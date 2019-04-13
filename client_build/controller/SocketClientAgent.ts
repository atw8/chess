import Socket = require("socket.io-client");

import {
    ClientServerMessage,
    MessageType, OnRoomGetListMessage,
    OnLoginGuestMessage, OpRoomGetListMessage, OpLoginGuestMessage,
    ServerClientMessage,
    ErrorCode, OpRoomJoinMessage, OnRoomJoinMessage, OnRoomJoinBroadcastMessage, OnRoomMakeMoveMessage, OpRoomMakeMoveMessage,
} from "./../../shared/MessageTypes";



import {SocketClientInterface} from "./SocketClientInterface";
import {LocalStorageKeys} from "../LocalStorageKeys";


export class SocketClientAgent {
    private socket : SocketIOClient.Socket;

    private token : string;

    private requestId : number;

    private localStartTimeStamps : { [key : number]  : number };

    private latency : number | null;
    private minTimeDiff : number | null;
    private maxTimeDiff : number | null;


    private socketClientInterface : SocketClientInterface;



    constructor(socketClientInterface : SocketClientInterface){
        console.log("SocketClientAgent.constructor");

        this.socketClientInterface = socketClientInterface;

        this.localStartTimeStamps = {};

        {
            let _token = localStorage.getItem(LocalStorageKeys.TOKEN);
            if(_token != null){
                this.token = _token;
            }
        }

        this.requestId = 0;

        this.latency = null;
        this.minTimeDiff = null;
        this.maxTimeDiff = null;

        this.socket = Socket();
        this.socket.on("connect", this.OnConnect.bind(this));
        this.socket.on("disconnect", this.OnDisconnect.bind(this));

        this.socket.on(MessageType.OnLoginGuest, this.OnLoginGuest.bind(this));
        this.socket.on(MessageType.OnRoomGetList, this.OnGetRoomList.bind(this));

        this.socket.on(MessageType.OnRoomJoin, this.OnRoomJoin.bind(this));
        this.socket.on(MessageType.OnRoomJoinBroadcast, this.OnRoomJoinBroadcast.bind(this));

        this.socket.on(MessageType.OnRoomMakeMove, this.OnRoomMakeMove.bind(this));


    }


    public OnConnect(){
        console.debug("onConnect");

        this.socketClientInterface.OnConnect();

        this.OpLoginGuest(this.token);
    }
    public OnDisconnect(){
        console.debug("onDisconnect");

        this.socketClientInterface.OnDisconnect();
    }

    public emitClientServerMessage(clientServerMessage : ClientServerMessage){
        clientServerMessage.setRequestId(this.getIncrRequestId());

        this.localStartTimeStamps[clientServerMessage.getRequestId()] = this.getTimeStamp();
        this.socket.emit(clientServerMessage.getMessageType(), JSON.stringify(clientServerMessage));
    }
    private getIncrRequestId():number{
        this.requestId++;

        return this.requestId;
    }



    private updateLatencyTimeDiff(serverClientMessage : ServerClientMessage){
        let _updateTimeDiff = (minTimeDiff : number, maxTimeDiff : number) => {
            if(this.minTimeDiff == null){
                this.minTimeDiff = minTimeDiff;
            }else {
                this.minTimeDiff = Math.max(this.minTimeDiff, minTimeDiff);
            }

            if(this.maxTimeDiff == null){
                this.maxTimeDiff = maxTimeDiff;
            }else {
                this.maxTimeDiff = Math.max(this.maxTimeDiff, maxTimeDiff);
            }
        };

        let requestId = serverClientMessage.getRequestId();
        if(!(requestId in this.localStartTimeStamps)){
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

    public getTimeStamp():number{
        return Date.now();
    }
    public getServerTimeStamp():number{
        return this.getTimeStamp() + (<number>this.minTimeDiff + <number>this.maxTimeDiff)/2;
    }







    //Related OpLoginGuest
    public OpLoginGuest(token ?: string){
        let opLoginGuestMessage : OpLoginGuestMessage = new OpLoginGuestMessage(token);

        this.emitClientServerMessage(opLoginGuestMessage);
    }
    public OnLoginGuest(message : string){
        let onLoginGuestMessage : OnLoginGuestMessage | null = OnLoginGuestMessage.createFromString(message);
        if(onLoginGuestMessage == null){
            return;
        }

        this.updateLatencyTimeDiff(onLoginGuestMessage);
        if(onLoginGuestMessage.getErrorCode() != ErrorCode.SUCCESS){
            return
        }


        this.token = onLoginGuestMessage.token;
        localStorage.setItem(LocalStorageKeys.TOKEN, this.token);


        this.OpRoomJoin(onLoginGuestMessage.roomId);

        this.socketClientInterface.OnLoginGuest(onLoginGuestMessage);
    }


    public OpGetRoomList(){
        let opGetRoomListMessage : OpRoomGetListMessage = new OpRoomGetListMessage();

        this.emitClientServerMessage(opGetRoomListMessage);
    }
    public OnGetRoomList(message : string){
        let onGetRoomListMessage : OnRoomGetListMessage | null = OnRoomGetListMessage.createFromString(message);
        if(onGetRoomListMessage == null){
            return;
        }


        this.updateLatencyTimeDiff(onGetRoomListMessage);

        this.socketClientInterface.OnRoomGetList(onGetRoomListMessage);
    }


    public OpRoomJoin(roomId ?: number){
        let opRoomJoinMsg : OpRoomJoinMessage  = new OpRoomJoinMessage(roomId);

        this.emitClientServerMessage(opRoomJoinMsg);
    }
    public OnRoomJoin(message : string) {
        let onRoomJoinMsg: OnRoomJoinMessage | null = OnRoomJoinMessage.createFromString(message);
        if(onRoomJoinMsg == null){
            return;
        }

        this.updateLatencyTimeDiff(onRoomJoinMsg);

        this.socketClientInterface.OnRoomJoin(onRoomJoinMsg);
    }
    public OnRoomJoinBroadcast(message : string){
        let onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage | null = OnRoomJoinBroadcastMessage.createFromString(message);
        if(onRoomJoinBroadcastMsg == null){
            return;
        }

        this.socketClientInterface.OnRoomJoinBroadcast(onRoomJoinBroadcastMsg);
    }



    public OpRoomMakeMove(roomId : number, sanMove : string){
        let opRoomMakeMoveMsg : OpRoomMakeMoveMessage = new OpRoomMakeMoveMessage(roomId, sanMove);

        this.emitClientServerMessage(opRoomMakeMoveMsg);
    }
    public OnRoomMakeMove(message : string){
        let onRoomMakeMoveMsg: OnRoomMakeMoveMessage | null = OnRoomMakeMoveMessage.createFromString(message);
        if(onRoomMakeMoveMsg == null){
            return;
        }

        this.updateLatencyTimeDiff(onRoomMakeMoveMsg);

        this.socketClientInterface.OnRoomMakeMove(onRoomMakeMoveMsg);
    }



}