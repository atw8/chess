import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";

import {ImageTag} from "../ImageTag";
import {PieceModel} from "../../shared/engine/PieceModel";


export class PieceView extends PIXI.Sprite {

    private m_squareWidth : number;
    private m_squareHeight : number;


    private pieceModel : PieceModel.Interface;

    public getSideType():SideType{
        return this.pieceModel.sideType;
    }
    public getPieceType():PieceType{
        return this.pieceModel.pieceType;
    }

    private static getKeyForPieceModel(pieceModel : PieceModel.Interface){
        let key : ImageTag = ImageTag.null;
        switch(pieceModel.sideType){
            case SideType.WHITE:
                switch(pieceModel.pieceType){
                    case PieceType.PAWN:
                        key = ImageTag.white_pawn;
                        break;
                    case PieceType.KNIGHT:
                        key = ImageTag.white_knight;
                        break;
                    case PieceType.BISHOP:
                        key = ImageTag.white_bishop;
                        break;
                    case PieceType.ROOK:
                        key = ImageTag.white_rook;
                        break;
                    case PieceType.QUEEN:
                        key = ImageTag.white_queen;
                        break;
                    case PieceType.KING:
                        key = ImageTag.white_king;
                        break;
                }
                break;
            case SideType.BLACK:
                switch(pieceModel.pieceType){
                    case PieceType.PAWN:
                        key = ImageTag.black_pawn;
                        break;
                    case PieceType.KNIGHT:
                        key = ImageTag.black_knight;
                        break;
                    case PieceType.BISHOP:
                        key = ImageTag.black_bishop;
                        break;
                    case PieceType.ROOK:
                        key = ImageTag.black_rook;
                        break;
                    case PieceType.QUEEN:
                        key = ImageTag.black_queen;
                        break;
                    case PieceType.KING:
                        key = ImageTag.black_king;
                        break;
                }
                break;
        }

        return key;
    }

    constructor(pieceModel : PieceModel.Interface, squareWidth : number, squareHeight : number){
        super(PIXI.Texture.from(PieceView.getKeyForPieceModel(pieceModel)));

        this.pieceModel = {sideType : pieceModel.sideType, pieceType : pieceModel.pieceType};


        this.m_squareWidth = squareWidth;
        this.m_squareHeight = squareHeight;



        this.anchor.set(0.5, 0.5);

        this.setNormal();
    }

    public setPiece(pieceModel : PieceModel.Interface){
        if(PieceModel.isEqualTo(pieceModel, this.pieceModel)){
            return;
        }

        this.pieceModel = {sideType : pieceModel.sideType, pieceType : pieceModel.pieceType};

        this.texture = PIXI.Texture.from(PieceView.getKeyForPieceModel(this.pieceModel));
    }

    public setNormal(){
        const scaleCons = 90;

        let scaleX = this.m_squareWidth/scaleCons;
        let scaleY = this.m_squareHeight/scaleCons;

        this.scale.set(scaleX, scaleY);
    }
    public setMoving(){
        const scaleCons = 62;

        let scaleX = this.m_squareWidth/scaleCons;
        let scaleY = this.m_squareHeight/scaleCons;

        this.scale.set(scaleX, scaleY);
    }

    public setAlpha(alpha : number){
        this.alpha = alpha;
    }
}