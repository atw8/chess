import {Controller} from "./../controller/Controller";

import 'p2';
import 'pixi';
import 'phaser';


const Global = require("./../Global");

export class TouchLayer{
    private controller : Controller;

    private isEnabled : boolean;

    private isDown = false;

    constructor(controller : Controller){
        this.controller = controller;

        this.isEnabled = false;

        this.isDown = false;


        let delay = (1.0 / 60.0) * 1000;
        let updateLoop = Global.game.time.create(false);
        updateLoop.loop(delay, this.update.bind(this, delay));
        updateLoop.start();
    }


    public update(dt : number){
        let gameIsDown = Global.game.input.activePointer.isDown;

        let worldX = Global.game.input.activePointer.worldX;
        let worldY = Global.game.input.activePointer.worldY;

        let worldLocation = new Phaser.Point(worldX, worldY);

        if(this.isDown){
            if(gameIsDown){
                this.onTouchMoved(worldLocation);
            }else {
                this.onTouchEnded(worldLocation);
            }
        }else {
            if(gameIsDown){
                this.onTouchBegan(worldLocation);
            }
        }

        this.isDown = gameIsDown;
    }


    public setIsEnabled(isEnabled : boolean){
        this.isEnabled = isEnabled;
    }
    public getIsEnabled():boolean{
        return this.isEnabled;
    }



    public onTouchBegan(worldLocation : Phaser.Point){
        if(!this.isEnabled){
            return;
        }

        this.controller.onTouchBegan(worldLocation);
    }
    public onTouchMoved(worldLocation : Phaser.Point){
        if(!this.isEnabled){
            return;
        }
        this.controller.onTouchMoved(worldLocation);
    }
    public onTouchEnded(worldLocation : Phaser.Point){
        if(!this.isEnabled){
            return;
        }
        this.controller.onTouchEnded(worldLocation);
    }
}
