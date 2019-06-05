import {SimpleGame} from "../../app";
import * as PIXI from 'pixi.js';

export class DefaultButton extends PIXI.Graphics {
    protected m_width : number;
    protected m_height : number;

    private m_cb : (d : DefaultButton) => void;



    constructor(width : number, height : number, cb : (d : DefaultButton) => void){
        super();
        this.m_width = width;
        this.m_height = height;
        this.m_cb = cb;

        this.lineStyle(5,  SimpleGame.getDarkBrownColor(), 1.0);
        this.beginFill(SimpleGame.getLightBrownColor());

        this.drawRoundedRect(-this.m_width/2, -this.m_height/2, this.m_width, this.m_height, 5);


        let originScale : number | null = null;

        let onUp = () => {
            if(originScale != null){
                this.scale.set(originScale);
                originScale = null;
            }

        };
        let onDown = () => {
            if(originScale == null){
                originScale = Math.min(this.scale.x, this.scale.y);
                this.scale.set(originScale*0.9);
            }
        };
        let onClick = () => {
            this.m_cb(this);
        };
        //onDown : () => void, onClick : () => void



        SimpleGame.addBtnProperties(this, onUp, onDown, onClick);
    }


}