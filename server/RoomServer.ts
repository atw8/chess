import {
    ClientServerMessage,
    ErrorCode,
    OnRoomJoinMessage,
    OnRoomMakeMoveMessage, OnRoomMakeVoteMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage, OpRoomMakeVoteMessage,
    RoomInitConfig,
    ServerClientMessage
} from "../shared/MessageTypes";

import {SocketServerAgent} from "./SocketServerAgent";

import {RoomTypeEnum} from "../shared/RoomTypeEnum";

import {RoomAbstract} from "./RoomAbstract"
import {RoomMultiplayer} from "./RoomMultiplayer"
import {RoomNormal} from "./RoomNormal";

import * as SocketIO from "socket.io";
import {RoomContainer} from "./RoomContainer";

export class RoomServer {
    private socketServerAgent : SocketServerAgent;

    private roomsMap : { [key : number] : RoomAbstract};

    private roomIdCounter : number;

    private roomContainer : RoomContainer;

    constructor(socketServerAgent : SocketServerAgent){
        this.socketServerAgent = socketServerAgent;

        this.roomsMap = {};

        this.roomIdCounter = 0;
        this.roomContainer = new RoomContainer();
    }


    public getRoomIdsForPlayerId(playerId : number):number[]{
        return this.roomContainer.getRoomIdsForPlayerId(playerId);
    }
    public getPlayerIdsForRoomId(roomId : number):number[]{
        return this.roomContainer.getPlayerIdsForRoomId(roomId);
    }

    public joinRoom(playerId : number, opJoinRoomMessage : OpRoomJoinMessage):void{
        let roomId = this.roomContainer.getAvaliable(opJoinRoomMessage);

        if(roomId == undefined){
            this.roomIdCounter++;
            roomId = this.roomIdCounter;

            let roomInitConfig = <RoomInitConfig>opJoinRoomMessage.roomInitConfig;

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

            this.roomContainer.addRoom(room.getRoomId(), roomInitConfig);

            this.roomsMap[roomId] = room;
        }

        let room = this.roomsMap[roomId];

        let ret : OnRoomJoinMessage = new OnRoomJoinMessage(opJoinRoomMessage);

        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            this.emitMessage(playerId, opJoinRoomMessage, ret);
        }else {
            room.joinRoom(playerId, opJoinRoomMessage, ret);
            this.roomContainer.addPlayerIdRoomId(playerId, room.getRoomId());
            //this.roomContainer.se(playerId);
        }
    }

    public makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage):void{
        let ret : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(opRoomMakeMoveMsg);

        let room : RoomAbstract = this.roomsMap[ret.roomId];
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

        let room : RoomAbstract = this.roomsMap[ret.roomId];
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
        this.roomContainer.removeRoom(roomId);
        delete this.roomsMap[roomId];
    }


    public emitMessage(socket : SocketIO.Socket | number, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        this.socketServerAgent.emitMessage(socket, clientServerMessage, serverClientMessage);
    }
}