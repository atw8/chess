import Socket = require("socket.io-client");

import {
    ClientServerMessage,
    MessageType, OnGetRoomsListMessage,
    OnLoginGuestMessage, OpGetRoomsListMessage, OpLoginGuestMessage,
    ServerClientMessage,
    ErrorCode, OpJoinRoomMessage
} from "./../../shared/MessageTypes";



import {SocketClientInterface} from "./SocketClientInterface";


export class SocketClientAgent {
    private socket : SocketIOClient.Socket;

    private token ?: string;

    private isConnected : boolean;


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

        this.requestId = 0;

        this.latency = null;
        this.minTimeDiff = null;
        this.maxTimeDiff = null;


        this.isConnected = false;

        this.socket = Socket();
        this.socket.on("connect", this.OnConnect.bind(this));
        this.socket.on("disconnect", this.OnDisconnect.bind(this));

        this.socket.on(MessageType.OnLoginGuest, this.OnLoginGuest.bind(this));
        this.socket.on(MessageType.OnGetRoomsList, this.OnGetRoomList.bind(this));
    }



    public getIsConnected():boolean {
        return this.isConnected;
    }

    public OnConnect(){
        console.debug("onConnect");
        this.isConnected = true;

        this.socketClientInterface.OnConnect();

        this.OpLoginGuest(this.token);
    }
    public OnDisconnect(){
        console.debug("onDisconnect");
        this.isConnected = false;

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


        this.OpJoinRoom();
    }


    public OpGetRoomList(){
        let opGetRoomListMessage : OpGetRoomsListMessage = new OpGetRoomsListMessage();

        this.emitClientServerMessage(opGetRoomListMessage);
    }
    public OnGetRoomList(message : string){
        let onGetRoomListMessage : OnGetRoomsListMessage | null = OnGetRoomsListMessage.createFromString(message);
        if(onGetRoomListMessage == null){
            return;
        }

        this.updateLatencyTimeDiff(onGetRoomListMessage);
    }


    public OpJoinRoom(roomId ?: number){
        let opJoinRoomMessage : OpJoinRoomMessage  = new OpJoinRoomMessage(roomId);

        this.emitClientServerMessage(opJoinRoomMessage);
    }




}