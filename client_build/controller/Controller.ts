import {SocketClientAgent} from "./SocketClientAgent";

import {OnGetRoomsListMessage, OnLoginGuestMessage} from "./../../shared/MessageTypes";

import {SocketClientInterface} from "./SocketClientInterface";
import {BoardView} from "../view/BoardView";

import {ChessEngine} from "../../shared/engine/ChessEngine";

export class Controller implements SocketClientInterface{
    private socketClientAgent : SocketClientAgent;


    constructor(){
        this.socketClientAgent = new SocketClientAgent(this);
        this.chessEngine = new ChessEngine();
    }


    private boardView : BoardView;
    private chessEngine : ChessEngine;


    public setBoardView(boardView : BoardView){
        this.boardView = boardView;
        this.boardView.updateViewToModel(null);
    }



    private onConnectCallback : (() => void) | null = null;
    public setOnConnectCallback(onConnectCallback : (() => void) | null){
        this.onConnectCallback = onConnectCallback;
    }
    public OnConnect() : void{
        if(this.onConnectCallback != null){
            this.onConnectCallback();
        }
    }


    private onDisconnectCallback : (() => void) | null = null;
    public setOnDisconnectCallback(onDisconnectCallback : (() => void | null) | null){
        this.onDisconnectCallback = onDisconnectCallback;
    }
    public OnDisconnect() : void{
        if(this.onDisconnectCallback != null){
            this.onDisconnectCallback();
        }
    }

    private onLoginGuestCallback : ((onLoginGuestMessage :OnLoginGuestMessage) => void) | null = null;
    public setOnLoginGuestCallback(onLoginGuestCallback : ((onLoginGuestMessage :OnLoginGuestMessage) => void) | null){
        this.onLoginGuestCallback = onLoginGuestCallback;
    }
    public OnLoginGuest(onLoginGuestMessage :OnLoginGuestMessage) :void{
        if(this.onLoginGuestCallback != null) {
            this.onLoginGuestCallback(onLoginGuestMessage);
        }
    }

    private onGetRoomListCallback : ((onGetRoomListMessage :OnGetRoomsListMessage) => void) | null = null;
    public setOnGetRoomListCallback(onGetRoomListCallback : ((onGetRoomListMessage : OnGetRoomsListMessage) => void) | null){
        this.onGetRoomListCallback = onGetRoomListCallback;
    }
    public OnGetRoomList(onGetRoomListMessage : OnGetRoomsListMessage):void{
        if(this.onGetRoomListCallback != null){
            this.onGetRoomListCallback(onGetRoomListMessage);
        }
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
}