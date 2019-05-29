/*
export class ControllerInner extends ControllerAbstract{
    private roomId : number;
    private controllerOuter : ControllerOuter;

    private uiBoardView : BoardView;
    private uiParentView : ParentBoardView;

    private gameTimeManager : GameTimeManager;
    private sideTypeMapStruct : DomainMapStruct<SideType, number>;

    constructor(roomId : number, controllerOuter : ControllerOuter){
        super();
        this.roomId = roomId;
        this.controllerOuter = controllerOuter;



        PIXI.ticker.shared.add(this.tick, this);
    }

    public isPredictPanel():boolean{
        return true;
    }
    public predictMovePress(isMyMove : boolean, sanStr : string){

    }


    public setParentBoardView(opts : {uiParentView : ParentBoardView,
        uiBoardView : BoardView,
        uiPredictPanel : PredictPanel | null,
        uiPredictBoardView : BoardView | null}):void{

        this.uiParentView = opts.uiParentView;

        this.uiBoardView = opts.uiBoardView;
        this.uiBoardView.updateViewToModel(null);

        this.synchronizeTouchLayer();
    }

    public synchronizeTouchLayer(){
        if(this.uiParentView != undefined && this.uiBoardView != undefined){
            this.uiBoardView.setTouchEnabled(true);
        }
    }


    public notifyMove(moveClass : MoveClass, uiBoardView : BoardView):void{
        //this.uiTouchLayer.setIsEnabled(false);

        //this.uiBoardView.doMoveAnimation(moveClass, false, false, null);


        //let sanMove = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);

        //this.controllerOuter.OpRoomMakeMove(this.roomId, sanMove);
    }
    public notifyPromote(moveClass : MoveClass[], uiBoardView : BoardView):void{
        this.uiBoardView.setTouchEnabled(false);

        this.uiParentView.showPromotePieceLayer(moveClass, this.notifyMove.bind(this))
    }




    public OnConnect(){

    }
    public OnDisconnect(){

    }

    public OnLoginGuest(onLoginGuestMessage :OnUserLoginGuestMessage){

    }
    public OnRoomJoin(onRoomJoinMsg : OnRoomJoinMessage){
        let roomInitConfig = this.controllerOuter.getRoomInitConfig(this.roomId);
        let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);

        this.gameTimeManager = new GameTimeManager(roomInitConfig.gameTimeStructs);


        if(roomInitConfig.roomTypeEnum == RoomTypeEnum.NORMAL){
            this.sideTypeMapStruct = new DomainMapStruct<SideType, number>([SideType.WHITE, SideType.BLACK]);
            this.sideTypeMapStruct.setDomainMap(roomStateConfig.sideTypeMap);
        }else {
            this.uiParentView.setVotingData(roomStateConfig.votingData);
        }


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
            let timeStamp = this.controllerOuter.getServerTimeStamp();
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                this.uiParentView.setTime(sideType, this.gameTimeManager.getCurrentTime(sideType, timeStamp));
            }
        }




        if(roomInitConfig.roomTypeEnum == RoomTypeEnum.NORMAL){
            let mySideType = <SideType>this.sideTypeMapStruct.getKeyForValue(this.controllerOuter.getPlayerId());

            this.uiBoardView.setBoardFacing(mySideType, false);
        }

        //this.gameTimeStructs[SideType.WHITE].start(this.socketClientAgent.getServerTimeStamp());
        //this.gameTimeStructs[SideType.BLACK].start(this.socketClientAgent.getServerTimeStamp());

        this.syncrhonizeRoomState();
    }

    public OnRoomJoinBroadcast(onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage){
        let roomInitConfig = this.controllerOuter.getRoomInitConfig(this.roomId);

        this.gameTimeManager.start(onRoomJoinBroadcastMsg.beginTimeStamp);

        if(roomInitConfig.roomTypeEnum == RoomTypeEnum.NORMAL){
            this.sideTypeMapStruct.setDomainMap(onRoomJoinBroadcastMsg.sideTypeMap);
        }



        this.syncrhonizeRoomState();
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

    public OnRoomMakeVote(onRoomMakeVoteMsg : OnRoomMakeVoteMessage){
        this.uiParentView.setMyVoting(onRoomMakeVoteMsg.myVoting);
    }

    public OnRoomVotingUpdateBroadcast(onRoomVotingUpdateBroadcastMsg : OnRoomVotingUpdateBroadcastMessage){
        this.uiParentView.setVotingData(onRoomVotingUpdateBroadcastMsg.votingData);
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



    public syncrhonizeRoomState(){
        let roomInitConfig = this.controllerOuter.getRoomInitConfig(this.roomId);
        let roomStateConfig = this.controllerOuter.getRoomStateConfig(this.roomId);
        this.uiParentView.setWaitingNodeVisible(roomStateConfig.roomState == RoomStateEnum.START);


        if(roomStateConfig.roomState != RoomStateEnum.NORMAL){
            this.uiBoardView.setTouchEnabled(false);
        }else {
            if(roomInitConfig.roomTypeEnum == RoomTypeEnum.NORMAL){
                let mySideType = <SideType>this.sideTypeMapStruct.getKeyForValue(this.controllerOuter.getPlayerId());

                this.uiBoardView.setTouchEnabled(this.chessEngine.getMoveTurn() == mySideType);
            }else {
                this.uiBoardView.setTouchEnabled(true);
            }
        }

        if(roomStateConfig.roomState == RoomStateEnum.END){
            let OnRoomFinish = () =>{
                this.controllerOuter.removeController(this.roomId);
            };

            this.uiParentView.showWinNode(roomStateConfig.chessGameState, OnRoomFinish);
        }
    }



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
*/