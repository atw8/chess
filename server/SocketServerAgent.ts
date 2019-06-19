import * as http from "http";
import {Stockfish} from "./Stockfish"
import {RoomServer} from "./Room/RoomServer";

import {
    ClientServerMessage, ErrorCode, MessageType, OnRoomJoinMessage,
    OnUserLoginGuestMessage, OnRoomMakeMoveMessage, OpRoomJoinMessage,
    OpUserLoginGuestMessage, OpRoomMakeMoveMessage,
    ServerClientMessage, createMessageFromString, OpRoomMakeVoteMessage, OpRoomGetRoomStateMessage
} from "./../shared/MessageTypes";
import {UserNormalManager} from "./User/UserNormalManager";
import {UserStockfishManager} from "./User/UserStockfishManager";


export class SocketServerAgent {
    private userNormalManager : UserNormalManager;
    private userStockfishManager : UserStockfishManager;
    private roomServer : RoomServer;



    constructor(server : http.Server){
        this.roomServer = new RoomServer(this);

        this.userNormalManager = new UserNormalManager(this, server);
        this.userStockfishManager = new UserStockfishManager(this);


        let stockFishParams : {setOptions : Stockfish.SetOptions, goOptions : Stockfish.GoOptions}[] = [];

        let numOfStockFishParams : number = 4;
        for(let i = 0; i < numOfStockFishParams; i++){
            let skillLevel = Math.floor(0 + (20 - 0)*(i/numOfStockFishParams));

            stockFishParams.push({setOptions : {"Skill Level" : i, "MultiPV" : 2}, goOptions : {}});
            stockFishParams.push({setOptions : {"Skill Level" : i, "MultiPV" : 2}, goOptions : {}});
        }
        this.userStockfishManager.init(stockFishParams);
    }

    public emitMessage(playerId : number, clientServerMessage : ClientServerMessage | null, serverClientMessage : ServerClientMessage){
        serverClientMessage.setTimeStamp(Date.now());
        if(clientServerMessage != null){
            serverClientMessage.setRequestId(clientServerMessage.getRequestId());
        }

        this.userNormalManager.emit(playerId, serverClientMessage);
        this.userStockfishManager.emit(playerId, serverClientMessage);
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