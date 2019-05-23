import {RoomAbstract} from "./RoomAbstract"
import {
    ClientServerMessage,
    ErrorCode,
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveMessage,
    OnRoomVotingUpdateBroadcastMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig,
    RoomStateConfig,
    ServerClientMessage
} from "../shared/MessageTypes";
import {RoomServer} from "./RoomServer";
import {SideType} from "../shared/engine/SideType";
import {RoomStateEnum} from "../shared/RoomStateEnum";

export class RoomMultiplayer extends RoomAbstract{
    private playerIds : {[key : number] : boolean};

    private isVotingDataDirty : boolean;
    private votingData : {[key : string] : number};
    private playerIdSanStrMap : {[key : number] : string};

    constructor(roomServer : RoomServer, roomId : number, roomInitConfig : RoomInitConfig){
        super(roomServer, roomId, roomInitConfig);
        this.playerIds = {};

        this.playerIdSanStrMap = {};
        this.initVotingData();

        let tickVotingDelay : number = 1000;
        setInterval(this.tickVoting.bind(this, tickVotingDelay), tickVotingDelay);
    }
    private initVotingData(){
        this.isVotingDataDirty = true;

        this.votingData = {};
        let sanMoves = this.chessEngine.getSANMovesForCurrentBoardAndMoveClasses(null);
        for(let i = 0; i < sanMoves.length; i++){
            this.votingData[sanMoves[i]] = 0;
        }
    }


    public _getRoomStateConfig(playerId : number | null, roomStateConfig : RoomStateConfig):void{
        roomStateConfig.votingData = this.votingData;
        roomStateConfig.myVoting = "";
        if(playerId != null){
            if(playerId in this.playerIdSanStrMap){
                roomStateConfig.myVoting = this.playerIdSanStrMap[playerId];
            }
        }
    }

    public getSideTypeForPlayerId(playerId : number):SideType{
        return this.chessEngine.getMoveTurn();
    }
    public setSideTypeForPlayerId(playerId : number, sideType : SideType | undefined):void{
        this.playerIds[playerId] = true;
    }


    public emitOtherPlayerId(playerId : number | null, clientServerMsg : ClientServerMessage | null, serverClientMsg : ServerClientMessage):void{
        for(let _pId in this.playerIds){
            let pId : number = parseInt(_pId);
            if(playerId != pId){
                this.emitPlayerId(pId, clientServerMsg, serverClientMsg);
            }
        }
    }


    public joinRoom(playerId : number, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void{
        this.setSideTypeForPlayerId(playerId, opJoinRoomMsg.sideType);

        if(this.roomStateEnum == RoomStateEnum.START){
            this.roomStateEnum = RoomStateEnum.NORMAL;

            let beginTimeStamp = Date.now();
            this.gameTimeManager.start(beginTimeStamp);
        }


        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS || onJoinRoomMsg.getErrorCode() == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM){
            onJoinRoomMsg.roomId = this.getRoomId();
            onJoinRoomMsg.roomInitConfig = this.getRoomInitConfig();
            onJoinRoomMsg.roomStateConfig = this.getRoomStateConfig(playerId);
        }
        this.emitPlayerId(playerId, opJoinRoomMsg, onJoinRoomMsg);

        /*
        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS){
            let onJoinRoomBroadcastMsg = new OnRoomJoinBroadcastMessage(this.getRoomId());
            onJoinRoomBroadcastMsg.sideTypeMap = this.sideTypeMapStruct.getDomainMap();
            onJoinRoomBroadcastMsg.beginTimeStamp = this.gameTimeManager.getFirstTimeStamp();
            onJoinRoomBroadcastMsg.chessGameState = this.chessEngine.getGameState();
            onJoinRoomBroadcastMsg.roomState = this.roomStateEnum;

            this.emitOtherPlayerId(playerId, null, onJoinRoomBroadcastMsg);
        }
        */
    }


    public _makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage, onRoomMakeMoveMsg : OnRoomMakeMoveMessage, moveTimeStamp : number){
        let sanStr = opRoomMakeMoveMsg.sanMove;
        if(!(sanStr in this.votingData)){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_INVALID_SAN_MOVE);
            this.emitPlayerId(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return;
        }

        if(playerId in this.playerIdSanStrMap){
            let sanStr = this.playerIdSanStrMap[playerId];
            this.votingData[sanStr]--;
        }
        this.isVotingDataDirty = true;
        this.playerIdSanStrMap[playerId] = sanStr;
        this.votingData[sanStr]++;

        this.emitPlayerId(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
    }


    public tickVoting(tickVotingDelay : number){
        if(this.roomStateEnum != RoomStateEnum.NORMAL || !this.isVotingDataDirty){
            return;
        }

        let onRoomVotingUpdateBroadcastMsgType = {
            roomId : this.getRoomId(),
            votingData : this.votingData
        };
        let onRoomVotingUpdateBroadcastMsg = new OnRoomVotingUpdateBroadcastMessage(onRoomVotingUpdateBroadcastMsgType);
        this.emitOtherPlayerId(null, null, onRoomVotingUpdateBroadcastMsg);

        this.isVotingDataDirty = false;
    }
}