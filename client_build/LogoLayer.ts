import {ScrollLayer} from "./ScrollLayer";
import {SimpleGame} from "./app";
import {ChooseGameLayer} from "./ChooseGameLayer/ChooseGameLayer";
import {ImageTag} from "./ImageTag";
import {ControllerOuter} from "./controller/ControllerOuter";
import {RoomInitConfig} from "../shared/MessageTypes";


const ScrollLayerSpeed : number = 10;
const DisplayPoints : boolean = true;

export class LogoLayer extends PIXI.Container {
    //private logo : PIXI.Sprite;

    private scrollLayer : ScrollLayer;
    private points : PIXI.Sprite[];
    private controller : ControllerOuter;

    constructor(){
        super();

        this.on("added", this.onAdded);
    }


    public onAdded(){
        //let size = {width : SimpleGame.getDesignWidth(), height : SimpleGame.getDesignHeight()};
        let size = {width : SimpleGame.getDesignWidth(), height : SimpleGame.getDesignHeight()};
        this.scrollLayer = new ScrollLayer(ScrollLayer.DIRECTION.HORIZONTAL, size, SimpleGame.getDesignWidth(), ScrollLayerSpeed);
        this.addChild(this.scrollLayer);




        //this.scrollLayer.addLayer(new ChooseGameLayer());
        //this.scrollLayer.addLayer(new ChooseGameLayer());


        this.points = [];
        this.addLayer(new ChooseGameLayer(this.onClickCallback.bind(this)));


        this.controller = new ControllerOuter(this);

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


    public onClickCallback(roomInitConfig : RoomInitConfig){
        this.controller.OpRoomJoin({roomInitConfig : roomInitConfig});
    }


    public addLayer(layer : PIXI.DisplayObject){
        this.scrollLayer.addLayer(layer);
        this.scrollLayer.goToLayer(layer, true);

        this.arrangePoints();
        this.updatePointTexture();
    }

    public removeLayer(layer : PIXI.DisplayObject){
        let layerIndex = this.scrollLayer.getLayerIndexForLayer(layer);
        this.scrollLayer.removeLayer(layer);
        this.scrollLayer.goToLayerIndex(layerIndex - 1, true);

        this.arrangePoints();
        this.updatePointTexture();
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
}