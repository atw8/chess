import {RoomServer} from "./RoomServer";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {
    ClientServerMessage,
    ErrorCode,
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage,
    OnRoomTimeOutBroadcastMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig,
    RoomStateConfig, ServerClientMessage
} from "../shared/MessageTypes";


import {SideType} from "../shared/engine/SideType";
import {RoomStateEnum} from "../shared/RoomStateEnum";
import {ChessGameStateEnum} from "../shared/engine/ChessGameStateEnum";
import {GameTimeManager} from "../shared/gameTime/GameTimeManager";
import {DomainMapStruct} from "../shared/DomainMapStruct";
import {RoomTypeEnum} from "../shared/RoomTypeEnum";

export abstract class RoomAbstract {
    protected readonly roomServer : RoomServer;

    private readonly roomId : number;
    private readonly roomInitConfig : RoomInitConfig;

    public roomStateEnum : RoomStateEnum;

    public chessEngine : ChessEngine;
    public gameTimeManager : GameTimeManager;


    protected constructor(roomServer : RoomServer, roomId : number, roomInitConfig : RoomInitConfig){
        this.roomServer = roomServer;
        this.roomId = roomId;
        //this.roomInitConfig = roomInitConfig;
        this.roomInitConfig = JSON.parse(JSON.stringify(roomInitConfig));


        this.gameTimeManager = new GameTimeManager(this.roomInitConfig.gameTimeStructs);

        this.chessEngine = new ChessEngine(this.roomInitConfig);
        this.roomInitConfig.beginFenStr = this.chessEngine.getFirstFenStr();

        this.roomStateEnum = RoomStateEnum.START;

        let tickDelay : number = 300;
        setInterval(this.tick.bind(this, tickDelay), tickDelay);
    }

    public getRoomInitConfig():RoomInitConfig{
        return this.roomInitConfig;
    }
    public getRoomInitConfigStr():string{
        return RoomInitConfig.getRoomInitConfigStr(this.roomInitConfig);
    }

    public getRoomStateConfig(playerId : number | null):RoomStateConfig{
        let roomStateConfig : RoomStateConfig = new RoomStateConfig();

        roomStateConfig.roomState = this.roomStateEnum;



        roomStateConfig.currentFenStr = this.chessEngine.getLastFenStr();

        roomStateConfig.sanMoves = this.chessEngine.getSanMoves();
        roomStateConfig.timeStamps = this.gameTimeManager.getTimeStamps();

        roomStateConfig.isResignMap = this.chessEngine.m_isResign;
        roomStateConfig.isLoseByTimeMap = this.chessEngine.m_isLoseByTime;
        roomStateConfig.askDrawMap = this.chessEngine.m_askForDraw;

        roomStateConfig.chessGameState = this.chessEngine.getGameState();


        this._getRoomStateConfig(playerId, roomStateConfig);
        return roomStateConfig;
    }
    public abstract _getRoomStateConfig(playerId : number | null, roomStateConfig : RoomStateConfig):void;


    public getRoomId():number{
        return this.roomId;
    }




    /*
    public async quitRoom(token : string){
        delete this.tokens[token];
    }
    */

    public emitPlayerId(playerId : number, clientServerMsg : ClientServerMessage | null, serverClientMsg : ServerClientMessage){
        this.roomServer.emitMessage(playerId, clientServerMsg, serverClientMsg);
    }
    public abstract emitOtherPlayerId(playerId : number | null, clientServerMsg : ClientServerMessage | null, serverClientMsg : ServerClientMessage):void;
    public abstract getSideTypeForPlayerId(playerId : number):SideType | undefined;
    public abstract setSideTypeForPlayerId(playerId : number, sideType : SideType | undefined):void;


    public abstract joinRoom(playerId : number, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void;

    public abstract _makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage, onRoomMakeMoveMsg : OnRoomMakeMoveMessage, moveTimeStamp : number):void;

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

        this._makeMove(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg, moveTimeStamp);
    }



    public tick(dt : number){
        if(this.roomStateEnum != RoomStateEnum.NORMAL){
            return;
        }

        let timeStamp = Date.now();
        this._tick(timeStamp);
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
                roomId : this.roomId,
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
