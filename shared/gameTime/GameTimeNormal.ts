import {GameTimeAbstract} from "./GameTimeAbstract"
import {GameTimeType} from "./GameTimeType";
import {SideType} from "../engine/SideType";
import {GameTimeManager} from "./GameTimeManager";


export class GameTimeNormal extends GameTimeAbstract {
    private totalTime : number;
    private incrTime : number;


    public getGameTimeType():GameTimeType{
        return GameTimeType.NORMAL;
    }
    public getCurrentTime(sideType : SideType, timeStamp : number):number{
        let ret = this.totalTime;


        let timeStamps = this.gameTimeManager.getTimeStamps();
        if(sideType == SideType.WHITE){
            for(let i = 1; i < timeStamps.length; i += 2){
                ret += timeStamps[i - 1] - timeStamps[i] + this.incrTime;
            }
        }else if(sideType == SideType.BLACK){
            for(let i = 2; i < timeStamps.length; i += 2){
                ret += timeStamps[i - 1] - timeStamps[i] + this.incrTime;
            }
        }
        if(this.gameTimeManager.getMoveTurn() == sideType){
            ret += timeStamps[timeStamps.length - 1] - timeStamp;
        }

        return ret;
    }


    constructor(gameTimeManager : GameTimeManager, totalTime : number, incrTime : number){
        super(gameTimeManager);

        this.totalTime = totalTime;
        this.incrTime = incrTime;
    }

}

