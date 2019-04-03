"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fairy_1 = require("./Fairy");
const FairyType_1 = require("./FairyType");
class FairyLeaper extends Fairy_1.Fairy {
    constructor() {
        super(FairyType_1.FairyType.LEAPER);
        this.vectors = [];
        this.maxX = 0;
        this.maxY = 0;
    }
    addVector(vector) {
        this.maxX = Math.max(this.maxX, Math.abs(vector.x));
        this.maxY = Math.max(this.maxY, Math.abs(vector.y));
        this.vectors.push(vector);
    }
    getMaxX() {
        return this.maxX;
    }
    getMaxY() {
        return this.maxY;
    }
    getVectors() {
        return this.vectors;
    }
}
exports.FairyLeaper = FairyLeaper;
//# sourceMappingURL=FairyLeaper.js.map