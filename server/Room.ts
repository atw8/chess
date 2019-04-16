import {RoomServer} from "./RoomServer";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {
    ErrorCode,
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage, OnRoomTimeOutBroadcastMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig,
    RoomStateConfig
} from "../shared/MessageTypes";


import {SideType} from "../shared/engine/SideType";
import {GameTimeAbstract} from "../shared/gameTime/GameTimeAbstract";
import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {GameTimeInfinite} from "../shared/gameTime/GameTimeInfinite";
import {GameTimeMove} from "../shared/gameTime/GameTimeMove";
import {GameTimeNormal} from "../shared/gameTime/GameTimeNormal";
import {RoomState} from "./RoomState";

export class Room {
    //private playerIdSideTypeMap : {[key : number] : SideType};
    //private sideTypePlayerIdMap : {[key : number] : number};

    private roomServer : RoomServer;

    private roomInitConfig : RoomInitConfig;
    private roomStateConfig : RoomStateConfig;


    private chessEngine : ChessEngine;

    private gameTimeStructs : { [key : number] : GameTimeAbstract};

    constructor(roomServer : RoomServer, roomInitConfig : RoomInitConfig){
        this.roomServer = roomServer;
        this.roomInitConfig = roomInitConfig;


        this.gameTimeStructs = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let gameTimeStruct = this.roomInitConfig.gameTimeStructs[sideType];
            switch (gameTimeStruct.timeType) {
                case GameTimeType.INFINITE:
                {
                    this.gameTimeStructs[sideType] = new GameTimeInfinite();
                }
                    break;
                case GameTimeType.MOVE:
                {
                    let totalTime : number = <number>this.roomInitConfig.gameTimeStructs[sideType].totalTime;

                    this.gameTimeStructs[sideType] = new GameTimeMove(totalTime);
                }
                    break;
                case GameTimeType.NORMAL:
                {
                    let totalTime : number = <number>this.roomInitConfig.gameTimeStructs[sideType].totalTime;
                    let incrTime : number = <number>this.roomInitConfig.gameTimeStructs[sideType].incrTime;

                    this.gameTimeStructs[sideType] = new GameTimeNormal(totalTime, incrTime);
                }
                    break;
            }

        }




        this.chessEngine = new ChessEngine(this.roomInitConfig);

        this.roomStateConfig = new RoomStateConfig();


        this.updateRoomStateConfig();


        let tickDelay : number = 300;
        setInterval(this.tick.bind(this, tickDelay), tickDelay);
    }

    public getRoomInitConfig():RoomInitConfig{
        return this.roomInitConfig;
    }
    public getRoomStateConfig():RoomStateConfig{
        return this.roomStateConfig;
    }





    /*
    public async quitRoom(token : string){
        delete this.tokens[token];
    }
    */


    public updateRoomStateConfig(){
        this.roomStateConfig.currentFenStr = this.chessEngine.getLastFenStr();
        this.roomStateConfig.sanMoves = this.chessEngine.getSanMoves();
    }


    public joinRoom(playerId : number, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void{
        let sideType = opJoinRoomMsg.sideType;
        if(this.roomStateConfig.getSideTypeForPlayerId(playerId) != undefined){
            onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM);

            sideType = this.roomStateConfig.getSideTypeForPlayerId(playerId);
        }else if(sideType == undefined){
            let freeSideTypes : SideType[] = this.roomStateConfig.getFreeSideTypes();

            if(freeSideTypes.length != 0){
                sideType = freeSideTypes[Math.floor(Math.random()*freeSideTypes.length)];
            }else {
                onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_HAS_SIDE_TYPE);
            }
        }else if(!this.roomStateConfig.isSideTypeFree(sideType)){
            onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_HAS_SIDE_TYPE);
        }


        if(!this.roomStateConfig.hasFreeSideTypes() && this.roomStateConfig.roomState == RoomState.START){

            this.startGame();
        }

        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS || onJoinRoomMsg.getErrorCode() == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM){
            this.roomStateConfig.sideTypeMap[<SideType>sideType] = playerId;

            onJoinRoomMsg.roomInitConfig = this.getRoomInitConfig();
            onJoinRoomMsg.roomStateConfig = this.getRoomStateConfig();
        }
        this.roomServer.emitMessage(playerId, opJoinRoomMsg, onJoinRoomMsg);


        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS){
            let oppositePlayerId = this.roomStateConfig.getPlayerIdForSideType(ChessEngine.getOppositeSideType(<SideType>sideType));
            if(oppositePlayerId != undefined){
                let onJoinRoomBroadcastMsg = new OnRoomJoinBroadcastMessage(this.roomInitConfig.roomId);
                onJoinRoomBroadcastMsg.roomInitConfig = this.getRoomInitConfig();
                onJoinRoomBroadcastMsg.roomStateConfig = this.getRoomStateConfig();

                this.roomServer.emitMessage(oppositePlayerId, null, onJoinRoomBroadcastMsg);
            }
        }


    }



    public makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage, onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void{
        this._makeMove(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);

        this.roomServer.emitMessage(playerId, opRoomMakeMoveMsg, onRoomMakeMoveMsg);
        if(onRoomMakeMoveMsg.getErrorCode() == ErrorCode.SUCCESS){
            let sideType = <SideType>this.roomStateConfig.getSideTypeForPlayerId(playerId);
            let oppositePlayerId = this.roomStateConfig.getPlayerIdForSideType(ChessEngine.getOppositeSideType(<SideType>sideType));

            if(oppositePlayerId != undefined){
                let onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage = new OnRoomMakeMoveBroadcastMessage(opRoomMakeMoveMsg.roomId, opRoomMakeMoveMsg.sanMove);

                this.roomServer.emitMessage(oppositePlayerId, null, onRoomMakeMoveBroadcastMsg);
            }
        }
    }

    public _makeMove(playerId :number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage, onRoomMakeMoveMsg : OnRoomMakeMoveMessage){
        let sideType = this.roomStateConfig.getSideTypeForPlayerId(playerId)
        if(sideType == undefined){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_IN_ROOM);
            return;
        }

        if(!(sideType == this.chessEngine.getMoveTurn())){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_NOT_MOVE_TURN);
            return;
        }

        let isSuccess = this.chessEngine.doMoveSan(onRoomMakeMoveMsg.sanMove);
        this.roomStateConfig.sanMoves = this.chessEngine.getSanMoves();
        if(!isSuccess){
            onRoomMakeMoveMsg.setErrorCode(ErrorCode.DO_MOVE_INVALID_SAN_MOVE);

        }

        this.updateRoomStateConfig();
    }



    public startGame(){
        if(this.roomStateConfig.roomState != RoomState.START){
            return;
        }
        this.roomStateConfig.roomState = RoomState.NORMAL;


        let timeStamp = Date.now();
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.gameTimeStructs[sideType].start(timeStamp);
        }
        this.roomStateConfig.timeStamps.push(timeStamp);
    }

    public tick(dt : number){
        return;
        if(this.roomStateConfig.roomState != RoomState.NORMAL){
            return;
        }

        let timeStamp = Date.now();
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(this.gameTimeStructs[sideType].isLose(sideType, timeStamp)){
                this.chessEngine.setIsLooseByTime(sideType, true);
                this.roomStateConfig.roomState = RoomState.END;
            }
        }

        if(this.roomStateConfig.roomState == RoomState.END){
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                this.gameTimeStructs[sideType].end(timeStamp);
            }

            this.roomStateConfig.chessGameState = this.chessEngine.getGameState();
            this.roomStateConfig.timeStamps.push(timeStamp);


            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                let playerId = <number>this.roomStateConfig.sideTypeMap[sideType];

                let onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage = new OnRoomTimeOutBroadcastMessage(this.roomStateConfig.chessGameState, timeStamp);

                this.roomServer.emitMessage(playerId, null, onRoomTimeOutBroadcastMsg);
            }
        }



    }
}
