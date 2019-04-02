"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SideType_1 = require("../engine/SideType");
class GameTimeAbstract {
    isLose(sideType, timeStamp) {
        let currentTime = this.getCurrentTime(sideType, timeStamp);
        return currentTime < 0;
    }
    constructor() {
        this.startTimeStamp = 0;
        this.endTimeStamp = 0;
        this.timeStamps = [];
    }
    getMoveTurn() {
        return this.timeStamps.length % 2 == 0 ? SideType_1.SideType.WHITE : SideType_1.SideType.BLACK;
    }
    start(startTimeStamp) {
        this.startTimeStamp = startTimeStamp;
    }
    end(endTimeStamp) {
        this.endTimeStamp = endTimeStamp;
    }
    doMove(timeStamp) {
        this.timeStamps.push(timeStamp);
    }
    undoMove() {
        this.timeStamps.pop();
    }
}
exports.GameTimeAbstract = GameTimeAbstract;
//# sourceMappingURL=GameTimeAbstract.js.map