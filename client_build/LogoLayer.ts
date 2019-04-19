import {SimpleGame} from "./app";
import {getLocationForImageTag, ImageTag} from "./ImageTag";

export class LogoLayer extends PIXI.Container {
    private logo : PIXI.Sprite;

    constructor(){
        super();

        this.logo = PIXI.Sprite.fromImage(ImageTag.logo);
        this.logo.anchor.set(0.5, 0.5);

        let logoScaleX = SimpleGame.getWidth()/this.logo.width;
        let logoScaleY = SimpleGame.getHeight()/this.logo.height;

        //this.localTransform.scale()

        this.addChild(this.logo);
    }
}