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

    public isFlipBoardBtn():boolean{
        return false;
    }
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
        let roomStateConfig = <RoomStateConfig>onRoomJoinMsg.roomStateConfig;
        this.uiParentView.setMyVoting(roomStateConfig.myVoting, this.chessEngine.getMoveTurn());
        this.uiParentView.setVotingData(roomStateConfig.votingData, this.chessEngine.getMoveTurn());

        this.uiPredictBoardView.setBoardFacing(roomStateConfig.mySideType, false);

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
        this.uiParentView.setVotingData(onRoomVotingUpdateBroadcastMsg.votingData,  this.chessEngine.getMoveTurn());
    }


    private predictMoveSanObject : {sanStr : string, sideType : SideType} | null = null;
    public predictMovePress(sanObject : {sanStr : string, sideType : SideType} | null){
        let oldPredictMoveSanObject = this.predictMoveSanObject;

        this.predictMoveSanObject = null;

        this.uiPredictBoardView.updateViewToModel(null);

        if(oldPredictMoveSanObject != null){
            this.uiParentView.setIsHighlighted(oldPredictMoveSanObject, false);
        }

        if(underscore.isEqual(oldPredictMoveSanObject, sanObject)){
            return;
        }
        this.predictMoveSanObject = sanObject;

        if(this.predictMoveSanObject == null){
            return;
        }

        let moveClass = <MoveClass>this.chessEngine.getMoveClassForCurrentBoardAndSanMove(this.predictMoveSanObject.sanStr);

        let cb = (moveClass : MoveClass)=>{
            if(this.predictMoveSanObject == null){
                return;
            }

            moveClass = ChessEngine.flipMoveClass(moveClass);
            this.uiPredictBoardView.doMove(moveClass, cb);
        };

        this.uiPredictBoardView.doMove(moveClass, cb);

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

