"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SquareColorCons_1 = require("./SquareColorCons");
require("p2");
require("pixi");
require("phaser");
const ImageTag_1 = require("../ImageTag");
const Global = require("./../Global");
class SquareColorNode extends Phaser.Sprite {
    constructor(squareColor, squareWidth, squareHeight) {
        let key = ImageTag_1.ImageTag.null;
        switch (squareColor) {
            case SquareColorCons_1.SQUARE_COLORS.BLUE:
                key = ImageTag_1.ImageTag.squareBlue;
                break;
            case SquareColorCons_1.SQUARE_COLORS.GREEN:
                key = ImageTag_1.ImageTag.squareGreen;
                break;
            case SquareColorCons_1.SQUARE_COLORS.RED:
                key = ImageTag_1.ImageTag.squareRed;
                break;
        }
        super(Global.game, 0, 0, key);
        this.anchor.set(0.5, 0.5);
        let scaleX = squareWidth / this.width;
        let scaleY = squareHeight / this.height;
        this.scale.set(scaleX, scaleY);
    }
}
exports.SquareColorNode = SquareColorNode;
//# sourceMappingURL=SquareColorNode.js.map