import * as PIXI from 'pixi.js';
import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";

import {PieceView} from "./PieceView";
import {SimpleGame} from "../app";


export class TimePanel extends PIXI.Graphics {
    private m_size : number;


    private uiPieceView : PieceView;

    private uiText : PIXI.Text;


    constructor(sideType: SideType, m_size: number) {
        super();


        this.m_size = m_size;


        this.uiPieceView = new PieceView({sideType : sideType, pieceType : PieceType.PAWN}, this.m_size, this.m_size);
        this.addChild(this.uiPieceView);


        this.uiText = new PIXI.Text("");
        this.uiText.style = new PIXI.TextStyle(SimpleGame.getDefaultTextStyleOptions(this.m_size));

        this.uiText.anchor.set(0.0, 0.5);
        this.addChild(this.uiText);

        this.setTime(6000 * 1000);





        let _width = SimpleGame.arrangeHorizontally([this.m_size/4, this.uiPieceView, this.uiText, this.m_size/4]);

        this.beginFill(0xFBE2B2);
        this.drawRect(-_width/2, -this.height/2, _width, this.height);

        this.lineStyle(1, SimpleGame.getBlackColor());
        this.moveTo(-_width/2, -this.height/2);
        this.lineTo(_width/2, -this.height/2);
        this.lineTo(_width/2, this.height/2);
        this.lineTo(-_width/2, this.height/2);
        this.lineTo(-_width/2, -this.height/2);

        this.setTime(Infinity);
    }


    public setSideType(sideType : SideType){
        this.uiPieceView.setPiece({sideType : sideType, pieceType : PieceType.PAWN});
    }
    public getSideType():SideType{
        return this.uiPieceView.getSideType();
    }


    public setTime(timeMilli : number){
        let text : string = "";
        if(isFinite(timeMilli)){
            if(timeMilli < 0){
                timeMilli = 0;
            }
            let minutes = Math.floor(timeMilli / (60 * 1000));
            let seconds = Math.floor(timeMilli/1000) -  minutes * 60;
            let milliSeconds = Math.floor(timeMilli - (minutes * 60 * 1000 + seconds * 1000));
            milliSeconds = Math.floor(milliSeconds/100);



            text = this.leftPad(minutes, 2) + ":" + this.leftPad(seconds, 2) + "." + this.rightPad(milliSeconds, 1);
        }else {
            text = " \u221E";
        }

        this.uiText.text = text;
    }


    private leftPad(number : number, targetLength : number):string {
        let ret = String(number);
        while(ret.length < targetLength){
            ret = '0' + ret
        }

        return ret;
    }
    private rightPad(number : number, targetLength : number):string {
        let ret = String(number);
        while(ret.length < targetLength){
            ret = ret + '0';
        }

        return ret;
    }
}