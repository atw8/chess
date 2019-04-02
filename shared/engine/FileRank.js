"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileRank {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new FileRank(this.x, this.y);
    }
    static addFileRank(fileRank1, fileRank2) {
        return new FileRank(fileRank1.x + fileRank2.x, fileRank1.y + fileRank2.y);
    }
    static subFileRank(fileRank1, fileRank2) {
        return new FileRank(fileRank1.x - fileRank2.x, fileRank1.x - fileRank2.y);
    }
}
exports.FileRank = FileRank;
//# sourceMappingURL=FileRank.js.map