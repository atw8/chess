import {RoomAbstract} from "./RoomAbstract"
import {
    ClientServerMessage,
    ErrorCode,
    OnRoomJoinBroadcastMessage, OnRoomJoinBroadcastMessageType,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage, OnRoomMakeMoveBroadcastMessageType,
    OnRoomMakeMoveMessage, OnRoomTimeOutBroadcastMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig,
    RoomStateConfig,
    ServerClientMessage
} from "../shared/MessageTypes";
import {RoomServer} from "./RoomServer";
import {SideType} from "../shared/engine/SideType";
import {DomainMapStruct} from "../shared/DomainMapStruct";
import {RoomStateEnum} from "../shared/RoomStateEnum";
import {ChessGameStateEnum} from "../shared/engine/ChessGameStateEnum";

export class RoomNormal extends RoomAbstract {
    private sideTypeMapStruct : DomainMapStruct<SideType, number>;

    constructor(roomServer : RoomServer, roomId : number, roomInitConfig : RoomInitConfig){
        super(roomServer, roomId, roomInitConfig);

        this.sideTypeMapStruct = new DomainMapStruct<SideType, number>([SideType.WHITE, SideType.BLACK]);
    }

    public _getRoomStateConfig(playerId : number | null, roomStateConfig : RoomStateConfig):void{
        roomStateConfig.sideTypeMap = this.sideTypeMapStruct.getDomainMap();
    }
    /*
    public isInRoom(playerId : number):boolean{
        return this.sideTypeMapStruct.getKeyForValue(playerId) != undefined
    }
    */

    public emitOtherPlayerId(playerId : number | null, clientServerMsg : ClientServerMessage | null, serverClientMsg : ServerClientMessage):void{
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let pId = this.sideTypeMapStruct.getValueForKey(sideType);
            if(pId != undefined && pId != playerId){
                this.emitPlayerId(pId, clientServerMsg, serverClientMsg);
            }
        }
    }


    public getSideTypeForPlayerId(playerId : number):SideType | undefined {
        return <SideType>this.sideTypeMapStruct.getKeyForValue(playerId);
    }
    public setSideTypeForPlayerId(playerId : number, sideType : SideType | undefined){
        if(sideType == undefined){
            let freeSideTypes : SideType[] = this.sideTypeMapStruct.getFreeKeys();

            sideType = freeSideTypes[Math.floor(Math.random()*freeSideTypes.length)];
        }

        if(sideType == undefined){
            return;
        }
        this.sideTypeMapStruct.setValueForKey(sideType, playerId)
    }






    public joinRoom(playerId : number, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void{
        let sideType = opJoinRoomMsg.sideType;
        if(this.getSideTypeForPlayerId(playerId) != undefined){
            onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM);

            sideType = <SideType>this.getSideTypeForPlayerId(playerId);
        }else {
            this.setSideTypeForPlayerId(playerId, sideType);
            sideType = this.getSideTypeForPlayerId(playerId);

            if(sideType == undefined){
                onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_HAS_SIDE_TYPE);
            }
        }

        if(this.roomStateEnum == RoomStateEnum.START && !this.sideTypeMapStruct.hasFreeKeys()){
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



        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS){
            let onJoinRoomBroadcastMsgType : OnRoomJoinBroadcastMessageType = {
                roomId : this.getRoomId(),
                sideTypeMap : this.sideTypeMapStruct.getDomainMap(),
                beginTimeStamp : this.gameTimeManager.getFirstTimeStamp(),
                chessGameState : this.chessEngine.getGameState(),
                roomState : this.roomStateEnum
            };

            let onRoomJoinBroadcastMsg = new OnRoomJoinBroadcastMessage(onJoinRoomBroadcastMsgType);


            this.emitOtherPlayerId(playerId, null, onRoomJoinBroadcastMsg);
        }
    }


    public makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage, onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void{
        let moveTimeStamp = Date.now();

        this._tick(moveTimeStamp);
        if(this.roomStateEnum != RoomStateEnum.NORMAL || this.chessEngine.getGameState() != ChessGameStateEnum.NORMAL){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_ACTIVE_GAME);
            this.emitPlayerId(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return;
        }

        let sideType = this.getSideTypeForPlayerId(playerId);
        if(sideType == undefined){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_IN_ROOM);
            this.emitPlayerId(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return;
        }

        if(sideType != this.chessEngine.getMoveTurn()){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_MOVE_TURN);
            this.emitPlayerId(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return;
        }

        let isSuccess = this.chessEngine.doMoveSan(onRoomMakeMoveMsg.sanMove);
        if(!isSuccess){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_INVALID_SAN_MOVE);
            this.emitPlayerId(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return
        }

        //Succeded making a move, send the positive response
        this.gameTimeManager.doMove(moveTimeStamp);
        if(this.chessEngine.getGameState() != ChessGameStateEnum.NORMAL){
            this.roomStateEnum = RoomStateEnum.END;
        }


        onRoomMakeMoveMsg.moveTimeStamp = moveTimeStamp;
        if(this.chessEngine.getGameState() != ChessGameStateEnum.NORMAL){
            onRoomMakeMoveMsg.chessGameState = this.chessEngine.getGameState();
        }
        if(this.roomStateEnum != RoomStateEnum.NORMAL){
            onRoomMakeMoveMsg.roomState = this.roomStateEnum;
        }

        this.emitPlayerId(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
        if(onRoomMakeMoveMsg.getErrorCode() == ErrorCode.SUCCESS){
            let onRoomMakeMoveBroadcastMsgType : OnRoomMakeMoveBroadcastMessageType= {
                roomId : opRoomMakeMoveMsg.roomId,
                sanMove : opRoomMakeMoveMsg.sanMove,
                moveTimeStamp : moveTimeStamp,
            };
            if(this.chessEngine.getGameState()!= ChessGameStateEnum.NORMAL){
                onRoomMakeMoveBroadcastMsgType.chessGameState = this.chessEngine.getGameState();
            }
            if(this.roomStateEnum != RoomStateEnum.NORMAL){
                onRoomMakeMoveBroadcastMsgType.roomState = this.roomStateEnum;
            }

            let onRoomMakeMoveBroadcastMsg = new OnRoomMakeMoveBroadcastMessage(onRoomMakeMoveBroadcastMsgType);


            this.emitOtherPlayerId(playerId, null, onRoomMakeMoveBroadcastMsg);
        }


        if(this.roomStateEnum == RoomStateEnum.END){
            this.roomServer.removeRoom(this);
        }
    }

    public _tick(timeStamp : number){
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(this.gameTimeManager.isLose(sideType, timeStamp)){
                this.chessEngine.setIsLoseByTime(sideType, true);
                this.roomStateEnum = RoomStateEnum.END;
            }
        }

        if(this.roomStateEnum == RoomStateEnum.END){
            this.gameTimeManager.end(timeStamp);


            let onRoomTimeOutBroadcastMsgType = {
                roomId : this.getRoomId(),
                roomState : this.roomStateEnum,
                chessGameState : this.chessEngine.getGameState(),
                endTimeStamp : timeStamp,
                isLoseByTimeMap : this.chessEngine.m_isLoseByTime
            };

            let onRoomTimeOutBroadcastMsg = new OnRoomTimeOutBroadcastMessage(onRoomTimeOutBroadcastMsgType);


            this.emitOtherPlayerId(null, null, onRoomTimeOutBroadcastMsg);
        }


        if(this.roomStateEnum == RoomStateEnum.END){
            this.roomServer.removeRoom(this);
        }
    }
}