import * as PIXI from 'pixi.js';

import * as TWEEN from '@tweenjs/tween.js'

export namespace ScrollLayer {
    export const enum DIRECTION {
        VERTICAL = 0,
        HORIZONTAL = 1
    }
}



export class ScrollLayer extends PIXI.Container{
    private direction : ScrollLayer.DIRECTION;

    private layers : (PIXI.DisplayObject & {onResizeScreen() : void})[];
    private currentLayerIndex : number;

    private tweenIndex : number;

    private scrollNode : PIXI.Container;
    private widthHeight : number;
    private speed : number;

    constructor(direction : ScrollLayer.DIRECTION, widthHeight : number, speed : number){
        super();

        this.direction = direction;

        this.widthHeight = widthHeight;
        this.speed = speed;

        this.layers = [];
        this.currentLayerIndex = 0;

        this.scrollNode = new PIXI.Container();
        this.addChild(this.scrollNode);

        this.tweenIndex = 0;



        /*

        */



        this.on("added", this.onAdded);
    }
    public onAdded(){

        /*
        this.mask = new PIXI.Graphics();

        this.mask.beginFill(0xFFFFFF);
        this.mask.drawRect(-this.m_size.width/2, -this.m_size.height/2, this.m_size.width, this.m_size.height);
        this.mask.position = this.toGlobal(new PIXI.Point(0, 0));
        */
    }



    public getNumOfLayers(){
        return this.layers.length;
    }


    public getCurrentLayer(){
        return this.getLayerForLayerIndex(this.currentLayerIndex)
    }
    public getCurrentLayerIndex():number{
        return this.currentLayerIndex;
    }


    public goToLayer(layer : PIXI.DisplayObject & {onResizeScreen() : void}, isAnimation : boolean){
        this.goToLayerIndex(this.getLayerIndexForLayer(layer), isAnimation);
    }
    public goToLayerIndex(currentLayerIndex : number, isAnimation : boolean){
        if(this.currentLayerIndex == currentLayerIndex){
            return;
        }
        this.currentLayerIndex = currentLayerIndex;

        this.tweenIndex ++;


        let endPosition = this.getPositionForLayerIndex(this.currentLayerIndex);
        endPosition.x *= -1;
        endPosition.y *= -1;

        if(isAnimation){
            let startPosition = this.scrollNode.position.clone();
            let distance = Math.sqrt(Math.pow(endPosition.x - startPosition.x, 2) + Math.pow(endPosition.y - startPosition.y, 2));
            let duration = distance/this.speed;

            let tween = new TWEEN.Tween({
                x : startPosition.x,
                y : startPosition.y
            });
            tween.to({x : endPosition.x, y : endPosition.y}, duration);

            let onUpdateCallback = function(tweenIndex : number, o : any){
                if(tweenIndex != this.tweenIndex){
                    return;
                }

                //this.worldTransform;

                this.scrollNode.position.set(o.x, o.y);
            };

            tween.onUpdate(onUpdateCallback.bind(this, this.tweenIndex));
            tween.start();

        }else {
            this.scrollNode.position = endPosition;
        }
    }


    public addLayer(layer : PIXI.DisplayObject & {onResizeScreen() : void}){
        this.layers.push(layer);
        this.scrollNode.addChild(layer);
        layer.position = this.getPositionForLayerIndex(this.layers.length - 1);
    }

    public removeLayer(layer: (PIXI.DisplayObject & {onResizeScreen() : void})){
        let layerIndex = this.getLayerIndexForLayer(layer);

        this.scrollNode.removeChild(layer);
        this.layers.splice(layerIndex, 1);

        for(let i = layerIndex; i < this.layers.length; i++){
            this.layers[i].position = this.getPositionForLayerIndex(i);
        }
    }


    public setWidthHeight(widthHeight : number):void{
        if(this.widthHeight == widthHeight){
            return;
        }
        this.widthHeight = widthHeight;


        //Made sure no animation is occuring
        this.tweenIndex++;

        for(let i = 0; i < this.layers.length; i++){
            let layer = this.layers[i];
            layer.position = this.getPositionForLayerIndex(i);
        }

        this.scrollNode.position = this.getPositionForLayerIndex(this.currentLayerIndex);
        this.scrollNode.position.x *= -1;
        this.scrollNode.position.y *= -1;
    }
    public getLayers():(PIXI.DisplayObject & {onResizeScreen() : void})[]{
        return this.layers;
    }

    public getLayerForLayerIndex(layerIndex : number):(PIXI.DisplayObject & {onResizeScreen() : void}){
        return this.layers[layerIndex];
    }
    public getLayerIndexForLayer(layer : PIXI.DisplayObject & {onResizeScreen() : void}):number{
        for(let i = 0; i < this.layers.length; i++){
            if(layer == this.layers[i]){
                return i;
            }
        }

        return -1;
    }


    public getPositionForLayerIndex(layerIndex : number):PIXI.Point{
        let ret : PIXI.Point = new PIXI.Point(0, 0);

        switch (this.direction) {
            case ScrollLayer.DIRECTION.HORIZONTAL:
                ret.x = layerIndex * this.widthHeight;
                break;
            case ScrollLayer.DIRECTION.VERTICAL:
                ret.y = layerIndex * this.widthHeight;
                break;

        }


        return ret;
    }

}
