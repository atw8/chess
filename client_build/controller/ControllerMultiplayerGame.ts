import {ControllerAbstract} from "./ControllerAbstract";
import {ControllerOuter} from "./ControllerOuter";
import {BoardView} from "../BoardViewLayer/BoardView";
import {MoveClass} from "../../shared/engine/MoveClass";
import {
    OnRoomJoinBroadcastMessage,
    OnRoomJoinMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage,
    OnRoomMakeVoteMessage,
    OnRoomMultiplayerStateBroadcastMessage,
    OnRoomTimeOutBroadcastMessage,
    OnRoomVotingUpdateBroadcastMessage,
    RoomStateConfig
} from "../../shared/MessageTypes";
import {RoomTypeEnum} from "../../shared/RoomTypeEnum";
import {RoomStateEnum} from "../../shared/RoomStateEnum";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {SideType} from "../../shared/engine/SideType";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";

import * as underscore from "underscore";

export class ControllerMultiplayerGame extends ControllerAbstract {
    private uiPredictBoardView : BoardView;

    constructor(roomId :number, controllerOuter : ControllerOuter){
        super(roomId, RoomTypeEnum.MULTIPLAYER, controllerOuter);
    }

    public notifyMove(moveClass : MoveClass, uiBoardView : BoardView):void{
        let myVoting = <string>this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);
        this.controllerOuter.OpRoomMakeVote(this.roomId, myVoting);


        this.uiBoardView.updatePieceViewsToDefault();
    }
    public notifyPromote(moveClass : MoveClass[], uiBoardView : BoardView):void{
        this.uiBoardView.setTouchEnabled(false);

        this.uiParentView.showPromotePieceLayer(moveClass, (moveClass : MoveClass)=>{
            this.uiBoardView.setTouchEnabled(true);
            this.notifyMove(moveClass, this.uiBoardView);
        })
    }

    public setParentBoardView(opts: {
        uiParentView: ParentBoardView,
        uiBoardView: BoardView,
        uiPredictBoardView: BoardView
    }){
        super.setParentBoardView(opts);

        this.uiPredictBoardView = opts.uiPredictBoardView;

    }

    public _OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage):void{
        this.uiParentView.setMoveTurn(this.chessEngine.getMoveTurn());

        let roomStateConfig = <RoomStateConfig>onRoomJoinMsg.roomStateConfig;
        this.uiParentView.setMyVoting(roomStateConfig.myVoting, this.chessEngine.getMoveTurn());
        this.uiParentView.setVotingData(roomStateConfig.votingData, this.chessEngine.getMoveTurn());

        this.uiPredictBoardView.setBoardFacing(this.uiBoardView.getBoardFacing(), false);

        this.syncrhonizeRoomState();
    }
    public _OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void{}

    public OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void{};
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void{};

    public OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage):void{};


    public OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage):void{
        this.uiParentView.setMyVoting(onRoomMakeVoteMsg.myVoting, this.chessEngine.getMoveTurn());

        this.predictMovePress({sanStr : onRoomMakeVoteMsg.myVoting, sideType : this.chessEngine.getMoveTurn()} );
    }

    public OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage):void{
        this.uiParentView.setVotingData(onRoomVotingUpdateBroadcastMsg.votingData, this.chessEngine.getMoveTurn());
    }


    /*
            this.uiPredictBoardView.updateViewToModel(null);
        if(sanObject == null){
            return;
        }
        let moveClass = this.chessEngine.getMoveClassForCurrentBoardAndSanMove(sanObject.sanStr);
        if(moveClass == null){
            return;
        }
        let uMoveClass = ChessEngine.flipMoveClass(moveClass);

        let bMoveClass : BoardView.MOVE_CLASS = {type : "MOVE_CLASS", moveClass : moveClass};
        let bUMoveClass : BoardView.MOVE_CLASS = {type : "MOVE_CLASS", moveClass : uMoveClass};

        let seq : BoardView.SEQUENCE = {type : "SEQUENCE", seq : [bMoveClass, bUMoveClass]};
        let repeatForever : BoardView.REPEAT_FOREVER = {type : "REPEAT_FOREVER", action : seq};

        this.uiPredictBoardView.doMoveAction(repeatForever);
     */

    private predictMoveSanObject : {sanStr : string, sideType : SideType} | null = null;
    public predictMovePress(sanObject : {sanStr : string, sideType : SideType} | null){
        this.uiPredictBoardView.updateViewToModel(null);

        if(this.predictMoveSanObject != null){
            this.uiParentView.setIsHighlighted(this.predictMoveSanObject, false);
        }

        if(underscore.isEqual(this.predictMoveSanObject, sanObject)){
            this.predictMoveSanObject = null;
            return;
        }
        this.predictMoveSanObject = sanObject;

        if(this.predictMoveSanObject == null){
            return;
        }


        let moveClass = <MoveClass>this.chessEngine.getMoveClassForCurrentBoardAndSanMove(this.predictMoveSanObject.sanStr);
        let m1Action = new BoardView.MOVE_CLASS(moveClass);
        let m2Action = new BoardView.MOVE_CLASS(ChessEngine.flipMoveClass(moveClass));
        let seq = new BoardView.SEQUENCE([m1Action, m2Action]);
        let repeatForever = new BoardView.REPEAT_FOREVER(seq);


        this.uiPredictBoardView.doMoveAction(repeatForever);

        this.uiParentView.setIsHighlighted(this.predictMoveSanObject, true);
    }

    public OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg : OnRoomMultiplayerStateBroadcastMessage):void{
        this.chessEngine.doMoveSan(onRoomMultiplayerStateBroadcastMsg.sanMove);
        this.gameTimeManager.doMove(onRoomMultiplayerStateBroadcastMsg.timeStamp);

        this.uiBoardView.doMove(<MoveClass>this.chessEngine.getLastMoveClass());

        this.predictMovePress(null);
        this.uiParentView.setMoveTurn(this.chessEngine.getMoveTurn());
        this.uiParentView.setMyVoting("", this.chessEngine.getMoveTurn());
        this.uiParentView.setVotingData({}, this.chessEngine.getMoveTurn());

        this.syncrhonizeRoomState();
    }
}

