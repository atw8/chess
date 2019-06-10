import {BoardView} from "./BoardView";
import {ORIENTATION, SimpleGame} from "../SimpleGame";
import {PromotePieceLayer} from "./PromotePieceLayer";
import {MoveClass} from "../../shared/engine/MoveClass";
import {WaitingNode} from "./WaitingNode";
import {TimePanel} from "./TimePanel";
import {SideType} from "../../shared/engine/SideType";
import {WinNode} from "./WinNode";
import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";
import {ControllerAbstract} from "../controller/ControllerAbstract";
import {PredictPanel} from "./PredictPanel";
import {RoomTypeEnum} from "../../shared/RoomTypeEnum";
import {ControllerMultiplayerGame} from "../controller/ControllerMultiplayerGame";
import {LanguageHelper, LanguageKey} from "../LanguageHelper";
import {LanguageButton} from "./Button/LanguageButton";


import * as PIXI from 'pixi.js';


export class ParentBoardView extends PIXI.Container {
    private uiBoardView : BoardView;
    private uiPredictBoardView : BoardView;

    private uiFlipBoardBtn : LanguageButton | null;

    private uiTimePanel : TimePanel;

    private controllerInner : ControllerAbstract;

    private uiWaitingNode : WaitingNode;
    private uiPredictPanel : { [key in ORIENTATION] : PredictPanel};

    private uiPromotePieceLayer : PromotePieceLayer | null = null;

    private uiWinNode : WinNode | null;

    constructor(controllerInner : ControllerAbstract){
        super();

        this.controllerInner = controllerInner;


        this.on("added", this.onAdded);
    }


    public onAdded(){
        //this.controller.setParentView(this);

        this.uiBoardView = new BoardView({size : 800,
            isBoardVisible : true,
            displaySquares : true,
            initTouchLayer : true}, this.controllerInner);

        this.uiBoardView.zIndex = 0;
        this.addChild(this.uiBoardView);
        //SimpleGame.debugDraw(this.uiBoardView);


        if(this.controllerInner.isFlipBoardBtn()){
            this.uiFlipBoardBtn = new LanguageButton(350, 50, this.flipBoardCallback.bind(this), LanguageKey.FlipBoard);
            this.uiFlipBoardBtn.zIndex = 4;
            this.addChild(this.uiFlipBoardBtn);
        }else {
            this.uiFlipBoardBtn = null;
        }



        this.uiTimePanel = new TimePanel(SideType.WHITE, 60);
        this.uiTimePanel.zIndex = 3;
        this.addChild(this.uiTimePanel);




        switch(this.controllerInner.getRoomTypeEnum()){
            case RoomTypeEnum.NORMAL:
            {
            }
                break;
            case RoomTypeEnum.MULTIPLAYER:
            {
                let m_opts = {size : 800,
                    isBoardVisible : false,
                    displaySquares : false,
                    initTouchLayer : false,
                    moveSpeedNormal : 0.0005,
                    pieceAlpha : 0.5};

                this.uiPredictBoardView = new BoardView(m_opts, this.controllerInner);
                this.uiPredictBoardView.zIndex = 1;
                this.uiPredictBoardView.setBoardFacing(this.uiBoardView.getBoardFacing(), false);
                this.addChild(this.uiPredictBoardView);


                // @ts-ignore
                this.uiPredictPanel = {};
                {
                    let predictPanelHeight : number = 800 - this.uiTimePanel.height;
                    if(this.uiFlipBoardBtn != null){
                        predictPanelHeight -= this.uiFlipBoardBtn.height;
                    }

                    this.uiPredictPanel[ORIENTATION.LANDSCAPE] = new PredictPanel(predictPanelHeight, 350, 50, 1, <ControllerMultiplayerGame>this.controllerInner);
                }
                {
                    this.uiPredictPanel[ORIENTATION.PORTRAIT] = new PredictPanel(300, 800, 50, 2, <ControllerMultiplayerGame>this.controllerInner);
                }

                for(let orientation = ORIENTATION.FIRST_ORIENTATION; orientation <= ORIENTATION.LAST_ORIENTATION; orientation++){
                    this.addChild(this.uiPredictPanel[orientation]);
                }


            }
                break;
        }


        //Add the uiWaitingNode
        this.uiWaitingNode = new WaitingNode(80, LanguageKey.Waiting);
        this.uiWaitingNode.zIndex = 2;
        this.addChild(this.uiWaitingNode);


        this.onResizeScreen();






        this.setWaitingNodeVisible(true);


        let parentBoardViewOpts = {
            uiParentView: this,
            uiBoardView: this.uiBoardView,
            uiPredictBoardView: this.uiPredictBoardView
        };
        this.controllerInner.setParentBoardView(parentBoardViewOpts);
    }

    public onResizeScreen():void{
        let scaleSprites = (s : number) =>{
            this.uiBoardView.scale.set(s);
            this.uiPredictBoardView.scale.set(s);

            for(let orientation = ORIENTATION.FIRST_ORIENTATION; orientation <= ORIENTATION.LAST_ORIENTATION; orientation++){
                this.uiPredictPanel[orientation].scale.set(s);
            }

            this.uiTimePanel.scale.set(s);
            this.uiWaitingNode.scale.set(s);

            if(this.uiFlipBoardBtn != null){
                this.uiFlipBoardBtn.scale.set(s);
            }

            if(this.uiPromotePieceLayer != null){
                this.uiPromotePieceLayer.scale.set(s);
            }

            if(this.uiWinNode != null){
                this.uiWinNode.scale.set(s);
            }


        };

        let getNormHeight = (s : PIXI.Container) => {
            return s.height/s.scale.y;
        };
        let getNormWidth = (s : PIXI.Container) => {
            return s.width/s.scale.x;
        };


        for(let orientation = ORIENTATION.FIRST_ORIENTATION; orientation <= ORIENTATION.LAST_ORIENTATION; orientation++){
            this.uiPredictPanel[orientation].visible = orientation == SimpleGame.getOrientation();
        }

        scaleSprites(1.0);

        if(SimpleGame.isLandscape()){
            let predictPanel = this.uiPredictPanel[ORIENTATION.LANDSCAPE];

            let w = getNormWidth(predictPanel) + getNormWidth(this.uiBoardView);
            if(w > SimpleGame.getDesignWidth()){
                scaleSprites(SimpleGame.getDesignWidth()/w)
            }

            SimpleGame.arrangeHorizontally([this.uiBoardView, predictPanel]);
            this.uiBoardView.position.y = 0;


            if(this.uiFlipBoardBtn != null){
                SimpleGame.arrangeVertically([predictPanel, this.uiTimePanel, this.uiFlipBoardBtn]);
            }else {
                SimpleGame.arrangeVertically([predictPanel, this.uiTimePanel]);
            }

            predictPanel.position.x = this.uiBoardView.position.x + this.uiBoardView.width/2 + predictPanel.width/2;

            this.uiTimePanel.position.x = predictPanel.position.x;
            if(this.uiFlipBoardBtn != null){
                this.uiFlipBoardBtn.position.x = predictPanel.position.x;
            }
        }else {
            let predictPanel = this.uiPredictPanel[ORIENTATION.PORTRAIT];

            let h = getNormHeight(predictPanel) + getNormHeight(this.uiBoardView) + getNormHeight(this.uiTimePanel);
            if(h > SimpleGame.getDesignHeight()){
                scaleSprites(SimpleGame.getDesignHeight()/h);
            }
            SimpleGame.arrangeVertically([this.uiBoardView, predictPanel, this.uiTimePanel]);

            this.uiBoardView.position.x = 0;
            predictPanel.position.x = 0;
            if(this.uiFlipBoardBtn != null){
                this.uiFlipBoardBtn.position.x = this.uiBoardView.position.x - this.uiBoardView.width/2 + this.uiFlipBoardBtn.width/2;
                this.uiFlipBoardBtn.position.y = this.uiTimePanel.position.y;

                this.uiTimePanel.position.x = this.uiBoardView.position.x + this.uiBoardView.width/2 - this.uiTimePanel.width/2;
            }else {
                this.uiTimePanel.position.x = this.uiBoardView.position.x;
            }
        }

        this.uiPredictBoardView.position = this.uiBoardView.position;
        this.uiWaitingNode.position = this.uiBoardView.position;


        if(this.uiPromotePieceLayer != null){
            this.uiPromotePieceLayer.position = this.uiBoardView.position;
        }
        if(this.uiWinNode != null){
            this.uiWinNode.position = this.uiBoardView.position;
        }
    }

    public setVotingData(votingData : { [key : string] : number}, sideType : SideType){
        for(let orientation = ORIENTATION.FIRST_ORIENTATION; orientation <= ORIENTATION.LAST_ORIENTATION; orientation++){
            this.uiPredictPanel[orientation].setVotingData(votingData, sideType);
        }

    }
    public setMyVoting(myVoting : string, sideType : SideType){
        for(let orientation = ORIENTATION.FIRST_ORIENTATION; orientation <= ORIENTATION.LAST_ORIENTATION; orientation++) {
            this.uiPredictPanel[orientation].setMyVoting(myVoting, sideType);
        }
    }
    public setIsHighlighted(sanObject : {sanStr : string, sideType : SideType}, isHighlighted : boolean){
        for(let orientation = ORIENTATION.FIRST_ORIENTATION; orientation <= ORIENTATION.LAST_ORIENTATION; orientation++){
            this.uiPredictPanel[orientation].setIsHighlighted(sanObject, isHighlighted);
        }
    }


    public showPromotePieceLayer(moveClasses : MoveClass[], callback : (moveClass : MoveClass) => void){
        if(this.uiPromotePieceLayer != null){
            return;
        }
        this.uiPromotePieceLayer = new PromotePieceLayer(moveClasses, 120, callback);
        this.uiPromotePieceLayer.scale.set(this.uiBoardView.scale.x);
        this.uiPromotePieceLayer.position = this.uiBoardView.position;
        this.addChild(this.uiPromotePieceLayer);

        this.uiPromotePieceLayer.on("removed", ()=>{
            this.uiPromotePieceLayer = null;
        })
    }

    public setWaitingNodeVisible(isVisible : boolean){
        this.uiWaitingNode.visible = isVisible;
        this.uiTimePanel.visible = !isVisible;
    }
    public setTime(sideType : SideType, timeMili : number){
        if(this.uiTimePanel.getSideType() == sideType){
            this.uiTimePanel.setTime(timeMili);
        }
    }

    public showWinNode(chessGameState : ChessGameStateEnum, okCallback : () => void){
        if(this.uiWinNode != null){
            return;
        }
        this.uiWinNode = new WinNode(45, chessGameState, okCallback);
        this.uiWinNode.scale.set(this.uiBoardView.scale.x);
        this.uiWinNode.position = this.uiBoardView.position;
        this.addChild(this.uiWinNode);
    }

    public setMoveTurn(moveTurn : SideType){
        this.uiTimePanel.setSideType(moveTurn);

        SimpleGame.setTitle(moveTurn);
    }



    public flipBoardCallback(){
        this.uiBoardView.flipBoardFacing(true);
        this.uiPredictBoardView.flipBoardFacing(true);
    }
}