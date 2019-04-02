"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("p2");
require("pixi");
require("phaser");
const Global = require("./../Global");
class TouchLayer {
    constructor(controller) {
        this.isDown = false;
        this.controller = controller;
        this.isEnabled = false;
        this.isDown = false;
        let delay = (1.0 / 60.0) * 1000;
        let updateLoop = Global.game.time.create(false);
        updateLoop.loop(delay, this.update.bind(this, delay));
        updateLoop.start();
    }
    update(dt) {
        let gameIsDown = Global.game.input.activePointer.isDown;
        let worldX = Global.game.input.activePointer.worldX;
        let worldY = Global.game.input.activePointer.worldY;
        let worldLocation = new Phaser.Point(worldX, worldY);
        if (this.isDown) {
            if (gameIsDown) {
                this.onTouchMoved(worldLocation);
            }
            else {
                this.onTouchEnded(worldLocation);
            }
        }
        else {
            if (gameIsDown) {
                this.onTouchBegan(worldLocation);
            }
        }
        this.isDown = gameIsDown;
    }
    setIsEnabled(isEnabled) {
        this.isEnabled = isEnabled;
    }
    getIsEnabled() {
        return this.isEnabled;
    }
    onTouchBegan(worldLocation) {
        if (!this.isEnabled) {
            return;
        }
        this.controller.onTouchBegan(worldLocation);
    }
    onTouchMoved(worldLocation) {
        if (!this.isEnabled) {
            return;
        }
        this.controller.onTouchMoved(worldLocation);
    }
    onTouchEnded(worldLocation) {
        if (!this.isEnabled) {
            return;
        }
        this.controller.onTouchEnded(worldLocation);
    }
}
exports.TouchLayer = TouchLayer;
//# sourceMappingURL=TouchLayer.js.map