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
import {stringify} from "querystring";

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



    public setIsHighlighted(sanObject : {sanStr : string, sideType : SideType}, isHighlighted : boolean):void{
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


    public setMyVoting(sanStr : string, moveTurn : SideType):void{
        this.uiMyMoveSprite.setSanObject({sanStr : sanStr, sideType : moveTurn});
    }





    public setVotingData(m_votingData : {[key : string] : number}, moveTurn : SideType){
        let numOfVotes : number = 0;
        for(let k in m_votingData){
            numOfVotes += m_votingData[k];
        }



        {
            let m_votingDataArray = [];

            for(let k in m_votingData){
                m_votingDataArray.push({sanStr : k, number : m_votingData[k]});
            }

            m_votingDataArray.sort((a:{ sanStr : string, number : number}, b:{ sanStr : string, number : number})=>{
                let ret : number;
                if(b.number == a.number){
                    ret = -b.sanStr.localeCompare(a.sanStr);
                }else {
                    ret = b.number - a.number;
                }
                return ret;
            });


            for(let i = this.maxNumOfUiVotedMoveSprites; i < m_votingDataArray.length; i++){
                let sanStr = m_votingDataArray[i].sanStr;
                delete m_votingData[sanStr];
            }
        }




        //Remove all the uiVotedMoveSprites
        let removeUiVotedVotedMoveSprites : {sanStr : string, sideType : SideType}[] = [];
        this.uiVotedMovesSprites.forEach((uiVotedMoveSprite : PredictButton, sideType : SideType, sanStr : string)=>{
            if(m_votingData[sanStr] == undefined || sideType != moveTurn){
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
        let addUiVotedMoveSprites : {sanStr : string, sideType : SideType}[] = [];
        for(let sanStr in m_votingData) {
            if(this.uiVotedMovesSprites.get(moveTurn, sanStr) == undefined){
                if(m_votingData[sanStr] != 0){
                    addUiVotedMoveSprites.push({sanStr : sanStr, sideType : moveTurn});
                }
            }
        }
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
                uiVotedMoveSprite.setPercentage(100*m_votingData[sanStr]/numOfVotes);
            }
        });




        if(this.uiMyMoveSprite.getIsHighlighted()){
            this.setIsHighlighted(<{sanStr : string, sideType : SideType}>this.uiMyMoveSprite.getSanObject(), true);
        }
    }
}