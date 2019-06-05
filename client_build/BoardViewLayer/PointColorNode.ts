import {POINT_COLORS} from "./PointColorCons";

import {ImageTag} from "../ImageTag";
import {SimpleGame} from "../app";
import * as PIXI from 'pixi.js';


export class PointColorNode extends PIXI.Sprite {
    constructor(pointColor : POINT_COLORS, squareWidth : number, squareHeight : number){
        let key : ImageTag = ImageTag.null;
        switch(pointColor){
            case POINT_COLORS.GREEN:
                key = ImageTag.pointGreen;
                break;
            case POINT_COLORS.RED:
                key = ImageTag.pointRed;
                break;
            case POINT_COLORS.YELLOW:
                key = ImageTag.pointYellow;
                break;
        }

        super(PIXI.Texture.from(key));

        let scaleX = (squareWidth/this.width)*0.8;
        let scaleY = (squareHeight/this.height)*0.8;

        this.scale.set(scaleX, scaleY);
        this.anchor.set(0.5, 0.5);
    }
}