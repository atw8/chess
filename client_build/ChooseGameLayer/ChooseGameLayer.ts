import {RoomInitConfig} from "../shared/MessageTypes";
import {SideType} from "../shared/engine/SideType";
import {GameTimeType} from "../shared/gameTime/GameTimeType";

export class MainLayer extends PIXI.Container {
    constructor(){
        super();

        let roomInitConfigs : RoomInitConfig[] = [];
        {
            let roomInitConfig = new RoomInitConfig();
            roomInitConfig.isChess960 = true;
            // @ts-ignore
            roomInitConfig.gameTimeStructs = {};
            roomInitConfig.gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.INFINITE};
            roomInitConfig.gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.INFINITE};

            roomInitConfigs.push(roomInitConfig);
        }
        {
            let roomInitConfig = new RoomInitConfig();
            roomInitConfig.isChess960 = true;
            // @ts-ignore
            roomInitConfig.gameTimeStructs = {};
            roomInitConfig.gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.MOVE, totalTime : 1 * 60 * 1000, incrTime : 0};
            roomInitConfig.gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.MOVE, totalTime : 1 * 60 * 1000, incrTime : 0};

            roomInitConfigs.push(roomInitConfig);
        }
        {
            let roomInitConfig = new RoomInitConfig();
            roomInitConfig.isChess960 = false;
            // @ts-ignore
            roomInitConfig.gameTimeStructs = {};
            roomInitConfig.gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.NORMAL, totalTime : 1 * 60 * 1000, incrTime : 5};
            roomInitConfig.gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.NORMAL, totalTime : 1 * 60 * 1000, incrTime : 5};

            roomInitConfigs.push(roomInitConfig);
        }






    }
}