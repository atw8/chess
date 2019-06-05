import {LogoLayer} from "./LogoLayer";
import {SimpleGame} from "./app";
import {ImageTag} from "./ImageTag";

import * as PIXI from 'pixi.js';

export class SplashScreenLayer extends PIXI.Container {
    constructor(){
        super();

        this.on("added", this.onAdded);
        this.on("removed", this.onRemoved);
    }

    private uiLogo : PIXI.Sprite;
    public onAdded(){
        this.uiLogo = PIXI.Sprite.from(ImageTag.logo);
        this.uiLogo.anchor.set(0.5, 0.5);
        this.addChild(this.uiLogo);
        //this.uiLogo.position.set(0, -SimpleGame.getDesignHeight()/2 + this.uiLogo.height/2);


        /*
        setTimeout(()=>{
            SimpleGame.getInstance().runLayer(new LogoLayer());
        }, 1000);
        */
    }

    public onRemoved(){

    }

    public onResizeScreen(){

    }
}