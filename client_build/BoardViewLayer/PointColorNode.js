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
var PointColorCons_1 = require("./PointColorCons");
var ImageTag_1 = require("../ImageTag");
var PointColorNode = /** @class */ (function (_super) {
    __extends(PointColorNode, _super);
    function PointColorNode(pointColor, squareWidth, squareHeight) {
        var _this = this;
        var key = ImageTag_1.ImageTag.null;
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
        _this = _super.call(this, PIXI.Texture.from(key)) || this;
        var scaleX = (squareWidth / _this.width) * 0.8;
        var scaleY = (squareHeight / _this.height) * 0.8;
        _this.scale.set(scaleX, scaleY);
        _this.anchor.set(0.5, 0.5);
        return _this;
    }
    return PointColorNode;
}(PIXI.Sprite));
exports.PointColorNode = PointColorNode;
//# sourceMappingURL=PointColorNode.js.map