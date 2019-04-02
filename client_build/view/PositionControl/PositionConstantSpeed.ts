import {PositionPoints} from "./PositionPoints";


export class PositionConstantSpeed extends PositionPoints {
    static getPointCumulDistMap(startPosition : Phaser.Point, endPosition : Phaser.Point) : number[]{
        let deltaPosition = Phaser.Point.subtract(endPosition, startPosition);

        let totalDistance = deltaPosition.getMagnitude();

        let numOfPoints = 2;
        let pointCumulDistMap : number[] = [];
        pointCumulDistMap[0] = 0;
        pointCumulDistMap[1] = totalDistance;

        return pointCumulDistMap;
    }

    static getPointSpeedMap(speed : number): number[]{
        let pointSpeedMap : number[] = [];
        pointSpeedMap[0] = speed;
        pointSpeedMap[1] = speed;

        return pointSpeedMap;
    }

    constructor(target : PIXI.DisplayObject, startPosition : Phaser.Point, endPosition : Phaser.Point, speed : number){
        super(target, startPosition, endPosition, 2, PositionConstantSpeed.getPointCumulDistMap(startPosition, endPosition), PositionConstantSpeed.getPointSpeedMap(speed));
    }
}
