import Socket = require("socket.io-client");
import {
    ClientServerMessage,
    ErrorCode,
    MessageType,
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage,
    OnRoomTimeOutBroadcastMessage,
    OnUserLoginGuestMessage,
    OpRoomJoinMessage,
    OpRoomMakeMoveMessage,
    OpUserLoginGuestMessage,
    RoomInitConfig,
    RoomStateConfig,
    ServerClientMessage,
} from "./../../shared/MessageTypes";


import {SocketClientInterface} from "./SocketClientInterface";
import {LocalStorageManager} from "../LocalStorageManager";


export class SocketClientAgent {
    private socket : SocketIOClient.Socket;

    private requestId : number;

    private localStartTimeStamps : { [key : number]  : number };

    private latency : number | null;
    private minTimeDiff : number | null;
    private maxTimeDiff : number | null;


    private socketClientInterface : SocketClientInterface;




    private playerId : number;
    public getPlayerId():number{
        return this.playerId;
    }



    private roomInitConfigs : { [key : number] : RoomInitConfig } = {};
    private roomStateConfigs : { [key : number] : RoomStateConfig } = {};

    public getRoomInitConfig(roomId : number):RoomInitConfig{
        return this.roomInitConfigs[roomId];
    }
    public getRoomStateConfig(roomId : number):RoomStateConfig{
        return this.roomStateConfigs[roomId];
    }

    constructor(socketClientInterface : SocketClientInterface){
        console.log("SocketClientAgent.constructor");

        this.roomInitConfigs = {};

        this.socketClientInterface = socketClientInterface;

        this.localStartTimeStamps = {};



        this.requestId = 0;

        this.latency = null;
        this.minTimeDiff = null;
        this.maxTimeDiff = null;

        this.socket = Socket();

        this.socket.on("connect", this.OnConnect.bind(this));
        this.socket.on("disconnect", this.OnDisconnect.bind(this));

        this.socket.on(MessageType.OnLoginGuest, this.OnLoginGuest.bind(this));

        this.socket.on(MessageType.OnRoomJoin, this.OnRoomJoin.bind(this));
        this.socket.on(MessageType.OnRoomJoinBroadcast, this.OnRoomJoinBroadcast.bind(this));

        this.socket.on(MessageType.OnRoomMakeMove, this.OnRoomMakeMove.bind(this));
        this.socket.on(MessageType.OnRoomMakeMoveBroadcast, this.OnRoomMakeMoveBroadcast.bind(this));

        this.socket.on(MessageType.OnRoomTimeOutBroadcast, this.OnRoomTimeOutBroadcast.bind(this));
    }


    public OnConnect(){
        console.debug("onConnect");

        this.socketClientInterface.OnConnect();


        this.OpLoginGuest(LocalStorageManager.getGuestToken());
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
        console.debug("OpLoginGuest ", token);
        let opLoginGuestMessage : OpUserLoginGuestMessage = new OpUserLoginGuestMessage(token);

        this.emitClientServerMessage(opLoginGuestMessage);
    }
    public OnLoginGuest(message : string){
        console.debug("OnLoginGuest ", message);
        let onLoginGuestMessage : OnUserLoginGuestMessage | null = OnUserLoginGuestMessage.createFromString(message);
        if(onLoginGuestMessage == null){
            return;
        }

        this.updateLatencyTimeDiff(onLoginGuestMessage);
        if(onLoginGuestMessage.getErrorCode() != ErrorCode.SUCCESS){
            return
        }


        LocalStorageManager.setGuestToken(onLoginGuestMessage.guestToken);
        this.playerId = onLoginGuestMessage.playerId;



        for(let i = 0; i < onLoginGuestMessage.roomIds.length; i++){
            let roomId = onLoginGuestMessage.roomIds[i];
            this.OpRoomJoin({roomId : roomId})
        }

        this.socketClientInterface.OnLoginGuest(onLoginGuestMessage);
    }




    public OpRoomJoin(opRoomJoinMsgParams : { roomId ?: number, roomInitConfig ?: RoomInitConfig}){
        //console.debug("OpRoomJoin ", roomId);
        let opRoomJoinMsg : OpRoomJoinMessage  = new OpRoomJoinMessage();
        opRoomJoinMsg.roomId = opRoomJoinMsgParams.roomId;
        opRoomJoinMsg.roomInitConfig = opRoomJoinMsgParams.roomInitConfig;
        //opRoomJoinMsg.roomInitConfig = roomInitConfig;

        this.emitClientServerMessage(opRoomJoinMsg);
    }
    public OnRoomJoin(message : string) {
        console.debug("OnRoomJoin ", message);
        let onRoomJoinMsg: OnRoomJoinMessage | null = OnRoomJoinMessage.createFromString(message);
        if(onRoomJoinMsg == null){
            return;
        }

        this.updateLatencyTimeDiff(onRoomJoinMsg);

        if(onRoomJoinMsg.getErrorCode() == ErrorCode.SUCCESS || onRoomJoinMsg.getErrorCode() == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM){
            let roomId = <number>onRoomJoinMsg.roomId;

            this.roomInitConfigs[roomId] = <RoomInitConfig>onRoomJoinMsg.roomInitConfig;
            this.roomStateConfigs[roomId] = <RoomStateConfig>onRoomJoinMsg.roomStateConfig;
        }

        this.socketClientInterface.OnRoomJoin(onRoomJoinMsg);
    }
    public OnRoomJoinBroadcast(message : string){
        console.debug("OnRoomJoinBroadcast ", message);
        let onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage | null = OnRoomJoinBroadcastMessage.createFromString(message);
        if(onRoomJoinBroadcastMsg == null){
            return;
        }


        if(onRoomJoinBroadcastMsg.getErrorCode() == ErrorCode.SUCCESS){
            let roomStateConfig = this.roomStateConfigs[onRoomJoinBroadcastMsg.roomId];

            roomStateConfig.roomState = onRoomJoinBroadcastMsg.roomState;
            roomStateConfig.sideTypeMap = onRoomJoinBroadcastMsg.sideTypeMap;

            roomStateConfig.chessGameState = onRoomJoinBroadcastMsg.chessGameState;
            roomStateConfig.roomState = onRoomJoinBroadcastMsg.roomState;
            roomStateConfig.timeStamps.push(onRoomJoinBroadcastMsg.beginTimeStamp);
        }
        this.socketClientInterface.OnRoomJoinBroadcast(onRoomJoinBroadcastMsg);
    }



    public OpRoomMakeMove(roomId : number, sanMove : string){
        console.debug("OpRoomMakeMove ", roomId, " ", sanMove);
        let opRoomMakeMoveMsg : OpRoomMakeMoveMessage = new OpRoomMakeMoveMessage(roomId, sanMove);

        this.emitClientServerMessage(opRoomMakeMoveMsg);
    }
    public OnRoomMakeMove(message : string){
        console.debug("OnRoomMakeMove ", message);
        let onRoomMakeMoveMsg: OnRoomMakeMoveMessage | null = OnRoomMakeMoveMessage.createFromString(message);
        if(onRoomMakeMoveMsg == null){
            return;
        }

        this.updateLatencyTimeDiff(onRoomMakeMoveMsg);

        if(onRoomMakeMoveMsg.getErrorCode() == ErrorCode.SUCCESS){
            let roomStateConfig = this.roomStateConfigs[onRoomMakeMoveMsg.roomId];

            roomStateConfig.sanMoves.push(onRoomMakeMoveMsg.sanMove);
            roomStateConfig.timeStamps.push(onRoomMakeMoveMsg.timeStamp);

            if(onRoomMakeMoveMsg.roomState != undefined){
                roomStateConfig.roomState = onRoomMakeMoveMsg.roomState;
            }
            if(onRoomMakeMoveMsg.chessGameState != undefined){
                roomStateConfig.chessGameState = onRoomMakeMoveMsg.chessGameState;
            }
        }

        this.socketClientInterface.OnRoomMakeMove(onRoomMakeMoveMsg);
    }
    public OnRoomMakeMoveBroadcast(message : string){
        console.debug("OnRoomMakeMoveBroadcast ", message);
        let onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage | null = OnRoomMakeMoveBroadcastMessage.createFromString(message);
        if(onRoomMakeMoveBroadcastMsg == null){
            return;
        }

        if(onRoomMakeMoveBroadcastMsg.getErrorCode() == ErrorCode.SUCCESS){
            let roomStateConfig = this.roomStateConfigs[onRoomMakeMoveBroadcastMsg.roomId];

            roomStateConfig.sanMoves.push(onRoomMakeMoveBroadcastMsg.sanMove);
            roomStateConfig.timeStamps.push(onRoomMakeMoveBroadcastMsg.timeStamp);

            if(onRoomMakeMoveBroadcastMsg.roomState != undefined){
                roomStateConfig.roomState = onRoomMakeMoveBroadcastMsg.roomState;
            }
            if(onRoomMakeMoveBroadcastMsg.chessGameState != undefined){
                roomStateConfig.chessGameState = onRoomMakeMoveBroadcastMsg.chessGameState;
            }
        }


        this.socketClientInterface.OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg);
    }


    public OnRoomTimeOutBroadcast(message : string){
        console.debug("OnRoomTimeOutBroadcast ", message);
        let onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage | null = OnRoomTimeOutBroadcastMessage.createFromString(message);
        if(onRoomTimeOutBroadcastMsg == null){
            return;
        }

        if(onRoomTimeOutBroadcastMsg.getErrorCode() == ErrorCode.SUCCESS){
            let roomStateConfig = this.roomStateConfigs[onRoomTimeOutBroadcastMsg.roomId];

            roomStateConfig.roomState = onRoomTimeOutBroadcastMsg.roomState;
            roomStateConfig.chessGameState = onRoomTimeOutBroadcastMsg.chessGameState;
            roomStateConfig.timeStamps.push(onRoomTimeOutBroadcastMsg.endTimeStamp);
        }

        this.socketClientInterface.OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg);
    }


}