import {GameTimeAbstract} from "./GameTimeAbstract"
import {GameTimeType} from "./GameTimeType";
import {SideType} from "../engine/SideType";
import {GameTimeManager} from "./GameTimeManager";


export class GameTimeInfinite extends GameTimeAbstract {
    public getGameTimeType():GameTimeType{
        return GameTimeType.INFINITE;
    }

    public getCurrentTime(sideType : SideType, timeStamp : number):number{
        return Infinity;
        //return Number.MAX_VALUE;
    }

    constructor(gameTimeManager : GameTimeManager){
        super(gameTimeManager);
    }

}

