"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameTimeAbstract_1 = require("./GameTimeAbstract");
const GameTimeType_1 = require("./GameTimeType");
class GameTimeInfinite extends GameTimeAbstract_1.GameTimeAbstract {
    getGameTimeType() {
        return GameTimeType_1.GameTimeType.INFINITE;
    }
    getCurrentTime(sideType, timeStamp) {
        return Number.MAX_VALUE;
    }
    constructor() {
        super();
    }
}
exports.GameTimeInfinite = GameTimeInfinite;
//# sourceMappingURL=GameTimeInfinite.js.map