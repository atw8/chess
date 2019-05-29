import {PredictSanSprite} from "./PredictSanSprite";
import {SanSprite} from "./SanSprite";
import {SideType} from "../../shared/engine/SideType";
import {PositionManager} from "../PositionManager";

import {SimpleGame} from "../app";
import {ControllerAbstract} from "../controller/ControllerAbstract";
import {LanguageHelper, LanguageKey} from "../LanguageHelper";
import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import {ControllerMultiplayerGame} from "../controller/ControllerMultiplayerGame";

export class PredictPanel extends PIXI.Graphics {

    private uiMyMoveText : PIXI.Text;
    private uiMyMoveSprite : PredictSanSprite;

    private uiVotedMovesText : PIXI.Text;
    private uiVotedMovesSprites : { [key : string] : { sprite : PredictSanSprite, lastRowPosition : number, newRowPosition : number } };



    private m_moveTurn : SideType;
    public setMoveTurn(moveTurn : SideType){
        this.m_moveTurn = moveTurn;
    }
    public getMoveTurn():SideType{
        return this.m_moveTurn;
    }



    private controller : ControllerMultiplayerGame;
    private positionManager : PositionManager;


    private m_height : number;
    private m_rowHeight : number;

    constructor(height : number, rowHeight : number, controller : ControllerMultiplayerGame){
        super();

        this.m_height = height;
        this.m_rowHeight = rowHeight;

        this.m_moveTurn = SideType.WHITE;

        this.controller = controller;


        this.uiVotedMovesSprites = {};
        this.positionManager = new PositionManager();



        {
            let textStyleOptions : PIXI.TextStyleOptions = {};
            textStyleOptions.fontSize = this.m_rowHeight;
            textStyleOptions.fontFamily = "Helvetica";
            textStyleOptions.fontWeight = "Bold";

            this.uiMyMoveText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.MyMove));
            this.uiMyMoveText.style = new PIXI.TextStyle(textStyleOptions);
            this.uiMyMoveText.anchor.set(0.5, 0.5);
            this.uiMyMoveText.position = this.getPositionForRow(0);

            this.addChild(this.uiMyMoveText);
        }
        {
            let textStyleOptions : PIXI.TextStyleOptions = {};
            textStyleOptions.fontSize = this.m_rowHeight;
            textStyleOptions.fontFamily = "Helvetica";
            textStyleOptions.fontWeight = "Bold";

            this.uiVotedMovesText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.VotedMoves));
            this.uiVotedMovesText.style = new PIXI.TextStyle(textStyleOptions);
            this.uiVotedMovesText.anchor.set(0.5, 0.5);
            this.uiVotedMovesText.position = this.getPositionForRow(2);


            this.addChild(this.uiVotedMovesText);
        }

        this.uiMyMoveSprite = new PredictSanSprite(this.getRowWidth(), this.getRowHeight(), this.m_moveTurn, this.predictSanSpriteCallback.bind(this, true));
        this.uiMyMoveSprite.position = this.getPositionForRow(1);
        this.addChild(this.uiMyMoveSprite);






        this.beginFill(SimpleGame.getLightBrownColor());
        this.lineStyle(4, SimpleGame.getBlackColor());



        this.drawRoundedRect(-this._getWidth()/2, -this._getHeight()/2, this._getWidth(), this._getHeight(), 4);



        let uiMask = new PIXI.Graphics();
        uiMask.beginFill(0xFFFFFF);
        uiMask.drawRoundedRect(-this._getWidth()/2, -this._getHeight()/2, this._getWidth(), this._getHeight(), 4);
        this.addChild(uiMask);

        this.mask = uiMask;
    }

    private getRowWidth():number{
        return this.m_rowHeight * 7;
    }
    private getRowHeight():number{
        return this.m_rowHeight;
    }
    private _getHeight():number{
        return this.m_height;
        /*
        let heightOffset = 40;
        let height = this.getRowHeight() * this.m_numOfRows + heightOffset;

        return height;
        */
    }
    private _getWidth():number{
        let widthOffset = 10;
        let width = this.getRowWidth() + widthOffset;

        return width;
    }

    private getPositionForRow(row : number):PIXI.Point {
        let ret = new PIXI.Point();
        ret.x = 0;

        let rowHeight = this.getRowHeight();

        ret.y = -this.m_height/2 + (rowHeight*1.3)*row + rowHeight/2 + rowHeight/4;

        return ret;
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







    public setMyMovePercentage(percentage : number | null):number | null{
        let ret = this.uiMyMoveSprite.getPercentage();

        this.uiMyMoveSprite.setPercentage(percentage);

        return ret;
    }

    public predictSanSpriteCallback(isMyMove : boolean, predictSanSprite : PredictSanSprite){
        //console.debug("isMyMove", isMyMove);
        let sanStr : string | null = predictSanSprite.getSanStr();
        if(sanStr == null){
            return;
        }

        this.controller.predictMovePress(isMyMove, sanStr);
    }


    public setMyVoting(sanStr : string | null):void{
        this.uiMyMoveSprite.setSanStr(sanStr);
    }
    public setVotingData(votingData : { [key : string] : number}){
        let votingDataArray : { sanStr : string, number : number}[] = [];
        for(let k in votingData){
            if(votingData[k] != 0){
                votingDataArray.push({sanStr : k, number : votingData[k]});
            }
        }

        votingDataArray.sort((a:{ sanStr : string, number : number}, b:{ sanStr : string, number : number})=>{
            let ret : number;
            if(b.number == a.number){
                ret = -b.sanStr.localeCompare(a.sanStr);
            }else {
                ret = b.number - a.number;
            }
            return ret;
        });


        let numOfVotes : number = 0;
        let votedSanMap : { [key : string] : { sanStr : string, number : number, rowPosition : number}} = {};
        for(let i = 0; i < votingDataArray.length; i++){
            let votedData = votingDataArray[i];
            votedSanMap[votingDataArray[i].sanStr] = {sanStr : votedData.sanStr, number : votedData.number, rowPosition : i + 3};

            numOfVotes += votedData.number;
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



            let tween = new TWEEN.Tween({alpha : sprite.alpha});
            tween.to({alpha : 0}, 500);
            tween.onUpdate((o : any) => {
                sprite.alpha = o.alpha;
            });
            tween.onComplete((o : any) =>{
               this.removeChild(sprite);
            });
            tween.start();
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
            let votedData : { sanStr : string, number : number, rowPosition : number}  = votedSanMap[sanStr];

            let sprite = new PredictSanSprite(this.getRowWidth(), this.getRowHeight(), this.m_moveTurn, this.predictSanSpriteCallback.bind(this, false))
            sprite.position = this.getPositionForRow(votedData.rowPosition);
            sprite.setSanStr(sanStr);
            if(numOfVotes == 0){
                sprite.setPercentage(0);
            }else {
                sprite.setPercentage( 100*(votedData.number)/numOfVotes);
            }

            this.addChild(sprite);

            if(this.isPredictMove(sanStr)){
                sprite.setIsPredictMove(true);
            }



            sprite.alpha = 0.0;
            let tween = new TWEEN.Tween({alpha : sprite.alpha});
            tween.to({alpha : 1.0}, 500);
            tween.onUpdate((o : any) => {
                sprite.alpha = o.alpha;
            });
            tween.start();


            this.uiVotedMovesSprites[sanStr] = { sprite : sprite, lastRowPosition : votedData.rowPosition, newRowPosition : votedData.rowPosition};
        }


        //Update all the percentages, and the positions
        for(let sanStr in this.uiVotedMovesSprites){
            if(numOfVotes == 0){
                this.uiVotedMovesSprites[sanStr].sprite.setPercentage(0);
            }else {
                this.uiVotedMovesSprites[sanStr].sprite.setPercentage(100*(votedSanMap[sanStr].number)/numOfVotes);
            }

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


            this.positionManager.moveTo(sprite, null, positionTo, 0.5);

            uiVotedMoveSprite.lastRowPosition = uiVotedMoveSprite.newRowPosition;
        }
    }
}