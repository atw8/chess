import {SimpleGame} from "../../SimpleGame";
import * as PIXI from 'pixi.js';

export class MultiText extends PIXI.Container {
    private uiTexts : PIXI.Text[];
    constructor(){
        super();
        this.uiTexts = [];
    }

    public addText(text : string, style ?: any | PIXI.TextStyle){
        let uiText : PIXI.Text = new PIXI.Text(text, style);
        uiText.anchor.set(0.5, 0.5);
        this.addChild(uiText);

        this.uiTexts.push(uiText);

        SimpleGame.arrangeHorizontally(this.uiTexts);
    }
}