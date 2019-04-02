"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SanSprite_1 = require("./SanSprite");
require("p2");
require("pixi");
require("phaser");
const Global = require("./../Global");
class PredictSanSprite extends Phaser.Button {
    constructor(width, height, moveTurn, pressBtnCallback) {
        super(Global.game);
        this.m_percentage = null;
        this.uiSanSprite = null;
        this.m_width = width;
        this.m_height = height;
        this.m_moveTurn = moveTurn;
        this.pressBtnCallback = pressBtnCallback;
        {
            let alphaNode = new Phaser.Graphics(Global.game);
            alphaNode.beginFill(0xFFFFFF, 0);
            alphaNode.drawRect(-this.m_width / 2, -this.m_height / 2, this.m_width, this.m_height);
            this.addChild(alphaNode);
        }
        this.uiSanSprite = null;
        //percentage thing
        this.uiPercentage = new Phaser.Text(Global.game, 0, 0, "");
        this.uiPercentage.anchor.set(1.0, 0.5);
        this.uiPercentage.position.set(this.m_width / 2, 0.0);
        this.uiPercentage.scale.set(this.m_height / this.uiPercentage.height, this.m_height / this.uiPercentage.height);
        this.addChild(this.uiPercentage);
        this.uiPressNode = new Phaser.Graphics(Global.game);
        this.uiPressNode.lineStyle(2, 0xA66325, 1);
        this.uiPressNode.drawRoundedRect(-this.m_width / 2, -this.m_height / 2, this.m_width, this.m_height, 3);
        this.addChild(this.uiPressNode);
        this.uiPressNode.visible = false;
        this.onInputUp.add(this.inputUp.bind(this));
    }
    inputUp() {
        console.debug("inputUp");
        this.pressBtnCallback(this);
    }
    setIsPredictMove(isPredictMove) {
        this.uiPressNode.visible = isPredictMove;
    }
    getIsPredictMove() {
        return this.uiPressNode.visible;
    }
    setSanStr(sanStr) {
        if (sanStr == this.m_sanStr) {
            return;
        }
        this.m_sanStr = sanStr;
        this.updateUiSanSprite();
    }
    getSanStr() {
        return this.m_sanStr;
    }
    setMoveTurn(moveTurn) {
        if (moveTurn == this.m_moveTurn) {
            return;
        }
        this.m_moveTurn = moveTurn;
        this.updateUiSanSprite();
    }
    getMoveTurn() {
        return this.m_moveTurn;
    }
    updateUiSanSprite() {
        if (this.uiSanSprite != null) {
            this.removeChild(this.uiSanSprite);
        }
        if (this.m_sanStr != null && this.m_moveTurn != null) {
            this.uiSanSprite = new SanSprite_1.SanSprite(this.m_sanStr, this.m_moveTurn, this.m_width, this.m_height);
            this.addChild(this.uiSanSprite);
            this.uiSanSprite.position.set(-this.m_width / 2, 0.0);
        }
    }
    setPercentage(percentage) {
        if (percentage == this.m_percentage) {
            return;
        }
        this.m_percentage = percentage;
        if (this.m_percentage != null) {
            this.uiPercentage.setText(this.m_percentage.toFixed(1) + "%", true);
            this.uiPercentage.visible = true;
        }
        else {
            this.uiPercentage.visible = false;
        }
    }
    getPercentage() {
        return this.m_percentage;
    }
}
exports.PredictSanSprite = PredictSanSprite;
//# sourceMappingURL=PredictSanSprite.js.map