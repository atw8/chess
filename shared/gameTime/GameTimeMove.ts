import {GameTimeAbstract} from "./GameTimeAbstract"
import {GameTimeType} from "./GameTimeType"
import {SideType} from "../engine/SideType";
import {GameTimeManager} from "./GameTimeManager";


export class GameTimeMove extends GameTimeAbstract {
    private moveTime : number;

    public getGameTimeType():GameTimeType{
        return GameTimeType.MOVE;
    }
    public getCurrentTime(sideType : SideType, timeStamp : number):number{
        let currentTime : number = this.moveTime;

        let timeStamps = this.gameTimeManager.getTimeStamps();

        if(this.gameTimeManager.getMoveTurn() == sideType && timeStamps.length > 0){
            currentTime += timeStamps[timeStamps.length - 1] - timeStamp;

        }

        return currentTime;
    }

    constructor(gameTimeManager : GameTimeManager, moveTime : number){
        super(gameTimeManager);
        this.moveTime = moveTime;
    }


}

