import {BoardView} from "./view/BoardView";
import {Controller} from "./controller/Controller";
import {SimpleGame} from "./app";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {PromotePieceLayer} from "./view/PromotePieceLayer";
import {MoveClass} from "../shared/engine/MoveClass";

export class MainLayer extends PIXI.Container {
    private boardView : BoardView;
    private controller : Controller;

    constructor(){
        super();

        this.controller = new Controller();
        this.controller.setParentView(this);
        //this.controller.setParentView(this);

        this.boardView = new BoardView(400, 400, this.controller);
        this.boardView.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
        this.addChild(this.boardView);


        this.controller.setBoardView(this.boardView);

        /*
        let promotePieceLayer = new PromotePieceLayer([], 90);

        this.addChild(promotePieceLayer);
        */
        //this.boardView.position.set(SimpleGame.game.width/2, SimpleGame.game.height/2);
        //SimpleGame.game.world.add(this.boardView);

        //this.boardView.position.set(SimpleGame.game.width/2, SimpleGame.game.height/2);
        //SimpleGame.game.world.add(this.boardView);
    }

    public showPromotePieceLayer(moveClasses : MoveClass[], callback : (moveClass : MoveClass) => void){
        let promotePieceLayer = new PromotePieceLayer(moveClasses, 90, callback);
        promotePieceLayer.position.set(SimpleGame.getWidth()/2, SimpleGame.getHeight()/2);
        this.addChild(promotePieceLayer);
    }
}