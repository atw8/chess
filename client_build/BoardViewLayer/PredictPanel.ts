import {SideType} from "../../shared/engine/SideType";
import {PositionManager} from "../PositionManager";

import {SimpleGame} from "../SimpleGame";
import {LanguageHelper, LanguageKey} from "../LanguageHelper";
import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import {ControllerMultiplayerGame} from "../controller/ControllerMultiplayerGame";
import {DefaultButton} from "./Button/DefaultButton";

import {SanSprite} from "./SanSprite";

class PredictButton  extends DefaultButton {
    private sanObject : {sanStr : string, sideType : SideType} | null;

    private uiPercentage : PIXI.Text;
    private uiSanSprite : SanSprite | null = null;
    private uiHighlight : PIXI.Graphics;

    private pieceViewScale : number = 0.7;

    constructor(width : number, height : number, cb : (d : DefaultButton) => void){
        super(width, height, cb);




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





    public setPercentage(percentage : number | null){
        let str : string;
        if(percentage == null){
            str = "";
        }else {
            str = percentage.toFixed(1) + "%";
        }

        this.uiPercentage.text = str;
    }

    public getSanObject():{sanStr : string, sideType : SideType}|null{
        return this.sanObject;
    }
    public setSanObject(sanObject : {sanStr : string, sideType : SideType} | null){
        this.sanObject = sanObject;


        if(this.uiSanSprite != null){
            this.uiSanSprite.parent.removeChild(this.uiSanSprite);
            this.uiSanSprite = null;
        }


        if(this.sanObject != null){
            this.uiSanSprite = new SanSprite(this.sanObject, this.m_height*this.pieceViewScale);
            this.addChild(this.uiSanSprite);

            this.uiSanSprite.position.set(-this.m_width/2 + this.uiSanSprite.width/2 + 0.5*this.pieceViewScale*this.m_height, 0.0);
        }
    }



    public getIsHighlighted():boolean{
        return this.uiHighlight.visible;
    }

    public setIsHighlighted(isHighlighted : boolean):void{
        this.uiHighlight.visible = isHighlighted;
    }
}


let predictBtnWidthScale = 0.9;
let predictBtnHeightScale = 0.8;

export class PredictPanel extends PIXI.Graphics {

    private uiMyMoveText : PIXI.Text;
    private uiMyMoveSprite : PredictButton;

    private uiVotedMovesText : PIXI.Text;
    private uiVotedMovesSprites : { [key in SideType] : { [key : string] : { sprite : PredictButton, lastRowPosition : number, newRowPosition : number } } };



    private controller : ControllerMultiplayerGame;
    private positionManager : PositionManager;


    private m_height : number;
    private m_width : number;
    private m_rowHeight : number;
    private m_numOfCols : number;

    constructor(height : number, width : number, rowHeight : number, numOfCols : number, controller : ControllerMultiplayerGame){
        super();

        this.m_height = height;
        this.m_width = width;
        this.m_rowHeight = rowHeight;
        this.m_numOfCols = numOfCols;

        this.controller = controller;

        //@ts-ignore
        this.uiVotedMovesSprites = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.uiVotedMovesSprites[sideType] = {};
        }

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
            this.uiMyMoveText.position = this.getPositionForRow(1);

            this.addChild(this.uiMyMoveText);
        }
        {
            this.uiVotedMovesText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.VotedMoves), SimpleGame.getDefaultTextStyleOptions(this.m_rowHeight));
            this.uiVotedMovesText.anchor.set(0.5, 0.5);
            this.uiVotedMovesText.position = this.getPositionForRow(3);


            this.addChild(this.uiVotedMovesText);
        }

        this.uiMyMoveSprite = new PredictButton(this.getRowWidth()*predictBtnWidthScale,
            this.getRowHeight()*predictBtnHeightScale,
            this.predictBtnCallback.bind(this));
        this.uiMyMoveSprite.position = this.getPositionForRow(2);
        this.addChild(this.uiMyMoveSprite);



    }



    private getRowWidth():number{
        return this.m_width/this.m_numOfCols;
    }
    private getRowHeight():number{
        return this.m_rowHeight;
    }
    private _getHeight():number{
        return this.m_height;
    }
    private _getWidth():number{
        return this.m_width;
    }

    private getPositionForRow(row : number):PIXI.Point {
        let ret = new PIXI.Point();


        ret.x = -this.m_width/2 + this.getRowWidth()/2;
        ret.y = -this.m_height/2 - this.getRowHeight()/2;




        let x = 0;
        let y = row;

        let maxNumOfRows = Math.floor(this._getHeight()/this.getRowHeight());
        while(y > maxNumOfRows){
            x++;
            y -= maxNumOfRows;
        }


        ret.x += x * this.getRowWidth();
        ret.y += y * this.getRowHeight();




        return ret;
    }








    public setIsHighlighted(sanObject : {sanStr : string, sideType : SideType}, isHighlighted : boolean):void{
        let myMoveSanObject = this.uiMyMoveSprite.getSanObject();
        if(myMoveSanObject != null && (myMoveSanObject.sanStr == sanObject.sanStr && myMoveSanObject.sideType == sanObject.sideType)){
            this.uiMyMoveSprite.setIsHighlighted(isHighlighted);
        }

        let uiVotedMoveSprite = this.uiVotedMovesSprites[sanObject.sideType][sanObject.sanStr];
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
        let sanObject : {sanStr : string, sideType : SideType} | null = predictButton.getSanObject();
        if(sanObject == null){
            return;
        }


        if(predictButton != this.uiMyMoveSprite){
            if(this.uiVotedMovesSprites[sanObject.sideType][sanObject.sanStr] == undefined){
                return;
            }
            if(this.uiVotedMovesSprites[sanObject.sideType][sanObject.sanStr].sprite != predictButton){
                return;
            }
        }

        this.controller.predictMovePress(sanObject);
    }


    public setMyVoting(sanStr : string, moveTurn : SideType):void{
        this.uiMyMoveSprite.setSanObject({sanStr : sanStr, sideType : moveTurn});
    }
    public setVotingData(votingData : { [key : string] : number}, moveTurn : SideType){
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
        //@ts-ignore
        let votedSanMap : { [key in SideType] : {[key : string] : { sanStr : string, number : number, rowPosition : number}}} = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            votedSanMap[sideType] = {};
        }
        for(let i = 0; i < votingDataArray.length; i++){
            let votedData = votingDataArray[i];
            votedSanMap[moveTurn][votedData.sanStr] = {sanStr : votedData.sanStr, number : votedData.number, rowPosition : i + 4};

            numOfVotes += votedData.number;
        }


        //remove all the old uiVotedMoveSprites
        let removeUiVotedMoveSprites : {sanStr : string, sideType : SideType}[] = [];
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            for(let sanStr in this.uiVotedMovesSprites[sideType]){
                if(votedSanMap[sideType][sanStr] == undefined){
                    removeUiVotedMoveSprites.push({sanStr : sanStr, sideType :sideType});
                }
            }
        }
        for(let i = 0; i < removeUiVotedMoveSprites.length; i++){
            let sanStr = removeUiVotedMoveSprites[i].sanStr;
            let sideType = removeUiVotedMoveSprites[i].sideType;

            let uiVotedMoveSprite = this.uiVotedMovesSprites[sideType][sanStr];
            delete this.uiVotedMovesSprites[sideType][sanStr];

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
        let addUiVotedMoveSprites : {sanStr : string, sideType : SideType}[] = [];
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            for(let sanStr in votedSanMap[sideType]) {
                if(this.uiVotedMovesSprites[sideType][sanStr] == undefined){
                    addUiVotedMoveSprites.push({sanStr : sanStr, sideType : sideType});
                }
            }
        }


        for(let i = 0; i < addUiVotedMoveSprites.length; i++){
            let sanStr = addUiVotedMoveSprites[i].sanStr;
            let sideType = addUiVotedMoveSprites[i].sideType;

            let votedData : { sanStr : string, number : number, rowPosition : number}  = votedSanMap[sideType][sanStr];

            let sprite = new PredictButton(this.getRowWidth()*predictBtnWidthScale,
                this.getRowHeight()*predictBtnHeightScale,
                this.predictBtnCallback.bind(this));
            sprite.position = this.getPositionForRow(votedData.rowPosition);
            sprite.setSanObject(addUiVotedMoveSprites[i]);
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


            this.uiVotedMovesSprites[sideType][sanStr] = { sprite : sprite, lastRowPosition : votedData.rowPosition, newRowPosition : votedData.rowPosition};
        }


        //Update all the percentages, and the positions
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            for(let sanStr in this.uiVotedMovesSprites[sideType]){
                if(numOfVotes == 0){
                    this.uiVotedMovesSprites[sideType][sanStr].sprite.setPercentage(0);
                }else {
                    this.uiVotedMovesSprites[sideType][sanStr].sprite.setPercentage(100*(votedSanMap[sideType][sanStr].number)/numOfVotes);
                }

                this.uiVotedMovesSprites[sideType][sanStr].newRowPosition = votedSanMap[sideType][sanStr].rowPosition;
            }
        }

        //Make all the sprites move into the rightful position
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            for(let sanStr in this.uiVotedMovesSprites[sideType]){
                let uiVotedMoveSprite = this.uiVotedMovesSprites[sideType][sanStr];
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



        if(this.uiMyMoveSprite.getIsHighlighted()){
            this.setIsHighlighted(<{sanStr : string, sideType : SideType}>this.uiMyMoveSprite.getSanObject(), true);
        }
    }
}