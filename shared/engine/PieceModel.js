"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PieceModel {
    constructor(pieceType, sideType) {
        this.pieceType = pieceType;
        this.sideType = sideType;
        this.numOfTimesAdded = 0;
        this.numOfTimesRemoved = 0;
    }
    getSideType() {
        return this.sideType;
    }
    ;
    getPieceType() {
        return this.pieceType;
    }
    ;
    getNumOfTimesMoved() {
        return Math.min(this.numOfTimesRemoved, this.numOfTimesAdded);
    }
    ;
    getNumOfTimesRemoved() {
        return this.numOfTimesRemoved;
    }
    ;
    setNumOfTimesRemoved(numOfTimesRemoved) {
        this.numOfTimesRemoved = numOfTimesRemoved;
    }
    ;
    addNumOfTimesRemoved(val) {
        this.setNumOfTimesRemoved(this.getNumOfTimesRemoved() + val);
    }
    ;
    incrNumOfTimesRemoved() {
        this.addNumOfTimesRemoved(1);
    }
    ;
    decrNumOfTimesRemoved() {
        this.addNumOfTimesRemoved(-1);
    }
    ;
    getNumOfTimesAdded() {
        return this.numOfTimesAdded;
    }
    ;
    setNumOfTimesAdded(numOfTimesAdded) {
        this.numOfTimesAdded = numOfTimesAdded;
    }
    ;
    addNumOfTimesAdded(val) {
        this.setNumOfTimesAdded(this.getNumOfTimesAdded() + val);
    }
    ;
    incrNumOfTimesAdded() {
        this.addNumOfTimesAdded(1);
    }
    ;
    decrNumOfTimesAdded() {
        this.addNumOfTimesAdded(-1);
    }
    ;
    static isEqualTo(pieceModel1, pieceModel2) {
        return pieceModel1.getPieceType() == pieceModel2.getPieceType() && pieceModel1.getSideType() == pieceModel2.getSideType();
    }
    ;
}
exports.PieceModel = PieceModel;
;
//# sourceMappingURL=PieceModel.js.map