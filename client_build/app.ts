import * as PIXI from 'pixi.js';
import 'pixi-layers'


import {getLocationForImageTag, ImageTag} from "./ImageTag";
import {LogoLayer} from "./LogoLayer";

import * as TWEEN from '@tweenjs/tween.js'
import {SideType} from "../shared/engine/SideType";
import TextStyleOptions = PIXI.TextStyleOptions;
import {ChooseGameLayer} from './ChooseGameLayer/ChooseGameLayer';
import {ControllerTest} from "./controller/ControllerTest";
import {ParentBoardView} from "./BoardViewLayer/ParentBoardView";
import {ControllerOuter} from "./controller/ControllerOuter";

enum ORIENTATION {
    LANDSCAPE,
    PORTRAIT
}

enum ORIENTATION_STRATERGY {
    CONSTANT_WIDTH,
    CONSTANT_HEIGHT,
}


export class SimpleGame extends PIXI.Application{
    private static OrientationStatergy : { [key in ORIENTATION] : {stratergy : ORIENTATION_STRATERGY, widthHeight : number}};
    private static designWidth : number;
    private static designHeight : number;

    private static gInstance : SimpleGame;

    public static getInstance():SimpleGame{
        if(typeof (this.gInstance) == "undefined"){
            this.gInstance = new SimpleGame();
        }

        return this.gInstance;
    }

    public static _getScreenWidth():number{
        return this.getInstance().view.width;
    }
    public static _getScreenHeight():number{
        return this.getInstance().view.height;
    }

    public static getDesignWidth():number{
        return SimpleGame.designWidth;
    }
    public static getDesignHeight():number{
        return SimpleGame.designHeight;
    }

    public static getDefaultWidth():number{
        return 800;
    }
    public static getDefaultHeight():number{
        return 800;
    }



    public static isPortrait():boolean{
        return SimpleGame.getOrientation() == ORIENTATION.PORTRAIT;
    }
    public static isLandscape():boolean{
        return SimpleGame.getOrientation() == ORIENTATION.LANDSCAPE;
    }
    private static getOrientation():ORIENTATION{
        let width = SimpleGame._getScreenWidth();
        let height = SimpleGame._getScreenHeight();


        return height >= width ? ORIENTATION.PORTRAIT : ORIENTATION.LANDSCAPE;
    }



    private constructor(){
        let applicationOptions : PIXI.ApplicationOptions = {};
        //applicationOptions.transparent = true;

        //let widthHeight = Math.min(window.innerWidth, window.innerHeight) * window.devicePixelRatio;

        applicationOptions.width = window.innerWidth * window.devicePixelRatio * 0.9;
        applicationOptions.height = window.innerHeight * window.devicePixelRatio * 0.9;
        applicationOptions.backgroundColor = 0xFFFFFF;


        super(applicationOptions);

        let divElement : HTMLDivElement = <HTMLDivElement> document.createElement( "div" );
        //divElement.setAttribute("text-align", "center");
        divElement.setAttribute("align", "center");
        //divElement.setAttribute("style", "border: 5px solid red");
        //divElement.setAttribute("margin", "0 auto");
        divElement.appendChild(this.view);



        document.body.appendChild(divElement);



        for(let imageTag in ImageTag){
            PIXI.loader.add(imageTag, getLocationForImageTag(<ImageTag>imageTag));
        }
        PIXI.loader.load(this.onLoad.bind(this));
    }



    public onLoad(){
        // @ts-ignore
        SimpleGame.OrientationStatergy = {};
        SimpleGame.OrientationStatergy[ORIENTATION.LANDSCAPE] = {"stratergy" : ORIENTATION_STRATERGY.CONSTANT_HEIGHT, widthHeight : SimpleGame.getDefaultHeight()};
        SimpleGame.OrientationStatergy[ORIENTATION.PORTRAIT] = {"stratergy" : ORIENTATION_STRATERGY.CONSTANT_WIDTH, widthHeight : SimpleGame.getDefaultWidth()};



        this.stage = new PIXI.display.Stage();

        let orientationStratergy = SimpleGame.OrientationStatergy[SimpleGame.getOrientation()];
        let scale : number = 0;
        if(orientationStratergy.stratergy == ORIENTATION_STRATERGY.CONSTANT_WIDTH){
            scale = SimpleGame._getScreenWidth()/orientationStratergy.widthHeight;
        }else if(orientationStratergy.stratergy == ORIENTATION_STRATERGY.CONSTANT_HEIGHT){
            scale = SimpleGame._getScreenHeight()/orientationStratergy.widthHeight;
        }

        this.stage.scale.set(scale, scale);
        this.stage.position.set(SimpleGame._getScreenWidth()/2, SimpleGame._getScreenHeight()/2);

        SimpleGame.designWidth = SimpleGame._getScreenWidth()/scale;
        SimpleGame.designHeight = SimpleGame._getScreenHeight()/scale;


        this.runLayer(new LogoLayer());
        /*
        let controllerOuter = new ControllerOuter()
        let controllerTest = new ControllerInner();
        let parentBoardView = new ParentBoardView(controllerTest);
        this.runLayer(parentBoardView);
        */
    }


    public runLayer(layer : PIXI.DisplayObject){
        this.stage.removeChildren();
        this.stage.addChild(layer);
    }


    public static debugDraw(spr : PIXI.Container){
        let parent = spr.parent;


        let debugNode = new PIXI.Graphics();
        debugNode.lineStyle(4, 0xFF0000);
        debugNode.moveTo(-spr.width/2, -spr.height/2);
        debugNode.lineTo(spr.width/2, -spr.height/2);
        debugNode.lineTo(spr.width/2, spr.height/2);
        debugNode.lineTo(-spr.width/2, spr.height/2);
        debugNode.lineTo(-spr.width/2, -spr.height/2);


        debugNode.position = spr.position.clone();
        parent.addChild(debugNode);
    }



    public static getLightBrownColor():number{
        return 0xFBE2B2;
    }
    public static getDarkBrownColor():number{
        return 0xA66325;
    }
    public static getWhiteColor():number{
        return 0xFFFFFF;
    }
    public static getBlackColor():number{
        return 0x000000;
    }

    public static getDefaultTextStyleOptions(fontSize : number):TextStyleOptions{
        let textStyleOptions : PIXI.TextStyleOptions = {};
        textStyleOptions.fontFamily = "Helvetica";
        textStyleOptions.fontSize = Math.round(fontSize);
        textStyleOptions.fontWeight = "bold";

        return textStyleOptions;
    }




    public static addBtnProperties(spr : PIXI.DisplayObject, onUp : () => void, onDown : () => void, onClick : () => void){
        spr.interactive = true;
        spr.on("pointerdown", onDown);
        //this.on("pointermove", this.onTouchMoved.bind(this));

        spr.on("pointerupoutside", onUp);
        spr.on("pointercancel", onUp);

        spr.on("pointerup", () => {onUp();onClick()});
    }

    public static arrangeVertically(sprs : (PIXI.Container | number)[]):number{
        return SimpleGame.arrangeHelper(sprs, "y", "height");
    }
    public static arrangeHorizontally(sprs : (PIXI.Container | number)[]):number{
        return SimpleGame.arrangeHelper(sprs, "x", "width");
    }

    private static arrangeHelper(sprs : (PIXI.Container | number)[], propXY : "x" | "y", propWidthHeight : "width" | "height"):number{
        let wh : number = 0;
        for(let i = 0; i < sprs.length; i++){
            let spr = sprs[i];


            if(typeof spr == "number"){
                wh += spr;
            }else {
                let anchor = 0.5;
                // @ts-ignore
                if(spr.anchor != undefined){
                    // @ts-ignore
                    anchor = spr.anchor[propXY];
                }

                spr.position[propXY] = wh + anchor * spr[propWidthHeight];

                wh += spr[propWidthHeight];
            }

        }

        for(let i = 0; i < sprs.length; i++){
            let spr = sprs[i];
            if(typeof spr != "number"){
                spr.position[propXY] = spr.position[propXY] - wh/2
            }

        }


        return wh;

    }

    public static recenterFunction(parent : PIXI.Container){
        SimpleGame.recenterSpritesFunction(parent.children);
    }

    public static recenterSpritesFunction(children : PIXI.DisplayObject[]){

        let minX = 0;
        let maxX = 0;

        let minY = 0;
        let maxY = 0;

        for(let i = 0; i < children.length; i++){
            let child = children[i];


            let width : number = 0;
            let height : number = 0;

            // @ts-ignore
            if(child.width != undefined){
                // @ts-ignore
                width = child.width;
            }
            // @ts-ignore
            if(child.height != undefined){
                // @ts-ignore
                height = child.height;
            }


            let anchor = new PIXI.Point(0.5, 0.5);
            // @ts-ignore
            if(child.anchor != undefined){
                // @ts-ignore
                anchor = child.anchor;
            }

            minX = Math.min(minX, child.x - width*anchor.x);
            maxX = Math.max(maxX, child.x + width*(1.0 - anchor.x));

            minY = Math.min(minY, child.y - height*anchor.y);
            maxY = Math.max(maxY, child.y + height*(1.0 - anchor.y));
        }


        let recenterVec = new PIXI.Point(-(minX + maxX)/2, -(minY + maxY)/2);

        if(recenterVec.x == 0 && recenterVec.y == 0){
            return;
        }

        for(let i = 0; i < children.length; i++){
            let child = children[i];

            child.x = child.x + recenterVec.x;
            child.y = child.y + recenterVec.y;
        }
    }


    public static arrangeList(startX : number, endX : number, numOfCols : number, startY : number, diffY : number, sprs : PIXI.DisplayObject[]){
        let y = startY - diffY;

        let diffX = endX - startX;

        for(let i = 0; i < sprs.length; i++){
            let x = startX + (i % numOfCols)*diffX/(numOfCols - 1);

            if((i % numOfCols) == 0){
                y += diffY;
            }

            sprs[i].position.set(x, y);
        }

        //for(let i = 0; i < sprs.length; i++){
            //sprs[i].visible = i < numOfCols;
        //}
    }
}


window.onload = () => {
    function animate(time : number){
        requestAnimationFrame(animate);
        TWEEN.update(time);
    }

    requestAnimationFrame(animate);

    SimpleGame.getInstance();
};