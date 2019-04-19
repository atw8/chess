import {MoveClass} from "../../shared/engine/MoveClass";
import {MainLayer} from "../MainLayer";
import {BoardView} from "../view/BoardView";

export interface ControllerAbstract {
    setParentBoardView(uiParentView : MainLayer, uiBoardView : BoardView):void;

    //Boardview related rubbish
    notifyMove(moveClass : MoveClass):void;

    notifyPromote(moveClasses : MoveClass[]):void;

    //Touch related API
    onTouchBegan(point : PIXI.Point):void;
    onTouchMoved(point : PIXI.Point):void;
    onTouchEnded(point : PIXI.Point):void;
}