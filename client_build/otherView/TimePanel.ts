import 'p2';
import 'pixi';
import 'phaser';
import {SimpleGame} from "../app";
import TextStyleOptions = PIXI.TextStyleOptions;



export class TimePanel extends PIXI.Graphics {
    private m_width : number;
    public getWidth():number{
        return this.m_width;
    }
    private m_height : number;
    public getHeight():number{
        return this.m_height;
    }

    private uiText : PIXI.Text;

    constructor(width : number, height : number){
        super();

        this.m_width = width;
        this.m_height = height;

        this.beginFill(0xFBE2B2);
        this.drawRoundedRect(-this.m_width/2, -this.m_height/2, this.m_width, this.m_height, 3);


        this.uiText = new PIXI.Text("Turn");
        let textStyleOptions : TextStyleOptions = {};
        textStyleOptions.fontSize = 50;
        textStyleOptions.fontFamily = "Times New Roman"
        this.uiText.style = new PIXI.TextStyle(textStyleOptions);

        this.uiText.position.y = 8;
        this.uiText.scale.set(this.m_height/this.uiText.height, this.m_height/this.uiText.height);
        this.uiText.anchor.set(0.5, 0.5);
        this.addChild(this.uiText);

        this.setTime(60* 1000);
    }


    public setTime(timeMilli : number){
        let minutes = Math.floor(timeMilli / (60 * 1000));
        let seconds = minutes * 60 - Math.floor(timeMilli/1000);


        this.uiText.text = this.leftPad(minutes, 2) + ":" + this.leftPad(seconds, 2);
    }


    private leftPad(number : number, targetLength : number):string {
        let ret = String(number);
        while(ret.length < targetLength){
            ret = '0' + ret
        }

        return ret;
    }
}