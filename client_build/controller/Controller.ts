import {SocketClientAgent} from "./SocketClientAgent";

import {OnGetRoomsListMessage, OnLoginGuestMessage} from "./../../shared/MessageTypes";

import {SocketClientInterface} from "./SocketClientInterface";
import {BoardView} from "../view/BoardView";

import {ChessEngine} from "../../shared/engine/ChessEngine";
import {MoveClass} from "../../shared/engine/MoveClass";
import {OnJoinRoomMessage} from "../../shared/MessageTypes";
import {SimpleGame} from "../app";
import {MainLayer} from "../MainLayer";
import {TouchLayer} from "../view/TouchLayer";

export class Controller implements SocketClientInterface{
    private socketClientAgent : SocketClientAgent;


    constructor(){
        this.socketClientAgent = new SocketClientAgent(this);
        this.chessEngine = new ChessEngine();

        let touchLayer = new TouchLayer(this);
    }


    private uiBoardView : BoardView;
    private uiMainLayer : MainLayer;
    private chessEngine : ChessEngine;


    public setParentView(uiMainLayer : MainLayer){
        this.uiMainLayer = uiMainLayer;
    }
    public setBoardView(uiBoardView : BoardView){
        this.uiBoardView = uiBoardView;
        this.uiBoardView.updateViewToModel(null);
    }


    public notifyMove(moveClass : MoveClass):boolean{
        if(this.chessEngine.isMoveLegal(moveClass, false)){
            this.chessEngine.doMove(moveClass);
            this.uiBoardView.doMove(moveClass);

            return false;
        }

        return true;
    }


    public OnConnect(){

    }
    public OnDisconnect(){

    }

    public OnLoginGuest(onLoginGuestMessage :OnLoginGuestMessage){

    }
    public OnGetRoomList(onGetRoomListMessage : OnGetRoomsListMessage){

    }
    public OnJoinRoom(onJoinRoomMessage : OnJoinRoomMessage){
        this.chessEngine.init(onJoinRoomMessage.roomInitConfig);
        this.uiBoardView.updateViewToModel(this.chessEngine);
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