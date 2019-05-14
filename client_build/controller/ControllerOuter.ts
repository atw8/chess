import {LogoLayer} from "../LogoLayer";
import {SocketClientAgent} from "./SocketClientAgent";
import {SocketClientInterface} from "./SocketClientInterface";
import {
    ErrorCode,
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage,
    OnRoomTimeOutBroadcastMessage,
    OnUserLoginGuestMessage,
    RoomInitConfig, RoomStateConfig
} from "../../shared/MessageTypes";
import {ControllerInner} from "./ControllerInner";

export class ControllerOuter implements SocketClientInterface{
    private uiLogoLayer : LogoLayer;
    private socketClientAgent : SocketClientAgent;


    private roomIdMap : { [key : number] : ControllerInner};

    constructor(uiLogoLayer : LogoLayer){
        this.uiLogoLayer = uiLogoLayer;
        this.socketClientAgent = new SocketClientAgent(this);

        this.roomIdMap = {};
    }



    public getOrAddController(roomId : number):ControllerInner{
        if(this.roomIdMap[roomId] == undefined){
            let controllerInner = new ControllerInner(roomId, this);
            this.uiLogoLayer.addParentBoardView(controllerInner);

            this.roomIdMap[roomId] = controllerInner;
        }

        return this.roomIdMap[roomId];
    }




    public getRoomInitConfig(roomId : number):RoomInitConfig{
        return this.socketClientAgent.getRoomInitConfig(roomId);
    }
    public getRoomStateConfig(roomId : number):RoomStateConfig{
        return this.socketClientAgent.getRoomStateConfig(roomId);
    }
    public getPlayerId():number{
        return this.socketClientAgent.getPlayerId();
    }
    public getServerTimeStamp():number{
        return this.socketClientAgent.getServerTimeStamp();
    }




    public OnConnect() : void {

    }
    public OnDisconnect() : void {

    }

    public OnLoginGuest(onLoginGuestMsg :OnUserLoginGuestMessage) :void {

    }

    public OpRoomJoin(opRoomJoinMsgParams : { roomId ?: number, roomInitConfig ?: RoomInitConfig}){
        this.socketClientAgent.OpRoomJoin(opRoomJoinMsgParams);
    }
    public OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void {
        if(!(onRoomJoinMsg.errorCode == ErrorCode.SUCCESS || onRoomJoinMsg.errorCode == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM)){
            return;
        }

        let roomId = <number>onRoomJoinMsg.roomId;

        let controller = this.getOrAddController(roomId);

        controller.OnRoomJoin(onRoomJoinMsg);
    }
    public OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void {
        if(!(onRoomJoinBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = <number>onRoomJoinBroadcastMsg.roomId;

        let controller = this.getOrAddController(roomId);

        controller.OnRoomJoinBroadcast(onRoomJoinBroadcastMsg);
    }


    public OpRoomMakeMove(roomId : number, sanMove : string){
        this.socketClientAgent.OpRoomMakeMove(roomId, sanMove);
    }
    public OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void {
        if(!(onRoomMakeMoveMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = <number>onRoomMakeMoveMsg.roomId;

        let controller = this.getOrAddController(roomId);

        controller.OnRoomMakeMove(onRoomMakeMoveMsg);
    }
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void {
        if(!(onRoomMakeMoveBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = <number>onRoomMakeMoveBroadcastMsg.roomId;

        let controller = this.getOrAddController(roomId);

        controller.OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg);
    }

    public OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage):void {
        if(!(onRoomTimeOutBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = <number>onRoomTimeOutBroadcastMsg.roomId;

        let controller = this.getOrAddController(roomId);

        controller.OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg);
    }
}