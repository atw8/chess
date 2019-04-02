"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameTimeAbstract_1 = require("./GameTimeAbstract");
const GameTimeType_1 = require("./GameTimeType");
class GameTimeMove extends GameTimeAbstract_1.GameTimeAbstract {
    getGameTimeType() {
        return GameTimeType_1.GameTimeType.MOVE;
    }
    getCurrentTime(sideType, timeStamp) {
        let currentTime = this.moveTime;
        if (this.getMoveTurn() == sideType) {
            if (this.timeStamps.length == 0) {
                currentTime = currentTime + (this.startTimeStamp - timeStamp);
            }
            else {
                currentTime = currentTime + (this.timeStamps[this.timeStamps.length - 1] - timeStamp);
            }
        }
        return currentTime;
    }
    constructor(moveTime) {
        super();
        this.moveTime = moveTime;
    }
}
exports.GameTimeMove = GameTimeMove;
//# sourceMappingURL=GameTimeMove.js.map