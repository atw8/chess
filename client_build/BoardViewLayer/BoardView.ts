import {FileRank} from "../../shared/engine/FileRank";
import {PieceModel} from "../../shared/engine/PieceModel";
import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {MoveClass} from "../../shared/engine/MoveClass";

import {PieceView} from "./PieceView";

import {SquareColorNode} from "./SquareColorNode";
import {SQUARE_COLORS} from "./SquareColorCons";

import {PointColorNode} from "./PointColorNode";
import {POINT_COLORS} from "./PointColorCons";



import {PositionManager} from "../PositionManager";


import {ImageTag} from "../ImageTag";
import {ControllerAbstract} from "../controller/ControllerAbstract";
import {TouchLayer} from "./TouchLayer";
import * as PIXI from 'pixi.js';


enum TouchTypes {
    NO_TOUCH = 0,
    DRAG_TOUCH = 1,
    ONE_TOUCH = 2,
}


const ZORDER = {
    SELECT_LIGHT : 1,
    OPTION_CYCLE : 1,

    SQUARE : 2,
    POINT : 3,


    NORMAL_SPRITE : 4,
    MOVING_SPRITE : 5,

    FILE_RANK_NUMBER : 6,
};


export class BoardView extends PIXI.Graphics {
    private uiTouchLayer : TouchLayer;

    private boardFacing: SideType;

    private fileRankPieceSprites : { [key : number] : { [key : number] : PieceView | null } };
    private uiBoardFiles: { [key: number]: PIXI.Text };
    private uiBoardRanks: { [key: number]: PIXI.Text };

    private uiSquares: { [key: number]: { [key: number]: SquareColorNode } };
    private uiPoints: { [key: number]: { [key: number]: PointColorNode } };

    private uiSelectLightSprite: PIXI.Sprite;
    private uiSelectLightFileRank: FileRank | null;

    private uiOptionCycleSprite: PIXI.Sprite;
    private uiOptionCycleFileRank: FileRank | null;

    private originFileRank: FileRank | null;
    private originSprite: PieceView | null;

    private touchType = TouchTypes.NO_TOUCH;

    private originTouchLocation: PIXI.Point| null;
    private currentTouchLocation: PIXI.Point | null;

    private positionManager : PositionManager;
    public getPositionManager():PositionManager {
        return this.positionManager;
    }


    private m_opts : {size : number,
        isBoardVisible : boolean,
        displaySquares : boolean,

        initTouchLayer : boolean,

        pieceAlpha : number,



        moveSpeedNormal : number,
        moveSpeedUndo : number,

        moveSpeedIllegal : number,
        moveSpeedFlipBoard : number};

    private controller: ControllerAbstract;



    //private fileRankNumberGroup : PIXI.Container;
    //private pointGroup: PIXI.Container;
    //private squareGroup : PIXI.Container;
    //private bottomGroup : PIXI.Container;


    //private pieceSpriteGroup : PIXI.Container;
    //private movingSpriteGroup : PIXI.Container;


    constructor(m_opts:  {size : number,
        isBoardVisible : boolean,
        displaySquares : boolean,
        initTouchLayer : boolean,
        pieceAlpha ?: number,
        moveSpeedNormal ?: number,
        moveSpeedUndo ?: number,
        moveSpeedIllegal ?: number,
        moveSpeedFlipBoard ?: number}, controller: ControllerAbstract) {

        super();
        this.sortableChildren = true;

        if(m_opts.pieceAlpha == undefined){
            m_opts.pieceAlpha = 1.0;
        }
        if(m_opts.moveSpeedNormal == undefined){
            m_opts.moveSpeedNormal = 0.001;
        }
        if(m_opts.moveSpeedUndo == undefined){
            m_opts.moveSpeedUndo = 0.001;
        }
        if(m_opts.moveSpeedIllegal == undefined){
            m_opts.moveSpeedIllegal = 0.003;
        }
        if(m_opts.moveSpeedFlipBoard == undefined){
            m_opts.moveSpeedFlipBoard = 0.002;
        }
        // @ts-ignore
        this.m_opts = m_opts;


        this.controller = controller;

        this.boardFacing = SideType.getRandomSideType();


        this.positionManager = new PositionManager();

        this.beginFill(this.getColorForColorType_inNum(SideType.WHITE), this.m_opts.isBoardVisible ? 1.0 : 0.0);
        this.drawRect(-this.m_opts.size / 2, -this.m_opts.size / 2, this.m_opts.size, this.m_opts.size);


        let squareWidth = this.getSquareWidth();
        let squareHeight = this.getSquareHeight();



        if(this.m_opts.isBoardVisible){
            this.beginFill(this.getColorForColorType_inNum(SideType.BLACK));
            for (let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++) {
                for (let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++) {
                    let fileRank = new FileRank(fileNumber, rank);

                    if (ChessEngine.getColorTypeForFileRank(fileRank) == SideType.BLACK) {
                        let position = this.getPositionForFileRank(fileRank);
                        this.drawRect(position.x - squareWidth / 2, position.y - squareHeight / 2, squareWidth, squareHeight);
                    }

                }
            }
        }


        /*
        this.pointGroup = new PIXI.Container();
        this.addChild(this.pointGroup);

        this.squareGroup = new PIXI.Container();
        this.addChild(this.squareGroup);

        this.bottomGroup = new PIXI.Container();
        this.addChild(this.bottomGroup);

        this.pieceSpriteGroup = new PIXI.Container();
        this.addChild(this.pieceSpriteGroup);

        this.movingSpriteGroup = new PIXI.Container();
        this.addChild(this.movingSpriteGroup);

        this.fileRankNumberGroup = new PIXI.Container();
        this.addChild(this.fileRankNumberGroup);
        */





        this.uiBoardFiles = {};
        this.uiBoardRanks = {};
        this.initBoardNumbers();
        this.updateBoardNumbersColorPosition();


        //The select light of the board
        this.uiSelectLightSprite = PIXI.Sprite.from(ImageTag.select_light);
        this.uiSelectLightSprite.zIndex = ZORDER.SELECT_LIGHT;
        this.addChild(this.uiSelectLightSprite);
        this.uiSelectLightSprite.scale.set(this.m_opts.size / 700);
        this.uiSelectLightSprite.anchor.set(0.5, 0.5);
        this.uiSelectLightFileRank = null;
        this.hideSelectLightSprite();

        //The option cycle sprite
        this.uiOptionCycleSprite = PIXI.Sprite.from(ImageTag.option_light);
        this.uiOptionCycleSprite.zIndex = ZORDER.OPTION_CYCLE;
        this.addChild(this.uiOptionCycleSprite);
        this.uiOptionCycleSprite.scale.set(this.m_opts.size / 700);
        this.uiOptionCycleSprite.anchor.set(0.5, 0.5);
        this.uiOptionCycleSprite.alpha = 0.3;
        this.uiOptionCycleFileRank = null;
        this.hideOptionCycleSprite();

        //The squares
        this.uiSquares = {};
        for (let squareColor = SQUARE_COLORS.FIRST_COLOR; squareColor <= SQUARE_COLORS.LAST_COLOR; squareColor++) {
            this.uiSquares[squareColor] = {};
        }

        //the points
        this.uiPoints = {};
        for (let pointColor = POINT_COLORS.FIRST_COLOR; pointColor <= POINT_COLORS.LAST_COLOR; pointColor++) {
            this.uiPoints[pointColor] = {};
        }

        //the filerank pieces
        this.fileRankPieceSprites = {};
        for (let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++) {
            this.fileRankPieceSprites[fileNumber] = {};
            for (let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++) {
                this.fileRankPieceSprites[fileNumber][rank] = null;
            }
        }

        //The code related to the touchtype
        this.originFileRank = null;

        this.touchType = TouchTypes.NO_TOUCH;
        this.originSprite = null;
        this.originTouchLocation = null;
        this.currentTouchLocation = null;


        if(this.m_opts.initTouchLayer){
            this.uiTouchLayer = new TouchLayer(this, this.controller);
            this.uiTouchLayer.setIsEnabled(false);
        }
    }
    public setTouchEnabled(touchEnabled :boolean):void{
        if(this.m_opts.initTouchLayer){
            this.uiTouchLayer.setIsEnabled(touchEnabled);
        }
    }

    public getPieceSpriteForFileRank(fileRank : FileRank):PieceView | null{
        return this.fileRankPieceSprites[fileRank.x][fileRank.y];
    }
    public setPieceSpriteForFileRank(fileRank : FileRank, pieceView : PieceView | null){
        this.fileRankPieceSprites[fileRank.x][fileRank.y] = pieceView;
    }


    public createPieceView(pieceModel : PieceModel.Interface):PieceView{
        let pieceSprite = new PieceView(pieceModel, this.getSquareWidth(), this.getSquareHeight());
        pieceSprite.zIndex = ZORDER.NORMAL_SPRITE;
        pieceSprite.alpha = this.m_opts.pieceAlpha;
        pieceSprite.buttonMode = true;
        this.addChild(pieceSprite);

        return pieceSprite;
    }

    public removePieceView(pieceSprite : PieceView){
        this.removeChild(pieceSprite);
    }
    public setPieceSpriteToNormal(pieceSprite : PieceView){
        pieceSprite.setNormal();
        pieceSprite.zIndex = ZORDER.NORMAL_SPRITE;
    }
    public setPieceSpriteToMoving(pieceSprite : PieceView, isMovingFlag : boolean){
        if(isMovingFlag){
            pieceSprite.setMoving();
        }

        pieceSprite.zIndex = ZORDER.MOVING_SPRITE;
    }
    public movePieceSprite(pieceSprite: PieceView, callback : (() => void) | null, positionTo : PIXI.Point, speed : number){
        this.setPieceSpriteToMoving(pieceSprite, false);

        this.positionManager.moveTo(pieceSprite, ()=>{
            if(!this.positionManager.isMoving(pieceSprite)){
                this.setPieceSpriteToNormal(pieceSprite);
            }

            if(callback != null){
                callback();
            }

        },positionTo, speed*this.m_opts.size);
    }





    private getColorForFileRank_inNum(fileRank : FileRank):number{
        return this.getColorForColorType_inNum(ChessEngine.getColorTypeForFileRank(fileRank));
    }
    private getColorForFileRank_inString(fileRank : FileRank):string {
        return this.getColorForColorType_inString(ChessEngine.getColorTypeForFileRank(fileRank));
    }
    private getColorForColorType_inNum(colorType : SideType):number{
        let colors: { [key: number]: number } = {};
        colors[SideType.WHITE] = 0xFFFFFF;
        colors[SideType.BLACK] = 0x333333;

        colors[SideType.WHITE] = 0xFBE2B2;
        colors[SideType.BLACK] = 0xA66325;

        return colors[colorType];
    }
    private getColorForColorType_inString(colorType : SideType):string{
        let colors: { [key: number]: string } = {};
        colors[SideType.WHITE] = "#FFFFFF";
        colors[SideType.BLACK] = "#333333";

        colors[SideType.WHITE] = "#FBE2B2";
        colors[SideType.BLACK] = "#A66325";

        return colors[colorType];
    }



    public getSquareWidth(): number {
        return this.m_opts.size / ChessEngine.getNumOfFiles();
    }

    public getSquareHeight(): number {
        return this.m_opts.size / ChessEngine.getNumOfRanks();
    }


    public onTouchBegan(worldLocation: PIXI.Point, chessEngine: ChessEngine) {
        this.currentTouchLocation = worldLocation;
        this._onTouchBegan(worldLocation, chessEngine);
    }

    public _onTouchBegan(worldLocation: PIXI.Point, chessEngine: ChessEngine) {
        let fileRank = this.getFileRankForWorldLocation(worldLocation);
        if (this.touchType === TouchTypes.NO_TOUCH) {
            if (chessEngine.getPieceForFileRank(fileRank) !== null && this.getPieceSpriteForFileRank(fileRank) !== null) {
                let possibleMoves = chessEngine.getPossibleMoves(fileRank, null);
                for (let i = 0; i < possibleMoves.length; i++) {
                    let possibleMove = possibleMoves[i];

                    let pointColor = null;
                    if (chessEngine.isMoveLegal(possibleMove, true)) {
                        pointColor = POINT_COLORS.GREEN;
                    } else {
                        pointColor = POINT_COLORS.RED;
                    }

                    this.addPoint(possibleMove.destFileRank, pointColor);
                }

                let vectorMoves = chessEngine.getVectorMoves(fileRank, null);
                for (let i = 0; i < vectorMoves.length; i++) {
                    let vectorMove = vectorMoves[i];

                    if (!this.hasPoint(vectorMove.destFileRank, POINT_COLORS.GREEN)) {
                        this.addPoint(vectorMove.destFileRank, POINT_COLORS.RED);
                    }
                }


                this.showSelectLightSprite(fileRank);

                this.originFileRank = fileRank;
                this.originSprite = <PieceView>this.getPieceSpriteForFileRank(this.originFileRank);
                this.originTouchLocation = worldLocation;


                setTimeout(() => {
                    if (this.currentTouchLocation === null || this.originTouchLocation === null || this.originSprite == null) {
                        return;
                    }


                    this.touchType = TouchTypes.DRAG_TOUCH;

                    this.setPieceSpriteToMoving(this.originSprite, true);
                    this._onTouchMoved(this.currentTouchLocation, chessEngine);
                }, 200);


                this.positionManager.stopMoving(this.originSprite);

                this.touchType = TouchTypes.ONE_TOUCH;
            } else {
                this.touchType = TouchTypes.NO_TOUCH;
            }
        } else if (this.touchType === TouchTypes.ONE_TOUCH) {
            this.onTouchHelper(worldLocation, fileRank, chessEngine);
        }
    }

    public onTouchMoved(worldLocation: PIXI.Point, chessEngine: ChessEngine) {
        this.currentTouchLocation = worldLocation;

        this._onTouchMoved(worldLocation, chessEngine);
    }

    public _onTouchMoved(worldLocation: PIXI.Point, chessEngine: ChessEngine) {
        let position = this.getPositionForWorldLocation(worldLocation);
        let fileRank = this.getFileRankForPosition(position);

        if (this.touchType === TouchTypes.DRAG_TOUCH) {
            this.showOptionCycleSprite(ChessEngine.getClosestLegalFileRank(fileRank));

            let halfSquareWidth = this.getSquareWidth()/2;
            let halfSquareHeight = this.getSquareHeight()/2;

            let minX = -this.m_opts.size/2 + halfSquareWidth;
            let maxX = this.m_opts.size/2 - halfSquareWidth;

            let minY = -this.m_opts.size/2 + halfSquareHeight;
            let maxY = this.m_opts.size/2 - halfSquareHeight;

            //console.log("original position", position);
            position.x = Math.max(minX, Math.min(maxX, position.x));
            position.y = Math.max(minY, Math.min(maxY, position.y));
            //console.log("new position", position);

            (<PieceView>this.originSprite).position = position;
            //(<PieceView>this.originSprite).position.set(0, 0);
        }
    }

    public onTouchEnded(worldLocation: PIXI.Point, chessEngine: ChessEngine | null) {
        this.currentTouchLocation = null;

        this._onTouchEnded(worldLocation, chessEngine);
    }

    public _onTouchEnded(worldLocation: PIXI.Point, chessEngine: ChessEngine | null) {
        if (this.touchType === TouchTypes.NO_TOUCH) {
            return;
        }

        let fileRank = this.getFileRankForWorldLocation(worldLocation);
        this.onTouchHelper(worldLocation, fileRank, chessEngine);
    }

    public onTouchHelper(worldLocation: PIXI.Point, fileRank: FileRank, chessEngine: ChessEngine | null) {
        this.removeAllPoints();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();

        let legalMoves : MoveClass[] = [];
        if(chessEngine != null){
            legalMoves = chessEngine.getLegalMoves(<FileRank>this.originFileRank, fileRank, true);
        }

        this.setPieceSpriteToNormal(<PieceView>this.originSprite);



        let lastTouchType = this.touchType;
        let lastOriginFileRank = this.originFileRank;
        let lastOriginSprite = this.originSprite;

        this.originFileRank = null;
        this.originTouchLocation = null;
        this.originSprite = null;

        this.touchType = TouchTypes.NO_TOUCH;


        if(legalMoves.length == 0){
            let positionTo = this.getPositionForFileRank(<FileRank>lastOriginFileRank);

            this.movePieceSprite(<PieceView>lastOriginSprite, null, positionTo, this.m_opts.moveSpeedIllegal);

            if(lastTouchType == TouchTypes.ONE_TOUCH && chessEngine != null){
                this._onTouchBegan(worldLocation, chessEngine);
            }
        }else if(legalMoves.length == 1){
            this.controller.notifyMove(legalMoves[0], this);
        }else {
            this.normalizePromote(legalMoves);
        }


    }



    public flipBoardFacing(isAnimation : boolean){
        this.setBoardFacing(ChessEngine.getOppositeSideType(this.boardFacing),isAnimation);
    }

    public setBoardFacing(boardFacing : SideType, isAnimation : boolean){
        if(boardFacing == this.boardFacing){
            return;
        }

        let oldBoardFacing = this.boardFacing;
        let newBoardFacing = boardFacing;


        for(let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++){
            for(let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++){
                let fileRank = new FileRank(fileNumber, rank);


                let sprite = this.getPieceSpriteForFileRank(fileRank);
                if(sprite != null) {
                    let positionFrom: PIXI.Point;
                    let positionTo: PIXI.Point;

                    this.boardFacing = oldBoardFacing;
                    positionFrom = this.getPositionForFileRank(fileRank);

                    this.boardFacing = newBoardFacing;
                    positionTo = this.getPositionForFileRank(fileRank);


                    if(isAnimation){
                        this.movePieceSprite(sprite, null, positionTo, this.m_opts.moveSpeedFlipBoard);
                    }else {
                        sprite.position = positionTo;
                    }

                }
            }
        }

        this.boardFacing = newBoardFacing;


        //Flip the squares and the points
        if(isAnimation){
            for(let squareColor = SQUARE_COLORS.FIRST_COLOR; squareColor <= SQUARE_COLORS.LAST_COLOR; squareColor++){
                let hashs : number[] = [];

                for(let _hash in this.uiSquares[squareColor]){
                    hashs.push(Number(_hash));
                }

                this.removeSquaresByColor(squareColor);
                for(let i = 0; i < hashs.length; i++){
                    let fileRank = ChessEngine.getFileRankForHash(hashs[i]);
                    this.addSquare(fileRank, squareColor);
                }
            }

            for(let pointColor = POINT_COLORS.FIRST_COLOR; pointColor <= POINT_COLORS.LAST_COLOR; pointColor++){
                let hashs : number[] = [];

                for(let _hash in this.uiPoints[pointColor]){
                    hashs.push(Number(_hash));
                }

                this.removePointsByColor(pointColor);
                for(let i = 0; i < hashs.length; i++){
                    let fileRank = ChessEngine.getFileRankForHash(hashs[i]);
                    this.addPoint(fileRank, pointColor);
                }
            }
        }else {
            for(let squareColor = SQUARE_COLORS.FIRST_COLOR; squareColor <= SQUARE_COLORS.LAST_COLOR; squareColor++){
                for(let _hash in this.uiSquares[squareColor]){
                    let hash = Number(_hash);

                    let uiSquare = this.uiSquares[squareColor][hash];
                    let fileRank = ChessEngine.getFileRankForHash(hash);
                    uiSquare.position = this.getPositionForFileRank(fileRank);
                }
            }

            for(let pointColor = POINT_COLORS.FIRST_COLOR; pointColor <= POINT_COLORS.LAST_COLOR; pointColor++){
                for(let _hash in this.uiPoints[pointColor]){
                    let hash = Number(_hash);

                    let uiPoint = this.uiPoints[pointColor][hash];
                    let fileRank = ChessEngine.getFileRankForHash(hash);
                    uiPoint.position = this.getPositionForFileRank(fileRank);
                }
            }
        }


        //flip the other graphics
        if(this.uiOptionCycleFileRank != null){
            this.uiOptionCycleSprite.position = this.getPositionForFileRank(this.uiOptionCycleFileRank);
        }
        if(this.uiSelectLightFileRank != null){
            this.uiSelectLightSprite.position = this.getPositionForFileRank(this.uiSelectLightFileRank);
        }

        this.updateBoardNumbersColorPosition();
    }
    public getBoardFacing():SideType{
        return this.boardFacing;
    }


    private initBoardNumbers() {
        for(let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++){
            let file = <string>ChessEngine.convertFileNumberToFile(fileNumber);

            let fileUi = new PIXI.Text(file);
            fileUi.zIndex = ZORDER.FILE_RANK_NUMBER;
            fileUi.visible = this.m_opts.isBoardVisible;
            this.uiBoardFiles[fileNumber] = fileUi;

            fileUi.anchor.set(0.0, 0.0);
            this.addChild(fileUi);

        }
        for(let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++){

            let rankUi = new PIXI.Text(rank.toString());
            rankUi.zIndex = ZORDER.FILE_RANK_NUMBER;
            rankUi.visible = this.m_opts.isBoardVisible;
            this.uiBoardRanks[rank] = rankUi;

            rankUi.anchor.set(1.0, 1.0);
            this.addChild(rankUi);
        }
    }

    private updateBoardNumbersColorPosition(){
        let squareWidth = this.getSquareWidth();
        let squareHeight = this.getSquareHeight();

        for(let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++){
            let fileUi = this.uiBoardFiles[fileNumber];

            let rank : number = -1;
            switch (this.boardFacing){
                case SideType.WHITE:
                    rank = 1;
                    break;
                case SideType.BLACK:
                    rank = ChessEngine.getNumOfRanks();
                    break;
            }


            let fileRank = new FileRank(fileNumber, rank);

            let fileUiPosition = this.getPositionForFileRank(fileRank);
            fileUiPosition.x = fileUiPosition.x - squareWidth/2;
            fileUiPosition.y = fileUiPosition.y - squareHeight/2;

            fileUi.position = fileUiPosition;


            let colorType = ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine.getOppositeSideType(colorType);

            let textStyleOptions = { fill : this.getColorForColorType_inString(colorType),
                fontSize :  Math.round(this.m_opts.size/30)};


            fileUi.style = new PIXI.TextStyle(textStyleOptions);
        }

        for(let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++){
            let rankUi = this.uiBoardRanks[rank];

            let fileNumber : number = -1;
            switch (this.boardFacing){
                case SideType.WHITE:
                    fileNumber = ChessEngine.getNumOfFiles();
                    break;
                case SideType.BLACK:
                    fileNumber = 1;
                    break;
            }

            let fileRank = new FileRank(fileNumber, rank);

            let rankUiPosition = this.getPositionForFileRank(fileRank);
            rankUiPosition.x = rankUiPosition.x + squareWidth/2;
            rankUiPosition.y = rankUiPosition.y + squareHeight/2;

            rankUi.position = rankUiPosition;


            let colorType = ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine.getOppositeSideType(colorType);

            let textStyleOptions = { fill : this.getColorForColorType_inString(colorType),
                fontSize :  Math.round(this.m_opts.size/30)};

            rankUi.style = new PIXI.TextStyle(textStyleOptions);
        }
    }



    public getPositionForFileRank(fileRank: FileRank): PIXI.Point {
        let x: number = 0;
        let y: number = 0;


        let minX = this.m_opts.size / (ChessEngine.getNumOfFiles() * 2);
        let maxX = this.m_opts.size - minX;

        minX -= this.m_opts.size / 2;
        maxX -= this.m_opts.size / 2;

        let minY = this.m_opts.size / (ChessEngine.getNumOfRanks() * 2);
        let maxY = this.m_opts.size - minY;

        minY -= this.m_opts.size / 2;
        maxY -= this.m_opts.size / 2;

        switch(this.boardFacing){
            case SideType.WHITE:
                x = minX + (maxX - minX) * (fileRank.x - 1) / (ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (ChessEngine.getNumOfRanks() - fileRank.y) / (ChessEngine.getNumOfRanks() - 1);
                break;
            case SideType.BLACK:
                x = minX + (maxX - minX) * (ChessEngine.getNumOfFiles() - fileRank.x) / (ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (fileRank.y - 1) / (ChessEngine.getNumOfRanks() - 1);
                break;
        }

        return new PIXI.Point(x, y);
    }

    public getFileRankForPosition(position: PIXI.Point): FileRank {
        let squareWidth = this.getSquareWidth();
        let squareHeight = this.getSquareHeight();

        let fileNumber: number = -1;
        let rank: number = -1;

        switch (this.boardFacing){
            case SideType.WHITE:
                fileNumber = Math.floor((position.x + this.m_opts.size / 2) / squareWidth) + 1;
                rank = ChessEngine.getNumOfRanks() - (Math.floor((position.y + this.m_opts.size / 2) / squareHeight) + 1) + 1;
                break;
            case SideType.BLACK:
                fileNumber = ChessEngine.getNumOfFiles() - (Math.floor((position.x + this.m_opts.size / 2) / squareWidth) + 1) + 1;
                rank = Math.floor((position.y + this.m_opts.size / 2) / squareHeight) + 1;
                break;
        }




        return new FileRank(fileNumber, rank);
    }

    public getPositionForWorldLocation(worldLocation: PIXI.Point): PIXI.Point {
        return this.toLocal(worldLocation);
    }

    public getFileRankForWorldLocation(worldLocation: PIXI.Point): FileRank {
        return this.getFileRankForPosition(this.getPositionForWorldLocation(worldLocation));
    }







    public updateViewToModel(chessEngine: ChessEngine | null) {
        //Hide all possible sprites, that can be displayed
        this.positionManager.stopMoving(null);

        this.removeAllPoints();
        this.removeAllSquares();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();


        // @ts-ignore
        let rememPieceMap : { [key in SideType] : { [key in PieceType] : PieceView[]}} = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            // @ts-ignore
            rememPieceMap[sideType] = {};
            for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; pieceType++){
                rememPieceMap[sideType][pieceType] = [];
            }
        }

        //Remove all board sprites and draw them again
        for (let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++) {
            for (let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++) {
                let fileRank = new FileRank(fileNumber, rank);

                let pieceSprite = this.getPieceSpriteForFileRank(fileRank);

                if (pieceSprite != null) {
                    this.setPieceSpriteForFileRank(fileRank, null);
                    this.removePieceView(pieceSprite);

                    rememPieceMap[pieceSprite.getSideType()][pieceSprite.getPieceType()].push(pieceSprite)
                }
            }
        }


        if(chessEngine == null){
            return;
        }


        let pieceToSquareMap = chessEngine.getPieceToSquareMap();
        for (let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++) {
            for (let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; pieceType++) {
                let positions = pieceToSquareMap[sideType][pieceType];
                for (let i = 0; i < positions.length; i++) {
                    let fileRank = positions[i];

                    let pieceSprite : PieceView;
                    if(rememPieceMap[sideType][pieceType].length > 0){
                        pieceSprite = <PieceView>rememPieceMap[sideType][pieceType].pop();
                        this.setPieceSpriteToNormal(pieceSprite);
                    }else {
                        pieceSprite = this.createPieceView({sideType : sideType, pieceType : pieceType});
                    }


                    pieceSprite.position = this.getPositionForFileRank(fileRank);
                    this.setPieceSpriteForFileRank(fileRank, pieceSprite);
                }
            }
        }


        this.addLastMoveSquares(chessEngine.getLastMoveClass());
    }
    public updatePieceViewsToDefault(){
        for(let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++){
            for(let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++){
                let fileRank = new FileRank(fileNumber, rank);


                let sprite = this.getPieceSpriteForFileRank(fileRank);
                if(sprite != null) {
                    let positionFrom: PIXI.Point = this.positionManager.getPosition(sprite);
                    let positionTo: PIXI.Point = this.getPositionForFileRank(fileRank);

                    this.movePieceSprite(sprite, null, positionTo, this.m_opts.moveSpeedFlipBoard);
                }
            }
        }
    }


    public hasPoint(fileRank: FileRank, pointColor: POINT_COLORS | null): boolean {
        let hash = ChessEngine.getHashForFileRank(fileRank);

        let ret = false;

        if (pointColor == null) {
            for (pointColor = POINT_COLORS.FIRST_COLOR; pointColor <= POINT_COLORS.LAST_COLOR; pointColor) {
                ret = ret || (this.uiPoints[pointColor][hash] != undefined);
            }
        } else {
            ret = this.uiPoints[pointColor][hash] != undefined;
        }

        return ret;
    }

    public addPoint(fileRank: FileRank, pointColor: POINT_COLORS) {
        let hash = ChessEngine.getHashForFileRank(fileRank);

        if (this.uiPoints[pointColor][hash] == undefined) {
            let uiPoint = new PointColorNode(pointColor, this.getSquareWidth(), this.getSquareHeight());
            uiPoint.zIndex = ZORDER.POINT;

            uiPoint.position = this.getPositionForFileRank(fileRank);

            this.uiPoints[pointColor][hash] = uiPoint;
            this.addChild(uiPoint);
        }
    }

    public removePointsByColor(pointColor: POINT_COLORS) {
        for (let hash in this.uiPoints[pointColor]) {
            this.removeChild(this.uiPoints[pointColor][hash]);
        }
        this.uiPoints[pointColor] = {};
    }

    public removeAllPoints() {
        for (let pointColor = POINT_COLORS.FIRST_COLOR; pointColor <= POINT_COLORS.LAST_COLOR; pointColor++) {
            this.removePointsByColor(pointColor);
        }
    }


    //Code to do with adding squares
    public hasSquare(fileRank: FileRank, squareColor: SQUARE_COLORS | null):boolean{
        let hash = ChessEngine.getHashForFileRank(fileRank);

        let ret : boolean;

        if(squareColor == null){
            ret = false;
            for(squareColor = SQUARE_COLORS.FIRST_COLOR; squareColor <= SQUARE_COLORS.LAST_COLOR; squareColor++){
                ret = ret || this.uiSquares[squareColor][hash] != undefined;
            }
        }else {
            ret = this.uiSquares[squareColor][hash] != undefined
        }

        return ret;
    }


    public addSquare(fileRank: FileRank, squareColor: SQUARE_COLORS) {
        if(!this.m_opts.displaySquares){
            return;
        }

        let hash = ChessEngine.getHashForFileRank(fileRank);

        if(this.uiSquares[squareColor][hash] == undefined){

            let uiSquare = new SquareColorNode(squareColor, this.getSquareWidth(), this.getSquareHeight());
            uiSquare.zIndex = ZORDER.SQUARE;
            uiSquare.position = this.getPositionForFileRank(fileRank);

            this.uiSquares[squareColor][hash] = uiSquare;

            this.addChild(uiSquare);
        }
    }


    public removeSquaresByColor(squareColor: SQUARE_COLORS) {
        for(let _hash in this.uiSquares[squareColor]){
            let hash = parseInt(_hash);

            let uiSquare = this.uiSquares[squareColor][hash];

            this.removeChild(uiSquare);
        }


        this.uiSquares[squareColor] = {};
    }

    public removeAllSquares() {
        for (let squareColor = SQUARE_COLORS.FIRST_COLOR; squareColor <= SQUARE_COLORS.LAST_COLOR; squareColor++) {
            this.removeSquaresByColor(squareColor);
        }
    }


    public hideSelectLightSprite() {
        this.uiSelectLightFileRank = null;
        this.uiSelectLightSprite.visible = false;
    }

    public showSelectLightSprite(fileRank: FileRank) {
        if(this.uiSelectLightFileRank != null){
            if(FileRank.isEqual(fileRank, this.uiSelectLightFileRank)){
                return;
            }
        }

        this.uiSelectLightFileRank = fileRank;

        this.uiSelectLightSprite.position = this.getPositionForFileRank(this.uiSelectLightFileRank);
        this.uiSelectLightSprite.visible = true;
    }


    public hideOptionCycleSprite() {
        this.uiOptionCycleFileRank = null;
        this.uiOptionCycleSprite.visible = false;
    }

    public showOptionCycleSprite(fileRank: FileRank) {
        if (this.uiOptionCycleFileRank != null) {
            if(FileRank.isEqual(fileRank, this.uiOptionCycleFileRank)){
                return;
            }
        }

        this.uiOptionCycleFileRank = fileRank;

        this.uiOptionCycleSprite.position = this.getPositionForFileRank(this.uiOptionCycleFileRank);
        this.uiOptionCycleSprite.visible = true;
    }


    public addLastMoveSquares(moveClass: MoveClass | null) {
        if(moveClass == null){
            return;
        }
        let originFileRank = moveClass.originFileRank;
        let destFileRank = moveClass.destFileRank;


        this.addSquare(originFileRank, SQUARE_COLORS.BLUE);
        this.addSquare(destFileRank, SQUARE_COLORS.BLUE);
    }









    private normalizePromote(legalMoves : MoveClass[]){
        let cb = (_ : MoveClass, __ : boolean) => {
            this.controller.notifyPromote(legalMoves, this);
        };
        this.doMoveAnimation(legalMoves[0], false, false, cb);
    }
    public doMove(moveClass : MoveClass, cb : ((moveClass : MoveClass, isUndoMove : boolean) => void) | null = null){
        this.doMoveAnimation(moveClass, false, true, cb);
        this.addLastMoveSquares(moveClass);
    }

    public doMoveAnimation(moveClass : MoveClass, isUndoMove : boolean, isStrictMove : boolean, endAnimation : ((moveClass : MoveClass, isUndoMove : boolean) => void) | null){
        if(this.touchType != TouchTypes.NO_TOUCH) {
            this.onTouchEnded(new PIXI.Point(this.m_opts.size * 100, this.m_opts.size* 100), null);
        }
        this.removeAllSquares();

        let removeAddMoveStructs : MoveClass.RemoveAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(false);





        // @ts-ignore
        let removeStructs : ({sprite : PieceView | null} & MoveClass.RemoveStruct)[] = removeAddMoveStructs.removeStructs;
        for(let i = 0; i < removeStructs.length; i++){
            removeStructs[i].sprite = null;
        }

        // @ts-ignore
        let addStructs : ({sprite : PieceView | null} & MoveClass.AddStruct)[] = removeAddMoveStructs.addStructs;
        for(let i = 0; i < addStructs.length; i++){
            addStructs[i].sprite = null;
        }

        // @ts-ignore
        let moveStructs : ({sprite : PieceView | null} & MoveClass.MoveStruct)[] = removeAddMoveStructs.moveStructs;
        for(let i = 0; i < moveStructs.length; i++){
            moveStructs[i].sprite = null;
        }




        if(isStrictMove){
            for(let i = 0; i < removeStructs.length; i++){
                let removeStruct = removeStructs[i];

                let fileRank = removeStruct.fileRank;
                let piece = removeStruct.piece;

                {
                    let pieceSprite = this.getPieceSpriteForFileRank(fileRank);
                    if(pieceSprite == null){
                        pieceSprite = this.createPieceView(piece);
                        pieceSprite.position = this.getPositionForFileRank(fileRank)
                        this.setPieceSpriteForFileRank(fileRank, pieceSprite);
                    }
                }


                let pieceSprite = <PieceView>this.getPieceSpriteForFileRank(fileRank);
                pieceSprite.setPiece(piece);
                removeStruct.sprite = pieceSprite;

                this.setPieceSpriteForFileRank(fileRank, null);
            }

            for(let i = 0; i < moveStructs.length; i++){
                let moveStruct = moveStructs[i];

                let originFileRank = moveStruct.originFileRank;
                let destFileRank = moveStruct.destFileRank;

                let originPiece = moveStruct.originPiece;
                let destPiece = moveStruct.destPiece;

                let pieceSprite = this.getPieceSpriteForFileRank(originFileRank);
                if(pieceSprite == null){
                    pieceSprite = this.createPieceView(originPiece);
                    pieceSprite.position = this.getPositionForFileRank(originFileRank);
                    this.setPieceSpriteForFileRank(originFileRank, pieceSprite);
                }

                pieceSprite.setPiece(originPiece);

                moveStruct.sprite = pieceSprite;

                this.setPieceSpriteForFileRank(originFileRank, null);
            }
            for(let i = 0; i < moveStructs.length; i++){
                let moveStruct = moveStructs[i];

                let originFileRank = moveStruct.originFileRank;
                let destFileRank = moveStruct.destFileRank;

                let originPiece = moveStruct.originPiece;
                let destPiece = moveStruct.destPiece;

                {
                    let pieceSprite = this.getPieceSpriteForFileRank(destFileRank);
                    if(pieceSprite != null){
                        this.removePieceView(pieceSprite);
                        this.setPieceSpriteForFileRank(destFileRank, null);
                    }
                }

                this.setPieceSpriteForFileRank(destFileRank, moveStruct.sprite);
            }


            for(let i = 0; i < addStructs.length; i++){
                let addStruct = addStructs[i];

                let fileRank = addStruct.fileRank;
                let piece = addStruct.piece;


                {
                    let pieceSprite = this.getPieceSpriteForFileRank(fileRank);
                    if(pieceSprite != null){
                        this.removePieceView(pieceSprite);
                        this.setPieceSpriteForFileRank(fileRank, null);
                    }
                }



                let pieceSprite = this.createPieceView(piece);
                pieceSprite.position = this.getPositionForFileRank(fileRank);

                pieceSprite.visible = false;

                addStruct.sprite = pieceSprite;

                this.setPieceSpriteForFileRank(fileRank, pieceSprite);
            }
        }else {
            for(let i = 0; i < moveStructs.length; i++){
                let moveStruct = moveStructs[i];
                moveStruct.sprite = this.getPieceSpriteForFileRank(moveStruct.originFileRank);
            }
        }



        let moveStructCounter = 0;
        let globalMoveCallback = (moveStruct : ({sprite : PieceView | null} & MoveClass.MoveStruct) | null) => {
            if(moveStruct != null) {
                moveStructCounter = moveStructCounter + 1;

                let originPiece = moveStruct.originPiece;
                let destPiece = moveStruct.destPiece;

                if(isStrictMove){
                    (<PieceView>moveStruct.sprite).setPiece(destPiece);
                }
            }

            if(moveStructCounter == moveStructs.length && isStrictMove){
                for(let i = 0; i < removeStructs.length; i++) {
                    let removeStruct = removeStructs[i];

                    this.removePieceView(<PieceView>removeStruct.sprite);
                }

                for(let i = 0; i < addStructs.length; i++) {
                    let addStruct = moveStructs[i];

                    (<PieceView>addStruct.sprite).visible = true;
                }

            }

            if(endAnimation != null){
                endAnimation(moveClass, isUndoMove);
            }
        };

        for(let i = 0; i < moveStructs.length; i++){
            let moveStruct = moveStructs[i];

            let originFileRank = moveStruct.originFileRank;
            let destFileRank = moveStruct.destFileRank;

            let sprite = moveStruct.sprite;


            let localMoveCallback : ( () => void ) | null = () => {
                globalMoveCallback(moveStruct);
            };

            if(sprite == null){
                localMoveCallback();
            }else {
                let positionTo : PIXI.Point = this.getPositionForFileRank(destFileRank);


                if(isUndoMove){
                    localMoveCallback();
                    localMoveCallback = null;
                }

                let speed : number = isUndoMove ? this.m_opts.moveSpeedUndo : this.m_opts.moveSpeedNormal;
                this.movePieceSprite(sprite, localMoveCallback, positionTo, speed);
            }



        }

        if(moveStructs.length == 0){
            globalMoveCallback(null);
        }
    }
}




