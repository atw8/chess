import {BoardView} from "./BoardView";
import {SimpleGame} from "../app";
import {PromotePieceLayer} from "./PromotePieceLayer";
import {MoveClass} from "../../shared/engine/MoveClass";
import {WaitingNode} from "../OtherView/WaitingNode";
import {TimePanel} from "../OtherView/TimePanel";
import {SideType} from "../../shared/engine/SideType";
import {WinNode} from "./WinNode";
import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";
import {ControllerAbstract} from "../controller/ControllerAbstract";
import {PredictPanel} from "../OtherView/PredictPanel";


export class ParentBoardView extends PIXI.display.Layer {
    private uiBoardView : BoardView;
    private uiPredictBoardView : BoardView;

    private uiTimePanels : { [key in SideType] : TimePanel};

    private controllerInner : ControllerAbstract;

    private uiWaitingNode : WaitingNode;
    private uiPredictPanel : PredictPanel;

    constructor(controllerInner : ControllerAbstract){
        super();

        this.controllerInner = controllerInner;

        //this.controller.setParentView(this);


        this.uiBoardView = new BoardView({size : 800, isBoardVisible : true, displaySquares : true}, this.controllerInner);
        this.uiBoardView.zIndex = 0;
        this.addChild(this.uiBoardView);
        //SimpleGame.debugDraw(this.uiBoardView);

        //@ts-ignore
        this.uiTimePanels = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let uiTimePanel = new TimePanel(sideType,60);
            uiTimePanel.zIndex = 3;
            this.addChild(uiTimePanel);

            this.uiTimePanels[sideType] = uiTimePanel;
        }

        if(this.controllerInner.isPredictPanel()){
            let m_opts = {size : 800, isBoardVisible : false, displaySquares : false, moveSpeedNormal : 0.0005, pieceAlpha : 0.5};

            this.uiPredictBoardView = new BoardView(m_opts, this.controllerInner);
            this.uiPredictBoardView.zIndex = 1;
            this.addChild(this.uiPredictBoardView);

            this.uiPredictPanel = new PredictPanel(800, 50, this.controllerInner);
            this.uiPredictPanel.position.x = this.uiBoardView.position.x + this.uiBoardView.width/2 + this.uiPredictPanel.width/2;
            this.addChild(this.uiPredictPanel);
        }


        if(SimpleGame.isLandscape()){
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                let uiTimePanel = this.uiTimePanels[sideType];
                uiTimePanel.position.x = this.uiBoardView.position.x + this.uiBoardView.width/2 + uiTimePanel.width/2;
            }


            this.uiTimePanels[SideType.WHITE].position.y = this.uiBoardView.position.y - this.uiBoardView.height/2 + this.uiTimePanels[SideType.WHITE].height/2;
            this.uiTimePanels[SideType.BLACK].position.y = this.uiBoardView.position.y + this.uiBoardView.height/2 - this.uiTimePanels[SideType.BLACK].height/2;


            let w = this.uiPredictPanel.width + this.uiBoardView.width;
            if(w > SimpleGame.getDesignWidth()){
                let s = SimpleGame.getDesignWidth()/w;

                this.uiBoardView.scale.set(s);
                this.uiPredictBoardView.scale.set(s);
                this.uiPredictPanel.scale.set(s);
            }

            SimpleGame.arrangeHorizontally([this.uiBoardView, this.uiPredictPanel]);
            this.uiPredictBoardView.position = this.uiBoardView.position;

        }else {

        }

        //Add the uiWaitingNode
        this.uiWaitingNode = new WaitingNode(80);
        this.uiWaitingNode.position = this.uiBoardView.position;
        this.uiWaitingNode.zIndex = 2;
        this.addChild(this.uiWaitingNode);


        this.setWaitingNodeVisible(true);




        /*
        opts : {uiParentView : ParentBoardView,
        uiBoardView : BoardView,
        uiPredictPanel : PredictPanel | null,
        uiPredictBoardView : BoardView | null}
         */
        this.controllerInner.setParentBoardView({
            uiParentView: this,
            uiBoardView: this.uiBoardView,
            uiPredictPanel: this.uiPredictPanel,
            uiPredictBoardView: this.uiPredictBoardView
        });




        /*
        let chessGameStateSet : ChessGameStateEnum[] = [];
        chessGameStateSet.push(ChessGameStateEnum.DRAW_STALEMATE);
        chessGameStateSet.push(ChessGameStateEnum.DRAW_REPETITION);
        chessGameStateSet.push(ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL);
        chessGameStateSet.push(ChessGameStateEnum.DRAW_AGREEMENT);
        chessGameStateSet.push(ChessGameStateEnum.DRAW_50MOVES);
        chessGameStateSet.push(ChessGameStateEnum.BLACK_WIN_TIME);
        chessGameStateSet.push(ChessGameStateEnum.BLACK_WIN_RESIGN);
        chessGameStateSet.push(ChessGameStateEnum.BLACK_WIN_FORFEIT);
        chessGameStateSet.push(ChessGameStateEnum.BLACK_WIN_CHECKMATE);
        chessGameStateSet.push(ChessGameStateEnum.WHITE_WIN_TIME);
        chessGameStateSet.push(ChessGameStateEnum.WHITE_WIN_RESIGN);
        chessGameStateSet.push(ChessGameStateEnum.WHITE_WIN_FORFEIT);
        chessGameStateSet.push(ChessGameStateEnum.WHITE_WIN_CHECKMATE);
        let chessGameStateIndex = 6;

        let uiWinNode : WinNode | null = null;


        this.uiBoardView.interactive = true;
        this.uiBoardView.on("pointerdown", ()=>{
            console.log("hello");
            if(uiWinNode != null){
                uiWinNode.parent.removeChild(uiWinNode);
                uiWinNode = null;
            }

            let chessGameState = chessGameStateSet[chessGameStateIndex];
            chessGameStateIndex = (chessGameStateIndex + 1)%chessGameStateSet.length;

            let winState = ChessEngine.getWinStateForGameStateAndSideType(chessGameState, SideType.WHITE);

            uiWinNode = new WinNode(45, chessGameState, winState);
            uiWinNode.position.set(SimpleGame.getScreenWidth()/2, SimpleGame.getScreenHeight()/2);
            this.addChild(uiWinNode);
        })
        */


        /*
        this.uiPredictPanel = new PredictPanel(200,400, 10, this.controller);
        this.addChild(this.uiPredictPanel);
        this.uiPredictPanel.position.set(this.uiBoardView.position.x, this.uiBoardView.position.y);
        */
    }
    /*
    public createPredictPanel(){
        if(this.uiPredictPanel != undefined){
            return;
        }
    }
    */
    public setVotedMoves(votedDatas : { sanStr : string, number : number}[]){
        this.uiPredictPanel.setVotedMoves(votedDatas);
    }


    public showPromotePieceLayer(moveClasses : MoveClass[], callback : (moveClass : MoveClass) => void){
        let promotePieceLayer = new PromotePieceLayer(moveClasses, 90, callback);
        promotePieceLayer.position.set(SimpleGame.getDesignWidth()/2, SimpleGame.getDesignHeight()/2);
        this.addChild(promotePieceLayer);
    }

    public setWaitingNodeVisible(isVisible : boolean){
        this.uiWaitingNode.visible = isVisible;
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.uiTimePanels[sideType].visible = !isVisible;
        }
    }
    public setTime(sideType : SideType, timeMili : number){
        this.uiTimePanels[sideType].setTime(timeMili);
    }

    public showWinNode(chessGameState : ChessGameStateEnum, okCallback : () => void){
        let uiWinNode = new WinNode(45, chessGameState, okCallback);
        this.addChild(uiWinNode);
    }
}