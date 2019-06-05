import {SQUARE_COLORS} from "./SquareColorCons";

import {ImageTag} from "../ImageTag";
import * as PIXI from 'pixi.js';



export class SquareColorNode extends PIXI.Sprite{
    constructor(squareColor : SQUARE_COLORS, squareWidth : number, squareHeight : number){
        let key : ImageTag = ImageTag.null;
        switch(squareColor){
            case SQUARE_COLORS.BLUE:
                key = ImageTag.squareBlue;
                break;
            case SQUARE_COLORS.GREEN:
                key = ImageTag.squareGreen;
                break;
            case SQUARE_COLORS.RED:
                key = ImageTag.squareRed;
                break;
        }
        super(PIXI.Texture.from(key));


        this.anchor.set(0.5, 0.5);


        let scaleX = squareWidth/this.width;
        let scaleY = squareHeight/this.height;

        this.scale.set(scaleX, scaleY);
    }
}