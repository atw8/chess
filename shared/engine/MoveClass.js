"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MoveClass {
    constructor(originFileRank, destFileRank) {
        this.originFileRank = originFileRank;
        this.destFileRank = destFileRank;
        this.changeSequence = [];
    }
    pushChange(fileRank, originPiece, destPiece) {
        let change = { fileRank: fileRank, originPiece: originPiece, destPiece: destPiece };
        this.changeSequence.push(change);
    }
    ;
    getLength() {
        return this.changeSequence.length;
    }
    ;
    get(i) {
        return this.changeSequence[i];
    }
    ;
    clone() {
        let ret = new MoveClass(this.originFileRank, this.destFileRank);
        for (let i = 0; i < this.getLength(); i++) {
            let change = this.get(i);
            ret.pushChange(change["fileRank"], change["originPiece"], change["destPiece"]);
        }
        return ret;
    }
    ;
}
exports.MoveClass = MoveClass;
;
//# sourceMappingURL=MoveClass.js.map