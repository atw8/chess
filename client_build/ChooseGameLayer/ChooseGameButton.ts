/*
import {RoomInitConfig} from "../../shared/MessageTypes";
import {SimpleGame} from "../app";
import {SideType} from "../../shared/engine/SideType";
import {GameTimeType} from "../../shared/gameTime/GameTimeType";

export class ChooseGameButton extends PIXI.display.Layer {
    private roomInitConfig : RoomInitConfig;
    private m_size : number;
    private onClickCallback : (roomInitConfig : RoomInitConfig) => void;


    constructor(roomInitConfig : RoomInitConfig, m_size : number, onClickCallback : (roomInitConfig : RoomInitConfig) => void){
        super();
        this.group.enableSort = true;

        this.roomInitConfig = roomInitConfig;
        this.m_size = m_size;
        this.onClickCallback = onClickCallback;



        //Create the title
        let titleText : string;
        if(roomInitConfig.isChess960){
            titleText = "Chess960";
        }else {
            titleText = "Chess";
        }

        let titleTextStyleOptions : PIXI.TextStyleOptions = SimpleGame.getDefaultTextStyleOptions(this.m_size/7);
        titleTextStyleOptions.fill = SimpleGame.getDarkBrownColor();
        let uiTitleText : PIXI.Text = new PIXI.Text(titleText, titleTextStyleOptions);
        uiTitleText.anchor.set(0.5, 0.5);

        this.addChild(uiTitleText);


        //Create the time
        let timeText : string = "";
        switch(roomInitConfig.gameTimeStructs[SideType.WHITE].timeType){
            case GameTimeType.INFINITE:
                timeText = "Infinite";
                break;
            case GameTimeType.MOVE:
            {
                let totalTime = <number>(roomInitConfig.gameTimeStructs[SideType.WHITE].totalTime);
                timeText = (totalTime / 1000).toString() + "s per move";
            }

                break;
            case GameTimeType.NORMAL:
            {
                let totalTime = <number>(roomInitConfig.gameTimeStructs[SideType.WHITE].totalTime);
                let incrTime = <number>(roomInitConfig.gameTimeStructs[SideType.WHITE].incrTime);

                timeText = (totalTime / 1000).toString() + "+" + (incrTime / 1000).toString();
            }
                break;
        }

        let timeTextStyleOptions : PIXI.TextStyleOptions = SimpleGame.getDefaultTextStyleOptions(this.m_size/10);
        let uiTimeText : PIXI.Text = new PIXI.Text(timeText, timeTextStyleOptions);
        uiTimeText.anchor.set(0.5, 0.5);
        this.addChild(uiTimeText);





        let _width = this.m_size;
        let _height = uiTimeText.height * 1.5;

        let uiRect = new PIXI.Graphics();
        //uiRect.lineColor = 0xFFFFFF;
        uiRect.lineStyle(5,  SimpleGame.getBlackColor(), 1.0);
        uiRect.beginFill(SimpleGame.getLightBrownColor());
        uiRect.drawRoundedRect(-_width/2, -_height/2, _width, _height, 10);
        uiRect.zIndex = -1;
        this.addChild(uiRect);

        //uiRect.arc(-_width/2, -_height/2, 10, 0, 90);



        //uiRect.drawEllipse(-_width/2, -_height/2, _width, _height, 10);


        uiTitleText.position.y = uiRect.position.y - uiRect.height/2 - uiTitleText.height*0.35;
        uiTitleText.position.x = uiRect.position.x - uiRect.width/2 + uiTitleText.width/2 + uiRect.width*0.05;

        uiTimeText.position.x = uiRect.position.x - uiRect.width/2 + uiTimeText.width/2 + uiRect.width*0.1;





        SimpleGame.recenterFunction(this);
        //SimpleGame.arrangeVertically([uiTitleText, uiTimeStyleText]);


        //this.beginFill(SimpleGame.getLightBrownColor());
        //this.drawRoundedRect(-_width/2, -_height/2, _width, _height, 5);

        //this.beginFill(SimpleGame.getLightBrownColor());
        //this.drawRoundedRect(-this.m_size/2,)


        SimpleGame.addBtnProperties(this, this.onUp.bind(this), this.onDown.bind(this), this.onClick.bind(this));
    }

    public onClick(){
        console.log("onClick");
        this.onUp();

        this.onClickCallback(this.roomInitConfig);
    }

    public onDown(){
        this.scale.set(0.9)
    }
    public onUp(){
        this.scale.set(1.0);
    }

}
*/
