import {PositionPoints} from "./PositionPoints";


export class PositionMovePiece extends PositionPoints {

    static getTotalDistance(startPosition : PIXI.Point, endPosition : PIXI.Point):number{
        let deltaPosition = PositionPoints.subtract(endPosition, startPosition);

        return PositionPoints.getMagnitude(deltaPosition);
    }

    static getNumOfPoints(startPosition : PIXI.Point, endPosition : PIXI.Point, slowDownDistance : number):number{

        let totalDistance = this.getTotalDistance(startPosition, endPosition);

        let numOfPoints = 0;
        if(totalDistance >= slowDownDistance){
            numOfPoints = 3;
        }else {
            numOfPoints = 2;
        }

        return numOfPoints;
    }

    static getPointCumulDistMap(startPosition : PIXI.Point, endPosition : PIXI.Point, slowDownDistance : number) : number[]{
        let totalDistance = this.getTotalDistance(startPosition, endPosition);


        let pointCumulDistMap : number[] = [];

        if(totalDistance >= slowDownDistance){
            pointCumulDistMap[0] = 0;
            pointCumulDistMap[1] = totalDistance - slowDownDistance;
            pointCumulDistMap[2] = totalDistance;
        }else {
            pointCumulDistMap[0] = 0;
            pointCumulDistMap[1] = totalDistance;
        }

        return pointCumulDistMap;
    }

    static getPointSpeedMap(startPosition : PIXI.Point, endPosition : PIXI.Point, slowDownDistance : number, speed : number) : number[]{
        let totalDistance = this.getTotalDistance(startPosition, endPosition);

        let pointSpeedMap : number[] = [];
        if(totalDistance >= slowDownDistance){
            pointSpeedMap[0] = speed;
            pointSpeedMap[1] = speed;
            pointSpeedMap[2] = speed/2;
        }else {
            pointSpeedMap[0] = speed;
            pointSpeedMap[1] = speed/2;
        }

        return pointSpeedMap;
    }


    constructor(target : PIXI.DisplayObject, startPosition : PIXI.Point, endPosition : PIXI.Point, speed : number, slowDownDistance : number){
        super(target,
            startPosition,
            endPosition,
            PositionMovePiece.getNumOfPoints(startPosition, endPosition, slowDownDistance),
            PositionMovePiece.getPointCumulDistMap(startPosition, endPosition, slowDownDistance),
            PositionMovePiece.getPointSpeedMap(startPosition, endPosition, slowDownDistance, speed))
    }
}
