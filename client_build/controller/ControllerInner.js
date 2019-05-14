"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SocketClientAgent_1 = require("./SocketClientAgent");
var MessageTypes_1 = require("./../../shared/MessageTypes");
var ChessEngine_1 = require("../../shared/engine/ChessEngine");
var TouchLayer_1 = require("../BoardViewLayer/TouchLayer");
var RoomStateEnum_1 = require("../../shared/RoomStateEnum");
var GameTimeManager_1 = require("../../shared/gameTime/GameTimeManager");
var DomainMapStruct_1 = require("../../shared/DomainMapStruct");
var ChessGameStateEnum_1 = require("../../shared/engine/ChessGameStateEnum");
var Controller = /** @class */ (function () {
    function Controller() {
        this.socketClientAgent = new SocketClientAgent_1.SocketClientAgent(this);
        this.chessEngine = new ChessEngine_1.ChessEngine();
        //this.gameTimeManager;
        this.uiTouchLayer = new TouchLayer_1.TouchLayer(this);
        this.uiTouchLayer.setIsEnabled(false);
        PIXI.ticker.shared.add(this.tick, this);
    }
    Controller.prototype.setLogoLayer = function (uiLogoLayer) {
        this.uiLogoLayer = uiLogoLayer;
    };
    Controller.prototype.setParentBoardView = function (uiParentView, uiBoardView) {
        this.uiParentView = uiParentView;
        this.uiBoardView = uiBoardView;
        this.uiBoardView.updateViewToModel(null);
        this.synchronizeTouchLayer();
        this.synchronizeTouchLayer();
    };
    Controller.prototype.synchronizeTouchLayer = function () {
        if (this.uiParentView != undefined && this.uiBoardView != undefined) {
            this.uiTouchLayer.setIsEnabled(true);
        }
    };
    Controller.prototype.notifyMove = function (moveClass) {
        this.uiTouchLayer.setIsEnabled(false);
        this.uiBoardView.doMoveAnimation(moveClass, false, false, null);
        var sanMove = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);
        this.socketClientAgent.OpRoomMakeMove(1, sanMove);
    };
    Controller.prototype.notifyPromote = function (moveClass) {
        this.uiTouchLayer.setIsEnabled(false);
        this.uiParentView.showPromotePieceLayer(moveClass, this.notifyMove.bind(this));
    };
    Controller.prototype.OnConnect = function () {
    };
    Controller.prototype.OnDisconnect = function () {
    };
    Controller.prototype.OnLoginGuest = function (onLoginGuestMessage) {
    };
    Controller.prototype.OnRoomJoin = function (onRoomJoinMsg) {
        if (!(onRoomJoinMsg.errorCode == MessageTypes_1.ErrorCode.SUCCESS || onRoomJoinMsg.errorCode == MessageTypes_1.ErrorCode.JOIN_ROOM_ALREADY_IN_ROOM)) {
            return;
        }
        this.roomId = onRoomJoinMsg.roomId;
        var roomInitConfig = this.socketClientAgent.getRoomInitConfig(this.roomId);
        var roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);
        this.gameTimeManager = new GameTimeManager_1.GameTimeManager(roomInitConfig.gameTimeStructs);
        this.sideTypeMapStruct = new DomainMapStruct_1.DomainMapStruct([1 /* WHITE */, 2 /* BLACK */]);
        this.sideTypeMapStruct.setDomainMap(roomStateConfig.sideTypeMap);
        this.chessEngine.init(roomInitConfig);
        for (var i = 0; i < roomStateConfig.sanMoves.length; i++) {
            var sanMove = roomStateConfig.sanMoves[i];
            this.chessEngine.doMoveSan(sanMove);
        }
        for (var i = 0; i < roomStateConfig.timeStamps.length; i++) {
            var timeStamp = roomStateConfig.timeStamps[i];
            this.gameTimeManager.doMove(timeStamp);
        }
        {
            var m_askDrawMap = roomStateConfig.askDrawMap;
            var m_isLoseByTime = roomStateConfig.isLoseByTimeMap;
            var m_isResignMap = roomStateConfig.isResignMap;
            for (var sideType = 1 /* FIRST_SIDE */; sideType <= 2 /* LAST_SIDE */; sideType++) {
                this.chessEngine.setIsAskForDraw(sideType, m_askDrawMap[sideType]);
                this.chessEngine.setIsLoseByTime(sideType, m_isLoseByTime[sideType]);
                this.chessEngine.setIsResign(sideType, m_isResignMap[sideType]);
            }
        }
        this.uiBoardView.updateViewToModel(this.chessEngine);
        {
            var timeStamp = this.socketClientAgent.getServerTimeStamp();
            for (var sideType = 1 /* FIRST_SIDE */; sideType <= 2 /* LAST_SIDE */; sideType++) {
                this.uiParentView.setTime(sideType, this.gameTimeManager.getCurrentTime(sideType, timeStamp));
            }
        }
        var mySideType = this.sideTypeMapStruct.getKeyForValue(this.socketClientAgent.getPlayerId());
        this.uiBoardView.setBoardFacing(mySideType, false);
        //this.gameTimeStructs[SideType.WHITE].start(this.socketClientAgent.getServerTimeStamp());
        //this.gameTimeStructs[SideType.BLACK].start(this.socketClientAgent.getServerTimeStamp());
        this.synchronizeIsWaiting();
    };
    Controller.prototype.OnRoomJoinBroadcast = function (onRoomJoinBroadcastMsg) {
        this.gameTimeManager.start(onRoomJoinBroadcastMsg.beginTimeStamp);
        this.sideTypeMapStruct.setDomainMap(onRoomJoinBroadcastMsg.sideTypeMap);
        this.synchronizeIsWaiting();
    };
    Controller.prototype.OnRoomMakeMove = function (onRoomMakeMoveMsg) {
        if (onRoomMakeMoveMsg.getErrorCode() != MessageTypes_1.ErrorCode.SUCCESS) {
            return;
        }
        this._OnRoomMakeMove(onRoomMakeMoveMsg.sanMove, onRoomMakeMoveMsg.timeStamp);
    };
    Controller.prototype.OnRoomMakeMoveBroadcast = function (onRoomMakeMoveBroadcastMsg) {
        if (onRoomMakeMoveBroadcastMsg.errorCode != MessageTypes_1.ErrorCode.SUCCESS) {
            return;
        }
        this._OnRoomMakeMove(onRoomMakeMoveBroadcastMsg.sanMove, onRoomMakeMoveBroadcastMsg.timeStamp);
    };
    Controller.prototype._OnRoomMakeMove = function (sanMove, timeStamp) {
        var moveClass = this.chessEngine.getMoveClassForCurrentBoardAndSanMove(sanMove);
        if (moveClass == null) {
            console.log("OnRoomMakeMove moveClass == null");
            return;
        }
        this.chessEngine.doMove(moveClass);
        this.uiBoardView.doMove(moveClass);
        this.gameTimeManager.doMove(timeStamp);
        this.synchronizeIsWaiting();
        if (this.chessEngine.getGameState() != ChessGameStateEnum_1.ChessGameStateEnum.NORMAL) {
            this.uiParentView.showWinNode(this.chessEngine.getGameState());
        }
    };
    Controller.prototype.synchronizeIsWaiting = function () {
        var roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);
        this.uiParentView.setWaitingNodeVisible(roomStateConfig.roomState != RoomStateEnum_1.RoomStateEnum.NORMAL);
        if (roomStateConfig.roomState != RoomStateEnum_1.RoomStateEnum.NORMAL) {
            this.uiTouchLayer.setIsEnabled(false);
        }
        else {
            var mySideType = this.sideTypeMapStruct.getKeyForValue(this.socketClientAgent.getPlayerId());
            this.uiTouchLayer.setIsEnabled(this.chessEngine.getMoveTurn() == mySideType);
        }
    };
    Controller.prototype.OnRoomTimeOutBroadcast = function (onRoomTimeOutBroadcast) {
        var roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);
        this.gameTimeManager.end(onRoomTimeOutBroadcast.endTimeStamp);
        for (var sideType = 1 /* FIRST_SIDE */; sideType <= 2 /* LAST_SIDE */; sideType++) {
            this.chessEngine.setIsLoseByTime(sideType, onRoomTimeOutBroadcast.isLoseByTimeMap[sideType]);
        }
        this.uiParentView.showWinNode(this.chessEngine.getGameState());
    };
    Controller.prototype.tick = function (dt) {
        var roomStateConfig = this.socketClientAgent.getRoomStateConfig(this.roomId);
        if (roomStateConfig == undefined) {
            return;
        }
        if (roomStateConfig.roomState != RoomStateEnum_1.RoomStateEnum.NORMAL) {
            return;
        }
        for (var sideType = 1 /* FIRST_SIDE */; sideType <= 2 /* LAST_SIDE */; sideType++) {
            var currentTime = this.gameTimeManager.getCurrentTime(sideType, this.socketClientAgent.getServerTimeStamp());
            this.uiParentView.setTime(sideType, currentTime);
        }
        //console.log("tick ", dt);
    };
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
    Controller.prototype.onTouchBegan = function (worldLocation) {
        this.uiBoardView.onTouchBegan(worldLocation, this.chessEngine);
    };
    Controller.prototype.onTouchMoved = function (worldLocation) {
        this.uiBoardView.onTouchMoved(worldLocation, this.chessEngine);
    };
    Controller.prototype.onTouchEnded = function (worldLocation) {
        this.uiBoardView.onTouchEnded(worldLocation, this.chessEngine);
    };
    return Controller;
}());
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map