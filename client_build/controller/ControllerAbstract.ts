import {MoveClass} from "../../shared/engine/MoveClass";
import {BoardView} from "../BoardViewLayer/BoardView";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";
import {LogoLayer} from "../LogoLayer";

export interface ControllerAbstract {
    setParentBoardView(uiParentView : ParentBoardView, uiBoardView : BoardView):void;

    //Boardview related rubbish
    notifyMove(moveClass : MoveClass):void;

    notifyPromote(moveClasses : MoveClass[]):void;

    //Touch related API
    onTouchBegan(point : PIXI.Point):void;
    onTouchMoved(point : PIXI.Point):void;
    onTouchEnded(point : PIXI.Point):void;
}
