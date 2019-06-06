import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {ChessGameResultEnum} from "../../shared/engine/ChessGameResultEnum";
import {SimpleGame} from "../app";
import {LanguageHelper, LanguageKey} from "../LanguageHelper";
import * as PIXI from "pixi.js";

export class WinNode extends PIXI.Graphics {
    private m_size : number;
    private onOkCallback : () => void;

    private uiTopText : PIXI.Text;
    private uiBottomText : PIXI.Text;

    private uiOkButton : PIXI.Graphics;

    constructor(m_size : number, chessGameState : ChessGameStateEnum, onOkCallback : () => void) {
        super();

        this.m_size = m_size;
        this.onOkCallback = onOkCallback;


        let textTopKey : LanguageKey = LanguageKey.Error;
        let textTop2Key : LanguageKey = LanguageKey.Error;
        let textBottomKey : LanguageKey = LanguageKey.Error;

        switch (chessGameState) {
            case ChessGameStateEnum.NORMAL:
                textTopKey = LanguageKey.Error;
                break;
            case ChessGameStateEnum.WHITE_WIN_CHECKMATE:
            case ChessGameStateEnum.BLACK_WIN_CHECKMATE:
                textTopKey = LanguageKey.Checkmate;
                break;

            case ChessGameStateEnum.WHITE_WIN_FORFEIT:
                textTopKey = LanguageKey.BlackForfeits;
                break;
            case ChessGameStateEnum.BLACK_WIN_FORFEIT:
                textTopKey = LanguageKey.WhiteForfeits;
                break;

            case ChessGameStateEnum.WHITE_WIN_RESIGN:
                textTopKey = LanguageKey.BlackResigns;
                break;
            case ChessGameStateEnum.BLACK_WIN_RESIGN:
                textTopKey = LanguageKey.WhiteResigns;
                break;

            case ChessGameStateEnum.WHITE_WIN_TIME:
            case ChessGameStateEnum.BLACK_WIN_TIME:
                textTopKey = LanguageKey.TimeOut;
                break;

            case ChessGameStateEnum.DRAW_50MOVES:
            case ChessGameStateEnum.DRAW_75MOVES:
            case ChessGameStateEnum.DRAW_AGREEMENT:
            case ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
            case ChessGameStateEnum.DRAW_THREEFOLD_REPETITION:
            case ChessGameStateEnum.DRAW_FIVEFOLD_REPETITION:
            case ChessGameStateEnum.DRAW_STALEMATE:
                textTopKey = LanguageKey.Draw;
                break;
        }

        switch(chessGameState){
            case ChessGameStateEnum.NORMAL:
                textBottomKey = LanguageKey.Error;
                break;
            case ChessGameStateEnum.WHITE_WIN_TIME:
            case ChessGameStateEnum.WHITE_WIN_RESIGN:
            case ChessGameStateEnum.WHITE_WIN_FORFEIT:
            case ChessGameStateEnum.WHITE_WIN_CHECKMATE:
                textBottomKey = LanguageKey.WhiteVictorious;
                break;
            case ChessGameStateEnum.BLACK_WIN_TIME:
            case ChessGameStateEnum.BLACK_WIN_RESIGN:
            case ChessGameStateEnum.BLACK_WIN_FORFEIT:
            case ChessGameStateEnum.BLACK_WIN_CHECKMATE:
                textBottomKey = LanguageKey.BlackVictorious;
                break;
            case ChessGameStateEnum.DRAW_50MOVES:
                textBottomKey = LanguageKey.Move50Rule;
                break;
            case ChessGameStateEnum.DRAW_75MOVES:
                textBottomKey = LanguageKey.Move75Rule;
                break;
            case ChessGameStateEnum.DRAW_AGREEMENT:
                textBottomKey = LanguageKey.DrawAgreement;
                break;
            case ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
                textBottomKey = LanguageKey.InsufficientMaerial;
                break;
            case ChessGameStateEnum.DRAW_THREEFOLD_REPETITION:
                textBottomKey = LanguageKey.ThreefoldRepetition;
                break;
            case ChessGameStateEnum.DRAW_FIVEFOLD_REPETITION:
                textBottomKey = LanguageKey.FivefoldRepetition;
                break;
            case ChessGameStateEnum.DRAW_STALEMATE:
                textBottomKey = LanguageKey.Stalemate;
                break;

        }

        switch(ChessEngine.getGameResultForGameState(chessGameState)){
            case ChessGameResultEnum.NORMAL:
                textTop2Key = LanguageKey.Error;
                break;
            case ChessGameResultEnum.WHITE_WIN:
                textTop2Key = LanguageKey.OneZero;
                break;
            case ChessGameResultEnum.BLACK_WIN:
                textTop2Key = LanguageKey.ZeroOne;
                break;
            case ChessGameResultEnum.DRAW:
                textTop2Key = LanguageKey.HalfHalf;
                break;
        }


        let textTop = LanguageHelper.getTextForLanguageKey(textTopKey) + " " + LanguageHelper.getTextForLanguageKey(textTop2Key);
        let textBottom = LanguageHelper.getTextForLanguageKey(textBottomKey);


        this.uiTopText = new PIXI.Text(textTop, SimpleGame.getDefaultTextStyleOptions(this.m_size));
        this.uiTopText.anchor.set(0.5, 0.5);
        this.addChild(this.uiTopText);


        let textStyleOptions = SimpleGame.getDefaultTextStyleOptions(this.m_size*0.6);
        textStyleOptions.fill = SimpleGame.getLightBrownColor();
        this.uiBottomText = new PIXI.Text(textBottom, textStyleOptions);
        this.uiBottomText.anchor.set(0.5, 0.5);
        this.addChild(this.uiBottomText);


        /*
            public static getLightBrownColor():number{
        return 0xFBE2B2;
    }
    public static getDarkBrownColor():number{
        return 0xA66325;
    }
    public static getWhiteColor():number{
        return 0xFFFFFF;
    }
    public static getBlackColor():number{
        return 0x000000;
    }

         */



        this.uiOkButton = new PIXI.Graphics();
        {
            let uiOkText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.Ok), SimpleGame.getDefaultTextStyleOptions(this.m_size));
            uiOkText.anchor.set(0.5, 0.5);


            let width = uiOkText.width*1.2;
            let height = uiOkText.height*1.2;

            this.uiOkButton.beginFill(SimpleGame.getWhiteColor(), 1.0);
            this.uiOkButton.lineStyle(5,  SimpleGame.getBlackColor(), 1.0);
            this.uiOkButton.drawRoundedRect(-width/2, -height/2, width, height, 4);

            this.uiOkButton.addChild(uiOkText);
            //uiOkText.position.x = 0;//this.uiOkButton.width/2;
            //uiOkText.position.y = this.uiOkButton.height/2;
        }

        this.addChild(this.uiOkButton);





        SimpleGame.arrangeVertically([this.uiTopText, this.uiBottomText, this.uiOkButton]);

        //this.uiBottomText.position.x = this.uiTopText.position.x - this.uiTopText.width/2 + this.uiBottomText.width/2;


        let padding = 1.05;
        let _width = this.width*padding;
        let _height = this.height*padding;


        this.beginFill(0xA66325, 1.0);
        this.drawRect(-_width/2, -_height/2, _width, _height);
        this.lineStyle(4, 0x000000);
        this.moveTo(-_width/2, -_height/2);
        this.lineTo(_width/2, -_height/2);
        this.lineTo(_width/2, _height/2);
        this.lineTo(-_width/2, _height/2);
        this.lineTo(-_width/2, -_height/2);

        this.uiTopText.position.x = -_width/(2*padding) + this.uiTopText.width/2;
        this.uiBottomText.position.x = -_width/(2*padding) + this.uiBottomText.width/2;

        this.uiOkButton.position.x = _width/(2*padding) - this.uiOkButton.width/2;


        let onUp = ()=>{
            this.uiOkButton.scale.set(1.0, 1.0);
        };
        let onDown = ()=>{
            this.uiOkButton.scale.set(0.9, 0.9);
        };

        SimpleGame.addBtnProperties(this.uiOkButton, onUp, onDown, this.onOkCallback);
    }

}




/*
switch (ChessEngine.getGameResultForGameState(chessGameState)) {
    case ChessGameResultEnum.NORMAL:
        break;
    case ChessGameResultEnum.DRAW:
        text = "\u00BD-\u00BD Draw";
        break;
    case ChessGameResultEnum.WHITE_WIN:
        text = "1-0 White Win";
        break;
    case ChessGameResultEnum.BLACK_WIN:
        text = "0-1 Black Win";
        break;
}
*/

//textStyleOptions.fontStyle = "0xFFFFFF";


/*
let filter = new PIXI.filters.BlurFilter();


filter.blur = 20;

let blurTween = new TWEEN.Tween({blur : filter.blur});
blurTween.to({blur : 0}, 2000);
blurTween.onUpdate((o : any) => {
    filter.blur = o.blur;
});
blurTween.start();
*/



//let emitterProperties : PIXI.particles.ParticleContainerProperties = {};

/*
let emitterConfig : particles.EmitterConfig = {
    lifetime: {
        min: 2.0,
        max: 2.0
    },
    frequency: 0.5,
    pos: {
        x: 0,
        y: 0
    }};



emitterConfig.autoUpdate = true;
emitterConfig.alpha = {list: [{value: 0, time: 0}, {value: 1, time: 0.5}, {value: 0, time: 1.0}], isStepped: false};
emitterConfig.scale =  {list: [{value: 0, time: 0}, {value: 1, time: 0.5}, {value: 0, time: 1.0 }], isStepped: false};
emitterConfig.color = {list: [{value: "ffffff", time: 0}, {value: "FBE2B2", time: 1}], isStepped: false};
//emitterConfig.speed = {list: [{value: 200, time: 0}, {value: 100, time: 1}], isStepped: false};
emitterConfig.maxParticles = 1000;
emitterConfig.addAtBack = true;
emitterConfig.spawnType = "rect";
emitterConfig.spawnRect = {x : -this.uiText.width/2, y : -this.uiText.height/2, w : this.uiText.width, h : this.uiText.height};
/*
{,
 ,
    startRotation: {
        min: 0,
        max: 360
    },
    rotationSpeed: {
        min: 0,
        max: 0
    },
    frequency: 0.008,
    spawnChance: 1,
    particlesPerWave: 1,
    emitterLifetime: 0.31,
    maxParticles: 1000,
,
    addAtBack: false,
    spawnType: "circle",
    spawnCircle: {
        x: 0,
        y: 0,
        r: 10
    }};


emitterConfig.emitterLifetime = -1;
let myEmitter: particles.Emitter = new particles.Emitter(this, getNameForImageTag(ImageTag.particle), emitterConfig);
*/
