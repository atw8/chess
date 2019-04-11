import {PositionPoints} from "./PositionPoints";
import {start} from "repl";


export class PositionConstantSpeed extends PositionPoints {
    static getPointCumulDistMap(startPosition : PIXI.Point, endPosition : PIXI.Point) : number[]{
        let deltaPosition = PositionPoints.subtract(endPosition, startPosition);
        let totalDistance = PositionPoints.getMagnitude(deltaPosition);

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

    constructor(target : PIXI.DisplayObject, startPosition : PIXI.Point, endPosition : PIXI.Point, speed : number){
        super(target, startPosition, endPosition, 2, PositionConstantSpeed.getPointCumulDistMap(startPosition, endPosition), PositionConstantSpeed.getPointSpeedMap(speed));
    }
}
