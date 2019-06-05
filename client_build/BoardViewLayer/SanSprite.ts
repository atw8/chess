import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";
import {PieceView} from "./PieceView";
import {PieceModel} from "../../shared/engine/PieceModel";
import {ChessEngine} from "../../shared/engine/ChessEngine";

import {SimpleGame} from "../app";
import * as PIXI from 'pixi.js';
import {type} from "os";


export class SanSprite extends PIXI.Container{
    private sanStr : string;
    private sideType : SideType;
    private m_size : number;


//    private sanText : string;

    //private pieceType : PieceType;


    //private uiPieceView : PieceView | null;
    //private uiSanText : PIXI.Text;

    constructor(sanStr : string, sideType : SideType, m_size : number){
        super();


        this.sanStr = sanStr;
        this.sideType = sideType;

        this.m_size = m_size;



        let pieceTypeStrArray : (PieceType | string)[] = [];
        if(ChessEngine.sanMoveKingCastleRegExp.test(this.sanStr) || ChessEngine.sanMoveQueenCastleRegExp.test(this.sanStr)){
            pieceTypeStrArray.push(this.sanStr);
        }else {
            let sanPatternResult = ChessEngine.sanMovePiecePatternRegExp.exec(this.sanStr);
            if(sanPatternResult == null){
                pieceTypeStrArray.push(this.sanStr);
            }else {

                if(sanPatternResult[1] != undefined){
                    let pieceType = (<PieceModel>ChessEngine.convertFenCharToPieceModel(sanPatternResult[1])).pieceType;
                    pieceTypeStrArray.push(pieceType);
                }
                let str = "";
                if(sanPatternResult[2] != undefined){
                    str += sanPatternResult[2];
                }
                if(sanPatternResult[3] != undefined){
                    str += sanPatternResult[3];
                }
                if(sanPatternResult[4] != undefined){
                    str += sanPatternResult[4];
                }
                if(sanPatternResult[5] != undefined){
                    str += sanPatternResult[5];
                }

                if(sanPatternResult[6] != undefined){
                    str += "=";
                    pieceTypeStrArray.push(str);
                    str = "";

                    let pieceType = (<PieceModel>ChessEngine.convertFenCharToPieceModel(sanPatternResult[6])).pieceType;
                    pieceTypeStrArray.push(pieceType);
                }
                if(sanPatternResult[7] != undefined){
                    str += sanPatternResult[7];
                }

                if(str != ""){
                    pieceTypeStrArray.push(str);
                }
            }
        }

        let displayContainers : PIXI.Container[] = [];

        for(let i = 0; i < pieceTypeStrArray.length; i++){
            let pieceTypeStr : PieceType | string = pieceTypeStrArray[i];
            if(typeof(pieceTypeStr) == "string"){
                let uiText = new PIXI.Text(pieceTypeStr);
                uiText.anchor.set(0.5, 0.5);
                uiText.style = new PIXI.TextStyle(SimpleGame.getDefaultTextStyleOptions(this.m_size));
                this.addChild(uiText);

                displayContainers.push(uiText);
            }else {
                let sizeConst : number = 1.1;
                let uiPieceView = new PieceView({sideType : this.sideType, pieceType : pieceTypeStr}, this.m_size * sizeConst, this.m_size * sizeConst);
                uiPieceView.anchor.set(0.5, 0.5);
                this.addChild(uiPieceView);

                displayContainers.push(uiPieceView);
            }
        }


        SimpleGame.arrangeHorizontally(displayContainers);
    }





}

