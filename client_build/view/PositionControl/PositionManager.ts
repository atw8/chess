import * as TWEEN from '@tweenjs/tween.js'


export class PositionManager {
    private movingSprites : {sprite : PIXI.DisplayObject,
        tween : TWEEN.Tween,
        finishCallback : (() => void) | null,
        endPosition : PIXI.Point}[];
    private tweenGroup : TWEEN.Group;


    private m_delay : number;



    constructor(delay ?: number){
        if(delay == undefined){
            delay = (1.0 / 60.0) * 1000;
        }
        this.m_delay = delay;

        this.movingSprites = [];

        this.tweenGroup = new TWEEN.Group();

        this.update(0);
    }

    public update(dt : number){
        let finishCallbacks: (() => void)[] = [];

        let index = 0;
        while(index < this.movingSprites.length){
            let movingSprite = this.movingSprites[index];

            if (!movingSprite.tween.update(TWEEN.now())) {
                movingSprite.tween.stop();
                this.movingSprites.splice(index, 1);

                if(movingSprite.finishCallback != null){
                    finishCallbacks.push(movingSprite.finishCallback);
                }
            }else {
                index += 1;
            }
        }

        for (let i = 0; i < finishCallbacks.length; i++) {
            let finishCallback = finishCallbacks[i];
            finishCallback();
        }


        setTimeout(this.update.bind(this, this.m_delay, null), this.m_delay);
    }

    public moveTo(sprite : PIXI.DisplayObject, finishCallback : (() => void) | null, endPosition : PIXI.Point, speed : number){
        let startPosition = this.getPosition(sprite);
        let diffPosition = new PIXI.Point(endPosition.x - startPosition.x, endPosition.y - startPosition.y);

        let duration = Math.sqrt(Math.pow(diffPosition.x, 2) + Math.pow(diffPosition.y, 2))/speed;

        let lastDelta = 0;

        let tween = new TWEEN.Tween({delta : 0}, this.tweenGroup);
        tween.to({delta : 1}, duration);
        tween.onUpdate((o : {delta : number}) => {
            sprite.position.x += (o.delta - lastDelta)*diffPosition.x;
            sprite.position.y += (o.delta - lastDelta)*diffPosition.y;

            lastDelta = o.delta;
        });

        tween.start(TWEEN.now());

        this.movingSprites.push({sprite : sprite, tween : tween, finishCallback : finishCallback, endPosition : endPosition.clone()});
    }

    public stopMoving(sprite : PIXI.DisplayObject | null){
        let finishCallbacks : (() => void)[] = [];

        let index = 0;
        while(index < this.movingSprites.length){
            let movingSprite = this.movingSprites[index];
            if(sprite == null || movingSprite.sprite == sprite){
                movingSprite.tween.end();
                movingSprite.tween.stop();

                this.movingSprites.splice(index, 1);
            }else {
                index += 1;
            }
        }
    }

    public isMoving(sprite : PIXI.DisplayObject | null):boolean{
        if(sprite == null){
            return this.movingSprites.length > 0;
        }

        for(let i = 0; i < this.movingSprites.length; i++){
            if(this.movingSprites[i].sprite == sprite){
                return true;
            }
        }

        return false;
    }



    public getPosition(sprite : PIXI.DisplayObject):PIXI.Point{
        let ret : PIXI.Point | null = null;

        for(let i = this.movingSprites.length - 1; i >= 0 && (ret == null); i--){
            if(this.movingSprites[i].sprite == sprite){
                ret = this.movingSprites[i].endPosition;
            }
        }

        if(ret == null){
            ret = sprite.position;
        }

        return ret;

    }
}
