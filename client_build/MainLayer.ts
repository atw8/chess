import {BoardView} from "./view/BoardView";
import {Controller} from "./controller/Controller";
import {SimpleGame} from "./app";
import {PromotePieceLayer} from "./view/PromotePieceLayer";
import {MoveClass} from "../shared/engine/MoveClass";
import {WaitingNode} from "./view/WaitingNode";
import {TimePanel} from "./otherView/TimePanel";
import {SideType} from "../shared/engine/SideType";
import {WinNode} from "./view/WinNode";
import {ChessGameStateEnum} from "../shared/engine/ChessGameStateEnum";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {WinStateEnum} from "../shared/engine/WinStateEnum";
import {LanguageHelper, LanguageKey} from "./LanguageHelper";
import {ControllerTest} from "./controller/ControllerTest";
import {ControllerAbstract} from "./controller/ControllerAbstract";


export class MainLayer extends PIXI.Container {
    private uiBoardView : BoardView;
    private uiTimePanels : { [key : number] : TimePanel};

    private controller : ControllerAbstract;

    private uiWaitingNode : WaitingNode;

    constructor(){
        super();

        this.controller = new ControllerTest();
        //this.controller.setParentView(this);

        this.uiBoardView = new BoardView(400, this.controller);
        this.uiBoardView.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
        this.addChild(this.uiBoardView);
        //SimpleGame.debugDraw(this.uiBoardView);


        this.uiTimePanels = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let uiTimePanel = new TimePanel(sideType,40);
            this.addChild(uiTimePanel);

            uiTimePanel.position.y = this.uiBoardView.position.y - this.uiBoardView.height/2 - uiTimePanel.height/2;

            this.uiTimePanels[sideType] = uiTimePanel;
        }
        this.uiTimePanels[SideType.WHITE].position.x = this.uiBoardView.position.x - this.uiBoardView.width/2 + this.uiTimePanels[SideType.WHITE].width/2;
        this.uiTimePanels[SideType.BLACK].position.x = this.uiBoardView.position.x + this.uiBoardView.width/2 - this.uiTimePanels[SideType.BLACK].width/2;



        //Add the uiWaitingNode
        this.uiWaitingNode = new WaitingNode(40);
        this.uiWaitingNode.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
        this.addChild(this.uiWaitingNode);


        this.setWaitingNodeVisible(true);




        this.controller.setParentBoardView(this, this.uiBoardView);


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
            uiWinNode.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
            this.addChild(uiWinNode);
        })
        */
    }

    public showPromotePieceLayer(moveClasses : MoveClass[], callback : (moveClass : MoveClass) => void){
        let promotePieceLayer = new PromotePieceLayer(moveClasses, 90, callback);
        promotePieceLayer.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
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

    public showWinNode(chessGameState : ChessGameStateEnum){
        let uiWinNode = new WinNode(45, chessGameState);
        uiWinNode.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
        this.addChild(uiWinNode);
    }
}