import {SideType} from "../engine/SideType";
import {GameTimeType} from "./GameTimeType";

export abstract class GameTimeAbstract {
    protected startTimeStamp : number;
    protected endTimeStamp : number;
    protected timeStamps : number[];


    public abstract getGameTimeType():GameTimeType;
    public isLose(sideType : SideType, timeStamp : number):boolean{
        let currentTime = this.getCurrentTime(sideType, timeStamp);

        return currentTime < 0;
    }
    public abstract getCurrentTime(sideType : SideType, timeStamp : number):number;

    constructor(){
        this.startTimeStamp = 0;
        this.endTimeStamp = 0;
        this.timeStamps = [];
    }


    public getMoveTurn():SideType{
        return this.timeStamps.length%2 == 0 ? SideType.WHITE : SideType.BLACK;
    }



    public start(startTimeStamp : number){
        this.startTimeStamp = startTimeStamp;
    }
    public end(endTimeStamp : number){
        this.endTimeStamp = endTimeStamp
    }

    public doMove(timeStamp : number){
        this.timeStamps.push(timeStamp);
    }
    public undoMove(){
        this.timeStamps.pop();
    }
}