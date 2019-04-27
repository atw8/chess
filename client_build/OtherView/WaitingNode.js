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
var app_1 = require("../app");
var TWEEN = require("@tweenjs/tween.js");
var LanguageHelper_1 = require("../LanguageHelper");
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
            uiBall.drawCircle(0, 0, _this.m_size * sizeRadiusConstant);
            var angle = 2.0 * Math.PI * (i / uiNumOfBalls);
            uiBall.position.set(_this.m_size * 0.5 * Math.cos(angle), _this.m_size * 0.5 * Math.sin(angle));
            _this.uiBallsNode.addChild(uiBall);
        }
        //rotation tween
        var tween = new TWEEN.Tween({ rotation: _this.uiBallsNode.rotation });
        tween.to({ rotation: 2 * Math.PI }, 1000);
        tween.onUpdate(function (o) {
            _this.uiBallsNode.rotation = o.rotation;
        });
        tween.repeat(Infinity);
        tween.start();
        var textStyleOptions = {};
        textStyleOptions.fontFamily = "Helvetica";
        textStyleOptions.fontSize = _this.m_size;
        textStyleOptions.fontWeight = "bold";
        _this.uiText = new PIXI.Text(LanguageHelper_1.LanguageHelper.getTextForLanguageKey(LanguageHelper_1.LanguageKey.Waiting), textStyleOptions);
        _this.uiText.anchor.set(0.5, 0.5);
        _this.addChild(_this.uiText);
        //Align all the graphics
        app_1.SimpleGame.arrangeHorizontally([_this.uiBallsNode, _this.m_size / 2, _this.uiText]);
        return _this;
    }
    return WaitingNode;
}(PIXI.Container));
exports.WaitingNode = WaitingNode;
//# sourceMappingURL=WaitingNode.js.map