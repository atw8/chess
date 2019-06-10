import {LogoLayer} from "./LogoLayer";
import {SimpleGame} from "./SimpleGame";
import {ImageTag} from "./ImageTag";

import * as PIXI from 'pixi.js';
import {WaitingNode} from "./BoardViewLayer/WaitingNode";
import {LanguageKey} from "./LanguageHelper";

export class SplashScreenLayer extends PIXI.Container {
    constructor(){
        super();

        this.on("added", this.onAdded);
        this.on("removed", this.onRemoved);
    }
    private timeDiffConstat : number = 3000;

    private uiLogo : PIXI.Sprite;
    private uiConnectingNode : WaitingNode;
    public onAdded(){
        this.uiLogo = PIXI.Sprite.from(ImageTag.logo);
        this.uiLogo.anchor.set(0.5, 0.5);
        this.addChild(this.uiLogo);


        this.uiConnectingNode = new WaitingNode(80, LanguageKey.Connecting);
        this.uiConnectingNode.position.x = this.uiLogo.position.x;
        this.uiConnectingNode.position.y = this.uiLogo.position.y + this.uiLogo.height/2 + this.uiConnectingNode.height/2;
        this.addChild(this.uiConnectingNode);
        this.uiConnectingNode.visible = false;

        setTimeout(()=>{
            this.uiConnectingNode.visible = true;
        }, this.timeDiffConstat);
    }

    public onRemoved(){

    }

    public onResizeScreen(){

    }
}