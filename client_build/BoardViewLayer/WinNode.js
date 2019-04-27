"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ChessGameStateEnum_1 = require("../../shared/engine/ChessGameStateEnum");
var ChessEngine_1 = require("../../shared/engine/ChessEngine");
var ChessGameResultEnum_1 = require("../../shared/engine/ChessGameResultEnum");
var app_1 = require("../app");
var LanguageHelper_1 = require("../LanguageHelper");
var WinNode = /** @class */ (function (_super) {
    __extends(WinNode, _super);
    function WinNode(m_size, chessGameState) {
        var _this = _super.call(this) || this;
        _this.m_size = m_size;
        var textTopKey = LanguageHelper_1.LanguageKey.Error;
        var textTop2Key = LanguageHelper_1.LanguageKey.Error;
        var textBottomKey = LanguageHelper_1.LanguageKey.Error;
        switch (chessGameState) {
            case ChessGameStateEnum_1.ChessGameStateEnum.NORMAL:
                textTopKey = LanguageHelper_1.LanguageKey.Error;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_CHECKMATE:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_CHECKMATE:
                textTopKey = LanguageHelper_1.LanguageKey.Checkmate;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_FORFEIT:
                textTopKey = LanguageHelper_1.LanguageKey.BlackForfeits;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_FORFEIT:
                textTopKey = LanguageHelper_1.LanguageKey.WhiteForfeits;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_RESIGN:
                textTopKey = LanguageHelper_1.LanguageKey.BlackResigns;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_RESIGN:
                textTopKey = LanguageHelper_1.LanguageKey.WhiteResigns;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_TIME:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_TIME:
                textTopKey = LanguageHelper_1.LanguageKey.TimeOut;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_50MOVES:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_AGREEMENT:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_REPETITION:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_STALEMATE:
                textTopKey = LanguageHelper_1.LanguageKey.Draw;
                break;
        }
        switch (chessGameState) {
            case ChessGameStateEnum_1.ChessGameStateEnum.NORMAL:
                textBottomKey = LanguageHelper_1.LanguageKey.Error;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_TIME:
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_RESIGN:
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_FORFEIT:
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_CHECKMATE:
                textBottomKey = LanguageHelper_1.LanguageKey.WhiteVictorious;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_TIME:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_RESIGN:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_FORFEIT:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_CHECKMATE:
                textBottomKey = LanguageHelper_1.LanguageKey.BlackVictorious;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_50MOVES:
                textBottomKey = LanguageHelper_1.LanguageKey.Move50Rule;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_AGREEMENT:
                textBottomKey = LanguageHelper_1.LanguageKey.DrawAgreement;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
                textBottomKey = LanguageHelper_1.LanguageKey.InsufficientMaerial;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_REPETITION:
                textBottomKey = LanguageHelper_1.LanguageKey.ThreefoldRepetition;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_STALEMATE:
                textBottomKey = LanguageHelper_1.LanguageKey.Stalemate;
                break;
        }
        switch (ChessEngine_1.ChessEngine.getGameResultForGameState(chessGameState)) {
            case ChessGameResultEnum_1.ChessGameResultEnum.NORMAL:
                textTop2Key = LanguageHelper_1.LanguageKey.Error;
                break;
            case ChessGameResultEnum_1.ChessGameResultEnum.WHITE_WIN:
                textTop2Key = LanguageHelper_1.LanguageKey.OneZero;
                break;
            case ChessGameResultEnum_1.ChessGameResultEnum.BLACK_WIN:
                textTop2Key = LanguageHelper_1.LanguageKey.ZeroOne;
                break;
            case ChessGameResultEnum_1.ChessGameResultEnum.DRAW:
                textTop2Key = LanguageHelper_1.LanguageKey.HalfHalf;
                break;
        }
        var textTop = LanguageHelper_1.LanguageHelper.getTextForLanguageKey(textTopKey) + " " + LanguageHelper_1.LanguageHelper.getTextForLanguageKey(textTop2Key);
        var textBottom = LanguageHelper_1.LanguageHelper.getTextForLanguageKey(textBottomKey);
        var textStyleOptions = {};
        textStyleOptions.fontSize = _this.m_size;
        textStyleOptions.fontFamily = "Helvetica";
        textStyleOptions.fill = "0x000000";
        textStyleOptions.fontWeight = "bold";
        _this.uiTopText = new PIXI.Text(textTop, textStyleOptions);
        _this.uiTopText.anchor.set(0.5, 0.5);
        _this.addChild(_this.uiTopText);
        textStyleOptions.fontSize = Math.round(_this.m_size * 0.6);
        textStyleOptions.fill = "0xFBE2B2";
        _this.uiBottomText = new PIXI.Text(textBottom, textStyleOptions);
        _this.uiBottomText.anchor.set(0.5, 0.5);
        _this.addChild(_this.uiBottomText);
        app_1.SimpleGame.arrangeVertically([_this.uiTopText, _this.uiBottomText]);
        //this.uiBottomText.position.x = this.uiTopText.position.x - this.uiTopText.width/2 + this.uiBottomText.width/2;
        var padding = 1.05;
        var _width = _this.width * padding;
        var _height = _this.height * padding;
        _this.beginFill(0xA66325, 1.0);
        _this.drawRect(-_width / 2, -_height / 2, _width, _height);
        _this.lineStyle(4, 0x000000);
        _this.moveTo(-_width / 2, -_height / 2);
        _this.lineTo(_width / 2, -_height / 2);
        _this.lineTo(_width / 2, _height / 2);
        _this.lineTo(-_width / 2, _height / 2);
        _this.lineTo(-_width / 2, -_height / 2);
        _this.uiTopText.position.x = -_width / (2 * padding) + _this.uiTopText.width / 2;
        _this.uiBottomText.position.x = -_width / (2 * padding) + _this.uiBottomText.width / 2;
        return _this;
    }
    return WinNode;
}(PIXI.Graphics));
exports.WinNode = WinNode;
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
//# sourceMappingURL=WinNode.js.map