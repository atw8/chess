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
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";

export class ControllerOuter implements SocketClientInterface{
    private uiLogoLayer : LogoLayer;
    private socketClientAgent : SocketClientAgent;


    private roomIdMap : { [key : number] : ControllerInner};
    private roomIdLayerMap : { [key : number] : ParentBoardView};

    constructor(uiLogoLayer : LogoLayer){
        this.uiLogoLayer = uiLogoLayer;
        this.socketClientAgent = new SocketClientAgent(this);

        this.roomIdMap = {};
        this.roomIdLayerMap = {};
    }




    public getOrCreateController(roomId : number):ControllerInner{
        if(this.roomIdMap[roomId] == undefined){
            let controllerInner = new ControllerInner(roomId, this);
            let parentBoardView = new ParentBoardView(controllerInner);

            this.roomIdMap[roomId] = controllerInner;
            this.roomIdLayerMap[roomId] = parentBoardView;

            this.uiLogoLayer.addLayer(parentBoardView);
        }

        return this.roomIdMap[roomId];
    }
    public removeController(roomId : number):void{
        delete this.roomIdMap[roomId];

        let parentBoardView = this.roomIdLayerMap[roomId];
        if(parentBoardView != undefined){
            this.uiLogoLayer.removeLayer(parentBoardView);
        }

        delete this.roomIdLayerMap[roomId];

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
        if(!(onLoginGuestMsg.getErrorCode() == ErrorCode.SUCCESS)){
            return;
        }

        let removeRoomIds : number[] = [];

        for(let _roomId in this.roomIdMap){
            let roomId = parseInt(_roomId);

            let isRemove : boolean = true;

            for(let i = 0; i < onLoginGuestMsg.roomIds.length && isRemove; i++){
                if(onLoginGuestMsg.roomIds[i] == roomId){
                    isRemove = false;
                }
            }

            if(isRemove){
                removeRoomIds.push(roomId);
            }
        }

        for(let i = 0; i < removeRoomIds.length; i++){
            let roomId = removeRoomIds[i];
            this.removeController(roomId);
        }
    }

    public OpRoomJoin(opRoomJoinMsgParams : { roomId ?: number, roomInitConfig ?: RoomInitConfig}){
        this.socketClientAgent.OpRoomJoin(opRoomJoinMsgParams);
    }
    public OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void {
        if(!(onRoomJoinMsg.errorCode == ErrorCode.SUCCESS || onRoomJoinMsg.errorCode == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM)){
            return;
        }

        let roomId = <number>onRoomJoinMsg.roomId;

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomJoin(onRoomJoinMsg);
    }
    public OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void {
        if(!(onRoomJoinBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = <number>onRoomJoinBroadcastMsg.roomId;

        let controller = this.getOrCreateController(roomId);

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

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomMakeMove(onRoomMakeMoveMsg);
    }
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void {
        if(!(onRoomMakeMoveBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = <number>onRoomMakeMoveBroadcastMsg.roomId;

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg);
    }

    public OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage):void {
        if(!(onRoomTimeOutBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = <number>onRoomTimeOutBroadcastMsg.roomId;

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg);
    }
}