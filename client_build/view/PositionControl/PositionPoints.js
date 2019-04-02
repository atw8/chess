"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PositionPoints {
    constructor(target, startPosition, endPosition, numOfPoints, pointCumulDistMap, pointSpeedMap) {
        this.m_target = target;
        this.m_startPosition = startPosition;
        this.m_endPosition = endPosition;
        this.m_numOfPoints = numOfPoints;
        this.m_pointCumulDistMap = pointCumulDistMap;
        this.m_pointSpeedMap = pointSpeedMap;
        this.m_previousPosition = startPosition;
        this.m_deltaPosition = Phaser.Point.subtract(this.m_endPosition, this.m_startPosition);
        this.m_pointDistMap = [];
        this.m_pointDistMap[0] = 0;
        for (let i = 1; i < this.m_numOfPoints; i++) {
            this.m_pointDistMap.push(this.m_pointCumulDistMap[i] - this.m_pointCumulDistMap[i - 1]);
        }
        this.m_pointTimeMap = [];
        this.m_pointTimeMap[0] = 0;
        this.m_pointCumulTimeMap = [];
        this.m_pointCumulTimeMap[0] = 0;
        for (let i = 1; i < this.m_numOfPoints; i++) {
            this.m_pointTimeMap.push((this.m_pointDistMap[i] * 2) / (this.m_pointSpeedMap[i] + this.m_pointSpeedMap[i - 1]));
            this.m_pointCumulTimeMap.push(this.m_pointCumulTimeMap[i - 1] + this.m_pointTimeMap[i]);
        }
        this.m_timeElapsed = 0.0;
    }
    isDone() {
        return this.m_timeElapsed >= this.m_pointCumulTimeMap[this.m_numOfPoints - 1];
    }
    ;
    tick(dt) {
        this.m_timeElapsed += dt;
        this.m_timeElapsed = Math.min(this.m_timeElapsed, this.m_pointCumulTimeMap[this.m_numOfPoints - 1]);
        this.m_timeElapsed = Math.max(this.m_timeElapsed, this.m_pointCumulTimeMap[0]);
        //Make the PositionMove Piece Stackable
        let position = this.m_target.position.clone();
        let diff = { x: position["x"] - this.m_previousPosition["x"], y: position["y"] - this.m_previousPosition["y"] };
        this.m_startPosition["x"] = this.m_startPosition["x"] + diff["x"];
        this.m_startPosition["y"] = this.m_startPosition["y"] + diff["y"];
        if (this.m_pointCumulDistMap[this.m_numOfPoints - 1] !== 0) {
            //Find out what interval we are in
            let intervalPoint = null;
            let index = 0;
            do {
                if (this.m_timeElapsed >= this.m_pointCumulTimeMap[index] && this.m_timeElapsed <= this.m_pointCumulTimeMap[index + 1]) {
                    intervalPoint = index;
                }
                index = index + 1;
            } while (intervalPoint === null);
            let s = null;
            s = this.m_pointCumulDistMap[intervalPoint];
            s += (this.m_pointSpeedMap[intervalPoint] + this.m_pointSpeedMap[intervalPoint + 1])
                * 0.5
                * (this.m_timeElapsed - this.m_pointCumulTimeMap[intervalPoint]);
            let delta = s / this.m_pointCumulDistMap[this.m_numOfPoints - 1];
            let newPosition = new Phaser.Point();
            newPosition["x"] = this.m_startPosition["x"] + this.m_deltaPosition["x"] * delta;
            newPosition["y"] = this.m_startPosition["y"] + this.m_deltaPosition["y"] * delta;
            this.m_target.position.set(newPosition.x, newPosition.y);
            this.m_previousPosition = newPosition;
        }
    }
    ;
}
exports.PositionPoints = PositionPoints;
//# sourceMappingURL=PositionPoints.js.map