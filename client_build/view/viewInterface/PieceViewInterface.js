"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PieceView_1 = require("../PieceView");
const ChessEngine_1 = require("../../../shared/engine/ChessEngine");
const AbstractViewInterface_1 = require("./AbstractViewInterface");
const AbstractViewInterface_2 = require("./AbstractViewInterface");
class PieceViewInterface extends AbstractViewInterface_1.AbstractViewInterface {
    constructor(controller, group, squareWidth, squareHeight) {
        super();
        this.controller = controller;
        this.group = group;
        this.squareWidth = squareWidth;
        this.squareHeight = squareHeight;
        this.array = {};
        for (let fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            this.array[fileNumber] = {};
            for (let rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                this.array[fileNumber][rank] = null;
            }
        }
    }
    getViewInterfaceType() {
        return AbstractViewInterface_2.AbstractViewInterfaceType.PIECE_VIEW;
    }
    createPieceView(sideType, pieceType) {
        let pieceSprite = new PieceView_1.PieceView(sideType, pieceType, this.squareWidth, this.squareHeight);
        this.group.add(pieceSprite);
        return pieceSprite;
    }
    removePieceView(pieceView) {
        this.group.remove(pieceView, true);
    }
    getPieceSpriteForFileRank(fileRank) {
        return this.array[fileRank["fileNumber"]][fileRank["rank"]];
    }
    setPieceSpriteForFileRank(fileRank, pieceSprite) {
        this.array[fileRank["fileNumber"]][fileRank["rank"]] = pieceSprite;
    }
    startAnimation(moveClass, isUndoMove) {
        this.controller.startAnimation(moveClass, isUndoMove);
    }
    endAnimation(moveClass, isUndoMove) {
        this.controller.endAnimation(moveClass, isUndoMove);
    }
}
exports.PieceViewInterface = PieceViewInterface;
//# sourceMappingURL=PieceViewInterface.js.map