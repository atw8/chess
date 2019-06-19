import {ScrollLayer} from "./ScrollLayer";
import {SimpleGame} from "./SimpleGame";
import {ImageTag} from "./ImageTag";
import {ControllerOuter} from "./controller/ControllerOuter";

import * as PIXI from 'pixi.js';
import {SplashScreenLayer} from "./SplashScreenLayer";
import {ChessEngine} from "../shared/engine/ChessEngine";
import {MoveClass} from "../shared/engine/MoveClass";

const ScrollLayerSpeed : number = 10;
const DisplayPoints : boolean = false;

export class LogoLayer extends PIXI.Container {


    private scrollLayer : ScrollLayer;
    private controller : ControllerOuter;

    private timeStamp : number;
    private timeDiffConstat : number = 2000;

    constructor(){
        super();

        /*
        let chessEngine = new ChessEngine({isAskDraw : true});
        let sanMoves :string[] = [];
        sanMoves.push("Nf3");
        sanMoves.push("Nf6");
        sanMoves.push("Ng1");
        sanMoves.push("Ng8");


        let milliStart = Date.now();
        let iIterations = 1000;
        for(let i = 0; i < iIterations; i++){
            for(let j = 0; j < sanMoves.length; j++){
                let sanMove = sanMoves[j];
                let moveClass = <MoveClass>chessEngine.getMoveClassForCurrentBoardAndSanMove(sanMove);
                chessEngine.doMove(moveClass)
            }
        }
        let milliEnd = Date.now();
        let milliElapsed = milliEnd - milliStart;
        alert("hell world " + iIterations + ", dateElapsed " + milliElapsed/1000);
        */

        this.on("added", this.onAdded);
    }


    public onAdded(){
        this.controller = new ControllerOuter(this);

        this.timeStamp = Date.now();

        //let size = {width : SimpleGame.getDesignWidth(), height : SimpleGame.getDesignHeight()};
        this.scrollLayer = new ScrollLayer(ScrollLayer.DIRECTION.HORIZONTAL, SimpleGame.getDesignWidth(), ScrollLayerSpeed);
        this.addChild(this.scrollLayer);

        this.scrollLayer.addLayer(new SplashScreenLayer(this.controller));


        //this.points = [];
        //this.addLayer(new ChooseGameLayer(this.onClickCallback.bind(this)));




        /*
        for(let i = 1; i <= 2; i++){
            let controllerInner = new ControllerInner(i, this.controller);
            this.addParentBoardView(controllerInner);
        }
        */


        /*
        let uiWinNode = new WinNode(45, ChessGameStateEnum.WHITE_WIN_CHECKMATE);
        this.addChild(uiWinNode);
        */



    }


    public onResizeScreen(){
        this.scrollLayer.setWidthHeight(SimpleGame.getDesignWidth());

        let layers = this.scrollLayer.getLayers();
        for(let i = 0; i < layers.length; i++){
            let layer = layers[i];
            layer.onResizeScreen();
        }

        /*
        for(let i = 0; i < this.points.length; i++){
            let point = this.points[i];
            point.y = SimpleGame.getDesignHeight()/2 - point.height;
        }
        */

    }



    public addLayer(layer : PIXI.DisplayObject & {onResizeScreen() : void}){
        this.scrollLayer.addLayer(layer);

        let timeStamp2 = Date.now();
        let timeDiff = timeStamp2 - this.timeStamp;
        if(timeDiff > this.timeDiffConstat){
            this.scrollLayer.goToLayer(layer, true);
        }else {
            let delay = this.timeDiffConstat - timeDiff;

            setTimeout(()=>{
                this.scrollLayer.goToLayer(layer, true);
            }, delay)
        }


        //this.arrangePoints();
        //this.updatePointTexture();
    }

    public removeLayer(layer : PIXI.DisplayObject & {onResizeScreen() : void}){
        this.scrollLayer.removeLayer(layer);
        //this.arrangePoints();
        //this.updatePointTexture();
    }




    /*
    public addParentBoardView(controllerInner : ControllerInner){
        let parentBoardView = new ParentBoardView(controllerInner);
        this.scrollLayer.addLayer(parentBoardView);

        this.arrangePoints();

        this.scrollLayer.goToLayer(parentBoardView, true);
        this.updatePointTexture();
    }
    */



    /*
    public arrangePoints(){
        if(!DisplayPoints){
            return;
        }
        let isArrange : boolean = this.points.length != this.scrollLayer.getNumOfLayers();


        while(this.points.length < this.scrollLayer.getNumOfLayers()){
            let point = PIXI.Sprite.from(ImageTag.pointOff);
            point.scale.set(2);
            this.addChild(point);

            let pointIndex = this.points.length;

            this.points.push(point);


            point.y = SimpleGame.getDesignHeight()/2 - point.height;

            point.interactive = true;

            point.on("pointerdown", this.onPointDown.bind(this, point, pointIndex));
            point.on("pointerupoutside", this.onPointUp.bind(this, point, pointIndex));
            point.on("pointercancel", this.onPointUp.bind(this, point, pointIndex));

            point.on("pointerup", this.onPointClick.bind(this, point, pointIndex));
        }
        while(this.points.length > this.scrollLayer.getNumOfLayers()){
            let point = <PIXI.Sprite>this.points.pop();
            this.removeChild(point);
        }

        if(isArrange){
            SimpleGame.arrangeHorizontally(this.points);
        }
    }


    public updatePointTexture(){
        for(let i = 0; i < this.points.length; i++){
            let textureStr = i == this.scrollLayer.getCurrentLayerIndex() ? ImageTag.pointOn : ImageTag.pointOff;

            this.points[i].texture = PIXI.Texture.from(textureStr);
        }
    }

    public onPointDown(point : PIXI.Sprite, pointIndex : number){
        if(pointIndex == this.scrollLayer.getCurrentLayerIndex()){
            return;
        }
        point.texture = PIXI.Texture.from(ImageTag.pointOn);
    }
    public onPointUp(point : PIXI.Sprite, pointIndex : number){
        if(pointIndex == this.scrollLayer.getCurrentLayerIndex()){
            return;
        }
        point.texture = PIXI.Texture.from(ImageTag.pointOff);
    }

    public onPointClick(point : PIXI.Sprite, pointIndex : number){
        this.onPointUp(point, pointIndex);
        this.scrollLayer.goToLayerIndex(pointIndex, true);

        this.updatePointTexture();
    }
    */


}