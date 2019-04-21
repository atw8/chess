import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";
import {PieceView} from "../view/PieceView";
import {PieceModel} from "../../shared/engine/PieceModel";
import {ChessEngine} from "../../shared/engine/ChessEngine";

import {SimpleGame} from "../app";


export class SanSprite extends PIXI.Container{

    private sanStr : string;

    private m_width : number;
    private m_height : number;

    private sanText : string;
    private sideType : SideType;
    private pieceType : PieceType;


    private uiPieceView : PieceView | null;
    constructor(sanStr : string, sideType : SideType, width : number, height : number){
        super();


        this.sanStr = sanStr;
        this.sideType = sideType;
        this.m_width = width;
        this.m_height = height;


        let firstChar = this.sanStr[0];



        let piece : PieceModel | null = ChessEngine.convertFenCharToPieceModel(firstChar);
        if(piece == null || piece.getSideType() == SideType.BLACK){
            this.pieceType = PieceType.PAWN;
            this.sanText = this.sanStr;
        }else {
            this.pieceType = piece.getPieceType();
            this.sanText = this.sanStr.substr(1);
        }

        if(this.pieceType != PieceType.PAWN){
            this.uiPieceView = new PieceView(this.sideType, this.pieceType, this.m_height, this.m_height);

            this.uiPieceView.anchor.set(0.0, 0.5);
            this.uiPieceView.position.set(0.0, -this.uiPieceView.height*0.15);
            this.addChild(this.uiPieceView);
        }else {
            this.uiPieceView = null;
        }


        this.uiSanText = new PIXI.Text(this.sanText);
        let uiSanTextScale : number;
        uiSanTextScale = this.m_height/this.uiSanText.height;
        this.uiSanText.scale.set(uiSanTextScale, uiSanTextScale);
        this.uiSanText.anchor.set(0.0, 0.5);
        if(this.uiPieceView == null){
            this.uiSanText.position.set(0.0, 0.0);
        }else {
            this.uiSanText.position.set(this.uiPieceView.width, 0.0);
        }

        this.addChild(this.uiSanText);
    }



    private uiSanText : PIXI.Text;


}

