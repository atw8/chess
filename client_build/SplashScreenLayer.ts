
import * as PIXI from 'pixi.js';
import {WaitingNode} from "./BoardViewLayer/WaitingNode";
import {LanguageKey} from "./LanguageHelper";
import {SimpleGame} from "./SimpleGame";
import {MultiText} from "./BoardViewLayer/Button/MultiText";

export class SplashScreenLayer extends PIXI.Container {
    constructor(){
        super();

        this.on("added", this.onAdded);
        this.on("removed", this.onRemoved);
    }
    private timeDiffConstat : number = 3000;

    private uiLogo : MultiText;
    private uiConnectingNode : WaitingNode;
    public onAdded(){



        this.uiLogo = new MultiText();
        let textStyleOptions = SimpleGame.getDefaultTextStyleOptions(110);
        textStyleOptions.fill = SimpleGame.getDarkBrownColor();
        this.uiLogo.addText("votechess", textStyleOptions);
        textStyleOptions.fill = SimpleGame.getBlackColor();
        this.uiLogo.addText(".com", textStyleOptions);
        //this.uiLogo = PIXI.Sprite.from(ImageTag.logo);
        this.addChild(this.uiLogo);


        this.uiConnectingNode = new WaitingNode(80, LanguageKey.Connecting);
        this.uiConnectingNode.position.x = this.uiLogo.position.x;
        this.uiConnectingNode.position.y = this.uiLogo.position.y + this.uiLogo.height/2 + this.uiConnectingNode.height/2;
        this.addChild(this.uiConnectingNode);
        this.uiConnectingNode.visible = false;


        setTimeout(()=>{
            this.uiConnectingNode.visible = true;
        }, this.timeDiffConstat);

        this.onResizeScreen();
    }

    public onRemoved(){

    }

    public onResizeScreen(){
        SimpleGame.arrangeVertically([this.uiLogo, this.uiConnectingNode]);
    }
}