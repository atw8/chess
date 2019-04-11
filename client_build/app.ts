import * as PIXI from 'pixi.js';
import {getNameForImageTag, getLocationForImageTag, ImageTag} from "./ImageTag";
import {LogoLayer} from "./LogoLayer";
import {MainLayer} from "./MainLayer";


export class SimpleGame extends PIXI.Application{
    private static gInstance : SimpleGame;

    public static getInstance():SimpleGame{
        if(typeof (this.gInstance) == "undefined"){
            this.gInstance = new SimpleGame();
        }

        return this.gInstance;
    }

    public static getWidth():number{
        return this.getInstance().view.width;
    }
    public static getHeight():number{
        return this.getInstance().view.height;
    }

    private constructor(){
        super();
        document.body.appendChild(this.view);

        let imageTags : ImageTag[] = [];
        imageTags.push(ImageTag.logo);

        imageTags.push(ImageTag.white_pawn);
        imageTags.push(ImageTag.black_pawn);
        imageTags.push(ImageTag.white_knight);
        imageTags.push(ImageTag.black_knight);
        imageTags.push(ImageTag.white_bishop);
        imageTags.push(ImageTag.black_bishop);
        imageTags.push(ImageTag.white_rook);
        imageTags.push(ImageTag.black_rook);
        imageTags.push(ImageTag.white_queen);
        imageTags.push(ImageTag.black_queen);
        imageTags.push(ImageTag.white_king);
        imageTags.push(ImageTag.black_king);

        imageTags.push(ImageTag.select_light);

        imageTags.push(ImageTag.option_light);

        imageTags.push(ImageTag.pointGreen);
        imageTags.push(ImageTag.pointRed);
        imageTags.push(ImageTag.pointYellow);

        imageTags.push(ImageTag.squareBlue);
        imageTags.push(ImageTag.squareGreen);
        imageTags.push(ImageTag.squareRed);

        imageTags.push(ImageTag.btnGreen);
        imageTags.push(ImageTag.btnGreenPress);

        imageTags.push(ImageTag.btnPrompt);
        imageTags.push(ImageTag.btnPromptPress);

        for(let i = 0; i < imageTags.length; i++){
            let imageTag = imageTags[i];
            PIXI.loader.add(getNameForImageTag(imageTag), getLocationForImageTag(imageTag));
        }
        PIXI.loader.load(this.onLoad.bind(this));
    };

    public onLoad(){
        //let logoLayer = new LogoLayer();
        //logoLayer.x = this.view.width/2;
        //logoLayer.y = this.view.height/2;
        let mainLayer = new MainLayer();


        this.stage.addChild(mainLayer);

        console.log("hello world");
    }

}


window.onload = () => {
    SimpleGame.getInstance();
};