import {GameTimeAbstract} from "./GameTimeAbstract";
import {GameTimeType} from "./GameTimeType";
import {SideType} from "../engine/SideType";
import {GameTimeInfinite} from "./GameTimeInfinite";
import {GameTimeMove} from "./GameTimeMove";
import {GameTimeNormal} from "./GameTimeNormal";


export type GameTimeStructConfig = { "timeType" : GameTimeType, "totalTime" ?: number, incrTime ?: number}
export type GameTimeStructConfigs = { [key in SideType] : GameTimeStructConfig};

export class GameTimeManager {
    private gameTimeStructs : { [key in SideType] : GameTimeAbstract} ;

    private timeStamps : number[];
    public getTimeStamps():number[]{
        return this.timeStamps;
    }
    public getFirstTimeStamp():number{
        return this.timeStamps[0];
    }
    public getLastTimeStamp():number{
        return this.timeStamps[this.timeStamps.length - 1];
    }

    constructor(gameTimeStructConfigs : GameTimeStructConfigs){
        this.timeStamps = [];

        // @ts-ignore
        this.gameTimeStructs = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let gameTimeStruct : GameTimeAbstract;

            switch(gameTimeStructConfigs[sideType].timeType){
                case GameTimeType.INFINITE:
                    {
                        gameTimeStruct = new GameTimeInfinite(this);
                    }
                    break;
                case GameTimeType.MOVE:
                    {
                        let totalTime = <number>gameTimeStructConfigs[sideType].totalTime;

                        gameTimeStruct = new GameTimeMove(this, totalTime);
                    }
                    break;
                case GameTimeType.NORMAL:
                    {
                        let totalTime = <number>gameTimeStructConfigs[sideType].totalTime;
                        let incrTime = <number>gameTimeStructConfigs[sideType].incrTime;

                        gameTimeStruct = new GameTimeNormal(this, totalTime, incrTime);
                    }
                    break;
            }


            // @ts-ignore
            this.gameTimeStructs[sideType] = gameTimeStruct;
        }
    }

    public getMoveTurn():SideType{
        return this.timeStamps.length%2 == 1 ? SideType.WHITE : SideType.BLACK;
    }



    public getCurrentTime(sideType : SideType, timeStamp : number):number{
        return this.gameTimeStructs[sideType].getCurrentTime(sideType, timeStamp);
    }
    public isLose(sideType : SideType, timeStamp : number):boolean{
        return this.gameTimeStructs[sideType].isLose(sideType, timeStamp);
    }


    public start(startTimeStamp : number){
        this.timeStamps.push(startTimeStamp);

        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.gameTimeStructs[sideType].start(startTimeStamp);
        }
    }
    public end(endTimeStamp : number){
        this.timeStamps.push(endTimeStamp);
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.gameTimeStructs[sideType].end(endTimeStamp);
        }
    }

    public doMove(timeStamp : number){
        this.timeStamps.push(timeStamp);
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.gameTimeStructs[sideType].doMove(timeStamp);
        }
    }
    public undoMove(){
        this.timeStamps.pop();
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.gameTimeStructs[sideType].undoMove();
        }
    }

}