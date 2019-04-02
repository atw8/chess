"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PredictSanSprite_1 = require("./PredictSanSprite");
const SideType_1 = require("../../shared/engine/SideType");
const PositionManager_1 = require("../view/PositionControl/PositionManager");
const PositionConstantSpeed_1 = require("../view/PositionControl/PositionConstantSpeed");
require("p2");
require("pixi");
require("phaser");
const Global = require("./../Global");
class PredictPanel extends Phaser.Graphics {
    getWidth() {
        return this.m_width;
    }
    getHeight() {
        return this.m_height;
    }
    getNumOfRows() {
        return this.m_numOfRows;
    }
    setMoveTurn(moveTurn) {
        this.m_moveTurn = moveTurn;
    }
    getMoveTurn() {
        return this.m_moveTurn;
    }
    constructor(width, height, numOfRows, controller) {
        super(Global.game);
        this.m_width = width;
        this.m_height = height;
        this.m_numOfRows = numOfRows;
        this.m_moveTurn = SideType_1.SideType.WHITE;
        this.controller = controller;
        this.uiMask = new Phaser.Graphics(Global.game, 0, 0);
        this.uiMask.beginFill(0xFFFFFF);
        this.uiMask.drawRoundedRect(-this.m_width / 2, -this.m_height / 2, this.m_width, this.m_height, 10);
        this.addChild(this.uiMask);
        this.mask = this.uiMask;
        this.beginFill(0xFBE2B2);
        this.drawRect(-this.m_width / 2, -this.m_height / 2, this.m_width, this.m_height);
        {
            this.uiMyMoveText = new Phaser.Text(Global.game, 0, 0, "My Move");
            this.uiMyMoveText.anchor.set(0.5, 0.5);
            this.uiMyMoveText.position = this.getPositionForRow(0);
            let scale = this.getRowHeight() / this.uiMyMoveText.height;
            this.uiMyMoveText.scale.set(scale, scale);
            this.addChild(this.uiMyMoveText);
        }
        {
            this.uiMyMoveSprite = new PredictSanSprite_1.PredictSanSprite(this.getRowWidth(), this.getRowHeight(), this.m_moveTurn, this.predictSanSpriteCallback.bind(this, true));
            this.uiMyMoveSprite.position = this.getPositionForRow(1);
            this.addChild(this.uiMyMoveSprite);
        }
        {
            this.uiVotedMovesText = new Phaser.Text(Global.game, 0, 0, "Voted Moves");
            this.uiVotedMovesText.anchor.set(0.5, 0.5);
            this.uiVotedMovesText.position = this.getPositionForRow(2);
            let scale = this.getRowHeight() / this.uiVotedMovesText.height;
            this.uiVotedMovesText.scale.set(scale, scale);
            this.addChild(this.uiVotedMovesText);
        }
        this.uiVotedMovesSprites = {};
        this.positionManager = new PositionManager_1.PositionManager();
    }
    getPositionForRow(row) {
        let ret = new Phaser.Point();
        let minY = -this.m_height / 2 + this.getTopOffset();
        let maxY = this.m_height / 2 - this.getBottomOFfset();
        ret.y = minY + (maxY - minY) * (row / (this.m_numOfRows - 1));
        ret.x = 0;
        return ret;
    }
    getTopOffset() {
        return 30;
    }
    getBottomOFfset() {
        return 30;
    }
    getRowSeparator() {
        return 3;
    }
    getRowHeight() {
        return (this.m_height - this.getTopOffset() - this.getBottomOFfset() - (this.m_numOfRows - 1) * this.getRowSeparator()) / this.m_numOfRows;
    }
    getRowWidth() {
        return this.m_width * 0.95;
    }
    setPredictMove(sanStr, isPredictMove) {
        if (this.uiMyMoveSprite.getSanStr() == sanStr) {
            this.uiMyMoveSprite.setIsPredictMove(isPredictMove);
        }
        if (sanStr in this.uiVotedMovesSprites) {
            this.uiVotedMovesSprites[sanStr].sprite.setIsPredictMove(isPredictMove);
        }
    }
    isPredictMove(sanStr) {
        let ret = false;
        if (this.uiMyMoveSprite.getSanStr() == sanStr) {
            if (this.uiMyMoveSprite.getIsPredictMove()) {
                ret = true;
            }
        }
        if (sanStr in this.uiVotedMovesSprites) {
            if (this.uiVotedMovesSprites[sanStr].sprite.getIsPredictMove()) {
                ret = true;
            }
        }
        return ret;
    }
    setMyMoveSanStr(sanStr) {
        let ret = this.uiMyMoveSprite.getSanStr();
        this.uiMyMoveSprite.setSanStr(sanStr);
        return ret;
    }
    setMyMovePercentage(percentage) {
        let ret = this.uiMyMoveSprite.getPercentage();
        this.uiMyMoveSprite.setPercentage(percentage);
        return ret;
    }
    setVotedMoves(votedDatas) {
        votedDatas.sort((a, b) => {
            return b.percentage - a.percentage;
        });
        while (votedDatas.length > this.m_numOfRows - 4) {
            votedDatas.pop();
        }
        let votedSanMap = {};
        for (let i = 0; i < votedDatas.length; i++) {
            let votedData = votedDatas[i];
            votedSanMap[votedDatas[i].sanStr] = { sanStr: votedData.sanStr, percentage: votedData.percentage, rowPosition: i + 3 };
        }
        //remove all the old uiVotedMoveSprites
        let removeUiVotedMoveSprites = [];
        for (let sanStr in this.uiVotedMovesSprites) {
            if (votedSanMap[sanStr] == undefined) {
                removeUiVotedMoveSprites.push(sanStr);
            }
        }
        for (let i = 0; i < removeUiVotedMoveSprites.length; i++) {
            let sanStr = removeUiVotedMoveSprites[i];
            let uiVotedMoveSprite = this.uiVotedMovesSprites[sanStr];
            delete this.uiVotedMovesSprites[sanStr];
            let sprite = uiVotedMoveSprite.sprite;
            let removeTween = new Phaser.Tween(sprite, Global.game, Global.game.tweens);
            removeTween.to({ alpha: 0.0 }, 500);
            removeTween.onComplete.add(() => {
                this.removeChild(sprite);
            }, this);
            removeTween.start();
        }
        //Add all the new uiVotedMoveSprites
        let addUiVotedMoveSprites = [];
        for (let sanStr in votedSanMap) {
            if (this.uiVotedMovesSprites[sanStr] == undefined) {
                addUiVotedMoveSprites.push(sanStr);
            }
        }
        for (let i = 0; i < addUiVotedMoveSprites.length; i++) {
            let sanStr = addUiVotedMoveSprites[i];
            let votedData = votedSanMap[sanStr];
            let sprite = new PredictSanSprite_1.PredictSanSprite(this.getRowWidth(), this.getRowHeight(), this.m_moveTurn, this.predictSanSpriteCallback.bind(this, false));
            sprite.position = this.getPositionForRow(votedData.rowPosition);
            sprite.setSanStr(sanStr);
            sprite.setPercentage(votedData.percentage);
            this.addChild(sprite);
            if (this.isPredictMove(sanStr)) {
                sprite.setIsPredictMove(true);
            }
            sprite.alpha = 0.0;
            let addTween = new Phaser.Tween(sprite, Global.game, Global.game.tweens);
            addTween.to({ alpha: 1.0 }, 500);
            addTween.start();
            this.uiVotedMovesSprites[sanStr] = { sprite: sprite, lastRowPosition: votedData.rowPosition, newRowPosition: votedData.rowPosition };
        }
        //Update all the percentages, and the positions
        for (let sanStr in this.uiVotedMovesSprites) {
            this.uiVotedMovesSprites[sanStr].sprite.setPercentage(votedSanMap[sanStr].percentage);
            this.uiVotedMovesSprites[sanStr].newRowPosition = votedSanMap[sanStr].rowPosition;
        }
        //Make all the sprites move into the rightful position
        for (let sanStr in this.uiVotedMovesSprites) {
            let uiVotedMoveSprite = this.uiVotedMovesSprites[sanStr];
            if (uiVotedMoveSprite.lastRowPosition == uiVotedMoveSprite.newRowPosition) {
                continue;
            }
            let sprite = uiVotedMoveSprite.sprite;
            let positionFrom = this.getPositionForRow(uiVotedMoveSprite.lastRowPosition);
            let positionTo = this.getPositionForRow(uiVotedMoveSprite.newRowPosition);
            let action = new PositionConstantSpeed_1.PositionConstantSpeed(sprite, positionFrom, positionTo, 0.5);
            this.positionManager.addMovingSprite(sprite, action, null);
            uiVotedMoveSprite.lastRowPosition = uiVotedMoveSprite.newRowPosition;
        }
        return removeUiVotedMoveSprites;
    }
    predictSanSpriteCallback(isMyMove, predictSanSprite) {
        console.debug("isMyMove", isMyMove);
        let sanStr = predictSanSprite.getSanStr();
        if (sanStr == null) {
            return;
        }
        this.controller.predictMovePress(isMyMove, sanStr);
    }
}
exports.PredictPanel = PredictPanel;
//# sourceMappingURL=PredictPanel.js.map