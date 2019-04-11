import {PositionPoints} from "./PositionPoints";
import {SimpleGame} from "../../app";


export class PositionManager {

    private m_movingSprites: { "sprite": PIXI.DisplayObject, "action": PositionPoints, "finishCallback": (() => void) | null }[];

    private m_delay : number;

    constructor(delay ?: number){
        this.m_movingSprites = [];


        if(delay == undefined){
            delay = (1.0 / 60.0) * 1000;
        }
        this.m_delay = delay;

        //let ticker = PIXI.ticker.shared;

        setTimeout(this.updateMovingSprites.bind(this, this.m_delay, null));
    }

    public getLength():number{
        return this.m_movingSprites.length;
    }


    public addMovingSprite(sprite : PIXI.DisplayObject, action : PositionPoints, finishCallback : (() => void) | null ){
        this.m_movingSprites.push( { sprite : sprite, action : action, finishCallback : finishCallback});
    }

    public updateMovingSprites(dt: number, specificSprite: PIXI.DisplayObject | null) {
        let removeMovingSprites = [];
        for (let index = 0; index < this.m_movingSprites.length; index++) {
            let movingSprite = this.m_movingSprites[index];


            let sprite = movingSprite["sprite"];
            let action = movingSprite["action"];
            let finishCallback = movingSprite["finishCallback"];

            if (specificSprite == null || specificSprite == sprite) {
                action.tick(dt);

                if (action.isDone()) {
                    removeMovingSprites.push(index - removeMovingSprites.length);
                }
            }
        }

        let finishCallbacks: (() => void)[] = [];

        for (let i = 0; i < removeMovingSprites.length; i++) {
            let index = removeMovingSprites[i];

            let movingSprite = this.m_movingSprites[index];

            let sprite = movingSprite["sprite"];
            let action = movingSprite["action"];
            let finishCallback = movingSprite["finishCallback"];

            if (finishCallback !== null) {
                finishCallbacks.push(finishCallback);
            }

            this.m_movingSprites.splice(index, 1);
        }

        for (let i = 0; i < finishCallbacks.length; i++) {
            let finishCallback = finishCallbacks[i];
            finishCallback();
        }

        setTimeout(this.updateMovingSprites.bind(this, this.m_delay, null));
    }


    public isMovingSprite(sprite: PIXI.DisplayObject): boolean {
        let ret = false;
        for (let i = 0; i < this.m_movingSprites.length && !ret; i++) {
            let movingSprite = this.m_movingSprites[i];

            if (sprite === movingSprite.sprite) {
                ret = true;
            }
        }

        return ret;
    }
}