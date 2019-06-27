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
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {SideType} from "../../shared/engine/SideType";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";

import {SanObject} from "../../shared/engine/SanObject";

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
        if(roomStateConfig.myVoting != undefined){
            this.uiParentView.setMyVoting({sanStr : roomStateConfig.myVoting, sideType : this.chessEngine.getMoveTurn()});
        }
        this.setVotingData(roomStateConfig.votingData);

        this.uiPredictBoardView.setBoardFacing(this.uiBoardView.getBoardFacing(), false);

        this.syncrhonizeRoomState();
    }
    public _OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage):void{}

    public OnRoomMakeMove(onRoomMakeMoveMsg : OnRoomMakeMoveMessage):void{};
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage):void{};

    public OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage):void{};


    public OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage):void{
        let sanObject = {sanStr : onRoomMakeVoteMsg.myVoting, sideType : this.chessEngine.getMoveTurn()};

        this.uiParentView.setMyVoting(sanObject);

        this.predictMovePress(sanObject);
    }

    public OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage):void{
        this.setVotingData(onRoomVotingUpdateBroadcastMsg.votingData);
    }


    private setVotingData(_votingData :  { [key : string] : number}){
        let votingData : {sanObject : SanObject.Interface, number : number}[] = [];

        let sideType = this.chessEngine.getMoveTurn();
        for(let sanStr in _votingData){
            let sanObject = {sanStr : sanStr, sideType : sideType};
            votingData.push({sanObject : sanObject, number : _votingData[sanStr]});
        }
        this.uiParentView.setVotingData(votingData);
    }


    private predictMoveSanObject : SanObject.Interface | null = null;
    public predictMovePress(sanObject : SanObject.Interface | null){
        this.uiPredictBoardView.updateViewToModel(null);

        if(this.predictMoveSanObject != null){
            this.uiParentView.setIsHighlighted(this.predictMoveSanObject, false);
        }

        if(this.predictMoveSanObject != null && sanObject != null){
            if(SanObject.isEqual(this.predictMoveSanObject, sanObject)){
                sanObject = null;
            }
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
        this.uiParentView.setMyVoting(null);
        this.uiParentView.setVotingData([]);

        this.syncrhonizeRoomState();
    }
}

