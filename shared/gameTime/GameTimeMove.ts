import {GameTimeAbstract} from "./GameTimeAbstract"
import {GameTimeType} from "./GameTimeType"
import {SideType} from "../engine/SideType";


export class GameTimeMove extends GameTimeAbstract {
    private moveTime : number;

    public getGameTimeType():GameTimeType{
        return GameTimeType.MOVE;
    }
    public getCurrentTime(sideType : SideType, timeStamp : number):number{
        let currentTime : number = this.moveTime;

        if(this.getMoveTurn() == sideType){
            if(this.timeStamps.length == 0){
                currentTime = currentTime + (this.startTimeStamp - timeStamp);
            }else {
                currentTime = currentTime + (this.timeStamps[this.timeStamps.length - 1] - timeStamp);
            }
        }

        return currentTime;
    }

    constructor(moveTime : number){
        super();
        this.moveTime = moveTime;
    }

}

