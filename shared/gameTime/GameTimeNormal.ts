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
        return 100;
    }


    constructor(totalTime : number, incrTime : number){
        super();
        this.totalTime = totalTime;
        this.incrTime = incrTime;
    }

}

