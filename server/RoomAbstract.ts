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


import {RoomStateEnum} from "../shared/RoomStateEnum";
import {GameTimeManager} from "../shared/gameTime/GameTimeManager";
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

        let tickDelay : number = 10;
        setInterval(this.tick.bind(this, tickDelay), tickDelay);
    }

    public getRoomInitConfig():RoomInitConfig{
        return this.roomInitConfig;
    }
    public getRoomInitConfigStr():string{
        return RoomInitConfig.getRoomInitConfigStr(this.roomInitConfig);
    }
    public getRoomTypeEnum():RoomTypeEnum{
        return this.roomInitConfig.roomTypeEnum;
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

    /*
    public abstract getSideTypeForPlayerId(playerId : number):SideType | undefined;
    public abstract setSideTypeForPlayerId(playerId : number, sideType : SideType | undefined):void;
    */

    public abstract joinRoom(playerId : number, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void;



    public tick(dt : number):void{
        if(this.roomStateEnum != RoomStateEnum.NORMAL){
            return;
        }

        let timeStamp = Date.now();
        this._tick(timeStamp);
    }
    public abstract _tick(timeStamp : number):void;
}
