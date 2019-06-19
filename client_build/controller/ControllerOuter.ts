import {LogoLayer} from "../LogoLayer";
import {SocketClientAgent} from "./SocketClientAgent";
import {SocketClientInterface} from "./SocketClientInterface";
import {
    ErrorCode, OnRoomGetRoomStateMessage,
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage, OnRoomMakeVoteMessage, OnRoomMultiplayerStateBroadcastMessage,
    OnRoomTimeOutBroadcastMessage, OnRoomVotingUpdateBroadcastMessage,
    OnUserLoginGuestMessage, OpRoomMakeVoteMessage,
    RoomInitConfig, RoomStateConfig
} from "../../shared/MessageTypes";
import {ControllerAbstract} from "./ControllerAbstract";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";
import {ControllerNormalGame} from "./ControllerNormalGame";
import {ControllerMultiplayerGame} from "./ControllerMultiplayerGame";

import {RoomTypeEnum} from "../../shared/RoomTypeEnum";
import {LocalStorageManager} from "../LocalStorageManager";
import {SplashScreenLayer} from "../SplashScreenLayer";

export class ControllerOuter implements SocketClientInterface{
    private uiLogoLayer : LogoLayer;
    private socketClientAgent : SocketClientAgent;


    private roomIdMap : { [key : number] : ControllerAbstract};
    private roomIdLayerMap : { [key : number] : ParentBoardView};

    constructor(uiLogoLayer : LogoLayer){
        this.uiLogoLayer = uiLogoLayer;
        this.socketClientAgent = new SocketClientAgent(this);

        this.roomIdMap = {};
        this.roomIdLayerMap = {};
    }




    public getOrCreateController(roomId : number):ControllerAbstract{
        if(this.roomIdMap[roomId] == undefined){
            let roomInitConfig = this.socketClientAgent.getRoomInitConfig(roomId);

            let controllerAbstract : ControllerAbstract;
            switch(roomInitConfig.roomTypeEnum){
                case RoomTypeEnum.NORMAL:
                    controllerAbstract = new ControllerNormalGame(roomId, this);
                    break;
                case RoomTypeEnum.MULTIPLAYER:
                    controllerAbstract = new ControllerMultiplayerGame(roomId, this);
                    break;
                default:
                    controllerAbstract = <ControllerNormalGame><unknown>"hello world";
                    break;
            }

            let parentBoardView = new ParentBoardView(controllerAbstract);

            this.roomIdMap[roomId] = controllerAbstract;
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


    private uiSplashScreen : SplashScreenLayer | null;
    public setSplashScreen(uiSplashScreen : SplashScreenLayer){
        this.uiSplashScreen = uiSplashScreen;
    }


    public OnConnect() : void {
        if(this.uiSplashScreen != null){
            this.uiSplashScreen.updateConnectState();
        }
    }
    public connect(){
        this.socketClientAgent.connect();
    }
    public isConnected():boolean{
        return this.socketClientAgent.isConnected();
    }
    public isDisconnected():boolean{
        return this.socketClientAgent.isDisconnected();
    }
    public OnDisconnect(reason : "io server disconnect" | "io client disconnect" | "ping timeout") : void {
        let removeRoomIds : number[] = [];

        for(let _roomId in this.roomIdMap){
            let roomId = parseInt(_roomId);

            removeRoomIds.push(roomId);
        }

        for(let i = 0; i < removeRoomIds.length; i++){
            let roomId = removeRoomIds[i];

            this.removeController(roomId);
        }

        if(this.uiSplashScreen != null){
            this.uiSplashScreen.updateConnectState();
        }
    }
    public OnConnectError() : void{

    }
    public OnConnectTimeOut() : void{

    }

    public OpLoginGuest(){
        this.socketClientAgent.OpLoginGuest(LocalStorageManager.getGuestToken());
    }

    public OnLoginGuest(onLoginGuestMsg :OnUserLoginGuestMessage) :void {}

    public OpRoomGetRoomState(){
        this.socketClientAgent.OpRoomGetRoomState();
    }
    public OnRoomGetRoomState(onRoomGetRoomStateMsg : OnRoomGetRoomStateMessage): void {
        let removeRoomIds : number[] = [];

        for(let _roomId in this.roomIdMap){
            let roomId = parseInt(_roomId);

            let isRemove : boolean = true;

            for(let i = 0; i < onRoomGetRoomStateMsg.roomIds.length && isRemove; i++){
                if(onRoomGetRoomStateMsg.roomIds[i] == roomId){
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

        let roomId = onRoomTimeOutBroadcastMsg.roomId;

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg);
    }


    public OpRoomMakeVote(roomId : number, myVoting : string):void {
        this.socketClientAgent.OpRoomMakeVote(roomId, myVoting);
    }
    public OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage):void {
        if(!(onRoomMakeVoteMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = onRoomMakeVoteMsg.roomId;

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomMakeVote(onRoomMakeVoteMsg);
    }

    public OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage):void {
        if(!(onRoomVotingUpdateBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = onRoomVotingUpdateBroadcastMsg.roomId;

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg);
    }

    public OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg : OnRoomMultiplayerStateBroadcastMessage):void{
        if(!(onRoomMultiplayerStateBroadcastMsg.errorCode == ErrorCode.SUCCESS)){
            return;
        }

        let roomId = onRoomMultiplayerStateBroadcastMsg.roomId;

        let controller = this.getOrCreateController(roomId);

        controller.OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg);
    }
}