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
import {PredictPanel} from "../BoardViewLayer/PredictPanel";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";

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

        /*
        this.uiBoardView.setTouchEnabled(false);

        this.uiParentView.showPromotePieceLayer(moveClass, this.notifyMove.bind(this))
        */
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
        this.uiParentView.setMyVoting(roomStateConfig.myVoting);
        this.uiParentView.setVotingData(roomStateConfig.votingData);

        this.uiBoardView.setBoardFacing(roomStateConfig.mySideType, false);
        this.uiPredictBoardView.setBoardFacing(roomStateConfig.mySideType, false)

        this.syncrhonizeRoomState();
    }
    public _OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void{}

    public OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void{};
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void{};

    public OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage):void{};


    public OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage):void{
        this.uiParentView.setMyVoting(onRoomMakeVoteMsg.myVoting);
        this.predictMovePress(this.chessEngine.getMoveTurn(), onRoomMakeVoteMsg.myVoting);
    }

    public OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage):void{
        this.uiParentView.setVotingData(onRoomVotingUpdateBroadcastMsg.votingData);
    }

    public _synchronizeRoomState():void{
        let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);

        if(roomStateConfig.roomState != RoomStateEnum.NORMAL){
            this.uiBoardView.setTouchEnabled(false);
        }else {
            this.uiBoardView.setTouchEnabled(roomStateConfig.mySideType == this.chessEngine.getMoveTurn());
        }

        this.uiParentView.setMoveTurn(this.chessEngine.getMoveTurn());
    }

    private predictMoveSideType : SideType | null = null;
    private predictMoveSanStr : string | null = null;
    public predictMovePress(predictMoveSideType : SideType | null, predictMoveSanStr : string | null){
        let oldPredictMoveSideType = this.predictMoveSideType;
        let oldPredictMoveSanStr = this.predictMoveSanStr;

        this.predictMoveSideType = null;
        this.predictMoveSanStr = null;

        this.uiPredictBoardView.updateViewToModel(null);

        if(oldPredictMoveSideType != null && oldPredictMoveSanStr != null){
            this.uiParentView.setIsHighlighted(oldPredictMoveSanStr, false);
        }

        if(oldPredictMoveSideType == predictMoveSideType && oldPredictMoveSanStr == predictMoveSanStr){
            return;
        }
        this.predictMoveSideType = predictMoveSideType;
        this.predictMoveSanStr = predictMoveSanStr;
        if(this.predictMoveSideType == null || this.predictMoveSanStr == null){
            return;
        }

        let moveClass = <MoveClass>this.chessEngine.getMoveClassForCurrentBoardAndSanMove(this.predictMoveSanStr);

        let cb = (moveClass : MoveClass)=>{
            if(this.predictMoveSideType == null || this.predictMoveSanStr == null){
                return;
            }

            moveClass = ChessEngine.flipMoveClass(moveClass);
            this.uiPredictBoardView.doMove(moveClass, cb);
        };

        this.uiPredictBoardView.doMove(moveClass, cb);

        this.uiParentView.setIsHighlighted(this.predictMoveSanStr, true);
    }

    public OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg : OnRoomMultiplayerStateBroadcastMessage):void{
        this.chessEngine.doMoveSan(onRoomMultiplayerStateBroadcastMsg.sanMove);
        this.gameTimeManager.doMove(onRoomMultiplayerStateBroadcastMsg.timeStamp);

        this.uiBoardView.doMove(<MoveClass>this.chessEngine.getLastMoveClass());

        this.predictMovePress(null, null);
        this.uiParentView.setMoveTurn(this.chessEngine.getMoveTurn());
        this.uiParentView.setMyVoting("");
        this.uiParentView.setVotingData({});

        this.syncrhonizeRoomState();
    }
}

