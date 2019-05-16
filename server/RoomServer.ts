import {
    ClientServerMessage,
    ErrorCode,
    OnRoomJoinMessage,
    OnRoomMakeMoveMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig,
    ServerClientMessage
} from "../shared/MessageTypes";

import {SocketServerAgent} from "./SocketServerAgent";

import {Room} from "./Room"
import * as SocketIO from "socket.io";
import {SideType} from "../shared/engine/SideType";
import {RoomContainer} from "./RoomContainer";

export class RoomServer {
    private socketServerAgent : SocketServerAgent;

    private roomsMap : { [key : number] : Room};

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

            let room = new Room(this, roomId, roomInitConfig);
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
        let ret : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(opRoomMakeMoveMsg.roomId, opRoomMakeMoveMsg.sanMove, 0);

        let room : Room = this.roomsMap[ret.roomId];
        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            this.emitMessage(playerId, opRoomMakeMoveMsg, ret);
        }else {
            room.makeMove(playerId, opRoomMakeMoveMsg, ret);
        }
    }


    public emitMessage(socket : SocketIO.Socket | number, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        this.socketServerAgent.emitMessage(socket, clientServerMessage, serverClientMessage);
    }
}