import {PieceView} from "../PieceView";

import {ChessEngine} from "../../../shared/engine/ChessEngine";
import {SideType} from "../../../shared/engine/SideType";
import {PieceType} from "../../../shared/engine/PieceType";
import {FileRank} from "../../../shared/engine/FileRank";
import {MoveClass} from "../../../shared/engine/MoveClass";

import {AbstractViewInterface} from "./AbstractViewInterface";
import {AbstractViewInterfaceType} from "./AbstractViewInterface";

import {Controller} from "./../controller/Controller";


export class PieceViewInterface extends AbstractViewInterface{
    private array : { [key : number] : { [key : number] : null | PieceView } };

    private controller : Controller;

    private group : Phaser.Group;
    private squareWidth : number;
    private squareHeight : number;

    constructor(controller : Controller, group : Phaser.Group, squareWidth : number, squareHeight : number) {
        super();
        this.controller = controller;

        this.group = group;
        this.squareWidth = squareWidth;
        this.squareHeight = squareHeight;


        this.array = {};

        for (let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++) {
            this.array[fileNumber] = {};
            for (let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++) {
                this.array[fileNumber][rank] = null;
            }
        }
    }

    public getViewInterfaceType(){
        return AbstractViewInterfaceType.PIECE_VIEW;
    }

    public createPieceView(sideType : SideType, pieceType : PieceType):PieceView{
        let pieceSprite = new PieceView(sideType, pieceType, this.squareWidth, this.squareHeight);
        this.group.add(pieceSprite);

        return pieceSprite;
    }
    public removePieceView(pieceView : PieceView){
        this.group.remove(pieceView, true);
    }


    public getPieceSpriteForFileRank(fileRank: FileRank): PieceView | null {
        return this.array[fileRank["fileNumber"]][fileRank["rank"]];
    }


    public setPieceSpriteForFileRank(fileRank: FileRank, pieceSprite: PieceView | null) {
        this.array[fileRank["fileNumber"]][fileRank["rank"]] = pieceSprite;
    }


    public startAnimation(moveClass : MoveClass, isUndoMove :boolean){
        this.controller.startAnimation(moveClass, isUndoMove);
    }
    public endAnimation(moveClass : MoveClass, isUndoMove : boolean){
        this.controller.endAnimation(moveClass, isUndoMove);
    }
}