"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TWEEN = require("@tweenjs/tween.js");
var PIXI = require("pixi.js");
var PositionManager = /** @class */ (function () {
    function PositionManager(delay) {
        if (delay == undefined) {
            delay = (1.0 / 60.0) * 1000;
        }
        this.m_delay = delay;
        this.movingSprites = [];
        this.tweenGroup = new TWEEN.Group();
        this.update(0);
    }
    PositionManager.prototype.update = function (dt) {
        var finishCallbacks = [];
        var updateTimeStamp = Date.now();
        var index = 0;
        while (index < this.movingSprites.length) {
            var movingSprite = this.movingSprites[index];
            if (!movingSprite.tween.update(updateTimeStamp)) {
                movingSprite.tween.stop();
                this.movingSprites.splice(index, 1);
                if (movingSprite.finishCallback != null) {
                    finishCallbacks.push(movingSprite.finishCallback);
                }
            }
            else {
                index += 1;
            }
        }
        for (var i = 0; i < finishCallbacks.length; i++) {
            finishCallbacks[i]();
        }
        setTimeout(this.update.bind(this, this.m_delay, null), this.m_delay);
    };
    PositionManager.prototype.moveTo = function (sprite, finishCallback, endPosition, speed) {
        var startPosition = this.getPosition(sprite);
        var diffPosition = new PIXI.Point(endPosition.x - startPosition.x, endPosition.y - startPosition.y);
        var duration = Math.sqrt(Math.pow(diffPosition.x, 2) + Math.pow(diffPosition.y, 2)) / speed;
        duration = Math.round(duration);
        var lastDelta = 0;
        var tween = new TWEEN.Tween({ delta: 0 }, this.tweenGroup);
        tween.to({ delta: 1 }, duration);
        tween.onUpdate(function (o) {
            sprite.position.x += (o.delta - lastDelta) * diffPosition.x;
            sprite.position.y += (o.delta - lastDelta) * diffPosition.y;
            lastDelta = o.delta;
        });
        tween.start(Date.now());
        this.movingSprites.push({ sprite: sprite, tween: tween, finishCallback: finishCallback, endPosition: endPosition.clone() });
    };
    PositionManager.prototype.stopMoving = function (sprite) {
        var finishCallbacks = [];
        var index = 0;
        while (index < this.movingSprites.length) {
            var movingSprite = this.movingSprites[index];
            if (sprite == null || movingSprite.sprite == sprite) {
                movingSprite.tween.end();
                movingSprite.tween.stop();
                this.movingSprites.splice(index, 1);
                if (movingSprite.finishCallback != null) {
                    finishCallbacks.push(movingSprite.finishCallback);
                }
            }
            else {
                index += 1;
            }
        }
        for (var i = 0; i < finishCallbacks.length; i++) {
            finishCallbacks[i]();
        }
    };
    PositionManager.prototype.isMoving = function (sprite) {
        if (sprite == null) {
            return this.movingSprites.length > 0;
        }
        for (var i = 0; i < this.movingSprites.length; i++) {
            if (this.movingSprites[i].sprite == sprite) {
                return true;
            }
        }
        return false;
    };
    PositionManager.prototype.getPosition = function (sprite) {
        var ret = null;
        for (var i = this.movingSprites.length - 1; i >= 0 && (ret == null); i--) {
            if (this.movingSprites[i].sprite == sprite) {
                ret = this.movingSprites[i].endPosition;
            }
        }
        if (ret == null) {
            ret = sprite.position;
        }
        return ret;
    };
    return PositionManager;
}());
exports.PositionManager = PositionManager;
//# sourceMappingURL=PositionManager.js.map