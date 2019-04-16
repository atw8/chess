import {SideType} from "../engine/SideType";
import {GameTimeType} from "./GameTimeType";

export abstract class GameTimeAbstract {
    protected timeStamps : number[];


    public abstract getGameTimeType():GameTimeType;
    public isLose(sideType : SideType, timeStamp : number):boolean{
        let currentTime = this.getCurrentTime(sideType, timeStamp);

        return currentTime < 0;
    }
    public abstract getCurrentTime(sideType : SideType, timeStamp : number):number;

    constructor(){
        this.timeStamps = [];
    }


    public getMoveTurn():SideType{
        return this.timeStamps.length%2 == 1 ? SideType.WHITE : SideType.BLACK;
    }



    public start(startTimeStamp : number){
        this.timeStamps.push(startTimeStamp);
    }
    public end(endTimeStamp : number){
        this.timeStamps.push(endTimeStamp);
    }

    public doMove(timeStamp : number){
        this.timeStamps.push(timeStamp);
    }
    public undoMove(){
        this.timeStamps.pop();
    }

    public setTimeStamps(timeStamps : number[]){
        this.timeStamps = timeStamps;
    }
}