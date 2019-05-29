import {SideType} from "../../shared/engine/SideType";
import {SanSprite} from "./SanSprite";

import {SimpleGame} from "../app";
import * as PIXI from "pixi.js";

let pieceViewScale : number = 0.7;

export class PredictSanSprite extends PIXI.Graphics{

    private m_width : number;
    private m_height : number;

    private m_sanStr : string | null;
    private m_moveTurn : SideType;
    private m_percentage : number | null = null;

    private uiSanSprite : SanSprite | null = null;
    private uiPercentage : PIXI.Text;


    private uiPressNode : PIXI.Graphics;



    private pressBtnCallback : (predictSanSprite : PredictSanSprite) => void;

    constructor(width : number, height : number, moveTurn : SideType, pressBtnCallback : (predictSanSprite : PredictSanSprite) => void){
        super();
        this.m_width = width;
        this.m_height = height;
        this.m_moveTurn = moveTurn;

        this.beginFill(0xFFFFFF, 0.0);
        this.drawRect(-this.m_width/2, -this.m_height/2, this.m_width, this.m_height);

        this.pressBtnCallback = pressBtnCallback;



        this.uiSanSprite = null;

        //percentage thing
        let textStyleOptions : PIXI.TextStyleOptions = {};
        textStyleOptions.fontSize = this.m_height*pieceViewScale;
        textStyleOptions.fontFamily = "Helvetica";
        textStyleOptions.fontWeight = "Bold";

        this.uiPercentage = new PIXI.Text("");
        this.uiPercentage.style = new PIXI.TextStyle(textStyleOptions);
        this.uiPercentage.anchor.set(1.0, 0.5);
        this.uiPercentage.position.set((this.m_width/2) - 0.5*pieceViewScale*this.m_height, 0.0);
        this.addChild(this.uiPercentage);


        this.uiPressNode = new PIXI.Graphics();
        this.uiPressNode.lineStyle(4, 0xA66325, 1);
        this.uiPressNode.drawRoundedRect(-this.m_width/2, -this.m_height/2, this.m_width, this.m_height, 4);
        this.addChild(this.uiPressNode);

        this.uiPressNode.visible = true;


        let onUp = () => {
            this.scale.set(1.0);
        };
        let onDown = () => {
            this.scale.set(0.9);
        };
        let onClick = () => {
            this.pressBtnCallback(this);
        };
        //onDown : () => void, onClick : () => void

        SimpleGame.addBtnProperties(this, onUp, onDown, onClick);
        //this.onInputUp.add(this.inputUp.bind(this));
    }

    public setIsPredictMove(isPredictMove : boolean){
        this.uiPressNode.visible = isPredictMove;
    }
    public getIsPredictMove(){
        return this.uiPressNode.visible;
    }





    public setSanStr(sanStr : string | null){
        if(sanStr == this.m_sanStr){
            return;
        }

        this.m_sanStr = sanStr;
        this.updateUiSanSprite();
    }
    public getSanStr():string | null{
        return this.m_sanStr;
    }
    public setMoveTurn(moveTurn : SideType){
        if(moveTurn == this.m_moveTurn){
            return;
        }

        this.m_moveTurn = moveTurn;
        this.updateUiSanSprite();
    }
    public getMoveTurn():SideType{
        return this.m_moveTurn;
    }

    public updateUiSanSprite(){
        if (this.uiSanSprite != null) {
            this.removeChild(this.uiSanSprite);
        }

        if(this.m_sanStr != null && this.m_moveTurn != null){
            this.uiSanSprite = new SanSprite(this.m_sanStr, this.m_moveTurn, this.m_height*pieceViewScale);
            this.addChild(this.uiSanSprite);

            this.uiSanSprite.position.set(-this.m_width/2 + this.uiSanSprite.width/2 + 0.5*pieceViewScale*this.m_height, 0.0);
        }
    }



    public setPercentage(percentage : number | null){
        if(percentage == this.m_percentage){
            return;
        }

        this.m_percentage = percentage;

        if(this.m_percentage != null){
            this.uiPercentage.text = this.m_percentage.toFixed(1) + "%";
            this.uiPercentage.visible = true;
        }else {
            this.uiPercentage.visible = false;
        }
    }

    public getPercentage():number | null{
        return this.m_percentage;
    }
}