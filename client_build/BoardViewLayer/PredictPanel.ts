import {SideType} from "../../shared/engine/SideType";
import {PositionManager} from "../PositionManager";

import {SimpleGame} from "../app";
import {LanguageHelper, LanguageKey} from "../LanguageHelper";
import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import {ControllerMultiplayerGame} from "../controller/ControllerMultiplayerGame";
import {DefaultButton} from "./Button/DefaultButton";

import {SanSprite} from "./SanSprite";

class PredictButton  extends DefaultButton {
    private m_sanStr : string;
    private m_moveTurn : SideType;

    private uiPercentage : PIXI.Text;
    private uiSanSprite : SanSprite | null = null;
    private uiHighlight : PIXI.Graphics;

    private pieceViewScale : number = 0.7;

    constructor(width : number, height : number, cb : (d : DefaultButton) => void){
        super(width, height, cb);

        //this.m_moveTurn = SideType.WHITE;
        //this.m_sanStr = "";

        this.uiHighlight = new PIXI.Graphics();
        this.uiHighlight.lineStyle(5,  SimpleGame.getDarkBrownColor(), 1.0);
        this.uiHighlight.beginFill(SimpleGame.getDarkBrownColor());

        this.uiHighlight.drawRoundedRect(-this.m_width/2, -this.m_height/2, this.m_width, this.m_height, 5);
        this.addChild(this.uiHighlight);
        this.uiHighlight.visible = false;


        this.uiPercentage = new PIXI.Text("", SimpleGame.getDefaultTextStyleOptions(this.m_height * this.pieceViewScale));
        this.uiPercentage.anchor.set(1.0, 0.5);
        this.uiPercentage.position.set((this.m_width/2) - 0.5*this.pieceViewScale*this.m_height, 0.0);
        this.addChild(this.uiPercentage);



    }


    public setSanStr(sanStr : string, moveTurn : SideType){
        if(sanStr == this.m_sanStr && moveTurn == this.m_moveTurn){
            return;
        }
        this.m_sanStr = sanStr;
        this.m_moveTurn = moveTurn;

        if(this.uiSanSprite != null){
            this.uiSanSprite.parent.removeChild(this.uiSanSprite);
            this.uiSanSprite = null;
        }

        this.uiSanSprite = new SanSprite(sanStr, moveTurn, this.m_height*this.pieceViewScale);
        this.addChild(this.uiSanSprite);

        this.uiSanSprite.position.set(-this.m_width/2 + this.uiSanSprite.width/2 + 0.5*this.pieceViewScale*this.m_height, 0.0);
    }


    public setPercentage(percentage : number | null){
        let str : string;
        if(percentage == null){
            str = "";
        }else {
            str = percentage.toFixed(1) + "%";
        }

        this.uiPercentage.text = str;
    }

    public getSanStr():string{
        return this.m_sanStr;
    }
    public getMoveTurn():SideType{
        return this.m_moveTurn;
    }



    public getIsHighlighted():boolean{
        return this.uiHighlight.visible;
    }

    public setIsHighlighted(isHighlighted : boolean):void{
        this.uiHighlight.visible = isHighlighted;
    }
}

export class PredictPanel extends PIXI.Graphics {

    private uiMyMoveText : PIXI.Text;
    private uiMyMoveSprite : PredictButton;

    private uiVotedMovesText : PIXI.Text;
    private uiVotedMovesSprites : { [key : string] : { sprite : PredictButton, lastRowPosition : number, newRowPosition : number } };



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
    private m_width : number;
    private m_rowHeight : number;

    constructor(height : number, width : number, rowHeight : number, controller : ControllerMultiplayerGame){
        super();

        this.m_height = height;
        this.m_width = width;
        this.m_rowHeight = rowHeight;

        this.m_moveTurn = SideType.WHITE;

        this.controller = controller;


        this.uiVotedMovesSprites = {};
        this.positionManager = new PositionManager();






        this.beginFill(SimpleGame.getLightBrownColor());
        this.lineStyle(4, SimpleGame.getBlackColor());

        this.drawRoundedRect(-this._getWidth()/2, -this._getHeight()/2, this._getWidth(), this._getHeight(), 4);


        let uiMask = new PIXI.Graphics();
        uiMask.beginFill(0xFFFFFF);
        uiMask.drawRoundedRect(-this._getWidth()/2, -this._getHeight()/2, this._getWidth(), this._getHeight(), 4);
        this.addChild(uiMask);

        this.mask = uiMask;




        {
            this.uiMyMoveText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.MyMove), SimpleGame.getDefaultTextStyleOptions(this.m_rowHeight));
            this.uiMyMoveText.anchor.set(0.5, 0.5);
            this.uiMyMoveText.position = this.getPositionForRow(0);

            this.addChild(this.uiMyMoveText);
        }
        {
            this.uiVotedMovesText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.VotedMoves), SimpleGame.getDefaultTextStyleOptions(this.m_rowHeight));
            this.uiVotedMovesText.anchor.set(0.5, 0.5);
            this.uiVotedMovesText.position = this.getPositionForRow(2);


            this.addChild(this.uiVotedMovesText);
        }

        this.uiMyMoveSprite = new PredictButton(this.getRowWidth(), this.getRowHeight(), this.predictBtnCallback.bind(this));
        this.uiMyMoveSprite.position = this.getPositionForRow(1);
        this.addChild(this.uiMyMoveSprite);



    }



    private getRowWidth():number{
        /*

        let widthOffset = 10;
        let width = this.getRowWidth() + widthOffset;

        return width;
         */

        return this.m_width - 10;

        //return this.m_rowHeight * 7;
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
        return this.m_width;
    }

    private getPositionForRow(row : number):PIXI.Point {
        let ret = new PIXI.Point();
        ret.x = 0;

        let rowHeight = this.getRowHeight();

        ret.y = -this.m_height/2 + (rowHeight*1.3)*row + rowHeight/2 + rowHeight/4;

        return ret;
    }









    public setIsHighlighted(sanStr : string, isHighlighted : boolean):void{
        if(this.uiMyMoveSprite.getSanStr() == sanStr){
            this.uiMyMoveSprite.setIsHighlighted(isHighlighted);
        }

        let uiVotedMoveSprite = this.uiVotedMovesSprites[sanStr];
        if(uiVotedMoveSprite == undefined){
            return;
        }

        uiVotedMoveSprite.sprite.setIsHighlighted(isHighlighted);
    }



    public setMyMovePercentage(percentage : number | null):void{
        this.uiMyMoveSprite.setPercentage(percentage);
    }

    public predictBtnCallback(predictButton : PredictButton){
        //console.debug("isMyMove", isMyMove);
        let sanStr : string | null = predictButton.getSanStr();
        if(sanStr == null){
            return;
        }


        if(predictButton != this.uiMyMoveSprite){
            if(this.uiVotedMovesSprites[sanStr] == undefined){
                return;
            }
            if(this.uiVotedMovesSprites[sanStr].sprite != predictButton){
                return;
            }
        }


        this.controller.predictMovePress(this.m_moveTurn, sanStr);
    }


    public setMyVoting(sanStr : string):void{
        this.uiMyMoveSprite.setSanStr(sanStr, this.m_moveTurn);
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

            let sprite = new PredictButton(this.getRowWidth(), this.getRowHeight(), this.predictBtnCallback.bind(this));
            sprite.position = this.getPositionForRow(votedData.rowPosition);
            sprite.setSanStr(sanStr, this.m_moveTurn);
            if(numOfVotes == 0){
                sprite.setPercentage(0);
            }else {
                sprite.setPercentage( 100*(votedData.number)/numOfVotes);
            }

            this.addChild(sprite);

            //if(this.isPredictMove(sanStr)){
                //sprite.setIsPredictMove(true);
            //}



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


        if(this.uiMyMoveSprite.getIsHighlighted()){
            this.setIsHighlighted(this.uiMyMoveSprite.getSanStr(), true);
        }
    }
}