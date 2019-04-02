"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameTimeAbstract_1 = require("./GameTimeAbstract");
const GameTimeType_1 = require("./GameTimeType");
class GameTimeNormal extends GameTimeAbstract_1.GameTimeAbstract {
    getGameTimeType() {
        return GameTimeType_1.GameTimeType.NORMAL;
    }
    getCurrentTime(sideType, timeStamp) {
        return 100;
    }
    constructor(totalTime, incrTime) {
        super();
        this.totalTime = totalTime;
        this.incrTime = incrTime;
    }
}
exports.GameTimeNormal = GameTimeNormal;
//# sourceMappingURL=GameTimeNormal.js.map