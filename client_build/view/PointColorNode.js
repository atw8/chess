"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PointColorCons_1 = require("./PointColorCons");
require("p2");
require("pixi");
require("phaser");
const ImageTag_1 = require("../ImageTag");
const Global = require("./../Global");
class PointColorNode extends Phaser.Sprite {
    constructor(pointColor, squareWidth, squareHeight) {
        let key = ImageTag_1.ImageTag.null;
        switch (pointColor) {
            case PointColorCons_1.POINT_COLORS.GREEN:
                key = ImageTag_1.ImageTag.pointGreen;
                break;
            case PointColorCons_1.POINT_COLORS.RED:
                key = ImageTag_1.ImageTag.pointRed;
                break;
            case PointColorCons_1.POINT_COLORS.YELLOW:
                key = ImageTag_1.ImageTag.pointYellow;
                break;
        }
        super(Global.game, 0, 0, key);
        let scaleX = (squareWidth / this.width) * 0.8;
        let scaleY = (squareHeight / this.height) * 0.8;
        this.scale.set(scaleX, scaleY);
        this.anchor.set(0.5, 0.5);
    }
}
exports.PointColorNode = PointColorNode;
//# sourceMappingURL=PointColorNode.js.map