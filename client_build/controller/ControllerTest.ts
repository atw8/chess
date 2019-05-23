import {ControllerAbstract} from "./ControllerAbstract";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";
import {MoveClass} from "../../shared/engine/MoveClass";
import {BoardView} from "../BoardViewLayer/BoardView";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {Matcher} from "anymatch";
import {PredictPanel} from "../OtherView/PredictPanel";
import {AbstractEngine} from "../../shared/engine/AbstractEngine";

export class ControllerTest implements ControllerAbstract {
    private uiParentView : ParentBoardView;
    private uiBoardView : BoardView;
    private uiPredictBoardView : BoardView | null;

    private chessEngine : ChessEngine;

    public setParentBoardView(opts : {uiParentView : ParentBoardView,
        uiBoardView : BoardView,
        uiPredictPanel : PredictPanel | null,
        uiPredictBoardView : BoardView | null}):void{


        this.uiParentView = opts.uiParentView;
        this.uiBoardView = opts.uiBoardView;
        this.uiPredictBoardView = opts.uiPredictBoardView;

        this.chessEngine = new ChessEngine();
        this.uiBoardView.updateViewToModel(this.chessEngine);

        let moveClasses = this.chessEngine.getAllLegalMoves(null, false);
        let sanMoves = this.chessEngine.getSANMovesForCurrentBoardAndMoveClasses(moveClasses);


        let votedMoves :  { sanStr : string, number : number}[] = [];
        for(let i = 0; i < sanMoves.length; i++){
            let number = Math.floor(Math.random()*100);
            votedMoves.push({sanStr : sanMoves[i], number : number});
        }

        //this.uiParentView.setVotingData(votedMoves);

        console.log(this.chessEngine.getSanMoves());

        //this.onPredictBoardViewDoMove();
    }




    //Boardview related rubbish
    public notifyMove(moveClass : MoveClass, uiBoardView : BoardView){

    }

    public notifyPromote(moveClasses : MoveClass[], uiBoardView : BoardView){

    }

    //Touch related API
    public onTouchBegan(point : PIXI.Point){

    }
    public onTouchMoved(point : PIXI.Point){

    }
    public onTouchEnded(point : PIXI.Point){

    }


    private isPredictContinue : boolean = true;
    public isPredictPanel():boolean{
        return true;
    }
    public predictMovePress(isMyMove : boolean, sanMove : string){
        if(this.uiPredictBoardView == null){
            return;
        }

        this.isPredictContinue = false;
        this.uiPredictBoardView.updateViewToModel(null);
        this.isPredictContinue = true;

        let _p = () => {
            if(this.uiPredictBoardView == null){
                return;
            }
            if(!this.isPredictContinue){
                return;
            }


            this.uiPredictBoardView.updateViewToModel(null);

            let moveClass = this.chessEngine.getMoveClassForCurrentBoardAndSanMove(sanMove);
            if(moveClass == null){
                return;
            }

            this.uiPredictBoardView.doMove(moveClass, _p2)
        };

        let _p2 = (moveClass : MoveClass) => {
            if(this.uiPredictBoardView == null){
                return;
            }
            if(!this.isPredictContinue){
                return;
            }

            moveClass = AbstractEngine.flipMoveClass(moveClass);

            this.uiPredictBoardView.doMove(moveClass, _p);
        };

        _p();
    }


}