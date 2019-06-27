import {SideType} from "../../shared/engine/SideType";
import {PositionManager} from "../PositionManager";

import {SimpleGame} from "../SimpleGame";
import {LanguageHelper, LanguageKey} from "../LanguageHelper";
import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import {ControllerMultiplayerGame} from "../controller/ControllerMultiplayerGame";
import {DefaultButton} from "./Button/DefaultButton";

import {SanSprite} from "./SanSprite";
import {TableContainer} from "./Table/TableContainer";

import {NestedMap} from "../NestedMap";
import {SanObject} from "../../shared/engine/SanObject";

class PredictButton  extends DefaultButton {
    private sanObject : SanObject.Interface | null;

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

    public getSanObject():SanObject.Interface|null{
        return this.sanObject;
    }
    public setSanObject(sanObject : SanObject.Interface | null){
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

export class PredictPanel extends TableContainer {

    private uiMyMoveText : PIXI.Text;
    private uiMyMoveSprite : PredictButton;

    private uiVotedMovesText : PIXI.Text;

    private uiVotedMovesSprites : NestedMap.Double<SideType, string, PredictButton>;
    private maxNumOfUiVotedMoveSprites : number;

    private controller : ControllerMultiplayerGame;



    constructor(properties : TableContainer.Properties, controller : ControllerMultiplayerGame){
        super(properties);
        this.controller = controller;


        this.uiVotedMovesSprites = new NestedMap.Double<SideType, string, PredictButton>();


        {
            this.uiMyMoveText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.MyMove), SimpleGame.getDefaultTextStyleOptions(this.getRowHeight()));
            this.uiMyMoveText.anchor.set(0.5, 0.5);

            this.addItem(this.uiMyMoveText, 1);
        }
        {
            this.uiMyMoveSprite = new PredictButton(this.getRowWidth()*predictBtnWidthScale,
                this.getRowHeight()*predictBtnHeightScale,
                this.predictBtnCallback.bind(this));

            this.addItem(this.uiMyMoveSprite, 2);
        }
        {
            this.uiVotedMovesText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.VotedMoves), SimpleGame.getDefaultTextStyleOptions(this.getRowHeight()));
            this.uiVotedMovesText.anchor.set(0.5, 0.5);

            this.addItem(this.uiVotedMovesText, 3);
        }


        this.maxNumOfUiVotedMoveSprites = this.getMaxNumOfItems() - 3;
    }



    public setIsHighlighted(sanObject : SanObject.Interface, isHighlighted : boolean):void{
        let myMoveSanObject = this.uiMyMoveSprite.getSanObject();
        if(myMoveSanObject != null && (myMoveSanObject.sanStr == sanObject.sanStr && myMoveSanObject.sideType == sanObject.sideType)){
            this.uiMyMoveSprite.setIsHighlighted(isHighlighted);
        }

        let uiVotedMoveSprite = this.uiVotedMovesSprites.get(sanObject.sideType, sanObject.sanStr);
        if(uiVotedMoveSprite != undefined){
            uiVotedMoveSprite.setIsHighlighted(isHighlighted);
        }
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
            let uiVotedMovesSprite = this.uiVotedMovesSprites.get(sanObject.sideType, sanObject.sanStr);

            if(uiVotedMovesSprite != predictButton){
                return;
            }
        }

        this.controller.predictMovePress(sanObject);
    }


    public setMyVoting(sanObject : SanObject.Interface | null):void{
        this.uiMyMoveSprite.setSanObject(sanObject);
    }




    public setVotingData(m_votingData : {sanObject : SanObject.Interface, number : number}[]){
        let numOfVotes : number = 0;
        for(let i = 0; i < m_votingData.length; i++){
            numOfVotes += m_votingData[i].number;
        }

        let m_votingDataMap = new NestedMap.Double<SideType, string, number>();
        {
            m_votingData.sort((a:{ sanObject : SanObject.Interface, number : number}, b:{sanObject : SanObject.Interface, number : number})=>{
                let ret : number;

                if(b.number == a.number){
                    let hasA = this.uiVotedMovesSprites.has(a.sanObject.sideType, a.sanObject.sanStr);
                    let hasB = this.uiVotedMovesSprites.has(b.sanObject.sideType, b.sanObject.sanStr);

                    if(hasA && hasB || !hasA && !hasB){
                        ret = -b.sanObject.sanStr.localeCompare(a.sanObject.sanStr);
                    }else {
                        if(hasA){
                            ret = -1;
                        }else {
                            ret = 1;
                        }
                    }


                    //ret =
                }else {
                    ret = b.number - a.number;
                }
                return ret;
            });



            for(let i = 0; i < Math.min(m_votingData.length, this.maxNumOfUiVotedMoveSprites); i++){
                let sideType = m_votingData[i].sanObject.sideType;
                let sanStr = m_votingData[i].sanObject.sanStr;
                let number = m_votingData[i].number;

                m_votingDataMap.set(number, sideType, sanStr);
            }
        }




        //Remove all the uiVotedMoveSprites
        let removeUiVotedVotedMoveSprites : SanObject.Interface[] = [];
        this.uiVotedMovesSprites.forEach((uiVotedMoveSprite : PredictButton, sideType : SideType, sanStr : string)=>{
            if(!m_votingDataMap.has(sideType, sanStr)){
                removeUiVotedVotedMoveSprites.push({sanStr : sanStr, sideType : sideType});
            }
        });
        for(let i = 0; i < removeUiVotedVotedMoveSprites.length; i++){
            let sanStr = removeUiVotedVotedMoveSprites[i].sanStr;
            let sideType = removeUiVotedVotedMoveSprites[i].sideType;

            let uiVotedMoveSprite = <PredictButton>this.uiVotedMovesSprites.get(sideType, sanStr);
            this.removeItem(uiVotedMoveSprite);

            this.uiVotedMovesSprites.delete(sideType, sanStr);
        }


        //Add all the new uiVotedMoveSprites
        let addUiVotedMoveSprites : SanObject.Interface[] = [];
        m_votingDataMap.forEach((number : number, sideType : SideType, sanStr : string)=>{
            if(number != 0){
                if(!this.uiVotedMovesSprites.has(sideType, sanStr)){
                    addUiVotedMoveSprites.push({sanStr : sanStr, sideType : sideType});
                }
            }
        });
        for(let i = 0; i < addUiVotedMoveSprites.length; i++){
            let sanStr = addUiVotedMoveSprites[i].sanStr;
            let sideType = addUiVotedMoveSprites[i].sideType;


            let uiVotedMoveSprite = new PredictButton(this.getRowWidth()*predictBtnWidthScale,
                this.getRowHeight()*predictBtnHeightScale,
                this.predictBtnCallback.bind(this));
            this.addItem(uiVotedMoveSprite);


            uiVotedMoveSprite.setSanObject(addUiVotedMoveSprites[i]);

            this.uiVotedMovesSprites.set(uiVotedMoveSprite, sideType, sanStr);
        }



        //Update all the percentages
        this.uiVotedMovesSprites.forEach((uiVotedMoveSprite : PredictButton, sideType : SideType, sanStr : string)=>{
            if(numOfVotes == 0){
                uiVotedMoveSprite.setPercentage(0);
            }else {
                let number = <number>m_votingDataMap.get(sideType, sanStr);

                uiVotedMoveSprite.setPercentage(100*number/numOfVotes);
            }
        });




        if(this.uiMyMoveSprite.getIsHighlighted()){
            this.setIsHighlighted(<{sanStr : string, sideType : SideType}>this.uiMyMoveSprite.getSanObject(), true);
        }
    }
}