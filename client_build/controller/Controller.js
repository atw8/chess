"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketClientAgent_1 = require("./SocketClientAgent");
const ChessEngine_1 = require("../../shared/engine/ChessEngine");
class Controller {
    constructor() {
        this.onConnectCallback = null;
        this.onDisconnectCallback = null;
        this.onLoginGuestCallback = null;
        this.onGetRoomListCallback = null;
        this.socketClientAgent = new SocketClientAgent_1.SocketClientAgent(this);
        this.chessEngine = new ChessEngine_1.ChessEngine();
    }
    setBoardView(boardView) {
        this.boardView = boardView;
        this.boardView.updateViewToModel(null);
    }
    setOnConnectCallback(onConnectCallback) {
        this.onConnectCallback = onConnectCallback;
    }
    OnConnect() {
        if (this.onConnectCallback != null) {
            this.onConnectCallback();
        }
    }
    setOnDisconnectCallback(onDisconnectCallback) {
        this.onDisconnectCallback = onDisconnectCallback;
    }
    OnDisconnect() {
        if (this.onDisconnectCallback != null) {
            this.onDisconnectCallback();
        }
    }
    setOnLoginGuestCallback(onLoginGuestCallback) {
        this.onLoginGuestCallback = onLoginGuestCallback;
    }
    OnLoginGuest(onLoginGuestMessage) {
        if (this.onLoginGuestCallback != null) {
            this.onLoginGuestCallback(onLoginGuestMessage);
        }
    }
    setOnGetRoomListCallback(onGetRoomListCallback) {
        this.onGetRoomListCallback = onGetRoomListCallback;
    }
    OnGetRoomList(onGetRoomListMessage) {
        if (this.onGetRoomListCallback != null) {
            this.onGetRoomListCallback(onGetRoomListMessage);
        }
    }
}
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map