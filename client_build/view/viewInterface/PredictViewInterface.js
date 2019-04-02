"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PieceView_1 = require("../PieceView");
const ChessEngine_1 = require("../../../shared/engine/ChessEngine");
const AbstractViewInterface_1 = require("./AbstractViewInterface");
const AbstractViewInterface_2 = require("./AbstractViewInterface");
const Global = require("./../../Global");
class PredictViewInterface extends AbstractViewInterface_1.AbstractViewInterface {
    constructor(moveClass, alpha, boardView, group, squareWidth, squareHeight) {
        super();
        this.group = group;
        this.squareWidth = squareWidth;
        this.squareHeight = squareHeight;
        this.array = {};
        this.alpha = alpha;
        this.moveClass = moveClass;
        this.boardView = boardView;
        this.isDestroy = false;
        this.startAutomata(0.0);
    }
    destroy() {
        this.isDestroy = true;
        for (let _hash in this.array) {
            let hash = Number(_hash);
            let pieceView = this.array[hash];
            if (pieceView != null) {
                let positionManager = this.boardView.getPositionManager();
                while (positionManager.isMovingSprite(pieceView)) {
                    positionManager.updateMovingSprites(60 * 60 * 1000, pieceView);
                }
            }
        }
        for (let _hash in this.array) {
            let hash = Number(_hash);
            let pieceView = this.array[hash];
            if (pieceView != null) {
                this.removePieceView(pieceView);
            }
        }
        this.array = {};
    }
    getViewInterfaceType() {
        return AbstractViewInterface_2.AbstractViewInterfaceType.PREDICT_VIEW;
    }
    setPieceSpriteForFileRank(fileRank, pieceSprite) {
        let hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        this.array[hash] = pieceSprite;
    }
    getPieceSpriteForFileRank(fileRank) {
        let hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        let ret;
        if (this.array[hash] == undefined) {
            ret = null;
        }
        else {
            ret = this.array[hash];
        }
        return ret;
    }
    createPieceView(sideType, pieceType) {
        let pieceView = new PieceView_1.PieceView(sideType, pieceType, this.squareWidth, this.squareHeight);
        this.group.addChild(pieceView);
        pieceView.alpha = this.alpha;
        return pieceView;
    }
    removePieceView(pieceView) {
        this.group.removeChild(pieceView);
    }
    startAnimation(moveClass, isUndoMove) {
    }
    endAnimation(moveClass, isUndoMove) {
        this.startAutomata(500);
    }
    startAutomata(delay) {
        Global.game.time.events.add(delay, () => {
            if (!this.isDestroy) {
                this.boardView.doMoveAnimation(this.moveClass, false, this);
            }
        });
    }
}
exports.PredictViewInterface = PredictViewInterface;
//# sourceMappingURL=PredictViewInterface.js.map