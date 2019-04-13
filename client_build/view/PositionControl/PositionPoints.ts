
export class PositionPoints{

    protected static getMagnitude(point : PIXI.Point):number{
        return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
    }
    protected static subtract(point1 : PIXI.Point, point2 : PIXI.Point):PIXI.Point{
        return new PIXI.Point(point1.x - point2.x, point1.y - point2.y);
    }

    private m_target : PIXI.DisplayObject;
    //private m_startPosition : PIXI.Point;
    //private m_endPosition : PIXI.Point;

    private m_numOfPoints : number;
    private m_pointCumulDistMap : number[];
    private m_pointSpeedMap : number[];


    private m_pointDistMap : number[];
    private m_pointTimeMap : number[];
    private m_pointCumulTimeMap : number[];

    private m_timeElapsed : number;

    //private m_previousPosition : PIXI.Point;
    private m_deltaPosition : PIXI.Point;
    public m_lastDelta : number;

    constructor(target : PIXI.DisplayObject, startPosition : PIXI.Point, endPosition : PIXI.Point, numOfPoints :number, pointCumulDistMap : number[], pointSpeedMap : number[]){
        this.m_target = target;
        //this.m_startPosition = startPosition;
        //this.m_endPosition = endPosition;

        this.m_numOfPoints = numOfPoints;
        this.m_pointCumulDistMap = pointCumulDistMap;
        this.m_pointSpeedMap = pointSpeedMap;


        //this.m_previousPosition = startPosition;

        this.m_deltaPosition = new PIXI.Point(endPosition.x - startPosition.x, endPosition.y - startPosition.y);


        this.m_pointDistMap = [];
        this.m_pointDistMap[0] = 0;
        for(let i = 1; i < this.m_numOfPoints; i++){
            this.m_pointDistMap.push(this.m_pointCumulDistMap[i] - this.m_pointCumulDistMap[i - 1]);
        }


        this.m_pointTimeMap = [];
        this.m_pointTimeMap[0] = 0;
        this.m_pointCumulTimeMap = [];
        this.m_pointCumulTimeMap[0] = 0;
        for(let i = 1; i < this.m_numOfPoints; i++){
            this.m_pointTimeMap.push( (this.m_pointDistMap[i] * 2) / (this.m_pointSpeedMap[i] + this.m_pointSpeedMap[i - 1]) );
            this.m_pointCumulTimeMap.push( this.m_pointCumulTimeMap[i - 1] + this.m_pointTimeMap[i] );
        }


        this.m_timeElapsed = 0.0;
        this.m_lastDelta = 0.0;
    }



    public isDone():boolean{
        return this.m_timeElapsed >= this.m_pointCumulTimeMap[this.m_numOfPoints - 1];
    };

    public tick(dt : number){
        this.m_timeElapsed += dt;
        this.m_timeElapsed = Math.min(this.m_timeElapsed, this.m_pointCumulTimeMap[this.m_numOfPoints - 1]);
        this.m_timeElapsed = Math.max(this.m_timeElapsed, this.m_pointCumulTimeMap[0]);


        //Make the PositionMove Piece Stackable
        /*
        let position = this.m_target.position.clone();
        let diff = { x : position["x"] - this.m_previousPosition["x"], y : position["y"] - this.m_previousPosition["y"] };

        this.m_startPosition["x"] = this.m_startPosition["x"] + diff["x"];
        this.m_startPosition["y"] = this.m_startPosition["y"] + diff["y"];
        */

        if(this.m_pointCumulDistMap[this.m_numOfPoints - 1] !== 0){
            //Find out what interval we are in
            let intervalPoint = null;
            let index = 0;
            do {
                if(this.m_timeElapsed >= this.m_pointCumulTimeMap[index] && this.m_timeElapsed <= this.m_pointCumulTimeMap[index + 1]){
                    intervalPoint = index;
                }

                index = index + 1;
            }while(intervalPoint === null);


            let s = null;
            s = this.m_pointCumulDistMap[intervalPoint];
            s += (this.m_pointSpeedMap[intervalPoint] + this.m_pointSpeedMap[intervalPoint + 1])
                * 0.5
                * ( this.m_timeElapsed - this.m_pointCumulTimeMap[intervalPoint] );

            let delta = s / this.m_pointCumulDistMap[this.m_numOfPoints - 1];



            let newPosition = new PIXI.Point();
            newPosition["x"] = this.m_target.position.x + this.m_deltaPosition.x * (delta - this.m_lastDelta);
            newPosition["y"] = this.m_target.position.y + this.m_deltaPosition.y * (delta - this.m_lastDelta);


            this.m_target.position.set(newPosition.x, newPosition.y);
            this.m_lastDelta = delta;
            //this.m_previousPosition = newPosition;
        }
    };


    public getDeltaPosition():PIXI.Point{
        let ret : PIXI.Point = new PIXI.Point();
        ret.x = this.m_deltaPosition.x * (1.0 - this.m_lastDelta);
        ret.y = this.m_deltaPosition.y * (1.0 - this.m_lastDelta);

        return ret;
    }
}
