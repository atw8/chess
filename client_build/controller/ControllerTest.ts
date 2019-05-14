/*
import {ControllerAbstract} from "./ControllerAbstract";
import {BoardView} from "../BoardViewLayer/BoardView";
import {MoveClass} from "../../shared/engine/MoveClass";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {TouchLayer} from "../BoardViewLayer/TouchLayer";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";
import {LogoLayer} from "../LogoLayer";

export class ControllerTest implements ControllerAbstract{
    private uiLogoLayer : LogoLayer;
    private uiParentView : ParentBoardView;
    private uiBoardView : BoardView;

    private chessEngine : ChessEngine;

    private uiTouchLayer : TouchLayer;


    public setLogoLayer(uiLogoLayer : LogoLayer):void {
        this.uiLogoLayer = uiLogoLayer;
    }

    public setParentBoardView(uiParentView: ParentBoardView, uiBoardView: BoardView): void {
        this.uiParentView = uiParentView;

        this.uiBoardView = uiBoardView;
        this.chessEngine = new ChessEngine();


        //this.chessEngine.init({"isChess960" : false, "beginFenStr" : "r3k2r/1P6/8/8/8/8/8/R3K2R w KQkq - 1 5"});

        //this.chessEngine.init({"isChess960" : false, beginFenStr :"k7/8/8/8/8/4p3/3P4/8 w - - 1 5"});
        //this.chessEngine.init({"isChess960" : true});
        this.chessEngine.init({isChess960 : true, beginFenStr :"nbb1kqr1/ppp1ppp1/7r/3p1N1p/3P1n1P/7R/PPP1PPP1/NBB1KQR1 w Kk - 8 7"});
        this.uiBoardView.updateViewToModel(this.chessEngine);



        this.uiTouchLayer = new TouchLayer(this);
        this.uiTouchLayer.setIsEnabled(true);

        this.uiParentView.setWaitingNodeVisible(false);




        {
            let fenStrRegExp :RegExp;
            {
                let piecePlacementStr = "((?:[pnbrqkPNBRQK12345678]+\/){7}[pnbrqkPNBRQK12345678]+)";
                let sideTypeStr = "([wb])";
                let castlingStr = "((?:[KABCDEFGH]?[QABCDEFGH]?[kabcdefgh]?[qabcdefgh]?)|-)";
                let enPassantStr = "((?:[abcdefgh][12345678])|-)";
                let halfMoveStr = "(\\d)+";
                let moveNumberStr = "(\\d)+";


                let str = "^" + piecePlacementStr + " " + sideTypeStr + " " + castlingStr + " " + enPassantStr + " " + halfMoveStr + " " + moveNumberStr + "$";

                str = "^" + sideTypeStr + " " + halfMoveStr + " " + moveNumberStr + "$";
                let beginFenStr =  "w 0 1";


                let fenStrRegEx = new RegExp(str);

                if(fenStrRegEx.test(beginFenStr)){
                    alert("IT SUCCEDDED " + beginFenStr);
                    console.debug("success");
                }
            }

        }
    }

    //Boardview related rubbish
    public notifyMove(moveClass : MoveClass){
        this.uiTouchLayer.setIsEnabled(true);


        let uciMove = this.chessEngine.getUCIMoveForMoveClass(moveClass);
        moveClass = <MoveClass>this.chessEngine.getMoveClassForUCIMove(uciMove);

        this.chessEngine.doMove(moveClass);
        this.chessEngine.undoMove();

        //let sanMove = this.chessEngine.getSANMoveForCurrentBoardAndMoveClass(moveClass);
        //moveClass = <MoveClass>this.chessEngine.getMoveClassForCurrentBoardAndSanMove(sanMove);



        this.chessEngine.doMove(moveClass);



        this.chessEngine.doMove(moveClass);
        this.uiBoardView.doMove(moveClass);


        let initParam = {"isChess960" : this.chessEngine.initParam.isChess960,
            "beginFenStr" : this.chessEngine.getLastFenStr()};

        this.chessEngine.init(initParam);
        this.uiBoardView.updateViewToModel(this.chessEngine);
    }

    public notifyPromote(moveClasses : MoveClass[]){
        this.uiTouchLayer.setIsEnabled(false);

        this.uiParentView.showPromotePieceLayer(moveClasses, this.notifyMove.bind(this))
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