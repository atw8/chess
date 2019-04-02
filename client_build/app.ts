/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

import {SocketClientAgent} from "./controller/SocketClientAgent";
import {Controller} from "./controller/Controller";


import {BoardView} from "./view/BoardView";

import {TimePanel} from "./otherView/TimePanel";
import {PredictPanel} from "./otherView/PredictPanel";

import 'p2';
import 'pixi';
import 'phaser';
import {ImageTag} from "./ImageTag";
import {OnGetRoomsListMessage, OnLoginGuestMessage} from "../shared/MessageTypes";


const Global = require("./Global");

export class SimpleGame {
    constructor() {
        let width = 800;
        let height = 800;
        let type = Phaser.AUTO;
        let parent = "content";
        let state = {
            "preload" : this.preload.bind(this),
            "create" : this.create.bind(this),
            "update" : this.update.bind(this)
        };

        Global.game = new Phaser.Game(width, height, type, parent, state);
    }


    private controller : Controller;
    private boardView : BoardView;


    private logo : Phaser.Image;


    public create() {
        console.debug("create");
        this.logo = new Phaser.Image(Global.game, 0, 0, ImageTag.logo);
        this.logo.anchor.set(0.5, 0.5);
        this.logo.position.set(Global.game.width/2, Global.game.height/2);

        let logoScaleX = Global.game.width/this.logo.width;
        let logoScaleY = Global.game.height/this.logo.height;
        let logoScale = Math.min(logoScaleX, logoScaleY);
        this.logo.scale.set(logoScale);

        Global.game.world.add(this.logo);



        this.controller = new Controller();
        this.controller.setOnConnectCallback(this.onConnectCallback.bind(this));
        this.controller.setOnDisconnectCallback(this.onDisconnectCallback.bind(this));
        this.controller.setOnLoginGuestCallback(this.onLoginGuestCallback.bind(this));
        this.controller.setOnGetRoomListCallback(this.onGetRoomListCallback.bind(this));



        this.boardView = new BoardView(400, 400, this.controller);
        this.boardView.position.set(Global.game.width/2, Global.game.height/2);
        Global.game.world.add(this.boardView);

        this.controller.setBoardView(this.boardView);


        let predictPanel = new PredictPanel(190, 400, 10, this.controller);
        {
            let xSeparator = (this.boardView.getWidth() + predictPanel.getWidth() ) * 0.01;

            let posX = this.boardView.position.x - this.boardView.getWidth()/2 - predictPanel.getWidth()/2 - xSeparator;
            let posY = this.boardView.position.y;

            predictPanel.position.set(posX, posY);

            Global.game.world.add(predictPanel);
        }
        //this.controller.setPredictPanel(predictPanel);



        //this.controller.startGame();


        let timePanel = new TimePanel(200, 70);
        timePanel.position.set(Global.game.width/2, Global.game.height/2 - this.boardView.getHeight()/2 - timePanel.getHeight()/2 - 10);
        Global.game.world.addChild(timePanel);


        let flipBoardButton = new Phaser.Button(Global.game, 0, 0,
            "btnGreen",
            this.flipBoardFacing, this);
            //"btnGreen", "btnGreen", "btnGreenPress", "btnGreen");
        Global.game.world.add(flipBoardButton);

        let flipBoardButtonText = new Phaser.Text(Global.game, 0, 0, "Flip Board");
        flipBoardButtonText.position.set(flipBoardButton.width/2, flipBoardButton.height/2);
        flipBoardButtonText.anchor.set(0.5, 0.5);
        flipBoardButton.addChild(flipBoardButtonText);


    }

    public flipBoardFacing(){
        console.debug("switchOnClick");

        this.boardView.flipBoardFacing();
    }




    private getLocationForImageTag(imageTag : ImageTag):string {
        let ret : string = "";
        switch(imageTag){
            case ImageTag.logo:
                ret = "image/img_logo.png";
                break;
            case ImageTag.white_pawn:
                ret = "image/icon_pawn_white.png";
                break;
            case ImageTag.black_pawn:
                ret = "image/icon_pawn_black.png";
                break;
            case ImageTag.white_knight:
                ret = "image/icon_knight_white.png";
                break;
            case ImageTag.black_knight:
                ret = "image/icon_knight_black.png";
                break;
            case ImageTag.white_bishop:
                ret = "image/icon_bishop_white.png";
                break;
            case ImageTag.black_bishop:
                ret = "image/icon_bishop_black.png";
                break;
            case ImageTag.white_rook:
                ret = "image/icon_rook_white.png";
                break;
            case ImageTag.black_rook:
                ret = "image/icon_rook_black.png";
                break;
            case ImageTag.white_queen:
                ret = "image/icon_queen_white.png";
                break;
            case ImageTag.black_queen:
                ret = "image/icon_queen_black.png";
                break;
            case ImageTag.white_king:
                ret = "image/icon_king_white.png";
                break;
            case ImageTag.black_king:
                ret = "image/icon_king_black.png";
                break;
            case ImageTag.select_light:
                ret = "image/selectLightSprite.png";
                break;
            case ImageTag.option_light:
                ret = "image/optionCycleSprite.png";
                break;
            case ImageTag.pointGreen:
                ret = "image/pointGreen.png";
                break;
            case ImageTag.pointRed:
                ret = "image/pointRed.png";
                break;
            case ImageTag.pointYellow:
                ret = "image/pointYellow.png";
                break;
            case ImageTag.squareBlue:
                ret = "image/squareBlue.png";
                break;
            case ImageTag.squareGreen:
                ret = "image/squareGreen.png";
                break;
            case ImageTag.squareRed:
                ret = "image/squareRed.png";
                break;
            case ImageTag.btnGreen:
                ret = "image/btn_play_green_little.png";
                break;
            case ImageTag.btnGreenPress:
                ret = "image/btn_play_green_little_press.png";
                break;
            case ImageTag.btnPrompt:
                ret = "image/btn_prompt.png";
                break;
            case ImageTag.btnPromptPress:
                ret = "image/btn_prompt_press.png";
                break;
        }

        return ret;
    }

    public preload(){
        console.debug("preload");

        let imageTags : ImageTag[] = [];
        imageTags.push(ImageTag.logo);

        imageTags.push(ImageTag.white_pawn);
        imageTags.push(ImageTag.black_pawn);
        imageTags.push(ImageTag.white_knight);
        imageTags.push(ImageTag.black_knight);
        imageTags.push(ImageTag.white_bishop);
        imageTags.push(ImageTag.black_bishop);
        imageTags.push(ImageTag.white_rook);
        imageTags.push(ImageTag.black_rook);
        imageTags.push(ImageTag.white_queen);
        imageTags.push(ImageTag.black_queen);
        imageTags.push(ImageTag.white_king);
        imageTags.push(ImageTag.black_king);

        imageTags.push(ImageTag.select_light);

        imageTags.push(ImageTag.option_light);

        imageTags.push(ImageTag.pointGreen);
        imageTags.push(ImageTag.pointRed);
        imageTags.push(ImageTag.pointYellow);

        imageTags.push(ImageTag.squareBlue);
        imageTags.push(ImageTag.squareGreen);
        imageTags.push(ImageTag.squareRed);

        imageTags.push(ImageTag.btnGreen);
        imageTags.push(ImageTag.btnGreenPress);

        imageTags.push(ImageTag.btnPrompt);
        imageTags.push(ImageTag.btnPromptPress);

        for(let i = 0; i < imageTags.length; i++){
            let imageTag = imageTags[i];
            Global.game.load.image(imageTag, this.getLocationForImageTag(imageTag));
        }
    }

    public update(){

    }





    public onConnectCallback(){
        console.log("app.onConnectCallback");
    }
    public onDisconnectCallback(){
        console.log("app.onDisconnectCallback");
    }
    public onLoginGuestCallback(onLoginGuestMessage : OnLoginGuestMessage){
        console.log("app.onLoginGuestCallback");
    }
    public onGetRoomListCallback(onGetRoomListMessage : OnGetRoomsListMessage){
        console.log("app.onGetRoomListCallback");
    }
}

window.onload = () => {
    let simpleGame = new SimpleGame();
};