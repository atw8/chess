import {PieceView} from "../PieceView";
import {MoveClass} from "../../../shared/engine/MoveClass";
import {BoardView} from "../BoardView";

import {SideType} from "../../../shared/engine/SideType";
import {PieceType} from "../../../shared/engine/PieceType";
import {FileRank} from "../../../shared/engine/FileRank";
import {ChessEngine} from "../../../shared/engine/ChessEngine";


import {AbstractViewInterface} from "./AbstractViewInterface";
import {AbstractViewInterfaceType} from "./AbstractViewInterface";


const Global = require("./../../Global");

export class PredictViewInterface extends AbstractViewInterface{

    private group : Phaser.Group;
    private squareWidth : number;
    private squareHeight : number;

    private array : { [key : number] : PieceView | null};

    private alpha : number;

    private moveClass : MoveClass;
    private boardView : BoardView;

    private isDestroy : boolean;

    constructor(moveClass : MoveClass, alpha : number, boardView : BoardView, group : Phaser.Group, squareWidth : number, squareHeight : number){
        super();

        this.group = group;
        this.squareWidth = squareWidth;
        this.squareHeight = squareHeight;

        this.array = {};

        this.alpha = alpha;

        this.moveClass = moveClass;
        this.boardView = boardView;

        this.isDestroy = false;

        this.startAutomata(0.0);
    }

    public destroy(){
        this.isDestroy = true;
        for(let _hash in this.array){
            let hash = Number(_hash);
            let pieceView : PieceView | null = this.array[hash];
            if(pieceView != null){
                let positionManager = this.boardView.getPositionManager();

                while(positionManager.isMovingSprite(pieceView)){
                    positionManager.updateMovingSprites(60 * 60 * 1000, pieceView);
                }
            }
        }

        for(let _hash in this.array){
            let hash = Number(_hash);
            let pieceView : PieceView | null = this.array[hash];
            if(pieceView != null){
                this.removePieceView(pieceView);
            }
        }
        this.array = {};
    }



    public getViewInterfaceType(){
        return AbstractViewInterfaceType.PREDICT_VIEW;
    }


    public setPieceSpriteForFileRank(fileRank: FileRank, pieceSprite: PieceView | null){
        let hash = ChessEngine.getHashForFileRank(fileRank);
        this.array[hash] = pieceSprite;
    }

    public getPieceSpriteForFileRank(fileRank: FileRank): PieceView | null {
        let hash = ChessEngine.getHashForFileRank(fileRank);

        let ret : PieceView | null;
        if(this.array[hash] == undefined){
            ret = null;
        }else {
            ret = this.array[hash];
        }

        return ret;
    }

    public createPieceView(sideType : SideType, pieceType : PieceType):PieceView{
        let pieceView = new PieceView(sideType, pieceType, this.squareWidth, this.squareHeight);
        this.group.addChild(pieceView);

        pieceView.alpha = this.alpha;

        return pieceView;
    }
    public removePieceView(pieceView : PieceView){
        this.group.removeChild(pieceView);
    }




    public startAnimation(moveClass : MoveClass, isUndoMove : boolean){

    }
    public endAnimation(moveClass : MoveClass, isUndoMove : boolean){
        this.startAutomata(500);
    }







    private startAutomata(delay : number){
        Global.game.time.events.add(delay, () => {
            if(!this.isDestroy){
                this.boardView.doMoveAnimation(this.moveClass, false, this);
            }
        });

    }




}