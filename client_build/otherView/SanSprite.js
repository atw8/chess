"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SideType_1 = require("../../shared/engine/SideType");
const PieceType_1 = require("../../shared/engine/PieceType");
const PieceView_1 = require("../view/PieceView");
const ChessEngine_1 = require("../../shared/engine/ChessEngine");
require("p2");
require("pixi");
require("phaser");
const Global = require("./../Global");
class SanSprite extends Phaser.Graphics {
    constructor(sanStr, sideType, width, height) {
        super(Global.game);
        this.sanStr = sanStr;
        this.sideType = sideType;
        this.m_width = width;
        this.m_height = height;
        let firstChar = this.sanStr[0];
        let piece = ChessEngine_1.ChessEngine.fenCharToSideTypePieceType(firstChar);
        if (piece == null || piece.getSideType() == SideType_1.SideType.BLACK) {
            this.pieceType = PieceType_1.PieceType.PAWN;
            this.sanText = this.sanStr;
        }
        else {
            this.pieceType = piece.getPieceType();
            this.sanText = this.sanStr.substr(1);
        }
        if (this.pieceType != PieceType_1.PieceType.PAWN) {
            this.uiPieceView = new PieceView_1.PieceView(this.sideType, this.pieceType, this.m_height, this.m_height);
            this.uiPieceView.anchor.set(0.0, 0.5);
            this.uiPieceView.position.set(0.0, -this.uiPieceView.height * 0.15);
            this.addChild(this.uiPieceView);
        }
        else {
            this.uiPieceView = null;
        }
        this.uiSanText = new Phaser.Text(Global.game, 0, 0, this.sanText);
        let uiSanTextScale;
        uiSanTextScale = this.m_height / this.uiSanText.height;
        this.uiSanText.scale.set(uiSanTextScale, uiSanTextScale);
        this.uiSanText.anchor.set(0.0, 0.5);
        if (this.uiPieceView == null) {
            this.uiSanText.position.set(0.0, 0.0);
        }
        else {
            this.uiSanText.position.set(this.uiPieceView.width, 0.0);
        }
        this.addChild(this.uiSanText);
    }
}
exports.SanSprite = SanSprite;
//# sourceMappingURL=SanSprite.js.map