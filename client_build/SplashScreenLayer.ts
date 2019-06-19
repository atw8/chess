
import * as PIXI from 'pixi.js';
import {WaitingNode} from "./BoardViewLayer/WaitingNode";
import {LanguageKey} from "./LanguageHelper";
import {SimpleGame} from "./SimpleGame";
import {MultiText} from "./BoardViewLayer/Button/MultiText";
import {LanguageButton} from "./BoardViewLayer/Button/LanguageButton";
import {ControllerOuter} from "./controller/ControllerOuter";

export class SplashScreenLayer extends PIXI.Container {
    private controllerOuter : ControllerOuter;
    constructor(controllerOuter : ControllerOuter){
        super();
        this.controllerOuter = controllerOuter;


        this.on("added", this.onAdded);
        this.on("removed", this.onRemoved);
    }

    private uiLogo : MultiText;
    private uiConnectingNode : WaitingNode;
    private uiConnectBtn : LanguageButton;
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

        this.uiConnectBtn = new LanguageButton(this.uiConnectingNode.width,
            this.uiConnectingNode.height,
            this.onConnectBtnPress.bind(this),
            LanguageKey.Connect);
        this.uiConnectBtn.position = this.uiConnectingNode.position;
        this.addChild(this.uiConnectBtn);
        this.uiConnectBtn.visible = false;



        this.onResizeScreen();

        setTimeout(this.updateConnectState.bind(this), 3000);



        this.controllerOuter.setSplashScreen(this);
    }

    private onConnectBtnPress(){
        this.controllerOuter.connect();
    }

    public onRemoved(){

    }

    public onResizeScreen(){
        SimpleGame.arrangeVertically([this.uiLogo, this.uiConnectingNode]);
        this.uiConnectBtn.position = this.uiConnectingNode.position;
    }
    public updateConnectState(){
        let isConnected = this.controllerOuter.isConnected();
        let isDisconnected = this.controllerOuter.isDisconnected();

        let disconnectReason = this.controllerOuter.getDisconnectReason();
        if(isDisconnected){
            if(!(disconnectReason == "io server disconnect" || disconnectReason == "io client disconnect")){
                isDisconnected = false;
            }
        }

        if(isConnected){
            this.uiConnectingNode.visible = false;
            this.uiConnectBtn.visible = false;
        }else {
            if(isDisconnected){
                this.uiConnectingNode.visible = false;
                this.uiConnectBtn.visible = true;
            }else {
                this.uiConnectingNode.visible = true;
                this.uiConnectBtn.visible = false;
            }
        }
    }
}