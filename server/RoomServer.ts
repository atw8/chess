import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {
    ErrorCode,
    OnRoomGetListMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig
} from "../shared/MessageTypes";


import {SocketServerAgent} from "./SocketServerAgent";

import {Room} from "./Room"

export class RoomServer {

    private roomConfigs : RoomInitConfig[];
    private roomsMap : { [key : number] : Room};
    private roomIds : number[] = [];
    private tokenRoomIdMap : { [key : string] : number};


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

            //isChess960 : false,
            //beginFenStr : "rnbqkb1r/ppp2ppp/5n2/1N1pN3/8/5P2/Pp2P1PP/R1BQKB1R b KQkq - 1 7"
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

        this.tokenRoomIdMap = {};

        this.roomsMap = {};
        for(let i = 0; i < this.roomConfigs.length; i++){
            let roomConfig = this.roomConfigs[i];

            this.roomsMap[roomConfig.roomId] = new Room(this, roomConfig);

            this.roomIds.push(roomConfig.roomId);
        }
    }


    public getRoomIdList(){
        return this.roomIds;
    }
    public getRoomIdForToken(token : string):number|undefined{
        return this.tokenRoomIdMap[token];
    }

    public joinRoom(token : string, opJoinRoomMessage : OpRoomJoinMessage):OnRoomJoinMessage{
        let ret : OnRoomJoinMessage = new OnRoomJoinMessage(opJoinRoomMessage.roomId, opJoinRoomMessage.sideType);

        if(ret.roomId == undefined){
            ret.roomId = this.roomIds[0];
        }

        let room : Room = this.roomsMap[ret.roomId];
        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            return ret;
        }

        room.joinRoom(token, opJoinRoomMessage, ret);

        if(ret.getErrorCode() == ErrorCode.SUCCESS){
            ret.roomInitConfig = room.getRoomInitConfig();
            ret.roomStateConfig = room.getRoomStateConfig();

            this.tokenRoomIdMap[token] = ret.roomId;
        }

        return ret;
    }

    public makeMove(token : string, opRoomMakeMoveMessage : OpRoomMakeMoveMessage):OnRoomMakeMoveMessage{
        let ret : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(opRoomMakeMoveMessage.roomId, opRoomMakeMoveMessage.sanMove);

        let room : Room = this.roomsMap[ret.roomId];
        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            return ret;
        }

        room.makeMove(token, opRoomMakeMoveMessage, ret);
        if(ret.getErrorCode() == ErrorCode.SUCCESS){

        }

        return ret;
    }
}