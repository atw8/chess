import {ChessGameStateEnum} from "../../shared/engine/ChessGameStateEnum";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {ChessGameResultEnum} from "../../shared/engine/ChessGameResultEnum";
import {SimpleGame} from "../app";
import {LanguageHelper, LanguageKey} from "../LanguageHelper";

export class WinNode extends PIXI.Graphics {
    private m_size : number;

    private uiTopText : PIXI.Text;
    private uiBottomText : PIXI.Text;

    constructor(m_size : number, chessGameState : ChessGameStateEnum) {
        super();

        this.m_size = m_size;


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
            case ChessGameStateEnum.DRAW_AGREEMENT:
            case ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
            case ChessGameStateEnum.DRAW_REPETITION:
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
            case ChessGameStateEnum.DRAW_AGREEMENT:
                textBottomKey = LanguageKey.DrawAgreement;
                break;
            case ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
                textBottomKey = LanguageKey.InsufficientMaerial;
                break;
            case ChessGameStateEnum.DRAW_REPETITION:
                textBottomKey = LanguageKey.ThreefoldRepetition;
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


        let textStyleOptions : PIXI.TextStyleOptions = {};
        textStyleOptions.fontSize = this.m_size;
        textStyleOptions.fontFamily = "Helvetica";
        textStyleOptions.fill = "0x000000";
        textStyleOptions.fontWeight = "bold";
        this.uiTopText = new PIXI.Text(textTop, textStyleOptions);
        this.uiTopText.anchor.set(0.5, 0.5);
        this.addChild(this.uiTopText);


        textStyleOptions.fontSize = Math.round(this.m_size*0.6);
        textStyleOptions.fill = "0xFBE2B2";
        this.uiBottomText = new PIXI.Text(textBottom, textStyleOptions);
        this.uiBottomText.anchor.set(0.5, 0.5);
        this.addChild(this.uiBottomText);

        SimpleGame.arrangeVertically([this.uiTopText, this.uiBottomText]);

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
