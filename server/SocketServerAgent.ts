import * as http from "http";
import * as SocketIO from "socket.io";

import {RoomServer} from "./RoomServer";

const uuidv4 = require('uuid/v4');

import {
    ClientServerMessage, ErrorCode, MessageType, OnGetRoomsListMessage, OnJoinRoomMessage,
    OnLoginGuestMessage, OpGetRoomsListMessage, OpJoinRoomMessage,
    OpLoginGuestMessage,
    ServerClientMessage
} from "./../shared/MessageTypes";
import {ValidatorResult} from "jsonschema";

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
        socket.on(MessageType.OpGetRoomsList, this.OpGetRoomList.bind(this, socket));
        socket.on(MessageType.OpJoinRoom, this.OpJoinRoom.bind(this, socket));
    }

    public onConnectionDisconnect(socket : SocketIO.Socket){
        console.log("SocketServerAgent.onConnectionDisconnect");

        let token : string | undefined = this.socketTokenMap.get(socket);
        if(token !== undefined){
            this.tokenSocketMap.delete(token);
            this.socketTokenMap.delete(socket);
        }
    }

    public emitMessage(socket : SocketIO.Socket, clientServerMessage : ClientServerMessage, serverClientMessage : ServerClientMessage){
        serverClientMessage.setTimeStamp(Date.now());
        serverClientMessage.setRequestId(clientServerMessage.getRequestId());

        socket.emit(serverClientMessage.getMessageType(), JSON.stringify(serverClientMessage));
    }

    public OpLoginGuest(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpLoginGuest");
        let opLoginGuestMessage : OpLoginGuestMessage | null = OpLoginGuestMessage.createFromString(message);
        if(opLoginGuestMessage == null){
            return;
        }

        let opLoginGuestMessageToken : string | undefined = opLoginGuestMessage.getToken();

        let token : string;
        if(opLoginGuestMessageToken === undefined){
            token = uuidv4();
        }else {
            token = opLoginGuestMessageToken;
        }


        this.tokenSocketMap.set(token, socket);
        this.socketTokenMap.set(socket, token);



        let onLoginGuestMessage : OnLoginGuestMessage = new OnLoginGuestMessage(token);
        this.emitMessage(socket, opLoginGuestMessage, onLoginGuestMessage);
    }

    public OpGetRoomList(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpGetRoomList");
        let opGetRoomsListMessage : OpGetRoomsListMessage | null = OpGetRoomsListMessage.createFromString(message);
        if(opGetRoomsListMessage == null){
            return;
        }


        let onGetRoomListMessage : OnGetRoomsListMessage = new OnGetRoomsListMessage([]);
        this.roomServer.populateOnGetRoomsListMessage(onGetRoomListMessage);
        this.emitMessage(socket, opGetRoomsListMessage, onGetRoomListMessage);
    }

    public OpJoinRoom(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpJoinRoom");
        let opJoinRoomMessage : OpJoinRoomMessage | null = OpJoinRoomMessage.createFromString(message);
        if(opJoinRoomMessage == null){
            return;
        }

        let onJoinRoomMessage : OnJoinRoomMessage = new OnJoinRoomMessage(opJoinRoomMessage.roomId);
        this.roomServer.populateOnJoinRoomMessage(onJoinRoomMessage);
        this.emitMessage(socket, opJoinRoomMessage, onJoinRoomMessage);
    }



}


//module.exports = exports = SocketServerAgent;