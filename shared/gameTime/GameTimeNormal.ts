import {GameTimeAbstract} from "./GameTimeAbstract"
import {GameTimeType} from "./GameTimeType";
import {SideType} from "../engine/SideType";


export class GameTimeNormal extends GameTimeAbstract {
    private totalTime : number;
    private incrTime : number;


    public getGameTimeType():GameTimeType{
        return GameTimeType.NORMAL;
    }
    public getCurrentTime(sideType : SideType, timeStamp : number):number{
        let ret = this.totalTime;

        if(sideType == SideType.WHITE){
            for(let i = 1; i < this.timeStamps.length; i += 2){
                ret += this.timeStamps[i - 1] - this.timeStamps[i] + this.incrTime;
            }
        }else if(sideType == SideType.BLACK){
            for(let i = 0; i < this.timeStamps.length; i += 2){
                ret += this.timeStamps[i - 1] - this.timeStamps[i] + this.incrTime;
            }
        }

        return ret;
    }


    constructor(totalTime : number, incrTime : number){
        super();
        this.totalTime = totalTime;
        this.incrTime = incrTime;
    }

}

