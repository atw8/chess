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
var ChessEngine_1 = require("../../shared/engine/ChessEngine");
var PieceView_1 = require("./PieceView");
var PromotePieceLayer = /** @class */ (function (_super) {
    __extends(PromotePieceLayer, _super);
    function PromotePieceLayer(moveClasses, m_height, m_callback) {
        var _this = _super.call(this) || this;
        _this.moveClasses = moveClasses;
        _this.m_height = m_height;
        _this.m_callback = m_callback;
        var pieceSprites = [];
        var m_width = 0;
        for (var i = 0; i < moveClasses.length; i++) {
            var moveClass = moveClasses[i];
            var isPromotionMove = ChessEngine_1.ChessEngine.isPromotionMove(moveClass);
            if (isPromotionMove.isPromotion) {
                var pieceSprite = new PieceView_1.PieceView(isPromotionMove.promotionPieceModel, _this.m_height, _this.m_height);
                pieceSprite.interactive = true;
                pieceSprite.buttonMode = true;
                //pieceSprite.on('pointerdown', this.onClick.bind(this));
                pieceSprite.on('pointerdown', _this.onButtonDown.bind(_this, pieceSprite, moveClass));
                pieceSprite.on('pointerup', _this.onButtonUp.bind(_this, pieceSprite, moveClass));
                pieceSprite.on('pointerupoutside', _this.onButtonUp.bind(_this, pieceSprite, moveClass));
                pieceSprites.push(pieceSprite);
            }
        }
        //Adjust the position of this sprites
        var fromX = -_this.m_height * pieceSprites.length / 2;
        var toX = _this.m_height * pieceSprites.length / 2;
        var fromXMod = fromX + _this.m_height / 2;
        var toXMod = toX - _this.m_height / 2;
        for (var i = 0; i < pieceSprites.length; i++) {
            var pieceSprite = pieceSprites[i];
            pieceSprite.position.x = fromXMod + (toXMod - fromXMod) * (i / (pieceSprites.length - 1));
            _this.addChild(pieceSprite);
            //pieceSprite.on('pointerover', this.onButtonOver.bind(this, pieceSprite));
            //pieceSprite.on('pointerout', this.onButtonOut.bind(this, pieceSprite));
        }
        _this.beginFill(0xFFFFFF, 1.0);
        _this.drawRoundedRect(fromX, -_this.m_height / 2, toX - fromX, _this.m_height, 10);
        return _this;
    }
    PromotePieceLayer.prototype.onButtonDown = function (pieceSprite, moveClass, interactionEvent) {
        console.log("onButtonDown");
        pieceSprite.scale.set(1.1, 1.1);
    };
    PromotePieceLayer.prototype.onButtonUp = function (pieceSprite, moveClass, interactionEvent) {
        console.log("onButtonUp");
        pieceSprite.scale.set(1.0, 1.0);
        this.m_callback(moveClass);
        this.parent.removeChild(this);
    };
    return PromotePieceLayer;
}(PIXI.Graphics));
exports.PromotePieceLayer = PromotePieceLayer;
//# sourceMappingURL=PromotePieceLayer.js.map