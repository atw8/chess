import {BoardView} from "./view/BoardView";
import {Controller} from "./controller/Controller";
import {SimpleGame} from "./app";
import {PromotePieceLayer} from "./view/PromotePieceLayer";
import {MoveClass} from "../shared/engine/MoveClass";
import {WaitingNode} from "./view/WaitingNode";
import {TimePanel} from "./otherView/TimePanel";
import {SideType} from "../shared/engine/SideType";


export class MainLayer extends PIXI.Container {
    private uiBoardView : BoardView;
    private uiTimePanels : { [key : number] : TimePanel};

    private controller : Controller;

    private uiWaitingNode : WaitingNode;

    constructor(){
        super();

        this.controller = new Controller();
        this.controller.setParentView(this);
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


        this.controller.setBoardView(this.uiBoardView);



        //Add the uiWaitingNode
        this.uiWaitingNode = new WaitingNode(40);
        this.uiWaitingNode.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
        this.addChild(this.uiWaitingNode);
        this.uiWaitingNode.visible = false
    }

    public showPromotePieceLayer(moveClasses : MoveClass[], callback : (moveClass : MoveClass) => void){
        let promotePieceLayer = new PromotePieceLayer(moveClasses, 90, callback);
        promotePieceLayer.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
        this.addChild(promotePieceLayer);
    }


    public setWaitingNodeVisible(isVisible : boolean){
        this.uiWaitingNode.visible = isVisible;
    }
}