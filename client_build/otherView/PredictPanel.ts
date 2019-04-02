import {PredictSanSprite} from "./PredictSanSprite";
import {SanSprite} from "./SanSprite";
import {SideType} from "../../shared/engine/SideType";
import {Controller} from "./../controller/Controller";
import {PositionManager} from "../view/PositionControl/PositionManager";
import {PositionConstantSpeed} from "../view/PositionControl/PositionConstantSpeed";

import 'p2';
import 'pixi';
import 'phaser';

const Global = require("./../Global");

export class PredictPanel extends Phaser.Graphics {

    private uiMyMoveText : Phaser.Text;
    private uiMyMoveSprite : PredictSanSprite;

    private uiVotedMovesText : Phaser.Text;
    private uiVotedMovesSprites : { [key : string] : { sprite : PredictSanSprite, lastRowPosition : number, newRowPosition : number } };

    public uiMask : Phaser.Graphics;


    private m_width : number;
    public getWidth():number {
        return this.m_width;
    }
    private m_height : number;
    public getHeight():number{
        return this.m_height;
    }
    private m_numOfRows : number;
    public getNumOfRows():number{
        return this.m_numOfRows;
    }


    private m_moveTurn : SideType;
    public setMoveTurn(moveTurn : SideType){
        this.m_moveTurn = moveTurn;
    }
    public getMoveTurn():SideType{
        return this.m_moveTurn;
    }



    private controller : Controller;
    private positionManager : PositionManager;



    constructor(width : number, height : number, numOfRows : number, controller : Controller){
        super(Global.game);

        this.m_width = width;
        this.m_height = height;
        this.m_numOfRows = numOfRows;
        this.m_moveTurn = SideType.WHITE;

        this.controller = controller;



        this.uiMask = new Phaser.Graphics(Global.game, 0, 0);
        this.uiMask.beginFill(0xFFFFFF);
        this.uiMask.drawRoundedRect(-this.m_width/2, -this.m_height/2, this.m_width, this.m_height, 10);
        this.addChild(this.uiMask);

        this.mask = this.uiMask;



        this.beginFill(0xFBE2B2);
        this.drawRect(-this.m_width/2, -this.m_height/2, this.m_width, this.m_height);



        {
            this.uiMyMoveText = new Phaser.Text(Global.game, 0, 0, "My Move");
            this.uiMyMoveText.anchor.set(0.5, 0.5);
            this.uiMyMoveText.position = this.getPositionForRow(0);

            let scale = this.getRowHeight()/this.uiMyMoveText.height;
            this.uiMyMoveText.scale.set(scale, scale);

            this.addChild(this.uiMyMoveText);
        }
        {
            this.uiMyMoveSprite = new PredictSanSprite(this.getRowWidth(), this.getRowHeight(), this.m_moveTurn, this.predictSanSpriteCallback.bind(this, true));
            this.uiMyMoveSprite.position = this.getPositionForRow(1);
            this.addChild(this.uiMyMoveSprite);
        }
        {
            this.uiVotedMovesText = new Phaser.Text(Global.game, 0, 0, "Voted Moves");
            this.uiVotedMovesText.anchor.set(0.5, 0.5);
            this.uiVotedMovesText.position = this.getPositionForRow(2);


            let scale = this.getRowHeight()/this.uiVotedMovesText.height;
            this.uiVotedMovesText.scale.set(scale, scale);

            this.addChild(this.uiVotedMovesText);
        }

        this.uiVotedMovesSprites = {};
        this.positionManager = new PositionManager();
    }


    private getPositionForRow(row : number):Phaser.Point {
        let ret = new Phaser.Point();

        let minY = -this.m_height/2 + this.getTopOffset();

        let maxY = this.m_height/2 - this.getBottomOFfset();
        ret.y = minY + (maxY - minY)* ( row/(this.m_numOfRows - 1) );
        ret.x = 0;

        return ret;
    }

    private getTopOffset():number{
        return 30;
    }
    private getBottomOFfset():number{
        return 30;
    }
    private getRowSeparator():number{
        return 3;
    }

    private getRowHeight():number{
        return (this.m_height - this.getTopOffset() - this.getBottomOFfset() - (this.m_numOfRows - 1)*this.getRowSeparator())/this.m_numOfRows;
    }
    private getRowWidth():number{
        return this.m_width*0.95;
    }






    public setPredictMove(sanStr : string, isPredictMove : boolean){
        if(this.uiMyMoveSprite.getSanStr() == sanStr){
            this.uiMyMoveSprite.setIsPredictMove(isPredictMove)
        }

        if(sanStr in this.uiVotedMovesSprites){
            this.uiVotedMovesSprites[sanStr].sprite.setIsPredictMove(isPredictMove);
        }
    }
    public isPredictMove(sanStr : string):boolean {
        let ret : boolean = false;
        if(this.uiMyMoveSprite.getSanStr() == sanStr){
            if(this.uiMyMoveSprite.getIsPredictMove()){
                ret = true;
            }
        }

        if(sanStr in this.uiVotedMovesSprites){
            if(this.uiVotedMovesSprites[sanStr].sprite.getIsPredictMove()){
                ret = true;
            }
        }

        return ret;
    }






    public setMyMoveSanStr(sanStr : string | null):string | null{
        let ret = this.uiMyMoveSprite.getSanStr();

        this.uiMyMoveSprite.setSanStr(sanStr);

        return ret;
    }
    public setMyMovePercentage(percentage : number | null):number | null{
        let ret = this.uiMyMoveSprite.getPercentage();

        this.uiMyMoveSprite.setPercentage(percentage);

        return ret;
    }

    public setVotedMoves(votedDatas : { sanStr : string, percentage : number}[]):string[]{
        votedDatas.sort((a:{ sanStr : string, percentage : number}, b:{ sanStr : string, percentage : number})=>{
            return  b.percentage - a.percentage;
        });

        while(votedDatas.length > this.m_numOfRows - 4){
            votedDatas.pop();
        }

        let votedSanMap : { [key : string] : { sanStr : string, percentage : number, rowPosition : number}} = {};
        for(let i = 0; i < votedDatas.length; i++){
            let votedData = votedDatas[i];
            votedSanMap[votedDatas[i].sanStr] = {sanStr : votedData.sanStr, percentage : votedData.percentage, rowPosition : i + 3};
        }


        //remove all the old uiVotedMoveSprites
        let removeUiVotedMoveSprites : string[] = [];
        for(let sanStr in this.uiVotedMovesSprites){
            if(votedSanMap[sanStr] == undefined){
                removeUiVotedMoveSprites.push(sanStr);
            }
        }
        for(let i = 0; i < removeUiVotedMoveSprites.length; i++){
            let sanStr = removeUiVotedMoveSprites[i];
            let uiVotedMoveSprite = this.uiVotedMovesSprites[sanStr];
            delete this.uiVotedMovesSprites[sanStr];

            let sprite = uiVotedMoveSprite.sprite;

            let removeTween = new Phaser.Tween(sprite, Global.game, Global.game.tweens);
            removeTween.to( {alpha : 0.0}, 500);
            removeTween.onComplete.add(()=>{
                this.removeChild(sprite);
            }, this);

            removeTween.start();
        }

        //Add all the new uiVotedMoveSprites
        let addUiVotedMoveSprites : string[] = [];
        for(let sanStr in votedSanMap){
            if(this.uiVotedMovesSprites[sanStr] == undefined){
                addUiVotedMoveSprites.push(sanStr);
            }
        }
        for(let i = 0; i < addUiVotedMoveSprites.length; i++){
            let sanStr = addUiVotedMoveSprites[i];
            let votedData : { sanStr : string, percentage : number, rowPosition : number}  = votedSanMap[sanStr];

            let sprite = new PredictSanSprite(this.getRowWidth(), this.getRowHeight(), this.m_moveTurn, this.predictSanSpriteCallback.bind(this, false));
            sprite.position = this.getPositionForRow(votedData.rowPosition);
            sprite.setSanStr(sanStr);
            sprite.setPercentage(votedData.percentage);
            this.addChild(sprite);

            if(this.isPredictMove(sanStr)){
                sprite.setIsPredictMove(true);
            }

            sprite.alpha = 0.0;

            let addTween = new Phaser.Tween(sprite, Global.game, Global.game.tweens);
            addTween.to({alpha : 1.0}, 500);
            addTween.start();



            this.uiVotedMovesSprites[sanStr] = { sprite : sprite, lastRowPosition : votedData.rowPosition, newRowPosition : votedData.rowPosition};
        }


        //Update all the percentages, and the positions
        for(let sanStr in this.uiVotedMovesSprites){
            this.uiVotedMovesSprites[sanStr].sprite.setPercentage(votedSanMap[sanStr].percentage);
            this.uiVotedMovesSprites[sanStr].newRowPosition = votedSanMap[sanStr].rowPosition;
        }

        //Make all the sprites move into the rightful position
        for(let sanStr in this.uiVotedMovesSprites){
            let uiVotedMoveSprite = this.uiVotedMovesSprites[sanStr];
            if(uiVotedMoveSprite.lastRowPosition == uiVotedMoveSprite.newRowPosition){
                continue;
            }
            let sprite = uiVotedMoveSprite.sprite;

            let positionFrom = this.getPositionForRow(uiVotedMoveSprite.lastRowPosition);
            let positionTo = this.getPositionForRow(uiVotedMoveSprite.newRowPosition);


            let action = new PositionConstantSpeed(sprite, positionFrom, positionTo, 0.5);
            this.positionManager.addMovingSprite(sprite, action, null);

            uiVotedMoveSprite.lastRowPosition = uiVotedMoveSprite.newRowPosition;
        }



        return removeUiVotedMoveSprites;
    }






    public predictSanSpriteCallback(isMyMove : boolean, predictSanSprite : PredictSanSprite){
        console.debug("isMyMove", isMyMove);
        let sanStr : string | null = predictSanSprite.getSanStr();
        if(sanStr == null){
            return;
        }

        this.controller.predictMovePress(isMyMove, sanStr);
    }


}