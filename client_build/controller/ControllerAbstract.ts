import {MoveClass} from "../../shared/engine/MoveClass";
import {BoardView} from "../BoardViewLayer/BoardView";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {ControllerOuter} from "./ControllerOuter";
import {SocketClientInterface} from "./SocketClientInterface";
import {
    OnRoomGetRoomStateMessage,
    OnRoomJoinBroadcastMessage, OnRoomJoinMessage, OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage, OnRoomMakeVoteMessage, OnRoomMultiplayerStateBroadcastMessage,
    OnRoomTimeOutBroadcastMessage, OnRoomVotingUpdateBroadcastMessage,
    OnUserLoginGuestMessage, RoomInitConfig, RoomStateConfig
} from "../../shared/MessageTypes";
import {GameTimeManager} from "../../shared/gameTime/GameTimeManager";
import {RoomTypeEnum} from "../../shared/RoomTypeEnum";
import {SideType} from "../../shared/engine/SideType";
import {RoomStateEnum} from "../../shared/RoomStateEnum";

import {SimpleGame} from "../SimpleGame";


export abstract class ControllerAbstract implements SocketClientInterface {
    protected chessEngine: ChessEngine;

    protected readonly roomId: number;
    protected readonly roomTypeEnum: RoomTypeEnum;
    protected readonly controllerOuter: ControllerOuter;


    public abstract isFlipBoardBtn():boolean;

    protected gameTimeManager: GameTimeManager;

    protected uiParentView: ParentBoardView;
    protected uiBoardView: BoardView;

    constructor(roomId: number, roomTypeEnum: RoomTypeEnum, controllerOuter: ControllerOuter) {
        this.roomId = roomId;
        this.roomTypeEnum = roomTypeEnum;
        this.controllerOuter = controllerOuter;

        let roomInitConfig = this.controllerOuter.getRoomInitConfig(this.roomId);
        this.chessEngine = new ChessEngine(roomInitConfig);

        SimpleGame.getInstance().ticker.add(this.tick, this);
    }
    public getRoomTypeEnum():RoomTypeEnum{
        return this.roomTypeEnum;
    }

    public getChessEngine(): ChessEngine {
        return this.chessEngine;
    }

    public setParentBoardView(opts: {
        uiParentView: ParentBoardView,
        uiBoardView: BoardView
    }) {


        this.uiParentView = opts.uiParentView;
        this.uiBoardView = opts.uiBoardView;

        this.uiBoardView.updateViewToModel(null);
    }

    //setParentBoardView(uiParentView : ParentBoardView, uiBoardView : BoardView):void;

    //Boardview related rubbish
    public abstract notifyMove(moveClass: MoveClass, uiBoardView: BoardView): void;

    public abstract notifyPromote(moveClasses: MoveClass[], uiBoardView: BoardView): void;

    //Touch related API



    public OnConnect(): void {
    }
    public OnDisconnect(reason : "io server disconnect" | "io client disconnect" | "ping timeout"): void {
    }
    public OnConnectError() : void{
    }
    public OnConnectTimeOut() : void{
    }

    public OnLoginGuest(onLoginGuestMsg: OnUserLoginGuestMessage): void {}

    public OnRoomGetRoomState(onRoomGetRoomStateMsg : OnRoomGetRoomStateMessage): void {};

    public OnRoomJoin(onRoomJoinMsg: OnRoomJoinMessage): void {
        let roomInitConfig = <RoomInitConfig>onRoomJoinMsg.roomInitConfig;
        let roomStateConfig = <RoomStateConfig>onRoomJoinMsg.roomStateConfig;
        //let roomInitConfig = this.controllerOuter.getRoomInitConfig(this.roomId);
        //let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);

        this.gameTimeManager = new GameTimeManager(roomInitConfig.gameTimeStructs);


        this.chessEngine.init(roomInitConfig);
        for (let i = 0; i < roomStateConfig.sanMoves.length; i++) {
            let sanMove = roomStateConfig.sanMoves[i];
            this.chessEngine.doMoveSan(sanMove);
        }
        for (let i = 0; i < roomStateConfig.timeStamps.length; i++) {
            let timeStamp = roomStateConfig.timeStamps[i];
            this.gameTimeManager.doMove(timeStamp);
        }

        {
            let m_askDrawMap = roomStateConfig.askDrawMap;
            let m_isLoseByTime = roomStateConfig.isLoseByTimeMap;
            let m_isResignMap = roomStateConfig.isResignMap;

            for (let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++) {
                this.chessEngine.setIsAskForDraw(sideType, m_askDrawMap[sideType]);
                this.chessEngine.setIsLoseByTime(sideType, m_isLoseByTime[sideType]);
                this.chessEngine.setIsResign(sideType, m_isResignMap[sideType]);
            }
        }


        this.uiBoardView.updateViewToModel(this.chessEngine);

        {
            let timeStamp = this.controllerOuter.getServerTimeStamp();
            for (let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++) {
                this.uiParentView.setTime(sideType, this.gameTimeManager.getCurrentTime(sideType, timeStamp));
            }
        }

        this.uiBoardView.setBoardFacing(roomStateConfig.mySideType, false);

        this._OnRoomJoin(onRoomJoinMsg);
    }

    public abstract _OnRoomJoin(onRoomJoinMsg: OnRoomJoinMessage): void;

    public OnRoomJoinBroadcast(onRoomJoinBroadcastMsg: OnRoomJoinBroadcastMessage): void {
        this.gameTimeManager.start(onRoomJoinBroadcastMsg.beginTimeStamp);

        this._OnRoomJoinBroadcast(onRoomJoinBroadcastMsg);
    }

    public abstract _OnRoomJoinBroadcast(onRoomJoinBroadcastMsg: OnRoomJoinBroadcastMessage): void;


    public abstract OnRoomMakeMove(onRoomMakeMoveMsg: OnRoomMakeMoveMessage): void;

    public abstract OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg: OnRoomMakeMoveBroadcastMessage): void;

    public abstract OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg: OnRoomTimeOutBroadcastMessage): void;

    public abstract OnRoomMakeVote(onRoomMakeVoteMsg: OnRoomMakeVoteMessage): void;

    public abstract OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg: OnRoomVotingUpdateBroadcastMessage): void;

    public abstract OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg : OnRoomMultiplayerStateBroadcastMessage):void;

    public syncrhonizeRoomState() {
        let roomInitConfig = this.controllerOuter.getRoomInitConfig(this.roomId);
        let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);
        this.uiParentView.setWaitingNodeVisible(roomStateConfig.roomState == RoomStateEnum.START);


        if (roomStateConfig.roomState == RoomStateEnum.END) {
            let OnRoomFinish = () => {
                this.controllerOuter.removeController(this.roomId);
                this.controllerOuter.OpRoomGetRoomState();
            };

            this.uiParentView.showWinNode(roomStateConfig.chessGameState, OnRoomFinish);
        }

        if(roomStateConfig.roomState != RoomStateEnum.NORMAL){
            this.uiBoardView.setTouchEnabled(false);
        }else {
            this.uiBoardView.setTouchEnabled(roomStateConfig.mySideType == this.chessEngine.getMoveTurn());
        }

        this.uiParentView.setMoveTurn(this.chessEngine.getMoveTurn());
    }


    public tick(dt : number):void{
        let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);

        if(roomStateConfig == undefined){
            return;
        }

        if(roomStateConfig.roomState != RoomStateEnum.NORMAL){
            return;
        }


        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let currentTime = this.gameTimeManager.getCurrentTime(sideType, this.controllerOuter.getServerTimeStamp());
            this.uiParentView.setTime(sideType, currentTime);
        }
        //console.log("tick ", dt);
    }
}

