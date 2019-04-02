"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SideType_1 = require("../../shared/engine/SideType");
const PieceType_1 = require("../../shared/engine/PieceType");
require("p2");
require("pixi");
require("phaser");
const ImageTag_1 = require("../ImageTag");
const Global = require("./../Global");
class PieceView extends Phaser.Sprite {
    static getKeyForSideTypePieceType(sideType, pieceType) {
        let key = ImageTag_1.ImageTag.null;
        switch (sideType) {
            case SideType_1.SideType.WHITE:
                switch (pieceType) {
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
                switch (pieceType) {
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
    }
    constructor(sideType, pieceType, squareWidth, squareHeight) {
        super(Global.game, 0, 0, PieceView.getKeyForSideTypePieceType(sideType, pieceType));
        this.sideType = sideType;
        this.pieceType = pieceType;
        this.m_squareWidth = squareWidth;
        this.m_squareHeight = squareHeight;
        this.anchor.set(0.5, 0.5);
        this.setNormal();
    }
    setPiece(sideType, pieceType) {
        if (sideType == this.sideType && pieceType == this.pieceType) {
            return;
        }
        this.sideType = sideType;
        this.pieceType = pieceType;
        this.loadTexture(PieceView.getKeyForSideTypePieceType(this.sideType, this.pieceType));
    }
    setNormal() {
        const scaleCons = 90;
        let scaleX = this.m_squareWidth / scaleCons;
        let scaleY = this.m_squareHeight / scaleCons;
        this.scale.set(scaleX, scaleY);
    }
    setMoving() {
        const scaleCons = 62;
        let scaleX = this.m_squareWidth / scaleCons;
        let scaleY = this.m_squareHeight / scaleCons;
        this.scale.set(scaleX, scaleY);
    }
    setAlpha(alpha) {
        this.alpha = alpha;
    }
}
exports.PieceView = PieceView;
//# sourceMappingURL=PieceView.js.map