import {SQUARE_COLORS} from "./SquareColorCons";

import 'p2';
import 'pixi';
import 'phaser';
import {ImageTag} from "../ImageTag";

const Global = require("./../Global");


export class SquareColorNode extends Phaser.Sprite{
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
        super(Global.game, 0, 0, key);


        this.anchor.set(0.5, 0.5);


        let scaleX = squareWidth/this.width;
        let scaleY = squareHeight/this.height;

        this.scale.set(scaleX, scaleY);
    }
}