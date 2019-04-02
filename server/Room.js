"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChessEngine_1 = require("../shared/engine/ChessEngine");
const MessageTypes_1 = require("../shared/MessageTypes");
class Room {
    constructor(roomServer, roomInitConfig) {
        this.tokens = new Set();
        this.roomServer = roomServer;
        this.roomInitConfig = roomInitConfig;
        this.chessEngine = new ChessEngine_1.ChessEngine(this.roomInitConfig);
        this.roomStateConfig = new MessageTypes_1.RoomStateConfig();
        this.updateRoomStateConfig();
    }
    getRoomInitConfig() {
        return this.roomInitConfig;
    }
    getRoomStateConfig() {
        return this.roomStateConfig;
    }
    joinRoom(token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tokens.add(token);
        });
    }
    quitRoom(token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tokens.delete(token);
        });
    }
    updateRoomStateConfig() {
        this.roomStateConfig.currentFenStr = this.chessEngine.getLastFenStr();
        this.roomStateConfig.sanMoves = this.chessEngine.getSanMoves();
        this.roomStateConfig.voteConfig = {};
        let sanMoves = this.chessEngine.getSANMovesForCurrentBoardAndMoveClasses(this.chessEngine.getAllLegalMoves(null, false));
        for (let i = 0; i < sanMoves.length; i++) {
            let sanMove = sanMoves[i];
            this.roomStateConfig.voteConfig[sanMove] = 0;
        }
    }
    voteMove(token, sanMove) {
    }
    doMove() {
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map