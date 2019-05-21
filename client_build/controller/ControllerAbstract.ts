import {MoveClass} from "../../shared/engine/MoveClass";
import {BoardView} from "../BoardViewLayer/BoardView";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";
import {LogoLayer} from "../LogoLayer";
import {PredictPanel} from "../OtherView/PredictPanel";

export interface ControllerAbstract {
    setParentBoardView(opts : {uiParentView : ParentBoardView,
        uiBoardView : BoardView,
        uiPredictPanel : PredictPanel | null,
        uiPredictBoardView : BoardView | null}):void;
    //setParentBoardView(uiParentView : ParentBoardView, uiBoardView : BoardView):void;

    //Boardview related rubbish
    notifyMove(moveClass : MoveClass, uiBoardView : BoardView):void;

    notifyPromote(moveClasses : MoveClass[], uiBoardView : BoardView):void;

    //Touch related API
    onTouchBegan(point : PIXI.Point):void;
    onTouchMoved(point : PIXI.Point):void;
    onTouchEnded(point : PIXI.Point):void;

    isPredictPanel(): boolean;
    predictMovePress(isMyMove : boolean, sanStr : string): void;
}
