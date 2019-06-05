

import {getLocationForImageTag, ImageTag} from "./ImageTag";
import * as TWEEN from '@tweenjs/tween.js'
import {LogoLayer} from "./LogoLayer";


import "hammerjs"


import * as PIXI from 'pixi.js';
declare module "pixi.js" {
    interface Matrix {
        applyVector(pos : PIXI.Point, newPos ?: PIXI.Point):PIXI.Point;

        applyInverseVector(pos : PIXI.Point, newPos ?: PIXI.Point):PIXI.Point;
    }

    interface PointConstructor {
        lerp(posFrom : PIXI.Point, posTo : PIXI.Point, t : number, posOut ?: PIXI.Point):PIXI.Point;
    }
}


/*
PIXI.Point.lerp = function(posFrom : PIXI.Point, posTo : PIXI.Point, t : number, posOut ?: PIXI.Point){
    if(posOut === undefined){
        posOut = new PIXI.Point();
    }

    posOut.x = (1 - t)*posFrom.x + t*posTo.x;
    posOut.y = (1 - t)*posFrom.y + t*posTo.y;

    return posOut;
}
*/



PIXI.Matrix.prototype.applyVector = function(pos : PIXI.Point, newPos ?: PIXI.Point){
    let rememTx = this.tx;
    let rememTy = this.ty;
    this.tx = 0;
    this.ty = 0;
    newPos = <PIXI.Point>this.apply(pos, newPos);
    this.tx = rememTx;
    this.ty = rememTy;

    return newPos;
};

PIXI.Matrix.prototype.applyInverseVector = function(pos : PIXI.Point, newPos ?: PIXI.Point){
    let rememTx = this.tx;
    let rememTy = this.ty;
    this.tx = 0;
    this.ty = 0;
    newPos = <PIXI.Point>this.applyInverse(pos, newPos);
    this.tx = rememTx;
    this.ty = rememTy;

    return newPos;
};



const windowInnerScale = 0.9;




export enum ORIENTATION {
    LANDSCAPE = 0,
    PORTRAIT = 1,
    FIRST_ORIENTATION = LANDSCAPE,
    LAST_ORIENTATION = PORTRAIT
}

enum ORIENTATION_STRATERGY {
    CONSTANT_WIDTH,
    CONSTANT_HEIGHT,
}



export class SimpleGame extends PIXI.Application{
    private static OrientationStatergy : { [key in ORIENTATION] : {stratergy : ORIENTATION_STRATERGY, widthHeight : number}};
    private static designWidth : number;
    private static designHeight : number;

    private stageDefaultPosition : PIXI.Point;
    private maxStageScale : number;
    private minStageScale : number;

    private static gInstance : SimpleGame;

    public static getInstance():SimpleGame{
        if(this.gInstance == undefined){
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
    public static getOrientation():ORIENTATION{
        let width = SimpleGame._getScreenWidth();
        let height = SimpleGame._getScreenHeight();


        return height >= width ? ORIENTATION.PORTRAIT : ORIENTATION.LANDSCAPE;
    }



    private constructor(){
        //super({backgroundColor : 0xFFFFFF, resizeTo : });
        super({backgroundColor : 0xFFFFFF, width : window.innerWidth * windowInnerScale, height : window.innerHeight * windowInnerScale});

        let divElement : HTMLDivElement = <HTMLDivElement> document.createElement( "div" );
        divElement.setAttribute("align", "center");
        divElement.appendChild(this.view);



        document.body.appendChild(divElement);

        /*
        {
            let hammerTime = new Hammer(this.view);
            hammerTime.get('pinch').set({ enable: true });


            let pinchEnd : PIXI.Point | null;
            let pinchStart : PIXI.Point | null;
            let pinchScale : number = this.stage.scale.x;


            hammerTime.on("pinch", (e : HammerInput)=>{
                if(pinchStart == null || pinchEnd == null){
                    pinchStart = this.stage.position.clone();

                    {
                        let point = new PIXI.Point();
                        this.renderer.plugins.interaction.mapPositionToPoint(point, e.center.x, e.center.y);

                        let localPoint = this.stage.toLocal(point);
                        let localOrigin = this.stage.toLocal(new PIXI.Point(SimpleGame._getScreenWidth()/2, SimpleGame._getScreenHeight()/2));

                        let localDiff = new PIXI.Point(localOrigin.x - localPoint.x, localOrigin.y - localPoint.y);
                        let globalDiff = this.stage.worldTransform.applyVector(localDiff);

                        pinchEnd = new PIXI.Point(this.stage.position.x + globalDiff.x, this.stage.position.y + globalDiff.y);
                    }
                }


                //Update the scale
                let scale = pinchScale * e.scale;
                scale = Math.min(this.maxStageScale, scale);
                scale = Math.max(this.minStageScale, scale);


                //this.stage.scale.set(scale);


                //Update the position
                {
                    let position = new PIXI.Point();



                    let t = (scale - this.minStageScale)/(this.maxStageScale - this.minStageScale);
                    //alert("this.maxStageScale " + this.maxStageScale + ", this.minStageScale " + this.minStageScale + ", this.scale " + scale + ",t " + t);
                        //(scale - pinchScale)*(this.maxStageScale - pinchScale);

                    position.x = pinchStart.x + (pinchEnd.x - pinchStart.x)*t;
                    position.y = pinchStart.y + (pinchEnd.y - pinchStart.y)*t;

                    this.stage.position = position;
                }

            });
            hammerTime.on("pinchend", (e : HammerInput)=>{
                pinchStart = null;
                pinchEnd = null;
                pinchScale = this.stage.scale.x;
            });
        }
        */



        // @ts-ignore
        SimpleGame.OrientationStatergy = {};
        SimpleGame.OrientationStatergy[ORIENTATION.LANDSCAPE] = {"stratergy" : ORIENTATION_STRATERGY.CONSTANT_HEIGHT, widthHeight : SimpleGame.getDefaultHeight()};
        SimpleGame.OrientationStatergy[ORIENTATION.PORTRAIT] = {"stratergy" : ORIENTATION_STRATERGY.CONSTANT_WIDTH, widthHeight : SimpleGame.getDefaultWidth()};


        for(let imageTag in ImageTag){
            this.loader.add(imageTag, getLocationForImageTag(<ImageTag>imageTag));
        }
        this.loader.load(this.onLoad.bind(this));
    }


    public onResizeScreen(){
        this.renderer.resize(window.innerWidth * windowInnerScale, window.innerHeight * windowInnerScale);


        let orientationStratergy = SimpleGame.OrientationStatergy[SimpleGame.getOrientation()];
        let scale : number = 0;
        if(orientationStratergy.stratergy == ORIENTATION_STRATERGY.CONSTANT_WIDTH){
            scale = SimpleGame._getScreenWidth()/orientationStratergy.widthHeight;
        }else if(orientationStratergy.stratergy == ORIENTATION_STRATERGY.CONSTANT_HEIGHT){
            scale = SimpleGame._getScreenHeight()/orientationStratergy.widthHeight;
        }


        this.stage.scale.set(scale);
        this.stage.position.set(SimpleGame._getScreenWidth()/2, SimpleGame._getScreenHeight()/2);

        SimpleGame.designWidth = SimpleGame._getScreenWidth()/scale;
        SimpleGame.designHeight = SimpleGame._getScreenHeight()/scale;


        this.minStageScale = scale;
        this.maxStageScale = this.minStageScale*3;

        this.stageDefaultPosition = this.stage.position.clone();

        if(this.activeLayer != null){
            this.activeLayer.onResizeScreen();
        }
    }



    public onLoad(){
        this.onResizeScreen();


        this.runLayer(new LogoLayer());


        //Add pinch hammerTime


        //this.runLayer(new LogoLayer());
        /*
        let controllerOuter = new ControllerOuter()
        let controllerTest = new ControllerInner();
        let parentBoardView = new ParentBoardView(controllerTest);
        this.runLayer(parentBoardView);
        */
    }




    private activeLayer : PIXI.DisplayObject & {onResizeScreen() : void} | null = null;
    public runLayer(layer : PIXI.DisplayObject & {onResizeScreen() : void} | null){
        if(this.activeLayer != null){
            this.stage.removeChild(this.activeLayer);
            this.activeLayer = null;
        }

        this.activeLayer = layer;
        if(this.activeLayer != null){
            this.stage.addChild(this.activeLayer);
        }
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

    public static getDefaultTextStyleOptions(fontSize : number):{fontFamily ?: string,
        fontSize ?: number,
        fontWeight ?: string,
        fill ?: number}{

        let textStyleOptions = {
            fontFamily : "Helvetica",
            fontSize : Math.round(fontSize),
            fontWeight : "bold"
        };

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


    window.addEventListener('resize', ()=>{
        SimpleGame.getInstance().onResizeScreen();
    });

    SimpleGame.getInstance();






};