import {RoomServer} from "./RoomServer";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {
    ErrorCode, OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig,
    RoomStateConfig
} from "../shared/MessageTypes";


import {SideType} from "../shared/engine/SideType";

export class Room {
    private tokenSideTypeMap : {[key : string] : SideType};
    private sideTypeTokenMap : {[key : number] : string};
    private roomServer : RoomServer;

    private roomInitConfig : RoomInitConfig;
    private roomStateConfig : RoomStateConfig;


    private sanMoves : string[];
    private sanMovesSet : { [key : string] : boolean};

    private chessEngine : ChessEngine;

    constructor(roomServer : RoomServer, roomInitConfig : RoomInitConfig){
        this.roomServer = roomServer;
        this.roomInitConfig = roomInitConfig;


        this.tokenSideTypeMap = {};
        this.sideTypeTokenMap = {};


        this.chessEngine = new ChessEngine(this.roomInitConfig);

        this.roomStateConfig = new RoomStateConfig();

        this.updateRoomStateConfig();
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


        /*
        let sanMoves = this.chessEngine.getSANMovesForCurrentBoardAndMoveClasses(this.chessEngine.getAllLegalMoves(null, false));
        for(let i = 0; i < sanMoves.length; i++){
            let sanMove = sanMoves[i];
            this.roomStateConfig.voteConfig[sanMove] = 0;
        }
        */
    }


    private getRandomIntInclusive(min : number, max : number):number{
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }

    public joinRoom(token : string, opJoinRoomMsg : OpRoomJoinMessage, onJoinRoomMsg : OnRoomJoinMessage):void{
        let sideType = opJoinRoomMsg.sideType;
        if(token in this.tokenSideTypeMap){
            onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM);

            sideType = this.tokenSideTypeMap[token];
        }else {
            if(sideType == undefined){
                if(!(SideType.WHITE in this.sideTypeTokenMap || SideType.BLACK in this.sideTypeTokenMap)){
                    sideType = this.getRandomIntInclusive(SideType.FIRST_SIDE, SideType.LAST_SIDE);
                }else if(!(SideType.WHITE in this.sideTypeTokenMap)){
                    sideType = SideType.WHITE;
                }else if(!(SideType.BLACK in this.sideTypeTokenMap)){
                    sideType = SideType.BLACK;
                }

                if(sideType == undefined){
                    onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_HAS_SIDE_TYPE);
                    return;
                }
            }else if(sideType in this.sideTypeTokenMap) {
                onJoinRoomMsg.setErrorCode(ErrorCode.JOIN_ROOM_ALREADY_HAS_SIDE_TYPE);
                return;
            }
            onJoinRoomMsg.sideType = sideType;
        }


        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS || onJoinRoomMsg.getErrorCode() == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM){
            this.tokenSideTypeMap[token] = sideType;
            this.sideTypeTokenMap[sideType] = token;


            this.roomStateConfig.isWaiting = !((SideType.WHITE in this.sideTypeTokenMap) && (SideType.BLACK in this.sideTypeTokenMap));

            onJoinRoomMsg.roomInitConfig = this.getRoomInitConfig();
            onJoinRoomMsg.roomStateConfig = this.getRoomStateConfig();
        }
        this.roomServer.emitMessage(token, opJoinRoomMsg, onJoinRoomMsg);


        if(onJoinRoomMsg.getErrorCode() == ErrorCode.SUCCESS){
            let oppositeToken = this.sideTypeTokenMap[ChessEngine.getOppositeSideType(sideType)];
            if(oppositeToken != undefined){
                let onJoinRoomBroadcastMsg = new OnRoomJoinBroadcastMessage(this.roomInitConfig.roomId);
                onJoinRoomBroadcastMsg.roomInitConfig = this.getRoomInitConfig();
                onJoinRoomBroadcastMsg.roomStateConfig = this.getRoomStateConfig();


                this.roomServer.emitMessage(oppositeToken, null, onJoinRoomBroadcastMsg);
            }
        }
    }

    public makeMove(token : string, opRoomMakeMoveMessage : OpRoomMakeMoveMessage, onRoomMakeMoveMessage : OnRoomMakeMoveMessage):void{
        if(!(token in this.tokenSideTypeMap)){
            onRoomMakeMoveMessage.setErrorCode(ErrorCode.DO_MOVE_NOT_IN_ROOM);
            return;
        }

        let sideType = this.tokenSideTypeMap[token];
        if(!(sideType == this.chessEngine.getMoveTurn())){
            onRoomMakeMoveMessage.setErrorCode(ErrorCode.DO_MOVE_NOT_MOVE_TURN);
            return;
        }

        let isSuccess = this.chessEngine.doMoveSan(opRoomMakeMoveMessage.sanMove);
        if(!isSuccess){
            onRoomMakeMoveMessage.setErrorCode(ErrorCode.DO_MOVE_INVALID_SAN_MOVE);
        }

    }

}
