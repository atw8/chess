import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";
import {PieceView} from "./PieceView";
import {PieceModel} from "../../shared/engine/PieceModel";
import {ChessEngine} from "../../shared/engine/ChessEngine";

import {SimpleGame} from "../app";


export class SanSprite extends PIXI.Container{

    private m_size : number;

    private sanStr : string;

    private sanText : string;
    private sideType : SideType;
    private pieceType : PieceType;


    private uiPieceView : PieceView | null;
    private uiSanText : PIXI.Text;

    constructor(sanStr : string, sideType : SideType, m_size : number){
        super();


        this.sanStr = sanStr;
        this.sideType = sideType;

        this.m_size = m_size;

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
            let sizeConst : number = 1.1;
            this.uiPieceView = new PieceView({sideType : this.sideType, pieceType : this.pieceType}, this.m_size * sizeConst, this.m_size * sizeConst);
            this.uiPieceView.anchor.set(0.5, 0.5);
            this.addChild(this.uiPieceView);
        }else {
            this.uiPieceView = null;
        }


        let textStyleOptions : PIXI.TextStyleOptions = {};
        textStyleOptions.fontSize = this.m_size;
        textStyleOptions.fontFamily = "Helvetica";
        textStyleOptions.fontWeight = "Bold";

        this.uiSanText = new PIXI.Text(this.sanText);
        this.uiSanText.anchor.set(0.5, 0.5);
        this.uiSanText.style = new PIXI.TextStyle(textStyleOptions);
        this.addChild(this.uiSanText);

        if(this.uiPieceView != null){
            SimpleGame.arrangeHorizontally([this.uiPieceView, this.uiSanText]);
        }


    }





}

