import {SocketClientAgent} from "./SocketClientAgent";

import {
    ErrorCode,
    OnRoomGetListMessage,
    OnRoomJoinBroadcastMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage,
    OnRoomTimeOutBroadcastMessage,
    OnUserLoginGuestMessage
} from "./../../shared/MessageTypes";

import {SocketClientInterface} from "./SocketClientInterface";
import {ControllerAbstract} from "./ControllerAbstract";

import {BoardView} from "../view/BoardView";

import {ChessEngine} from "../../shared/engine/ChessEngine";
import {MoveClass} from "../../shared/engine/MoveClass";
import {OnRoomJoinMessage} from "../../shared/MessageTypes";
import {MainLayer} from "../MainLayer";
import {TouchLayer} from "../view/TouchLayer";
import {SideType} from "../../shared/engine/SideType";

import {RoomStateEnum} from "../../shared/RoomStateEnum";
import {GameTimeManager} from "../../shared/gameTime/GameTimeManager";
import {DomainMapStruct} from "../../shared/DomainMapStruct";
import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";


export class Controller implements SocketClientInterface, ControllerAbstract{
    private socketClientAgent : SocketClientAgent;

    private roomId : number;

    private uiBoardView : BoardView;
    private uiMainLayer : MainLayer;
    private chessEngine : ChessEngine;

    private gameTimeManager : GameTimeManager;
    private sideTypeMapStruct : DomainMapStruct<SideType, number>;


    private uiTouchLayer : TouchLayer;

    constructor(){
        this.socketClientAgent = new SocketClientAgent(this);
        this.chessEngine = new ChessEngine();

        //this.gameTimeManager;


        this.uiTouchLayer = new TouchLayer(this);
        this.uiTouchLayer.setIsEnabled(false);

        PIXI.ticker.shared.add(this.tick, this);
    }


    public setParentBoardView(uiParentView: MainLayer, uiBoardView: BoardView): void {
        this.uiMainLayer = uiParentView;

        this.uiBoardView = uiBoardView;
        this.uiBoardView.updateViewToModel(null);

        this.synchronizeTouchLayer();

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
        if(!(onRoomJoinMsg.errorCode == ErrorCode.SUCCESS || onRoomJoinMsg.errorCode == ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM)){
            return;
        }
        this.roomId = <number>onRoomJoinMsg.roomId;

        let roomInitConfig = this.socketClientAgent.getRoomInitConfig(this.roomId);
        let roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);

        this.gameTimeManager = new GameTimeManager(roomInitConfig.gameTimeStructs);

        this.sideTypeMapStruct = new DomainMapStruct<SideType, number>([SideType.WHITE, SideType.BLACK]);
        this.sideTypeMapStruct.setDomainMap(roomStateConfig.sideTypeMap);

        this.chessEngine.init(roomInitConfig);
        for(let i = 0; i < roomStateConfig.sanMoves.length; i++){
            let sanMove = roomStateConfig.sanMoves[i];
            this.chessEngine.doMoveSan(sanMove);
        }
        for(let i = 0; i < roomStateConfig.timeStamps.length; i++){
            let timeStamp = roomStateConfig.timeStamps[i];
            this.gameTimeManager.doMove(timeStamp);
        }

        {
            let m_askDrawMap = roomStateConfig.askDrawMap;
            let m_isLoseByTime = roomStateConfig.isLoseByTimeMap;
            let m_isResignMap = roomStateConfig.isResignMap;

            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                this.chessEngine.setIsAskForDraw(sideType, m_askDrawMap[sideType]);
                this.chessEngine.setIsLoseByTime(sideType, m_isLoseByTime[sideType]);
                this.chessEngine.setIsResign(sideType, m_isResignMap[sideType]);
            }
        }


        this.uiBoardView.updateViewToModel(this.chessEngine);

        {
            let timeStamp = this.socketClientAgent.getServerTimeStamp();
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                this.uiMainLayer.setTime(sideType, this.gameTimeManager.getCurrentTime(sideType, timeStamp));
            }
        }




        let mySideType = <SideType>this.sideTypeMapStruct.getKeyForValue(this.socketClientAgent.getPlayerId());

        this.uiBoardView.setBoardFacing(mySideType, false);
        //this.gameTimeStructs[SideType.WHITE].start(this.socketClientAgent.getServerTimeStamp());
        //this.gameTimeStructs[SideType.BLACK].start(this.socketClientAgent.getServerTimeStamp());

        this.synchronizeIsWaiting();
    }

    public OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage){
        this.gameTimeManager.start(onRoomJoinBroadcastMsg.beginTimeStamp);
        this.sideTypeMapStruct.setDomainMap(onRoomJoinBroadcastMsg.sideTypeMap);


        this.synchronizeIsWaiting();
    }


    public OnRoomMakeMove(onRoomMakeMoveMsg: OnRoomMakeMoveMessage): void {
        if(onRoomMakeMoveMsg.getErrorCode() != ErrorCode.SUCCESS){
            return;
        }

        this._OnRoomMakeMove(onRoomMakeMoveMsg.sanMove, onRoomMakeMoveMsg.timeStamp);
    }
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg: OnRoomMakeMoveBroadcastMessage): void {
        if(onRoomMakeMoveBroadcastMsg.errorCode != ErrorCode.SUCCESS){
            return;
        }
        this._OnRoomMakeMove(onRoomMakeMoveBroadcastMsg.sanMove, onRoomMakeMoveBroadcastMsg.timeStamp);
    }
    public _OnRoomMakeMove(sanMove : string, timeStamp : number){
        let moveClass = this.chessEngine.getMoveClassForCurrentBoardAndSanMove(sanMove);
        if(moveClass == null){
            console.log("OnRoomMakeMove moveClass == null");
            return;
        }
        this.chessEngine.doMove(moveClass);
        this.uiBoardView.doMove(moveClass);

        this.gameTimeManager.doMove(timeStamp);


        this.synchronizeIsWaiting();

        if(this.chessEngine.getGameState() != ChessGameStateEnum.NORMAL){
            this.uiMainLayer.showWinNode(this.chessEngine.getGameState());
        }
    }


    public synchronizeIsWaiting(){
        let roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);
        this.uiMainLayer.setWaitingNodeVisible(roomStateConfig.roomState != RoomStateEnum.NORMAL);



        if(roomStateConfig.roomState != RoomStateEnum.NORMAL){
            this.uiTouchLayer.setIsEnabled(false);
        }else {
            let mySideType = <SideType>this.sideTypeMapStruct.getKeyForValue(this.socketClientAgent.getPlayerId());


            this.uiTouchLayer.setIsEnabled(this.chessEngine.getMoveTurn() == mySideType);
        }
    }

    public OnRoomTimeOutBroadcast(onRoomTimeOutBroadcast : OnRoomTimeOutBroadcastMessage){
        let roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);
        this.gameTimeManager.end(onRoomTimeOutBroadcast.endTimeStamp);

        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.chessEngine.setIsLoseByTime(sideType, onRoomTimeOutBroadcast.isLoseByTimeMap[sideType]);
        }


        this.uiMainLayer.showWinNode(this.chessEngine.getGameState());
    }


    public tick(dt : number):void{
        let roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);

        if(roomStateConfig == undefined){
            return;
        }

        if(roomStateConfig.roomState != RoomStateEnum.NORMAL){
            return;
        }


        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let currentTime = this.gameTimeManager.getCurrentTime(sideType, this.socketClientAgent.getServerTimeStamp());
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