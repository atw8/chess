"use strict";
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = require("./controller/Controller");
const BoardView_1 = require("./view/BoardView");
const TimePanel_1 = require("./otherView/TimePanel");
const PredictPanel_1 = require("./otherView/PredictPanel");
require("p2");
require("pixi");
require("phaser");
const ImageTag_1 = require("./ImageTag");
const Global = require("./Global");
class SimpleGame {
    constructor() {
        let width = 800;
        let height = 800;
        let type = Phaser.AUTO;
        let parent = "content";
        let state = {
            "preload": this.preload.bind(this),
            "create": this.create.bind(this),
            "update": this.update.bind(this)
        };
        Global.game = new Phaser.Game(width, height, type, parent, state);
    }
    create() {
        console.debug("create");
        this.logo = new Phaser.Image(Global.game, 0, 0, ImageTag_1.ImageTag.logo);
        this.logo.anchor.set(0.5, 0.5);
        this.logo.position.set(Global.game.width / 2, Global.game.height / 2);
        let logoScaleX = Global.game.width / this.logo.width;
        let logoScaleY = Global.game.height / this.logo.height;
        let logoScale = Math.min(logoScaleX, logoScaleY);
        this.logo.scale.set(logoScale);
        Global.game.world.add(this.logo);
        this.controller = new Controller_1.Controller();
        this.controller.setOnConnectCallback(this.onConnectCallback.bind(this));
        this.controller.setOnDisconnectCallback(this.onDisconnectCallback.bind(this));
        this.controller.setOnLoginGuestCallback(this.onLoginGuestCallback.bind(this));
        this.controller.setOnGetRoomListCallback(this.onGetRoomListCallback.bind(this));
        this.boardView = new BoardView_1.BoardView(400, 400, this.controller);
        this.boardView.position.set(Global.game.width / 2, Global.game.height / 2);
        Global.game.world.add(this.boardView);
        this.controller.setBoardView(this.boardView);
        let predictPanel = new PredictPanel_1.PredictPanel(190, 400, 10, this.controller);
        {
            let xSeparator = (this.boardView.getWidth() + predictPanel.getWidth()) * 0.01;
            let posX = this.boardView.position.x - this.boardView.getWidth() / 2 - predictPanel.getWidth() / 2 - xSeparator;
            let posY = this.boardView.position.y;
            predictPanel.position.set(posX, posY);
            Global.game.world.add(predictPanel);
        }
        //this.controller.setPredictPanel(predictPanel);
        //this.controller.startGame();
        let timePanel = new TimePanel_1.TimePanel(200, 70);
        timePanel.position.set(Global.game.width / 2, Global.game.height / 2 - this.boardView.getHeight() / 2 - timePanel.getHeight() / 2 - 10);
        Global.game.world.addChild(timePanel);
        let flipBoardButton = new Phaser.Button(Global.game, 0, 0, "btnGreen", this.flipBoardFacing, this);
        //"btnGreen", "btnGreen", "btnGreenPress", "btnGreen");
        Global.game.world.add(flipBoardButton);
        let flipBoardButtonText = new Phaser.Text(Global.game, 0, 0, "Flip Board");
        flipBoardButtonText.position.set(flipBoardButton.width / 2, flipBoardButton.height / 2);
        flipBoardButtonText.anchor.set(0.5, 0.5);
        flipBoardButton.addChild(flipBoardButtonText);
    }
    flipBoardFacing() {
        console.debug("switchOnClick");
        this.boardView.flipBoardFacing();
    }
    getLocationForImageTag(imageTag) {
        let ret = "";
        switch (imageTag) {
            case ImageTag_1.ImageTag.logo:
                ret = "image/img_logo.png";
                break;
            case ImageTag_1.ImageTag.white_pawn:
                ret = "image/icon_pawn_white.png";
                break;
            case ImageTag_1.ImageTag.black_pawn:
                ret = "image/icon_pawn_black.png";
                break;
            case ImageTag_1.ImageTag.white_knight:
                ret = "image/icon_knight_white.png";
                break;
            case ImageTag_1.ImageTag.black_knight:
                ret = "image/icon_knight_black.png";
                break;
            case ImageTag_1.ImageTag.white_bishop:
                ret = "image/icon_bishop_white.png";
                break;
            case ImageTag_1.ImageTag.black_bishop:
                ret = "image/icon_bishop_black.png";
                break;
            case ImageTag_1.ImageTag.white_rook:
                ret = "image/icon_rook_white.png";
                break;
            case ImageTag_1.ImageTag.black_rook:
                ret = "image/icon_rook_black.png";
                break;
            case ImageTag_1.ImageTag.white_queen:
                ret = "image/icon_queen_white.png";
                break;
            case ImageTag_1.ImageTag.black_queen:
                ret = "image/icon_queen_black.png";
                break;
            case ImageTag_1.ImageTag.white_king:
                ret = "image/icon_king_white.png";
                break;
            case ImageTag_1.ImageTag.black_king:
                ret = "image/icon_king_black.png";
                break;
            case ImageTag_1.ImageTag.select_light:
                ret = "image/selectLightSprite.png";
                break;
            case ImageTag_1.ImageTag.option_light:
                ret = "image/optionCycleSprite.png";
                break;
            case ImageTag_1.ImageTag.pointGreen:
                ret = "image/pointGreen.png";
                break;
            case ImageTag_1.ImageTag.pointRed:
                ret = "image/pointRed.png";
                break;
            case ImageTag_1.ImageTag.pointYellow:
                ret = "image/pointYellow.png";
                break;
            case ImageTag_1.ImageTag.squareBlue:
                ret = "image/squareBlue.png";
                break;
            case ImageTag_1.ImageTag.squareGreen:
                ret = "image/squareGreen.png";
                break;
            case ImageTag_1.ImageTag.squareRed:
                ret = "image/squareRed.png";
                break;
            case ImageTag_1.ImageTag.btnGreen:
                ret = "image/btn_play_green_little.png";
                break;
            case ImageTag_1.ImageTag.btnGreenPress:
                ret = "image/btn_play_green_little_press.png";
                break;
            case ImageTag_1.ImageTag.btnPrompt:
                ret = "image/btn_prompt.png";
                break;
            case ImageTag_1.ImageTag.btnPromptPress:
                ret = "image/btn_prompt_press.png";
                break;
        }
        return ret;
    }
    preload() {
        console.debug("preload");
        let imageTags = [];
        imageTags.push(ImageTag_1.ImageTag.logo);
        imageTags.push(ImageTag_1.ImageTag.white_pawn);
        imageTags.push(ImageTag_1.ImageTag.black_pawn);
        imageTags.push(ImageTag_1.ImageTag.white_knight);
        imageTags.push(ImageTag_1.ImageTag.black_knight);
        imageTags.push(ImageTag_1.ImageTag.white_bishop);
        imageTags.push(ImageTag_1.ImageTag.black_bishop);
        imageTags.push(ImageTag_1.ImageTag.white_rook);
        imageTags.push(ImageTag_1.ImageTag.black_rook);
        imageTags.push(ImageTag_1.ImageTag.white_queen);
        imageTags.push(ImageTag_1.ImageTag.black_queen);
        imageTags.push(ImageTag_1.ImageTag.white_king);
        imageTags.push(ImageTag_1.ImageTag.black_king);
        imageTags.push(ImageTag_1.ImageTag.select_light);
        imageTags.push(ImageTag_1.ImageTag.option_light);
        imageTags.push(ImageTag_1.ImageTag.pointGreen);
        imageTags.push(ImageTag_1.ImageTag.pointRed);
        imageTags.push(ImageTag_1.ImageTag.pointYellow);
        imageTags.push(ImageTag_1.ImageTag.squareBlue);
        imageTags.push(ImageTag_1.ImageTag.squareGreen);
        imageTags.push(ImageTag_1.ImageTag.squareRed);
        imageTags.push(ImageTag_1.ImageTag.btnGreen);
        imageTags.push(ImageTag_1.ImageTag.btnGreenPress);
        imageTags.push(ImageTag_1.ImageTag.btnPrompt);
        imageTags.push(ImageTag_1.ImageTag.btnPromptPress);
        for (let i = 0; i < imageTags.length; i++) {
            let imageTag = imageTags[i];
            Global.game.load.image(imageTag, this.getLocationForImageTag(imageTag));
        }
    }
    update() {
    }
    onConnectCallback() {
        console.log("app.onConnectCallback");
    }
    onDisconnectCallback() {
        console.log("app.onDisconnectCallback");
    }
    onLoginGuestCallback(onLoginGuestMessage) {
        console.log("app.onLoginGuestCallback");
    }
    onGetRoomListCallback(onGetRoomListMessage) {
        console.log("app.onGetRoomListCallback");
    }
}
exports.SimpleGame = SimpleGame;
window.onload = () => {
    let simpleGame = new SimpleGame();
};
//# sourceMappingURL=app.js.map