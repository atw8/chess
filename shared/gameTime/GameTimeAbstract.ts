import {SideType} from "../engine/SideType";
import {GameTimeType} from "./GameTimeType";
import {GameTimeManager} from "./GameTimeManager";

export abstract class GameTimeAbstract {
    public abstract getGameTimeType():GameTimeType;
    public isLose(sideType : SideType, timeStamp : number):boolean{
        let currentTime = this.getCurrentTime(sideType, timeStamp);

        return currentTime < 0;
    }
    public abstract getCurrentTime(sideType : SideType, timeStamp : number):number;


    protected gameTimeManager : GameTimeManager;

    constructor(gameTimeManager : GameTimeManager){
        this.gameTimeManager = gameTimeManager;
    }


    public start(startTimeStamp : number){}
    public end(endTimeStamp : number){}

    public doMove(timeStamp : number){}
    public undoMove(){}

    public setTimeStamps(timeStamps : number[]){}
}