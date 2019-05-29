import * as http from "http";
import * as SocketIO from "socket.io";

import {RoomServer} from "./RoomServer";

import {
    ClientServerMessage, ErrorCode, MessageType, OnRoomJoinMessage,
    OnUserLoginGuestMessage, OnRoomMakeMoveMessage, OpRoomJoinMessage,
    OpUserLoginGuestMessage, OpRoomMakeMoveMessage,
    ServerClientMessage, createMessageFromString, OpRoomMakeVoteMessage
} from "./../shared/MessageTypes";
import {UserServer} from "./UserServer";


export class SocketServerAgent {
    private io : SocketIO.Server;

    private socketPlayerIdMap : Map<SocketIO.Socket, number>;
    private playerIdSocketMap : Map<number, SocketIO.Socket>;


    private roomServer : RoomServer;
    private userServer : UserServer;


    constructor(server : http.Server){
        this.roomServer = new RoomServer(this);
        this.userServer = new UserServer(this);

        this.socketPlayerIdMap = new Map<SocketIO.Socket, number>();
        this.playerIdSocketMap = new Map<number, SocketIO.Socket>();

        this.io = SocketIO(server);

        this.io.on("connection", this.onConnection.bind(this));
    }

    public onConnection(socket : SocketIO.Socket){
        console.log("SocketServerAgent.onConnection");

        socket.on("disconnect", this.onConnectionDisconnect.bind(this, socket));
        socket.on(MessageType.OpLoginGuest, this.OpLoginGuest.bind(this, socket));


        socket.on(MessageType.OpRoomJoin, this.OpJoinRoom.bind(this, socket));
        socket.on(MessageType.OpRoomMakeMove, this.OpRoomMakeMove.bind(this, socket));

        socket.on(MessageType.OpRoomMakeVote, this.OpRoomMakeVote.bind(this, socket));
    }

    public onConnectionDisconnect(socket : SocketIO.Socket){
        console.log("SocketServerAgent.onConnectionDisconnect");

        let playerId : number | undefined = this.socketPlayerIdMap.get(socket);
        if(typeof playerId !== "undefined"){
            this.playerIdSocketMap.delete(playerId);
            this.socketPlayerIdMap.delete(socket);
        }
    }

    public emitMessage(socket : SocketIO.Socket | number | undefined, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        serverClientMessage.setTimeStamp(Date.now());
        if(clientServerMessage != null){
            serverClientMessage.setRequestId(clientServerMessage.getRequestId());
        }


        if(typeof(socket) == "number"){
            socket = this.playerIdSocketMap.get(socket);
        }

        if(typeof(socket) != "undefined"){
            socket.emit(serverClientMessage.getMessageType(), JSON.stringify(serverClientMessage));
        }
    }

    public OpLoginGuest(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpLoginGuest");

        let opUserLoginGuestMsg = createMessageFromString(message, OpUserLoginGuestMessage);
        if(opUserLoginGuestMsg == null){
            return;
        }

        let onUserLoginGuestMsg : OnUserLoginGuestMessage = new OnUserLoginGuestMessage({guestToken : "", playerId : 0, roomIds : []});

        this.userServer.guestLogin(opUserLoginGuestMsg, onUserLoginGuestMsg);

        let playerId = onUserLoginGuestMsg.playerId;

        this.playerIdSocketMap.set(playerId, socket);
        this.socketPlayerIdMap.set(socket, playerId);

        onUserLoginGuestMsg.roomIds = this.roomServer.getRoomIdsForPlayerId(playerId);

        this.emitMessage(socket, opUserLoginGuestMsg, onUserLoginGuestMsg);
    }

    public OpJoinRoom(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpJoinRoom");
        let opRoomJoinMsg = createMessageFromString(message, OpRoomJoinMessage);
        if(opRoomJoinMsg == null){
            return;
        }


        let playerId = <number>this.socketPlayerIdMap.get(socket);
        this.roomServer.joinRoom(playerId, opRoomJoinMsg);
    }

    public OpRoomMakeMove(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpRoomMakeMove");
        let opRoomMakeMoveMsg = createMessageFromString(message, OpRoomMakeMoveMessage);
        if(opRoomMakeMoveMsg == null){
            return;
        }



        let playerId = <number>this.socketPlayerIdMap.get(socket);
        this.roomServer.makeMove(playerId, opRoomMakeMoveMsg);
    }

    public OpRoomMakeVote(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpRoomMakeVote");
        let opRoomMakeVoteMsg = createMessageFromString(message, OpRoomMakeVoteMessage);
        if(opRoomMakeVoteMsg == null){
            return;
        }

        let playerId = <number>this.socketPlayerIdMap.get(socket);
        this.roomServer.makeVote(playerId, opRoomMakeVoteMsg);
    }
}


//module.exports = exports = SocketServerAgent;