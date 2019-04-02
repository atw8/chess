"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIO = require("socket.io");
const RoomServer_1 = require("./RoomServer");
const uuidv4 = require('uuid/v4');
const MessageTypes_1 = require("./../shared/MessageTypes");
class SocketServerAgent {
    constructor(server) {
        this.roomServer = new RoomServer_1.RoomServer(this);
        this.socketTokenMap = new Map();
        this.tokenSocketMap = new Map();
        this.io = SocketIO(server);
        this.io.on("connection", this.onConnection.bind(this));
    }
    onConnection(socket) {
        console.log("SocketServerAgent.onConnection");
        socket.on("disconnect", this.onConnectionDisconnect.bind(this, socket));
        socket.on(MessageTypes_1.MessageType.OpLoginGuest, this.OpLoginGuest.bind(this, socket));
        socket.on(MessageTypes_1.MessageType.OpGetRoomsList, this.OpGetRoomList.bind(this, socket));
        socket.on(MessageTypes_1.MessageType.OpJoinRoom, this.OpJoinRoom.bind(this, socket));
    }
    onConnectionDisconnect(socket) {
        console.log("SocketServerAgent.onConnectionDisconnect");
        let token = this.socketTokenMap.get(socket);
        if (token !== undefined) {
            this.tokenSocketMap.delete(token);
            this.socketTokenMap.delete(socket);
        }
    }
    emitMessage(socket, clientServerMessage, serverClientMessage) {
        serverClientMessage.setTimeStamp(Date.now());
        serverClientMessage.setRequestId(clientServerMessage.getRequestId());
        socket.emit(serverClientMessage.getMessageType(), JSON.stringify(serverClientMessage));
    }
    OpLoginGuest(socket, message) {
        console.log("SocketServerAgent.OpLoginGuest");
        let opLoginGuestMessage = MessageTypes_1.OpLoginGuestMessage.createFromString(message);
        if (opLoginGuestMessage == null) {
            return;
        }
        let opLoginGuestMessageToken = opLoginGuestMessage.getToken();
        let token;
        if (opLoginGuestMessageToken === undefined) {
            token = uuidv4();
        }
        else {
            token = opLoginGuestMessageToken;
        }
        this.tokenSocketMap.set(token, socket);
        this.socketTokenMap.set(socket, token);
        let onLoginGuestMessage = new MessageTypes_1.OnLoginGuestMessage(token);
        this.emitMessage(socket, opLoginGuestMessage, onLoginGuestMessage);
    }
    OpGetRoomList(socket, message) {
        console.log("SocketServerAgent.OpGetRoomList");
        let opGetRoomsListMessage = MessageTypes_1.OpGetRoomsListMessage.createFromString(message);
        if (opGetRoomsListMessage == null) {
            return;
        }
        let onGetRoomListMessage = new MessageTypes_1.OnGetRoomsListMessage([]);
        this.roomServer.populateOnGetRoomsListMessage(onGetRoomListMessage);
        this.emitMessage(socket, opGetRoomsListMessage, onGetRoomListMessage);
    }
    OpJoinRoom(socket, message) {
        console.log("SocketServerAgent.OpJoinRoom");
        let opJoinRoomMessage = MessageTypes_1.OpJoinRoomMessage.createFromString(message);
        if (opJoinRoomMessage == null) {
            return;
        }
        let onJoinRoomMessage = new MessageTypes_1.OnJoinRoomMessage(opJoinRoomMessage.roomId);
        this.roomServer.populateOnJoinRoomMessage(onJoinRoomMessage);
        this.emitMessage(socket, opJoinRoomMessage, onJoinRoomMessage);
    }
}
exports.SocketServerAgent = SocketServerAgent;
//module.exports = exports = SocketServerAgent;
//# sourceMappingURL=SocketServerAgent.js.map