import * as http from "http";
import * as SocketIO from "socket.io";

import {RoomServer} from "./Room/RoomServer";

import {
    ClientServerMessage, ErrorCode, MessageType, OnRoomJoinMessage,
    OnUserLoginGuestMessage, OnRoomMakeMoveMessage, OpRoomJoinMessage,
    OpUserLoginGuestMessage, OpRoomMakeMoveMessage,
    ServerClientMessage, createMessageFromString, OpRoomMakeVoteMessage, OpRoomGetRoomStateMessage
} from "./../shared/MessageTypes";
import {UserAbstract} from "./User/UserAbstract";
import {UserNormalManager} from "./User/UserNormalManager";
import {UserStockfishManager} from "./User/UserStockfishManager";


export class SocketServerAgent {
    private playerIdUserAbstractMap : Map<number, UserAbstract>;


    private userNormalManager : UserNormalManager;
    private userStockfishManager : UserStockfishManager;
    private roomServer : RoomServer;



    constructor(server : http.Server){
        this.playerIdUserAbstractMap = new Map<number, UserAbstract>();

        this.roomServer = new RoomServer(this);

        this.userNormalManager = new UserNormalManager(this, server);
        this.userStockfishManager = new UserStockfishManager(this);


    }

    public removePlayerIdMap(playerId : number){
        console.log("SocketServerAgent.removePlayerIdMap");

        this.playerIdUserAbstractMap.delete(playerId);
    }
    public addPlayerIdMap(playerId : number, userAbstract : UserAbstract){
        console.log("SocketServerAgent.addPlayerIdMap");

        this.playerIdUserAbstractMap.set(playerId, userAbstract);
    }

    public emitMessage(userAbstract : UserAbstract | number | undefined, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        serverClientMessage.setTimeStamp(Date.now());
        if(clientServerMessage != null){
            serverClientMessage.setRequestId(clientServerMessage.getRequestId());
        }


        if(typeof(userAbstract) == "number"){
            userAbstract = this.playerIdUserAbstractMap.get(userAbstract);
        }

        if(typeof(userAbstract) != "undefined") {
            userAbstract.emit(serverClientMessage);
        }
    }

    public OpRoomGetRoomState(playerId : number, opRoomGetRoomStateMsg : OpRoomGetRoomStateMessage){
        console.log("SocketServerAgent.OpRoomGetRoomState");

        this.roomServer.getRoomState(playerId, opRoomGetRoomStateMsg);
    }

    public OpRoomJoin(playerId : number, opRoomJoinMsg : OpRoomJoinMessage){
        console.log("SocketServerAgent.OpRoomJoin");


        this.roomServer.joinRoom(playerId, opRoomJoinMsg);
    }

    public OpRoomMakeMove(playerId : number, opRoomMakeMoveMsg : OpRoomMakeMoveMessage){
        console.log("SocketServerAgent.OpRoomMakeMove");


        this.roomServer.makeMove(playerId, opRoomMakeMoveMsg);
    }

    public OpRoomMakeVote(playerId : number, opRoomMakeVoteMsg : OpRoomMakeVoteMessage){
        console.log("SocketServerAgent.OpRoomMakeVote");


        this.roomServer.makeVote(playerId, opRoomMakeVoteMsg);
    }
}


//module.exports = exports = SocketServerAgent;