import {MainLayer} from "../MainLayer";
import {ControllerAbstract} from "./ControllerAbstract";
import {BoardView} from "../view/BoardView";
import {MoveClass} from "../../shared/engine/MoveClass";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {TouchLayer} from "../view/TouchLayer";

export class ControllerTest implements ControllerAbstract{
    private uiParentView : MainLayer;
    private uiBoardView : BoardView;

    private chessEngine : ChessEngine;

    private uiTouchLayer : TouchLayer;



    public setParentBoardView(uiParentView: MainLayer, uiBoardView: BoardView): void {
        this.uiParentView = uiParentView;

        this.uiBoardView = uiBoardView;
        this.chessEngine = new ChessEngine();


        let startTimeStamp = Date.now();
        for(let i = 0; i < 1000; i++){
            this.chessEngine.init({"isChess960" : true});
            this.uiBoardView.updateViewToModel(this.chessEngine);
        }
        let endTimeStamp = Date.now();

        console.log(endTimeStamp - startTimeStamp);


        this.uiTouchLayer = new TouchLayer(this);
        this.uiTouchLayer.setIsEnabled(true);

        this.uiParentView.setWaitingNodeVisible(false);
    }

    //Boardview related rubbish
    public notifyMove(moveClass : MoveClass){
        this.chessEngine.doMove(moveClass);
        this.uiBoardView.doMove(moveClass);
    }

    public notifyPromote(moveClasses : MoveClass[]){

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