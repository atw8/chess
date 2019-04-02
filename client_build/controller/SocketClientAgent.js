"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Socket = require("socket.io-client");
const MessageTypes_1 = require("./../../shared/MessageTypes");
class SocketClientAgent {
    constructor(socketClientInterface) {
        console.log("SocketClientAgent.constructor");
        this.socketClientInterface = socketClientInterface;
        this.localStartTimeStamps = {};
        this.requestId = 0;
        this.latency = null;
        this.minTimeDiff = null;
        this.maxTimeDiff = null;
        this.isConnected = false;
        this.socket = Socket();
        this.socket.on("connect", this.OnConnect.bind(this));
        this.socket.on("disconnect", this.OnDisconnect.bind(this));
        this.socket.on(MessageTypes_1.MessageType.OnLoginGuest, this.OnLoginGuest.bind(this));
        this.socket.on(MessageTypes_1.MessageType.OnGetRoomsList, this.OnGetRoomList.bind(this));
    }
    getIsConnected() {
        return this.isConnected;
    }
    OnConnect() {
        console.debug("onConnect");
        this.isConnected = true;
        this.socketClientInterface.OnConnect();
        this.OpLoginGuest(this.token);
    }
    OnDisconnect() {
        console.debug("onDisconnect");
        this.isConnected = false;
        this.socketClientInterface.OnDisconnect();
    }
    emitClientServerMessage(clientServerMessage) {
        clientServerMessage.setRequestId(this.getIncrRequestId());
        this.localStartTimeStamps[clientServerMessage.getRequestId()] = this.getTimeStamp();
        this.socket.emit(clientServerMessage.getMessageType(), JSON.stringify(clientServerMessage));
    }
    getIncrRequestId() {
        this.requestId++;
        return this.requestId;
    }
    updateLatencyTimeDiff(serverClientMessage) {
        let _updateTimeDiff = (minTimeDiff, maxTimeDiff) => {
            if (this.minTimeDiff == null) {
                this.minTimeDiff = minTimeDiff;
            }
            else {
                this.minTimeDiff = Math.max(this.minTimeDiff, minTimeDiff);
            }
            if (this.maxTimeDiff == null) {
                this.maxTimeDiff = maxTimeDiff;
            }
            else {
                this.maxTimeDiff = Math.max(this.maxTimeDiff, maxTimeDiff);
            }
        };
        let requestId = serverClientMessage.getRequestId();
        if (!(requestId in this.localStartTimeStamps)) {
            return;
        }
        let localStartTimeStamp = this.localStartTimeStamps[requestId];
        delete this.localStartTimeStamps[requestId];
        let localFinishTimeStamp = this.getTimeStamp();
        let severTimeStamp = serverClientMessage.getTimeStamp();
        this.latency = localFinishTimeStamp - localStartTimeStamp;
        let minTimeDiff = severTimeStamp - localStartTimeStamp - this.latency;
        let maxTimeDiff = severTimeStamp - localStartTimeStamp;
        _updateTimeDiff(minTimeDiff, maxTimeDiff);
        minTimeDiff = severTimeStamp - localFinishTimeStamp;
        maxTimeDiff = severTimeStamp - localFinishTimeStamp + this.latency;
        _updateTimeDiff(minTimeDiff, maxTimeDiff);
    }
    getTimeStamp() {
        return Date.now();
    }
    getServerTimeStamp() {
        return this.getTimeStamp() + (this.minTimeDiff + this.maxTimeDiff) / 2;
    }
    //Related OpLoginGuest
    OpLoginGuest(token) {
        let opLoginGuestMessage = new MessageTypes_1.OpLoginGuestMessage(token);
        this.emitClientServerMessage(opLoginGuestMessage);
    }
    OnLoginGuest(message) {
        let onLoginGuestMessage = MessageTypes_1.OnLoginGuestMessage.createFromString(message);
        if (onLoginGuestMessage == null) {
            return;
        }
        this.updateLatencyTimeDiff(onLoginGuestMessage);
        if (onLoginGuestMessage.getErrorCode() != MessageTypes_1.ErrorCode.SUCCESS) {
            return;
        }
        this.token = onLoginGuestMessage.token;
        this.OpJoinRoom();
    }
    OpGetRoomList() {
        let opGetRoomListMessage = new MessageTypes_1.OpGetRoomsListMessage();
        this.emitClientServerMessage(opGetRoomListMessage);
    }
    OnGetRoomList(message) {
        let onGetRoomListMessage = MessageTypes_1.OnGetRoomsListMessage.createFromString(message);
        if (onGetRoomListMessage == null) {
            return;
        }
        this.updateLatencyTimeDiff(onGetRoomListMessage);
    }
    OpJoinRoom(roomId) {
        let opJoinRoomMessage = new MessageTypes_1.OpJoinRoomMessage(roomId);
        this.emitClientServerMessage(opJoinRoomMessage);
    }
}
exports.SocketClientAgent = SocketClientAgent;
//# sourceMappingURL=SocketClientAgent.js.map