"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameTimeType_1 = require("../shared/gameTime/GameTimeType");
const Room_1 = require("./Room");
class RoomServer {
    constructor(socketServer) {
        this.roomIds = [];
        this.roomConfigs = [];
        let roomConfig1 = {
            roomId: 1,
            gameTimeTypeWhite: GameTimeType_1.GameTimeType.MOVE,
            gameTimeTotalTimeWhite: 1 * 60 * 1000,
            gameTimeIncrTimeWhite: 0,
            gameTimeTypeBlack: GameTimeType_1.GameTimeType.MOVE,
            gameTimeTotalTimeBlack: 1 * 60 * 1000,
            gameTimeIncrTimeBlack: 0,
            isChess960: false,
        };
        let roomConfig2 = {
            roomId: 2,
            gameTimeTypeWhite: GameTimeType_1.GameTimeType.MOVE,
            gameTimeTotalTimeWhite: 45 * 1000,
            gameTimeIncrTimeWhite: 0,
            gameTimeTypeBlack: GameTimeType_1.GameTimeType.MOVE,
            gameTimeTotalTimeBlack: 45 * 1000,
            gameTimeIncrTimeBlack: 0,
            isChess960: true,
        };
        this.roomConfigs.push(roomConfig1);
        this.roomConfigs.push(roomConfig2);
        this.roomsMap = {};
        for (let i = 0; i < this.roomConfigs.length; i++) {
            let roomConfig = this.roomConfigs[i];
            this.roomsMap[roomConfig.roomId] = new Room_1.Room(this, roomConfig);
            this.roomIds.push(roomConfig.roomId);
        }
    }
    populateOnGetRoomsListMessage(onGetRoomListMessage) {
        onGetRoomListMessage.roomIds = this.roomIds;
    }
    populateOnJoinRoomMessage(onJoinRoomMessage) {
        if (onJoinRoomMessage.roomId == undefined) {
            onJoinRoomMessage.roomId = this.roomIds[0];
        }
        let room = this.roomsMap[onJoinRoomMessage.roomId];
        onJoinRoomMessage.roomInitConfig = room.getRoomInitConfig();
        onJoinRoomMessage.roomStateConfig = room.getRoomStateConfig();
    }
}
exports.RoomServer = RoomServer;
//# sourceMappingURL=RoomServer.js.map