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
var SideType_1 = require("../../shared/engine/SideType");
var PieceType_1 = require("../../shared/engine/PieceType");
var ImageTag_1 = require("../ImageTag");
var PieceModel_1 = require("../../shared/engine/PieceModel");
var PieceView = /** @class */ (function (_super) {
    __extends(PieceView, _super);
    function PieceView(pieceModel, squareWidth, squareHeight) {
        var _this = _super.call(this, PIXI.Texture.from(PieceView.getKeyForPieceModel(pieceModel))) || this;
        _this.pieceModel = { sideType: pieceModel.sideType, pieceType: pieceModel.pieceType };
        _this.m_squareWidth = squareWidth;
        _this.m_squareHeight = squareHeight;
        _this.anchor.set(0.5, 0.5);
        _this.setNormal();
        return _this;
    }
    PieceView.prototype.getSideType = function () {
        return this.pieceModel.sideType;
    };
    PieceView.prototype.getPieceType = function () {
        return this.pieceModel.pieceType;
    };
    PieceView.getKeyForPieceModel = function (pieceModel) {
        var key = ImageTag_1.ImageTag.null;
        switch (pieceModel.sideType) {
            case SideType_1.SideType.WHITE:
                switch (pieceModel.pieceType) {
                    case PieceType_1.PieceType.PAWN:
                        key = ImageTag_1.ImageTag.white_pawn;
                        break;
                    case PieceType_1.PieceType.KNIGHT:
                        key = ImageTag_1.ImageTag.white_knight;
                        break;
                    case PieceType_1.PieceType.BISHOP:
                        key = ImageTag_1.ImageTag.white_bishop;
                        break;
                    case PieceType_1.PieceType.ROOK:
                        key = ImageTag_1.ImageTag.white_rook;
                        break;
                    case PieceType_1.PieceType.QUEEN:
                        key = ImageTag_1.ImageTag.white_queen;
                        break;
                    case PieceType_1.PieceType.KING:
                        key = ImageTag_1.ImageTag.white_king;
                        break;
                }
                break;
            case SideType_1.SideType.BLACK:
                switch (pieceModel.pieceType) {
                    case PieceType_1.PieceType.PAWN:
                        key = ImageTag_1.ImageTag.black_pawn;
                        break;
                    case PieceType_1.PieceType.KNIGHT:
                        key = ImageTag_1.ImageTag.black_knight;
                        break;
                    case PieceType_1.PieceType.BISHOP:
                        key = ImageTag_1.ImageTag.black_bishop;
                        break;
                    case PieceType_1.PieceType.ROOK:
                        key = ImageTag_1.ImageTag.black_rook;
                        break;
                    case PieceType_1.PieceType.QUEEN:
                        key = ImageTag_1.ImageTag.black_queen;
                        break;
                    case PieceType_1.PieceType.KING:
                        key = ImageTag_1.ImageTag.black_king;
                        break;
                }
                break;
        }
        return key;
    };
    PieceView.prototype.setPiece = function (pieceModel) {
        if (PieceModel_1.PieceModel.isEqualTo(pieceModel, this.pieceModel)) {
            return;
        }
        this.pieceModel = { sideType: pieceModel.sideType, pieceType: pieceModel.pieceType };
        this.texture = PIXI.Texture.from(PieceView.getKeyForPieceModel(this.pieceModel));
    };
    PieceView.prototype.setNormal = function () {
        var scaleCons = 90;
        var scaleX = this.m_squareWidth / scaleCons;
        var scaleY = this.m_squareHeight / scaleCons;
        this.scale.set(scaleX, scaleY);
    };
    PieceView.prototype.setMoving = function () {
        var scaleCons = 62;
        var scaleX = this.m_squareWidth / scaleCons;
        var scaleY = this.m_squareHeight / scaleCons;
        this.scale.set(scaleX, scaleY);
    };
    PieceView.prototype.setAlpha = function (alpha) {
        this.alpha = alpha;
    };
    return PieceView;
}(PIXI.Sprite));
exports.PieceView = PieceView;
//# sourceMappingURL=PieceView.js.map