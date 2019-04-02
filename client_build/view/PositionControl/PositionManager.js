"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Global = require("./../../Global");
class PositionManager {
    constructor(delay) {
        this.m_movingSprites = [];
        if (delay == undefined) {
            delay = (1.0 / 60.0) * 1000;
        }
        this.m_delay = delay;
        let updateMovingSpriteLoop = Global.game.time.create(false);
        updateMovingSpriteLoop.loop(this.m_delay, this.updateMovingSprites.bind(this, this.m_delay, null));
        updateMovingSpriteLoop.start();
    }
    getLength() {
        return this.m_movingSprites.length;
    }
    addMovingSprite(sprite, action, finishCallback) {
        this.m_movingSprites.push({ sprite: sprite, action: action, finishCallback: finishCallback });
    }
    updateMovingSprites(dt, specificSprite) {
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
        let finishCallbacks = [];
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
    }
    isMovingSprite(sprite) {
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
exports.PositionManager = PositionManager;
//# sourceMappingURL=PositionManager.js.map