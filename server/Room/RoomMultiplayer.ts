import {RoomAbstract} from "./RoomAbstract"
import {
    ClientServerMessage,
    ErrorCode,
    OnRoomJoinMessage,
    OnRoomVotingUpdateBroadcastMessage,
    OpRoomJoinMessage,
    OnRoomMakeVoteMessage,
    OpRoomMakeVoteMessage,
    RoomInitConfig,
    RoomStateConfig,
    ServerClientMessage,
    OnRoomTimeOutBroadcastMessage,
    OnRoomMultiplayerStateBroadcastMessage, OnRoomMultiplayerStateBroadcastMessageType
} from "../../shared/MessageTypes";
import {RoomServer} from "./RoomServer";
import {SideType} from "../../shared/engine/SideType";
import {RoomStateEnum} from "../../shared/RoomStateEnum";
import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";

export class RoomMultiplayer extends RoomAbstract{
    private playerIds : Set<number>;
    private wbPlayerIds : { [key in SideType] : Set<number> };

    private isVotingDataDirty : boolean;
    private votingData : {[key : string] : number};
    private playerIdSanStrMap : {[key : number] : string};

    constructor(roomServer : RoomServer, roomId : number, roomInitConfig : RoomInitConfig){
        super(roomServer, roomId, roomInitConfig);

        this.playerIds = new Set<number>();
        //@ts-ignore
        this.wbPlayerIds = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.wbPlayerIds[sideType] = new Set<number>();
        }

        this.initVotingData();

        let tickVotingDelay : number = 1000;
        setInterval(this.tickVoting.bind(this, tickVotingDelay), tickVotingDelay);
    }
    private initVotingData(){
        this.isVotingDataDirty = true;

        this.playerIdSanStrMap = {};

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

            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                let wbPlayerIdSet = this.wbPlayerIds[sideType];
                if(wbPlayerIdSet.has(playerId)){
                    roomStateConfig.mySideType = sideType;
                }
            }

        }


        //roomStateConfig.mySideType = thi
    }



    public emitOtherPlayerId(playerId : number | null, clientServerMsg : ClientServerMessage | null, serverClientMsg : ServerClientMessage):void{
        this.playerIds.forEach((pId : number)=>{
            if(playerId != pId){
                this.emitPlayerId(pId, clientServerMsg, serverClientMsg);
            }
        });
    }


    public joinRoom(playerId : number, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void{

        if(!this.playerIds.has(playerId)){
            let whiteSideTypes = this.wbPlayerIds[SideType.WHITE].size;
            let blackSideTypes = this.wbPlayerIds[SideType.BLACK].size;

            let mySideType : SideType;
            if(whiteSideTypes > blackSideTypes){
                mySideType = SideType.BLACK;
            }else if(whiteSideTypes < blackSideTypes){
                mySideType = SideType.WHITE;
            }else {
                mySideType = SideType.getRandomSideType();
            }

            this.wbPlayerIds[mySideType].add(playerId);
            this.playerIds.add(playerId);
        }







        //this.playerIds.add(playerId);

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

    }


    public makeVote(playerId : number, opRoomMakeVoteMoveMsg : OpRoomMakeVoteMessage, onRoomMakeVoteMoveMsg : OnRoomMakeVoteMessage):void{
        if(this.roomStateEnum != RoomStateEnum.NORMAL || this.chessEngine.getGameState() != ChessGameStateEnum.NORMAL){
            onRoomMakeVoteMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_ACTIVE_GAME);
            this.emitPlayerId(playerId, opRoomMakeVoteMoveMsg, onRoomMakeVoteMoveMsg);
            return;
        }

        if(!this.playerIds.has(playerId)){
            onRoomMakeVoteMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_IN_ROOM);
            this.emitPlayerId(playerId, opRoomMakeVoteMoveMsg, onRoomMakeVoteMoveMsg);
            return;
        }
        if(!this.wbPlayerIds[this.chessEngine.getMoveTurn()].has(playerId)){
            onRoomMakeVoteMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_MOVE_TURN);
            this.emitPlayerId(playerId, opRoomMakeVoteMoveMsg, onRoomMakeVoteMoveMsg);
            return;
        }


        let sanStr = onRoomMakeVoteMoveMsg.myVoting;
        if(!(sanStr in this.votingData)){
            onRoomMakeVoteMoveMsg.setErrorCode(ErrorCode.DO_MOVE_INVALID_SAN_MOVE);
            this.emitPlayerId(playerId, opRoomMakeVoteMoveMsg, onRoomMakeVoteMoveMsg);
            return;
        }

        if(playerId in this.playerIdSanStrMap){
            let sanStr = this.playerIdSanStrMap[playerId];
            this.votingData[sanStr]--;
        }
        this.isVotingDataDirty = true;
        this.playerIdSanStrMap[playerId] = sanStr;
        this.votingData[sanStr]++;

        this.emitPlayerId(playerId, opRoomMakeVoteMoveMsg, onRoomMakeVoteMoveMsg);

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


    public _tick(timeStamp : number){
        let isTimeOut : boolean = false;
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE && !isTimeOut; sideType++){
            isTimeOut = this.gameTimeManager.isLose(sideType, timeStamp);

            if(isTimeOut){
                //Adjust the timeStamp, so we dont end up loosing by accident
                timeStamp = timeStamp + this.gameTimeManager.getCurrentTime(sideType, timeStamp);
            }
        }

        if(isTimeOut){



            let topVotingNumber : number = 0;
            let topVotingMoves : string[] = [];
            for(let sanStr in this.votingData){
                let number = this.votingData[sanStr];
                if(number > topVotingNumber){
                    topVotingNumber = number;
                    topVotingMoves = [sanStr];
                }else if(number == topVotingNumber){
                    topVotingMoves.push(sanStr);
                }
            }

            let sanMove = topVotingMoves[Math.floor(Math.random()*topVotingMoves.length)];

            this.gameTimeManager.doMove(timeStamp);
            this.chessEngine.doMoveSan(sanMove);


            let onRoomMultiplayerStateBroadcastMsgType : OnRoomMultiplayerStateBroadcastMessageType = {
                roomId : this.getRoomId(),
                sanMove : sanMove,
                moveTimeStamp : timeStamp
            };

            if(this.chessEngine.getGameState() != ChessGameStateEnum.NORMAL){
                this.roomStateEnum = RoomStateEnum.END;
            }




            if(this.chessEngine.getGameState()!= ChessGameStateEnum.NORMAL){
                onRoomMultiplayerStateBroadcastMsgType.chessGameState = this.chessEngine.getGameState();
            }
            if(this.roomStateEnum != RoomStateEnum.NORMAL){
                onRoomMultiplayerStateBroadcastMsgType.roomState = this.roomStateEnum;
            }

            let onRoomMultiplayerStateBroadcastMsg = new OnRoomMultiplayerStateBroadcastMessage(onRoomMultiplayerStateBroadcastMsgType);




            this.emitOtherPlayerId(null, null, onRoomMultiplayerStateBroadcastMsg);

            this.initVotingData();
            this.tickVoting(0.0);


            if(this.roomStateEnum == RoomStateEnum.END){
                this.roomServer.removeRoom(this);
                this.roomServer.createRoom(this.getRoomInitConfig());
            }
        }
    }
}