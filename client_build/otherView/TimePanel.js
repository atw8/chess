"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("p2");
require("pixi");
require("phaser");
const Global = require("./../Global");
class TimePanel extends Phaser.Graphics {
    getWidth() {
        return this.m_width;
    }
    getHeight() {
        return this.m_height;
    }
    constructor(width, height) {
        super(Global.game);
        this.m_width = width;
        this.m_height = height;
        this.beginFill(0xFBE2B2);
        this.drawRoundedRect(-this.m_width / 2, -this.m_height / 2, this.m_width, this.m_height, 3);
        this.uiText = new Phaser.Text(Global.game, 0, 0, "Turn");
        this.uiText.fontSize = 50;
        this.uiText.font = "Times New Roman";
        this.uiText.position.y = 8;
        this.uiText.scale.set(this.m_height / this.uiText.height, this.m_height / this.uiText.height);
        this.uiText.anchor.set(0.5, 0.5);
        this.addChild(this.uiText);
        this.setTime(60 * 1000);
    }
    setTime(timeMilli) {
        let minutes = Math.floor(timeMilli / (60 * 1000));
        let seconds = minutes * 60 - Math.floor(timeMilli / 1000);
        let str = this.leftPad(minutes, 2) + ":" + this.leftPad(seconds, 2);
        this.uiText.setText(str);
    }
    leftPad(number, targetLength) {
        let ret = String(number);
        while (ret.length < targetLength) {
            ret = '0' + ret;
        }
        return ret;
    }
}
exports.TimePanel = TimePanel;
//# sourceMappingURL=TimePanel.js.map