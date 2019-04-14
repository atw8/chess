import {SocketClientAgent} from "./SocketClientAgent";

import {
    ErrorCode,
    OnRoomGetListMessage,
    OnRoomJoinBroadcastMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage,
    OnUserLoginGuestMessage,
    RoomInitConfig,
    RoomStateConfig
} from "./../../shared/MessageTypes";

import {SocketClientInterface} from "./SocketClientInterface";
import {BoardView} from "../view/BoardView";

import {ChessEngine} from "../../shared/engine/ChessEngine";
import {MoveClass} from "../../shared/engine/MoveClass";
import {OnRoomJoinMessage} from "../../shared/MessageTypes";
import {MainLayer} from "../MainLayer";
import {TouchLayer} from "../view/TouchLayer";
import {SideType} from "../../shared/engine/SideType";
import {GameTimeAbstract} from "../../shared/gameTime/GameTimeAbstract";
import {GameTimeType} from "../../shared/gameTime/GameTimeType";
import {GameTimeInfinite} from "../../shared/gameTime/GameTimeInfinite";
import {GameTimeMove} from "../../shared/gameTime/GameTimeMove";
import {GameTimeNormal} from "../../shared/gameTime/GameTimeNormal";


export class Controller implements SocketClientInterface{
    private socketClientAgent : SocketClientAgent;

    private uiTouchLayer : TouchLayer;

    constructor(){
        this.socketClientAgent = new SocketClientAgent(this);
        this.chessEngine = new ChessEngine();
        this.gameTimeStructs = {};

        this.uiTouchLayer = new TouchLayer(this);
        this.uiTouchLayer.setIsEnabled(false);

        PIXI.ticker.shared.add(this.tick, this);
    }


    private uiBoardView : BoardView;
    private uiMainLayer : MainLayer;
    private chessEngine : ChessEngine;
    private gameTimeStructs : { [key : number] : GameTimeAbstract};

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
        let sanMove = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);
        this.socketClientAgent.OpRoomMakeMove(1, sanMove);
    }
    public notifyPromote(moveClass : MoveClass[]):void{
        this.uiTouchLayer.setIsEnabled(false);

        this.uiMainLayer.showPromotePieceLayer(moveClass, this.notifyMove.bind(this))
    }




    public OnConnect(){

    }
    public OnDisconnect(){

    }

    public OnLoginGuest(onLoginGuestMessage :OnUserLoginGuestMessage){

    }
    public OnRoomGetList(onGetRoomListMessage : OnRoomGetListMessage){

    }

    public OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage){
        if(onRoomJoinMsg.errorCode == ErrorCode.SUCCESS || onRoomJoinMsg.errorCode == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM){
            this.roomInitConfig = <RoomInitConfig> onRoomJoinMsg.roomInitConfig;
            this.roomStateConfig = <RoomStateConfig> onRoomJoinMsg.roomStateConfig;

            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                switch (this.roomInitConfig.gameTimeStructs[sideType].timeType) {
                    case GameTimeType.INFINITE:
                    {
                        this.gameTimeStructs[sideType] = new GameTimeInfinite();
                    }
                        break;
                    case GameTimeType.MOVE:
                    {
                        let totalTime = <number>this.roomInitConfig.gameTimeStructs[sideType].totalTime;
                        this.gameTimeStructs[sideType] = new GameTimeMove(totalTime);
                    }
                        break;
                    case GameTimeType.NORMAL:
                    {
                        let totalTime = <number>this.roomInitConfig.gameTimeStructs[sideType].totalTime;
                        let incrTime = <number>this.roomInitConfig.gameTimeStructs[sideType].incrTime;
                        this.gameTimeStructs[sideType] = new GameTimeNormal(totalTime, incrTime);
                    }
                        break;
                }
            }

            this.chessEngine.init(this.roomInitConfig);
            for(let i = 0; i < this.roomStateConfig.sanMoves.length; i++){
                let sanMove = this.roomStateConfig.sanMoves[i];
                this.chessEngine.doMoveSan(sanMove);
            }

            this.uiBoardView.updateViewToModel(this.chessEngine);


            {
                let timeStamp = this.socketClientAgent.getServerTimeStamp();
                for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                    this.uiMainLayer.setTime(sideType, this.gameTimeStructs[sideType].getCurrentTime(sideType, timeStamp));
                }
            }


            let sideType = <SideType>this.roomStateConfig.getSideTypeForPlayerId(this.socketClientAgent.getPlayerId());
            this.uiBoardView.setBoardFacing(sideType, false);
        }



        this.gameTimeStructs[SideType.WHITE].start(this.socketClientAgent.getServerTimeStamp());
        this.gameTimeStructs[SideType.BLACK].start(this.socketClientAgent.getServerTimeStamp());
    }
    public OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage){
        this.roomStateConfig = <RoomStateConfig> onRoomJoinBroadcastMsg.roomStateConfig;

        this.synchronizeIsWaiting();
    }



    public OnRoomMakeMove(onRoomMakeMoveMsg: OnRoomMakeMoveMessage): void {
        if(onRoomMakeMoveMsg.getErrorCode() != ErrorCode.SUCCESS){
            return;
        }

        this._OnRoomMakeMove(onRoomMakeMoveMsg.sanMove);
    }
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg: OnRoomMakeMoveBroadcastMessage): void {
        if(onRoomMakeMoveBroadcastMsg.errorCode != ErrorCode.SUCCESS){
            return;
        }
        this._OnRoomMakeMove(onRoomMakeMoveBroadcastMsg.sanMove);
    }
    public _OnRoomMakeMove(sanMove : string){
        let moveClass = this.chessEngine.getMoveClassForCurrentBoardAndSanMove(sanMove);
        if(moveClass == null){
            console.log("OnRoomMakeMove moveClass == null");
            return;
        }
        this.chessEngine.doMove(moveClass);
        this.uiBoardView.doMove(moveClass);

        this.synchronizeIsWaiting();
    }
    public synchronizeIsWaiting(){
        this.uiMainLayer.setWaitingNodeVisible(this.roomStateConfig.isWaiting);

        if(this.roomStateConfig.isWaiting){
            this.uiTouchLayer.setIsEnabled(false);
        }else {
            let mySideType = this.roomStateConfig.getSideTypeForPlayerId(this.socketClientAgent.getPlayerId())

            this.uiTouchLayer.setIsEnabled(this.chessEngine.getMoveTurn() == mySideType);
        }
    }


    public tick(dt : number):void{
        if(this.roomStateConfig == undefined){
            return;
        }
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let currentTime = this.gameTimeStructs[sideType].getCurrentTime(sideType, this.socketClientAgent.getServerTimeStamp())
            this.uiMainLayer.setTime(sideType, currentTime);
        }
        //console.log("tick ", dt);
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