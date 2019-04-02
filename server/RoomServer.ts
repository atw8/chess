import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {
    OnGetRoomsListMessage,
    OnJoinRoomMessage,
    OpGetRoomsListMessage,
    OpJoinRoomMessage
} from "../shared/MessageTypes";
import {RoomInitConfig} from "../shared/RoomConfigs";

import {SocketServerAgent} from "./SocketServerAgent";

import {Room} from "./Room"

export class RoomServer {

    private roomConfigs : RoomInitConfig[];
    private roomsMap : { [key : number] : Room};
    private roomIds : number[] = [];



    constructor(socketServer : SocketServerAgent){
        this.roomConfigs = [];
        let roomConfig1 : RoomInitConfig = {
            roomId : 1,
            gameTimeTypeWhite : GameTimeType.MOVE,
            gameTimeTotalTimeWhite : 1 * 60 * 1000,
            gameTimeIncrTimeWhite : 0,

            gameTimeTypeBlack : GameTimeType.MOVE,
            gameTimeTotalTimeBlack : 1 * 60 * 1000,
            gameTimeIncrTimeBlack : 0,

            isChess960 : false,
        };

        let roomConfig2 : RoomInitConfig = {
            roomId : 2,
            gameTimeTypeWhite : GameTimeType.MOVE,
            gameTimeTotalTimeWhite : 45 * 1000,
            gameTimeIncrTimeWhite : 0,

            gameTimeTypeBlack : GameTimeType.MOVE,
            gameTimeTotalTimeBlack : 45 * 1000,
            gameTimeIncrTimeBlack : 0,

            isChess960 : true,
        };

        this.roomConfigs.push(roomConfig1);
        this.roomConfigs.push(roomConfig2);

        this.roomsMap = {};
        for(let i = 0; i < this.roomConfigs.length; i++){
            let roomConfig = this.roomConfigs[i];

            this.roomsMap[roomConfig.roomId] = new Room(this, roomConfig);

            this.roomIds.push(roomConfig.roomId);
        }
    }


    public populateOnGetRoomsListMessage(onGetRoomListMessage : OnGetRoomsListMessage){
        onGetRoomListMessage.roomIds = this.roomIds;
    }

    public populateOnJoinRoomMessage(onJoinRoomMessage : OnJoinRoomMessage){
        if(onJoinRoomMessage.roomId == undefined){
            onJoinRoomMessage.roomId = this.roomIds[0];
        }

        let room : Room = this.roomsMap[onJoinRoomMessage.roomId];

        onJoinRoomMessage.roomInitConfig = room.getRoomInitConfig();
        onJoinRoomMessage.roomStateConfig = room.getRoomStateConfig();
    }
}