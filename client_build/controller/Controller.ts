import {SocketClientAgent} from "./SocketClientAgent";

import {
    OnRoomGetListMessage,
    OnLoginGuestMessage,
    OnRoomMakeMoveMessage,
    RoomStateConfig, RoomInitConfig, OnRoomJoinBroadcastMessage
} from "./../../shared/MessageTypes";

import {SocketClientInterface} from "./SocketClientInterface";
import {BoardView} from "../view/BoardView";

import {ChessEngine} from "../../shared/engine/ChessEngine";
import {MoveClass} from "../../shared/engine/MoveClass";
import {OnRoomJoinMessage} from "../../shared/MessageTypes";
import {SimpleGame} from "../app";
import {MainLayer} from "../MainLayer";
import {TouchLayer} from "../view/TouchLayer";

export class Controller implements SocketClientInterface{
    private socketClientAgent : SocketClientAgent;

    private uiTouchLayer : TouchLayer;

    constructor(){
        this.socketClientAgent = new SocketClientAgent(this);
        this.chessEngine = new ChessEngine();

        this.uiTouchLayer = new TouchLayer(this);
        this.uiTouchLayer.setIsEnabled(false);
    }


    private uiBoardView : BoardView;
    private uiMainLayer : MainLayer;
    private chessEngine : ChessEngine;

    private roomStateConfig : RoomStateConfig;
    private roomInitConfig : RoomInitConfig;


    public setParentView(uiMainLayer : MainLayer){
        this.uiMainLayer = uiMainLayer;

        this.synchronizeTouchLayer();
    }
    public setBoardView(uiBoardView : BoardView){
        this.uiBoardView = uiBoardView;
        this.uiBoardView.updateViewToModel(null);

        this.synchronizeTouchLayer();
    }


    public synchronizeTouchLayer(){
        if(this.uiMainLayer != undefined && this.uiBoardView != undefined){
            this.uiTouchLayer.setIsEnabled(true);
        }
    }


    public notifyMove(moveClass : MoveClass):void{
        this.uiTouchLayer.setIsEnabled(false);


        this.uiBoardView.doMoveAnimation(moveClass, false, false, null);
        this.uiBoardView.doMove(moveClass);
        let sanMove = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);

        //this.socketClientAgent.OpRoomMakeMove(0, sanMove);

        //this.uiBoardView.doMove(moveClass, )
        //this.chessEngine.doMove(moveClass);
        //this.uiBoardView.doMove(moveClass);
    }
    public notifyPromote(moveClass : MoveClass[]):void{
        this.uiTouchLayer.setIsEnabled(false);

        this.uiMainLayer.showPromotePieceLayer(moveClass, this.notifyMove.bind(this))
    }




    public OnConnect(){

    }
    public OnDisconnect(){

    }

    public OnLoginGuest(onLoginGuestMessage :OnLoginGuestMessage){

    }
    public OnRoomGetList(onGetRoomListMessage : OnRoomGetListMessage){

    }

    public synchronizeMove(moveClass : MoveClass){
        this.uiTouchLayer.setIsEnabled(false);
        this.uiBoardView.doMoveAnimation(moveClass, false, false, null);

        let sanMove = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);
        this.socketClientAgent.OpRoomMakeMove(0, sanMove);
    }

    public OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage){
        this.roomInitConfig = <RoomInitConfig> onRoomJoinMsg.roomInitConfig;
        this.roomStateConfig = <RoomStateConfig> onRoomJoinMsg.roomStateConfig;

        this.chessEngine.init(this.roomInitConfig);
        this.uiBoardView.updateViewToModel(this.chessEngine);


        this.synchronizeIsWaiting();
    }
    public OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage){
        this.roomStateConfig = <RoomStateConfig> onRoomJoinBroadcastMsg.roomStateConfig;


        this.synchronizeIsWaiting();
    }
    public synchronizeIsWaiting(){
        this.uiTouchLayer.setIsEnabled(!this.roomStateConfig.isWaiting);
        this.uiMainLayer.setWaitingNodeVisible(this.roomStateConfig.isWaiting);
    }


    public OnRoomMakeMove(onRoomMakeMoveMsg: OnRoomMakeMoveMessage): void {
        let moveClass = this.chessEngine.getMoveClassForCurrentBoardAndSanMove(onRoomMakeMoveMsg.sanMove);
        if(moveClass == null){
            console.log("OnRoomMakeMove moveClass == null");
            return;
        }
        this.chessEngine.doMove(moveClass);
        this.uiBoardView.doMove(moveClass);
    }

    /*
    public async OpLoginGuest():MessageOnLogin{

    }
    */

    /*
    public startGame(){
        let initParam = {isChess960 : false};
        this.chessEngine = new ChessEngine(initParam);
        this.boardView.updateViewToModel(this.chessEngine);
        this.touchLayer = new TouchLayer(this);
        this.touchLayer.setIsEnabled(true);


        this.predictPanel.setMoveTurn(this.chessEngine.getMoveTurn());


    }




    public notifyMove(moveClass : MoveClass) : boolean{
        let sanStr = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);


        let oldSanStr = this.predictPanel.setMyMoveSanStr(sanStr);
        if(oldSanStr != null){
            if(!this.predictPanel.isPredictMove(oldSanStr)){
                this.boardView.hidePredictMove(oldSanStr);
            }

        }

        this.boardView.showPredictMove(sanStr, moveClass);
        this.predictPanel.setPredictMove(sanStr, true);


        return true;
    }
    public startAnimation(moveClass : MoveClass, isUndoMove : boolean){

    }
    public endAnimation(moveClass : MoveClass, isUndoMove : boolean){

    }
    */


    public onTouchBegan(worldLocation : PIXI.Point){
        this.uiBoardView.onTouchBegan(worldLocation, this.chessEngine);
    }
    public onTouchMoved(worldLocation : PIXI.Point){
        this.uiBoardView.onTouchMoved(worldLocation, this.chessEngine);
    }
    public onTouchEnded(worldLocation : PIXI.Point){
        this.uiBoardView.onTouchEnded(worldLocation, this.chessEngine);
    }
}