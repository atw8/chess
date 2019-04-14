import * as PIXI from 'pixi.js';
import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";

import {PieceView} from "../view/PieceView";
import {SimpleGame} from "../app";


export class TimePanel extends PIXI.Graphics {
    private m_size : number;

    private sideType : SideType;


    private uiPieceView : PieceView;

    private uiText : PIXI.Text;


    constructor(sideType: SideType, m_size: number) {
        super();

        this.sideType = sideType;

        this.m_size = m_size;


        this.uiPieceView = new PieceView(this.sideType, PieceType.PAWN, this.m_size, this.m_size);
        this.addChild(this.uiPieceView);


        this.uiText = new PIXI.Text();
        let textStyleOptions: PIXI.TextStyleOptions = {};
        textStyleOptions.fontSize = this.m_size;
        textStyleOptions.fontFamily = "Helvetica";
        this.uiText.style = new PIXI.TextStyle(textStyleOptions);

        this.uiText.anchor.set(0.0, 0.5);
        this.addChild(this.uiText);

        this.setTime(60 * 1000);





        let _width = SimpleGame.arrangeHorizontally([this.m_size/4, this.uiPieceView, this.uiText, this.m_size/4]);

        this.beginFill(0xFBE2B2);
        this.drawRect(-_width/2, -this.height/2, _width, this.height);

        this.lineStyle(1, 0x000000);
        this.moveTo(-_width/2, -this.height/2);
        this.lineTo(_width/2, -this.height/2);
        this.lineTo(_width/2, this.height/2);
        this.lineTo(-_width/2, this.height/2);
        this.lineTo(-_width/2, -this.height/2);

        this.setTime(Infinity);
    }


    public setTime(timeMilli : number){
        let text : string = "";
        if(isFinite(timeMilli)){
            let minutes = Math.floor(timeMilli / (60 * 1000));
            let seconds = Math.floor(timeMilli/1000) -  minutes * 60;

            text = this.leftPad(minutes, 2) + ":" + this.leftPad(seconds, 2);
        }else {
            text = " ∞";//U+221E"
        }

        this.uiText.text = text
    }


    private leftPad(number : number, targetLength : number):string {
        let ret = String(number);
        while(ret.length < targetLength){
            ret = '0' + ret
        }

        return ret;
    }
}