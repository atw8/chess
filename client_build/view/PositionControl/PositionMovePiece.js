"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PositionPoints_1 = require("./PositionPoints");
class PositionMovePiece extends PositionPoints_1.PositionPoints {
    static getTotalDistance(startPosition, endPosition) {
        let deltaPosition = Phaser.Point.subtract(endPosition, startPosition);
        return deltaPosition.getMagnitude();
    }
    static getNumOfPoints(startPosition, endPosition, slowDownDistance) {
        let totalDistance = this.getTotalDistance(startPosition, endPosition);
        let numOfPoints = 0;
        if (totalDistance >= slowDownDistance) {
            numOfPoints = 3;
        }
        else {
            numOfPoints = 2;
        }
        return numOfPoints;
    }
    static getPointCumulDistMap(startPosition, endPosition, slowDownDistance) {
        let totalDistance = this.getTotalDistance(startPosition, endPosition);
        let pointCumulDistMap = [];
        if (totalDistance >= slowDownDistance) {
            pointCumulDistMap[0] = 0;
            pointCumulDistMap[1] = totalDistance - slowDownDistance;
            pointCumulDistMap[2] = totalDistance;
        }
        else {
            pointCumulDistMap[0] = 0;
            pointCumulDistMap[1] = totalDistance;
        }
        return pointCumulDistMap;
    }
    static getPointSpeedMap(startPosition, endPosition, slowDownDistance, speed) {
        let totalDistance = this.getTotalDistance(startPosition, endPosition);
        let pointSpeedMap = [];
        if (totalDistance >= slowDownDistance) {
            pointSpeedMap[0] = speed;
            pointSpeedMap[1] = speed;
            pointSpeedMap[2] = speed / 2;
        }
        else {
            pointSpeedMap[0] = speed;
            pointSpeedMap[1] = speed / 2;
        }
        return pointSpeedMap;
    }
    constructor(target, startPosition, endPosition, speed, slowDownDistance) {
        super(target, startPosition, endPosition, PositionMovePiece.getNumOfPoints(startPosition, endPosition, slowDownDistance), PositionMovePiece.getPointCumulDistMap(startPosition, endPosition, slowDownDistance), PositionMovePiece.getPointSpeedMap(startPosition, endPosition, slowDownDistance, speed));
    }
}
exports.PositionMovePiece = PositionMovePiece;
//# sourceMappingURL=PositionMovePiece.js.map