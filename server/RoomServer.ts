import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {
    ClientServerMessage,
    ErrorCode,
    OnRoomGetListMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    RoomInitConfig, ServerClientMessage
} from "../shared/MessageTypes";


import {SideType} from "../shared/engine/SideType";

import {SocketServerAgent} from "./SocketServerAgent";

import {Room} from "./Room"
import * as SocketIO from "socket.io";

export class RoomServer {
    private socketServerAgent : SocketServerAgent;

    private roomConfigs : RoomInitConfig[];
    private roomsMap : { [key : number] : Room};
    private roomIds : number[] = [];
    private playerIdRoomIdMap : { [key : number] : number};


    constructor(socketServerAgent : SocketServerAgent){
        this.socketServerAgent = socketServerAgent;

        let r = "roomId";

        this.roomConfigs = [];

        let roomConfig1 : RoomInitConfig = new RoomInitConfig();
        roomConfig1.roomId = 1;
        // @ts-ignore
        roomConfig1.gameTimeStructs = {};
        roomConfig1.gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.MOVE, totalTime : 1 * 6 * 1000, incrTime : 0};
        roomConfig1.gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.MOVE, totalTime : 1 * 6 * 1000, incrTime : 0};


        let roomConfig2 : RoomInitConfig = new RoomInitConfig();
        roomConfig2.roomId = 2;
        // @ts-ignore
        roomConfig2.gameTimeStructs = {};
        roomConfig2.gameTimeStructs[SideType.WHITE] =  {timeType : GameTimeType.MOVE, totalTime : 1 * 45 * 1000, incrTime : 0};
        roomConfig2.gameTimeStructs[SideType.BLACK] =  {timeType : GameTimeType.MOVE, totalTime : 1 * 45 * 1000, incrTime : 0};
        roomConfig2.isChess960 = true;

        this.roomConfigs.push(roomConfig1);
        this.roomConfigs.push(roomConfig2);

        this.playerIdRoomIdMap = {};

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
    public getRoomIdForPlayerId(playerId : number):number|undefined{
        return this.playerIdRoomIdMap[playerId];
    }

    public joinRoom(playerId : number, opJoinRoomMessage : OpRoomJoinMessage):void{
        let ret : OnRoomJoinMessage = new OnRoomJoinMessage(opJoinRoomMessage.roomId, opJoinRoomMessage.sideType);

        if(ret.roomId == undefined){
            ret.roomId = this.roomIds[0];
        }

        let room : Room = this.roomsMap[ret.roomId];
        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            this.emitMessage(playerId, opJoinRoomMessage, ret);
        }else {
            room.joinRoom(playerId, opJoinRoomMessage, ret);
        }
    }

    public makeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage):void{
        let ret : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(opRoomMakeMoveMsg.roomId, opRoomMakeMoveMsg.sanMove, 0);

        let room : Room = this.roomsMap[ret.roomId];
        if(room == undefined){
            ret.setErrorCode(ErrorCode.ROOM_DOES_NOT_EXIST);
            this.emitMessage(playerId, opRoomMakeMoveMsg, ret);
        }else {
            room.makeMove(playerId, opRoomMakeMoveMsg, ret);
        }
    }


    public emitMessage(socket : SocketIO.Socket | number, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        this.socketServerAgent.emitMessage(socket, clientServerMessage, serverClientMessage);
    }
}