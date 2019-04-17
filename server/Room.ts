import {RoomServer} from "./RoomServer";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {
    ErrorCode,
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage,
    OnRoomTimeOutBroadcastMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig,
    RoomStateConfig
} from "../shared/MessageTypes";


import {SideType} from "../shared/engine/SideType";
import {RoomStateEnum} from "../shared/RoomStateEnum";
import {ChessGameStateEnum} from "../shared/engine/ChessGameStateEnum";
import {GameTimeManager} from "../shared/gameTime/GameTimeManager";
import {DomainMapStruct} from "../shared/DomainMapStruct";

export class Room {
    //private playerIdSideTypeMap : {[key : number] : SideType};
    //private sideTypePlayerIdMap : {[key : number] : number};

    private roomServer : RoomServer;

    private roomId : number;
    private roomInitConfig : RoomInitConfig;
    //private roomStateConfig : RoomStateConfig;

    private sideTypeMapStruct : DomainMapStruct<SideType, number>;

    private roomStateEnum : RoomStateEnum;


    private chessEngine : ChessEngine;

    private gameTimeManager : GameTimeManager;


    constructor(roomServer : RoomServer, roomInitConfig : RoomInitConfig){
        this.roomServer = roomServer;
        this.roomInitConfig = roomInitConfig;
        this.roomId = this.roomInitConfig.roomId;

        this.gameTimeManager = new GameTimeManager(this.roomInitConfig.gameTimeStructs);

        this.chessEngine = new ChessEngine(this.roomInitConfig);

        this.sideTypeMapStruct = new DomainMapStruct<SideType, number>([SideType.WHITE, SideType.BLACK]);

        this.roomStateEnum = RoomStateEnum.START;


        let tickDelay : number = 300;
        setInterval(this.tick.bind(this, tickDelay), tickDelay);
    }

    public getRoomInitConfig():RoomInitConfig{
        return this.roomInitConfig;
    }
    public getRoomStateConfig():RoomStateConfig{
        let roomStateConfig : RoomStateConfig = new RoomStateConfig();

        roomStateConfig.sideTypeMap = this.sideTypeMapStruct.getDomainMap();
        roomStateConfig.roomState = this.roomStateEnum;



        roomStateConfig.currentFenStr = this.chessEngine.getLastFenStr();

        roomStateConfig.sanMoves = this.chessEngine.getSanMoves();
        roomStateConfig.timeStamps = this.gameTimeManager.getTimeStamps();

        roomStateConfig.isResignMap = this.chessEngine.m_isResign;
        roomStateConfig.isLoseByTimeMap = this.chessEngine.m_isLoseByTime;
        roomStateConfig.askDrawMap = this.chessEngine.m_askForDraw;

        roomStateConfig.chessGameState = this.chessEngine.getGameState();


        return roomStateConfig;
    }





    /*
    public async quitRoom(token : string){
        delete this.tokens[token];
    }
    */



    public joinRoom(playerId : number, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void{
        let sideType = opJoinRoomMsg.sideType;
        if(this.sideTypeMapStruct.getKeyForValue(playerId) != undefined){
            onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM);

            sideType = <SideType>this.sideTypeMapStruct.getKeyForValue(playerId)
        }else if(sideType == undefined){
            let freeSideTypes : SideType[] = this.sideTypeMapStruct.getFreeKeys();

            if(freeSideTypes.length != 0){
                sideType = freeSideTypes[Math.floor(Math.random()*freeSideTypes.length)];
            }else {
                onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_HAS_SIDE_TYPE);
            }
        }else if(this.sideTypeMapStruct.getValueForKey(sideType) != undefined){
            onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_HAS_SIDE_TYPE);
        }


        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS){
            this.sideTypeMapStruct.setValueForKey(<SideType>sideType, playerId);
        }
        if(!this.sideTypeMapStruct.hasFreeKeys() && this.roomStateEnum == RoomStateEnum.START){
            this.roomStateEnum = RoomStateEnum.NORMAL;

            let beginTimeStamp = Date.now();
            this.gameTimeManager.start(beginTimeStamp);
        }

        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS || onJoinRoomMsg.getErrorCode() == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM){
            onJoinRoomMsg.roomInitConfig = this.getRoomInitConfig();
            onJoinRoomMsg.roomStateConfig = this.getRoomStateConfig();
        }
        this.roomServer.emitMessage(playerId, opJoinRoomMsg, onJoinRoomMsg);


        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS){
            let oppositePlayerId = this.sideTypeMapStruct.getValueForKey(ChessEngine.getOppositeSideType(<SideType>sideType));
            if(oppositePlayerId != undefined){
                let onJoinRoomBroadcastMsg = new OnRoomJoinBroadcastMessage(this.roomInitConfig.roomId);
                onJoinRoomBroadcastMsg.sideTypeMap = this.sideTypeMapStruct.getDomainMap();
                onJoinRoomBroadcastMsg.beginTimeStamp = this.gameTimeManager.getFirstTimeStamp();
                onJoinRoomBroadcastMsg.chessGameState = this.chessEngine.getGameState();
                onJoinRoomBroadcastMsg.roomState = this.roomStateEnum;


                this.roomServer.emitMessage(oppositePlayerId, null, onJoinRoomBroadcastMsg);
            }
        }


    }



    public makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage, onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void{
        let moveTimeStamp = Date.now();

        this._tick(moveTimeStamp);
        if(this.roomStateEnum != RoomStateEnum.NORMAL || this.chessEngine.getGameState() != ChessGameStateEnum.NORMAL){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_ACTIVE_GAME);
            this.roomServer.emitMessage(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return;
        }

        let sideType = this.sideTypeMapStruct.getKeyForValue(playerId);
        if(sideType == undefined){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_IN_ROOM);
            this.roomServer.emitMessage(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return;
        }

        if(!(sideType == this.chessEngine.getMoveTurn())){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_MOVE_TURN);
            this.roomServer.emitMessage(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
            return;
        }

        let isSuccess = this.chessEngine.doMoveSan(onRoomMakeMoveMsg.sanMove);
        if(!isSuccess){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_INVALID_SAN_MOVE);
            this.roomServer.emitMessage(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
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

        this.roomServer.emitMessage(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
        if(onRoomMakeMoveMsg.getErrorCode() == ErrorCode.SUCCESS){
            let sideType = <SideType>this.sideTypeMapStruct.getKeyForValue(playerId);
            let oppositePlayerId = this.sideTypeMapStruct.getValueForKey(ChessEngine.getOppositeSideType(sideType));

            if(oppositePlayerId != undefined){
                let onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage = new OnRoomMakeMoveBroadcastMessage(opRoomMakeMoveMsg.roomId, opRoomMakeMoveMsg.sanMove, moveTimeStamp);
                if(this.chessEngine.getGameState()!= ChessGameStateEnum.NORMAL){
                    onRoomMakeMoveBroadcastMsg.chessGameState = this.chessEngine.getGameState();
                }
                if(this.roomStateEnum != RoomStateEnum.NORMAL){
                    onRoomMakeMoveBroadcastMsg.roomState = this.roomStateEnum;
                }

                this.roomServer.emitMessage(oppositePlayerId, null, onRoomMakeMoveBroadcastMsg);
            }
        }
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

            let onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage = new OnRoomTimeOutBroadcastMessage(this.roomId,
                this.roomStateEnum,
                this.chessEngine.getGameState(),
                timeStamp,
                this.chessEngine.m_isLoseByTime);

            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                let playerId = <number>this.sideTypeMapStruct.getValueForKey(sideType);

                this.roomServer.emitMessage(playerId, null, onRoomTimeOutBroadcastMsg);
            }
        }
    }
}
