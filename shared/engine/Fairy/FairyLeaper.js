"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fairy_1 = require("./Fairy");
const FairyType_1 = require("./FairyType");
class FairyLeaper extends Fairy_1.Fairy {
    constructor() {
        super(FairyType_1.FairyType.LEAPER);
        this.vectors = [];
    }
    addVector(vector) {
        this.vectors.push(vector);
    }
    getVectors() {
        return this.vectors;
    }
}
exports.FairyLeaper = FairyLeaper;
//# sourceMappingURL=FairyLeaper.js.map