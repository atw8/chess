import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";

import {getNameForImageTag, ImageTag} from "../ImageTag";
import {SimpleGame} from "../app";


export class PieceView extends PIXI.Sprite {

    private m_squareWidth : number;
    private m_squareHeight : number;

    private sideType : SideType;
    private pieceType : PieceType;

    private static getKeyForSideTypePieceType(sideType : SideType, pieceType : PieceType) : string{
        let key : ImageTag = ImageTag.null;
        switch(sideType){
            case SideType.WHITE:
                switch(pieceType){
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
                switch(pieceType){
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

        return getNameForImageTag(key);
    }

    constructor(sideType : SideType, pieceType : PieceType, squareWidth : number, squareHeight : number){
        super(PIXI.Texture.from(PieceView.getKeyForSideTypePieceType(sideType, pieceType)));

        this.sideType = sideType;
        this.pieceType = pieceType;

        this.m_squareWidth = squareWidth;
        this.m_squareHeight = squareHeight;



        this.anchor.set(0.5, 0.5);

        this.setNormal();
    }

    public setPiece(sideType : SideType, pieceType : PieceType){
        if(sideType == this.sideType && pieceType == this.pieceType){
            return;
        }
        this.sideType = sideType;
        this.pieceType = pieceType;

        this.texture = PIXI.Texture.from(PieceView.getKeyForSideTypePieceType(this.sideType, this.pieceType));

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