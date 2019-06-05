"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SquareColorCons_1 = require("./SquareColorCons");
var ImageTag_1 = require("../ImageTag");
var PIXI = require("pixi.js");
var SquareColorNode = /** @class */ (function (_super) {
    __extends(SquareColorNode, _super);
    function SquareColorNode(squareColor, squareWidth, squareHeight) {
        var _this = this;
        var key = ImageTag_1.ImageTag.null;
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
        _this = _super.call(this, PIXI.Texture.from(key)) || this;
        _this.anchor.set(0.5, 0.5);
        var scaleX = squareWidth / _this.width;
        var scaleY = squareHeight / _this.height;
        _this.scale.set(scaleX, scaleY);
        return _this;
    }
    return SquareColorNode;
}(PIXI.Sprite));
exports.SquareColorNode = SquareColorNode;
//# sourceMappingURL=SquareColorNode.js.map