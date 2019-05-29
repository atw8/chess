import {
    ErrorCode,
    OnRoomJoinBroadcastMessage,
    OnRoomMakeMoveBroadcastMessage,
    OnRoomMakeMoveMessage, OnRoomMakeVoteMessage,
    OnRoomTimeOutBroadcastMessage, OnRoomVotingUpdateBroadcastMessage,
    OnUserLoginGuestMessage, RoomStateConfig
} from "./../../shared/MessageTypes";

import {ControllerAbstract} from "./ControllerAbstract";

import {BoardView} from "../BoardViewLayer/BoardView";

import {MoveClass} from "../../shared/engine/MoveClass";
import {OnRoomJoinMessage, OnRoomMultiplayerStateBroadcastMessage} from "../../shared/MessageTypes";
import {SideType} from "../../shared/engine/SideType";

import {RoomStateEnum} from "../../shared/RoomStateEnum";
import {DomainMapStruct} from "../../shared/DomainMapStruct";
import {ControllerOuter} from "./ControllerOuter";


import {RoomTypeEnum} from "../../shared/RoomTypeEnum";


export class ControllerNormalGame extends ControllerAbstract{
    private sideTypeMapStruct : DomainMapStruct<SideType, number>;

    constructor(roomId : number, controllerOuter : ControllerOuter){
        super(roomId, RoomTypeEnum.NORMAL, controllerOuter);

        this.sideTypeMapStruct = new DomainMapStruct<SideType, number>([SideType.WHITE, SideType.BLACK]);


    }


    public notifyMove(moveClass : MoveClass, uiBoardView : BoardView):void{
        this.uiBoardView.setTouchEnabled(false);

        this.uiBoardView.doMoveAnimation(moveClass, false, false, null);


        let sanMove = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);

        this.controllerOuter.OpRoomMakeMove(this.roomId, sanMove);
    }
    public notifyPromote(moveClass : MoveClass[], uiBoardView : BoardView):void{
        this.uiBoardView.setTouchEnabled(false);

        this.uiParentView.showPromotePieceLayer(moveClass, this.notifyMove.bind(this))
    }



    public _OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage){
        let roomStateConfig = <RoomStateConfig>onRoomJoinMsg.roomStateConfig;

        this.sideTypeMapStruct.setDomainMap(roomStateConfig.sideTypeMap);

        let mySideType = <SideType>this.sideTypeMapStruct.getKeyForValue(this.controllerOuter.getPlayerId());
        this.uiBoardView.setBoardFacing(mySideType, false);

        this.syncrhonizeRoomState();
    }

    public _OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage){
        this.sideTypeMapStruct.setDomainMap(onRoomJoinBroadcastMsg.sideTypeMap);

        this.syncrhonizeRoomState();
    }


    public OnRoomMakeMove(onRoomMakeMoveMsg: OnRoomMakeMoveMessage): void {
        this._OnRoomMakeMove(onRoomMakeMoveMsg.sanMove, onRoomMakeMoveMsg.timeStamp);
    }
    public OnRoomMakeMoveBroadcast(onRoomMakeMoveBroadcastMsg: OnRoomMakeMoveBroadcastMessage): void {
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


        this.syncrhonizeRoomState();
    }



    public OnRoomTimeOutBroadcast(onRoomTimeOutBroadcastMsg : OnRoomTimeOutBroadcastMessage){
        let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);
        this.gameTimeManager.end(onRoomTimeOutBroadcastMsg.endTimeStamp);

        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.chessEngine.setIsLoseByTime(sideType, onRoomTimeOutBroadcastMsg.isLoseByTimeMap[sideType]);
        }


        this.syncrhonizeRoomState();
    }

    public OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage):void{}

    public OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage):void{}

    public OnRoomMultiplayerStateBroadcast(onRoomMultiplayerStateBroadcastMsg : OnRoomMultiplayerStateBroadcastMessage):void{}

    public _synchronizeRoomState():void {
        let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);

        if(roomStateConfig.roomState != RoomStateEnum.NORMAL){
            this.uiBoardView.setTouchEnabled(false);
        }else {
            let mySideType = <SideType>this.sideTypeMapStruct.getKeyForValue(this.controllerOuter.getPlayerId());

            this.uiBoardView.setTouchEnabled(this.chessEngine.getMoveTurn() == mySideType);
        }

        this.uiParentView.setMoveTurn(this.chessEngine.getMoveTurn());
    }




}