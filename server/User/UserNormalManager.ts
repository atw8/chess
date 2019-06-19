import {SocketServerAgent} from "../SocketServerAgent";
import * as SocketIO from "socket.io";
import * as http from "http";
import {
    createMessageFromString,
    MessageType, OnUserLoginGuestMessage, OpRoomGetRoomStateMessage, OpRoomJoinMessage,
    OpRoomMakeMoveMessage, OpRoomMakeVoteMessage,
    OpUserLoginGuestMessage, ServerClientMessage
} from "../../shared/MessageTypes";
import {UserSingleton} from "./UserSingleton";

export class UserNormalManager {
    private socketServerAgent : SocketServerAgent;

    private io : SocketIO.Server;

    private socketPlayerIdMap : Map<SocketIO.Socket, number>;
    private playerIdSocketMap : Map<number, SocketIO.Socket>;

    constructor(socketServerAgent : SocketServerAgent, server : http.Server){
        this.socketServerAgent = socketServerAgent;

        this.socketPlayerIdMap = new Map<SocketIO.Socket, number>();
        this.playerIdSocketMap = new Map<number, SocketIO.Socket>();

        this.io = SocketIO(server);

        this.io.on("connection", this.onConnection.bind(this));
    }

    public emit(playerId : number, serverClientMessage : ServerClientMessage){
        let socket : SocketIO.Socket | undefined = this.playerIdSocketMap.get(playerId);
        if(socket != undefined){
            socket.emit(serverClientMessage.getMessageType(), JSON.stringify(serverClientMessage));
        }
    }

    public onConnection(socket : SocketIO.Socket){
        console.log("UserNormalManager.onConnection");

        socket.on("disconnect", this.onConnectionDisconnect.bind(this, socket));
        socket.on(MessageType.OpLoginGuest, this.OpLoginGuest.bind(this, socket));

        socket.on(MessageType.OpRoomGetRoomState, this.OpRoomGetRoomState.bind(this, socket));

        socket.on(MessageType.OpRoomJoin, this.OpRoomJoin.bind(this, socket));
        socket.on(MessageType.OpRoomMakeMove, this.OpRoomMakeMove.bind(this, socket));

        socket.on(MessageType.OpRoomMakeVote, this.OpRoomMakeVote.bind(this, socket));
    }

    public onConnectionDisconnect(socket : SocketIO.Socket){
        console.log("UserNormalManager.onConnectionDisconnect");

        let playerId : number | undefined = this.socketPlayerIdMap.get(socket);
        if(playerId != undefined){
            this.playerIdSocketMap.delete(playerId);
        }
        this.socketPlayerIdMap.delete(socket);
    }


    public OpLoginGuest(socket : SocketIO.Socket, message : string){
        console.log("SocketServerAgent.OpLoginGuest");
        {
            let playerId : number | undefined = this.socketPlayerIdMap.get(socket);
            if(playerId != undefined){
                this.playerIdSocketMap.delete(playerId);
            }
            this.socketPlayerIdMap.delete(socket);
        }

        let opUserLoginGuestMsg = createMessageFromString(message, OpUserLoginGuestMessage);
        if(opUserLoginGuestMsg == null){
            return;
        }


        let onUserLoginGuestMsgType = UserSingleton.getInstance().getUserDataForGuestToken(opUserLoginGuestMsg.guestToken);
        let onUserLoginGuestMsg  = new OnUserLoginGuestMessage(onUserLoginGuestMsgType);


        let playerId = onUserLoginGuestMsg.playerId;

        this.playerIdSocketMap.set(playerId, socket);
        this.socketPlayerIdMap.set(socket, playerId);


        this.socketServerAgent.emitMessage(playerId, opUserLoginGuestMsg, onUserLoginGuestMsg);
    }

    public OpRoomGetRoomState(socket : SocketIO.Socket, messsage : string){
        console.log("SocketServerAgent.OpRoomGetRoomState");
        let playerId = this.socketPlayerIdMap.get(socket);
        if(playerId == undefined){
            return;
        }

        let opRoomGetRoomStateMsg = createMessageFromString(messsage, OpRoomGetRoomStateMessage);
        if(opRoomGetRoomStateMsg == null){
            return;
        }

        this.socketServerAgent.OpRoomGetRoomState(playerId, opRoomGetRoomStateMsg)
    }

    public OpRoomJoin(socket : SocketIO.Socket, message : string){
        let playerId = this.socketPlayerIdMap.get(socket);
        if(playerId == undefined){
            return;
        }

        let opRoomJoinMsg = createMessageFromString(message, OpRoomJoinMessage);
        if(opRoomJoinMsg == null){
            return;
        }

        this.socketServerAgent.OpRoomJoin(playerId, opRoomJoinMsg);
    }

    public OpRoomMakeMove(socket : SocketIO.Socket, message : string){
        let playerId = this.socketPlayerIdMap.get(socket);
        if(playerId == undefined){
            return;
        }

        let opRoomMakeMoveMsg = createMessageFromString(message, OpRoomMakeMoveMessage);
        if(opRoomMakeMoveMsg == null){
            return;
        }

        this.socketServerAgent.OpRoomMakeMove(playerId, opRoomMakeMoveMsg);
    }

    public OpRoomMakeVote(socket : SocketIO.Socket, message : string){
        let playerId = this.socketPlayerIdMap.get(socket);
        if(playerId == undefined){
            return;
        }

        let opRoomMakeVoteMsg = createMessageFromString(message, OpRoomMakeVoteMessage);
        if(opRoomMakeVoteMsg == null){
            return;
        }

        this.socketServerAgent.OpRoomMakeVote(playerId, opRoomMakeVoteMsg);
    }
}