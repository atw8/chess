import {RoomInitConfig} from "../../shared/MessageTypes";
import {SideType} from "../../shared/engine/SideType";
import {GameTimeType} from "../../shared/gameTime/GameTimeType";
import {ChooseGameButton} from "./ChooseGameButton";
import {SimpleGame} from "../app";
import {ImageTag} from "../ImageTag";
import {ParentBoardView} from "../BoardViewLayer/ParentBoardView";
import {GameTimeStructConfigs} from "../../shared/gameTime/GameTimeManager";
import {RoomTypeEnum} from "../../shared/RoomTypeEnum";

export class ChooseGameLayer extends PIXI.Container {
    private onClickCallback : (roomInitConfig : RoomInitConfig) => void;

    constructor(onClickCallback : (roomInitConfig : RoomInitConfig) => void){
        super();
        this.onClickCallback = onClickCallback;

        let roomInitConfigs : RoomInitConfig[] = [];
        {

            let roomTypeEnum : RoomTypeEnum = RoomTypeEnum.MULTIPLAYER;
            // @ts-ignore
            let gameTimeStructs : GameTimeStructConfigs = {};
            gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.INFINITE};
            gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.INFINITE};

            let roomInitConfig = new RoomInitConfig(roomTypeEnum, gameTimeStructs);
            roomInitConfig.isChess960 = true;

            roomInitConfigs.push(roomInitConfig);
        }
        {
            let roomTypeEnum : RoomTypeEnum = RoomTypeEnum.MULTIPLAYER;
            // @ts-ignore
            let gameTimeStructs : GameTimeStructConfigs = {};
            gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.MOVE, totalTime : 1 * 60 * 1000, incrTime : 0};
            gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.MOVE, totalTime : 1 * 60 * 1000, incrTime : 0};

            let roomInitConfig = new RoomInitConfig(roomTypeEnum, gameTimeStructs);
            roomInitConfig.isChess960 = true;

            roomInitConfigs.push(roomInitConfig);
        }
        {
            let roomTypeEnum : RoomTypeEnum = RoomTypeEnum.MULTIPLAYER;
            // @ts-ignore
            let gameTimeStructs : GameTimeStructConfigs = {};
            gameTimeStructs[SideType.WHITE] = {timeType : GameTimeType.NORMAL, totalTime : 1 * 60 * 1000, incrTime : 5*1000};
            gameTimeStructs[SideType.BLACK] = {timeType : GameTimeType.NORMAL, totalTime : 1 * 60 * 1000, incrTime : 5*1000};

            gameTimeStructs[SideType.WHITE].totalTime = 5*1000;
            gameTimeStructs[SideType.BLACK].totalTime = 5*1000;

            let roomInitConfig = new RoomInitConfig(roomTypeEnum, gameTimeStructs);
            roomInitConfig.isChess960 = false;


            roomInitConfigs.push(roomInitConfig);
        }



        let chooseGameBtns : ChooseGameButton[] = [];
        for(let j = 0; j < 3; j++){
            for(let i = 0; i < roomInitConfigs.length; i++){
                let chooseGameBtn = new ChooseGameButton(roomInitConfigs[i], 230, this.onClickCallback);
                //chooseGameBtn.position.set(SimpleGame.getScreenWidth()/2, SimpleGame.getScreenHeight()/2);
                this.addChild(chooseGameBtn);

                chooseGameBtns.push(chooseGameBtn);
            }
        }

        let uiLogo = PIXI.Sprite.fromImage(ImageTag.logo);
        uiLogo.anchor.set(0.5, 0.5);
        this.addChild(uiLogo);
        uiLogo.position.set(0, -SimpleGame.getDesignHeight()/2 + uiLogo.height/2);



        let btnWidth = chooseGameBtns[0].width;
        let btnSpacing = btnWidth/10;

        let startX = -SimpleGame.getDefaultWidth()/2;
        let endX = SimpleGame.getDefaultWidth()/2;
        let numOfCols = Math.floor( (endX - startX)/(btnWidth + btnSpacing) );
        //let startY = uiLogo.position.y + uiLogo.height/2 +chooseGameBtns[0].height/2;
        let startY = uiLogo.position.y + uiLogo.height/2;
        let diffY = chooseGameBtns[0].height*2.0;


        //console.log("numOfCols " + numOfCols);
        SimpleGame.arrangeList(startX, endX, numOfCols, startY, diffY, chooseGameBtns);
        //SimpleGame.recenterFunction(this);
    }


}