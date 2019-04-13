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
var TWEEN = require("@tweenjs/tween.js");
var WaitingNode = /** @class */ (function (_super) {
    __extends(WaitingNode, _super);
    function WaitingNode(m_size) {
        var _this = _super.call(this) || this;
        _this.m_size = m_size;
        _this.uiBallsNode = new PIXI.Container();
        _this.addChild(_this.uiBallsNode);
        var uiNumOfBalls = 3;
        var sizeRadiusConstant = 1 / 6;
        for (var i = 0; i < uiNumOfBalls; i++) {
            var uiBall = new PIXI.Graphics();
            uiBall.beginFill(0xFFFFFF, 1);
            2;
            uiBall.drawCircle(0, 0, _this.m_size * sizeRadiusConstant);
            var angle = 2.0 * Math.PI * (i / uiNumOfBalls);
            uiBall.position.set(_this.m_size * 0.5 * Math.cos(angle), _this.m_size * 0.5 * Math.sin(angle));
            _this.uiBallsNode.addChild(uiBall);
            //this.addChild(uiBall);
        }
        //rotation tween
        var tween = new TWEEN.Tween({ rotation: _this.uiBallsNode.rotation });
        tween.to({ rotation: 2 * Math.PI }, 1000);
        tween.onUpdate(function (o) {
            _this.uiBallsNode.rotation = o.rotation;
        });
        tween.repeat(Infinity);
        tween.start();
        _this.uiText = new PIXI.Text("Waiting");
        var textStyleOptions = {};
        textStyleOptions.fontFamily = "Helvetica";
        textStyleOptions.fontSize = _this.m_size;
        _this.uiText.style = new PIXI.TextStyle(textStyleOptions);
        _this.uiText.anchor.set(0.5, 0.5);
        _this.addChild(_this.uiText);
        //Align all the graphics
        var uiBallsNodeWidth = _this.m_size + 2 * _this.m_size * sizeRadiusConstant;
        var uiTextWidth = _this.uiText.width;
        _this.uiBallsNode.position.x = uiBallsNodeWidth / 2 - (uiBallsNodeWidth + uiTextWidth) / 2;
        _this.uiText.position.x = uiBallsNodeWidth + uiTextWidth / 2 - (uiBallsNodeWidth + uiTextWidth) / 2;
        return _this;
    }
    return WaitingNode;
}(PIXI.Container));
exports.WaitingNode = WaitingNode;
//# sourceMappingURL=WaitingNode.js.map