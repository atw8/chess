import * as http from "http";
import * as SocketIO from "socket.io";

import {RoomServer} from "./RoomServer";

const uuidv4 = require('uuid/v4');

import {
    ClientServerMessage, ErrorCode, MessageType, OnRoomGetListMessage, OnRoomJoinMessage,
    OnLoginGuestMessage, OnRoomMakeMoveMessage, OpRoomGetListMessage, OpRoomJoinMessage,
    OpLoginGuestMessage, OpRoomMakeMoveMessage,
    ServerClientMessage
} from "./../shared/MessageTypes";
import {ValidatorResult} from "jsonschema";
import {json} from "express";

export class SocketServerAgent {
    private io : SocketIO.Server;

    private socketTokenMap : Map<SocketIO.Socket, string>;
    private tokenSocketMap : Map<string, SocketIO.Socket>;


    private roomServer : RoomServer;


    constructor(server : http.Server){
        this.roomServer = new RoomServer(this);

        this.socketTokenMap = new Map<SocketIO.Socket, string>();
        this.tokenSocketMap = new Map<string, SocketIO.Socket>();

        this.io = SocketIO(server);

        this.io.on("connection", this.onConnection.bind(this));
    }

    public onConnection(socket : SocketIO.Socket){
        console.log("SocketServerAgent.onConnection");

        socket.on("disconnect", this.onConnectionDisconnect.bind(this, socket));
        socket.on(MessageType.OpLoginGuest, this.OpLoginGuest.bind(this, socket));


        socket.on(MessageType.OpRoomGetList, this.OpGetRoomList.bind(this, socket));
        socket.on(MessageType.OpRoomJoin, this.OpJoinRoom.bind(this, socket));
        socket.on(MessageType.OpRoomMakeMove, this.OpRoomMakeMove.bind(this, socket));
    }

    public onConnectionDisconnect(socket : SocketIO.Socket){
        console.log("SocketServerAgent.onConnectionDisconnect");

        let token : string | undefined = this.socketTokenMap.get(socket);
        if(token !== undefined){
            this.tokenSocketMap.delete(token);
            this.socketTokenMap.delete(socket);
        }
    }

    public emitMessage(socket : SocketIO.Socket | string, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        serverClientMessage.setTimeStamp(Date.now());
        if(clientServerMessage != null){
            serverClientMessage.setRequestId(clientServerMessage.getRequestId());
        }


        if(typeof socket == "string"){
            socket = <SocketIO.Socket> this.tokenSocketMap.get(socket);
        }

        socket.emit(serverClientMessage.getMessageType(), JSON.stringify(serverClientMessage));
    }

    public OpLoginGuest(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpLoginGuest");
        let opLoginGuestMessage : OpLoginGuestMessage | null = OpLoginGuestMessage.createFromString(message);
        if(opLoginGuestMessage == null){
            return;
        }




        let token : string;
        {
          let _token = opLoginGuestMessage.getToken();
          if(_token == undefined){
              token = uuidv4();
          }else {
              token = _token;
          }
        }


        this.tokenSocketMap.set(token, socket);
        this.socketTokenMap.set(socket, token);


        let onLoginGuestMessage : OnLoginGuestMessage = new OnLoginGuestMessage(token);
        onLoginGuestMessage.roomId = this.roomServer.getRoomIdForToken(token);

        this.emitMessage(socket, opLoginGuestMessage, onLoginGuestMessage);
    }

    public OpGetRoomList(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpGetRoomList");
        let opGetRoomsListMessage : OpRoomGetListMessage | null = OpRoomGetListMessage.createFromString(message);
        if(opGetRoomsListMessage == null){
            return;
        }


        let onGetRoomListMessage : OnRoomGetListMessage = new OnRoomGetListMessage([]);
        onGetRoomListMessage.roomIds = this.roomServer.getRoomIdList();
        this.emitMessage(socket, opGetRoomsListMessage, onGetRoomListMessage);
    }

    public OpJoinRoom(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpJoinRoom");
        let opJoinRoomMessage : OpRoomJoinMessage | null = OpRoomJoinMessage.createFromString(message);
        if(opJoinRoomMessage == null){
            return;
        }



        let token = <string>this.socketTokenMap.get(socket);
        this.roomServer.joinRoom(token, opJoinRoomMessage);
    }

    public OpRoomMakeMove(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpRoomMakeMove");
        let opRoomMakeMoveMessage : OpRoomMakeMoveMessage | null = OpRoomMakeMoveMessage.createFromString(message);
        if(opRoomMakeMoveMessage == null){
            return;
        }

        let token = <string>this.socketTokenMap.get(socket);
        let onRoomMakeMoveMessage : OnRoomMakeMoveMessage = this.roomServer.makeMove(token, opRoomMakeMoveMessage);

        this.emitMessage(socket, opRoomMakeMoveMessage, onRoomMakeMoveMessage);
    }

}


//module.exports = exports = SocketServerAgent;