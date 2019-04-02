"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PositionPoints_1 = require("./PositionPoints");
class PositionConstantSpeed extends PositionPoints_1.PositionPoints {
    static getPointCumulDistMap(startPosition, endPosition) {
        let deltaPosition = Phaser.Point.subtract(endPosition, startPosition);
        let totalDistance = deltaPosition.getMagnitude();
        let numOfPoints = 2;
        let pointCumulDistMap = [];
        pointCumulDistMap[0] = 0;
        pointCumulDistMap[1] = totalDistance;
        return pointCumulDistMap;
    }
    static getPointSpeedMap(speed) {
        let pointSpeedMap = [];
        pointSpeedMap[0] = speed;
        pointSpeedMap[1] = speed;
        return pointSpeedMap;
    }
    constructor(target, startPosition, endPosition, speed) {
        super(target, startPosition, endPosition, 2, PositionConstantSpeed.getPointCumulDistMap(startPosition, endPosition), PositionConstantSpeed.getPointSpeedMap(speed));
    }
}
exports.PositionConstantSpeed = PositionConstantSpeed;
//# sourceMappingURL=PositionConstantSpeed.js.map