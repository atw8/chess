import {
    ClientServerMessage,
    ErrorCode, OnRoomGetRoomStateMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveMessage, OnRoomMakeVoteMessage, OpRoomGetRoomStateMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage, OpRoomMakeVoteMessage,
    RoomInitConfig,
    ServerClientMessage
} from "../../shared/MessageTypes";

import {SocketServerAgent} from "../SocketServerAgent";

import {RoomTypeEnum} from "../../shared/RoomTypeEnum";

import {RoomAbstract} from "./RoomAbstract"
import {RoomMultiplayer} from "./RoomMultiplayer"
import {RoomNormal} from "./RoomNormal";

import {SideType} from "../../shared/engine/SideType";
import {GameTimeStructConfigs} from "../../shared/gameTime/GameTimeManager";
import {GameTimeType} from "../../shared/gameTime/GameTimeType";

export class RoomServer {
    private socketServerAgent : SocketServerAgent;

    private roomsMap : Map<number, RoomAbstract>;

    private roomIdCounter : number;


    constructor(socketServerAgent : SocketServerAgent){
        this.socketServerAgent = socketServerAgent;

        this.roomIdCounter = 0;
        this.roomsMap = new Map<number, RoomAbstract>();


        {
            let roomTypeEnum : RoomTypeEnum = RoomTypeEnum.MULTIPLAYER;
            // @ts-ignore
            let gameTimeStructs : GameTimeStructConfigs = {};
            gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.MOVE, totalTime : 1 * 40 * 1000};
            gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.MOVE, totalTime : 1 * 40 * 1000};

            let isAskDraw = true;
            let isSideTypeProperty = false;

            let roomInitConfig = new RoomInitConfig(roomTypeEnum, gameTimeStructs, isAskDraw, isSideTypeProperty);
            roomInitConfig.isChess960 = false;
            //roomInitConfig.beginFenStr = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1"
            //roomInitConfig.beginFenStr = "8/8/K7/8/8/k7/pppppppp/8 w - - 0 1";

            this.createRoom(roomInitConfig);
        }

    }


    public getRoomIdsForPlayerId(playerId : number):number[]{
        return [this.roomIdCounter];
        //return this.roomContainer.getRoomIdsForPlayerId(playerId);
    }
    public getPlayerIdsForRoomId(roomId : number):number[]{
        return [];
        //return this.roomContainer.getPlayerIdsForRoomId(roomId);
    }

    public createRoom(roomInitConfig : RoomInitConfig):RoomAbstract{
        this.roomIdCounter++;
        let roomId = this.roomIdCounter;

        let room : RoomAbstract;
        switch (roomInitConfig.roomTypeEnum){
            case RoomTypeEnum.NORMAL:
                room = new RoomNormal(this, roomId, roomInitConfig);
                break;
            case RoomTypeEnum.MULTIPLAYER:
                room = new RoomMultiplayer(this, roomId, roomInitConfig);
                break;
            default:
                room = new RoomNormal(this, roomId, roomInitConfig);
                break;

        }
        //this.roomContainer.addRoom(room.getRoomId(), roomInitConfig);

        this.roomsMap.set(roomId, room);

        return room;
    }


    public getRoomState(playerId : number, opRoomGetRoomStateMsg : OpRoomGetRoomStateMessage){
        let onRoomGetRoomStateMsgType = {roomIds : this.getRoomIdsForPlayerId(playerId)};

        let onRoomGetRoomStateMsg = new OnRoomGetRoomStateMessage(onRoomGetRoomStateMsgType);

        this.emitMessage(playerId, opRoomGetRoomStateMsg, onRoomGetRoomStateMsg);
    }

    public joinRoom(playerId : number, opJoinRoomMessage : OpRoomJoinMessage):void{
        let roomId = opJoinRoomMessage.roomId;
        if(roomId == undefined){
            return;
        }

        /*
        if(roomId == undefined){
            this.createRoom(opJoinRoomMessage.roomInitConfig);
        }
        */

        let room = this.roomsMap.get(roomId);

        let ret : OnRoomJoinMessage = new OnRoomJoinMessage(opJoinRoomMessage);

        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            this.emitMessage(playerId, opJoinRoomMessage, ret);
        }else {
            room.joinRoom(playerId, opJoinRoomMessage, ret);
            //this.roomContainer.addPlayerIdRoomId(playerId, room.getRoomId());
            //this.roomContainer.se(playerId);
        }
    }

    public makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage):void{
        let ret : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(opRoomMakeMoveMsg);

        let room : RoomAbstract | undefined = this.roomsMap.get(ret.roomId);
        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            this.emitMessage(playerId, opRoomMakeMoveMsg, ret);
        }else {
            let roomTypeEnum = room.getRoomTypeEnum();
            if(roomTypeEnum != RoomTypeEnum.NORMAL){
                ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_SUPPORT_MAKE_MOVE);
                this.emitMessage(playerId, opRoomMakeMoveMsg, ret);
            }else {
                (<RoomNormal>room).makeMove(playerId, opRoomMakeMoveMsg, ret);
            }
        }
    }

    public makeVote(playerId : number, opRoomMakeVoteMsg : OpRoomMakeVoteMessage):void{
        let ret = new OnRoomMakeVoteMessage(opRoomMakeVoteMsg);

        let room : RoomAbstract | undefined = this.roomsMap.get(ret.roomId);
        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            this.emitMessage(playerId, opRoomMakeVoteMsg, ret);
        }else {
            let roomTypeEnum = room.getRoomTypeEnum();
            if(roomTypeEnum != RoomTypeEnum.MULTIPLAYER){
                ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_SUPPORT_VOTE_MOVE);
                this.emitMessage(playerId, opRoomMakeVoteMsg, ret);
            }else {
                (<RoomMultiplayer>room).makeVote(playerId, opRoomMakeVoteMsg, ret);
            }
        }
    }



    public removeRoom(room : RoomAbstract):void{
        let roomId = room.getRoomId();
        //this.roomContainer.removeRoom(roomId);
        this.roomsMap.delete(roomId);
        //delete this.roomsMap[roomId];
    }


    public emitMessage(playerId :  number, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        this.socketServerAgent.emitMessage(playerId, clientServerMessage, serverClientMessage);
    }
}