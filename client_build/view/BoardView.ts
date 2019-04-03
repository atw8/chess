/// <reference path="../../node_modules/phaser-ce/typescript/phaser.d.ts" />

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

import {Controller} from "./../controller/Controller";


import {AbstractViewInterfaceType} from "./viewInterface/AbstractViewInterface";
import {AbstractViewInterface} from "./viewInterface/AbstractViewInterface";
import {PredictViewInterface} from "./viewInterface/PredictViewInterface";
import {PieceViewInterface} from "./viewInterface/PieceViewInterface";


import {PositionManager} from "./PositionControl/PositionManager";
import {PositionConstantSpeed} from "./PositionControl/PositionConstantSpeed";
import {PositionMovePiece} from "./PositionControl/PositionMovePiece";


import 'p2';
import 'pixi';
import 'phaser';
import {ImageTag} from "../ImageTag";


const Global = require("./../Global");


interface AddStruct {
    fileRank : FileRank;
    piece : PieceModel;

    sprite : PieceView | null;
}

interface RemoveStruct {
    fileRank: FileRank;
    piece: PieceModel;

    sprite: PieceView | null;
}

interface MoveStruct {
    originPiece : PieceModel;
    destPiece : PieceModel;
    originFileRank : FileRank;
    destFileRank : FileRank;

    sprite: PieceView | null;
}



enum TouchTypes {
    NO_TOUCH = 0,
    DRAG_TOUCH = 1,
    ONE_TOUCH = 2,
}

enum ActionMovingTypes {
    MOVE = 1,
    UNMOVE = 2,
    ILLEGAL = 3,
    FLIP_BOARD = 4,
    PREDICT = 5,
}



export class BoardView extends Phaser.Graphics {

    private boardFacing: SideType;

    private pieceViewInterface: PieceViewInterface;
    private uiBoardFiles: { [key: number]: Phaser.Text };
    private uiBoardRanks: { [key: number]: Phaser.Text };

    private uiSquares: { [key: number]: { [key: number]: SquareColorNode } };
    private uiPoints: { [key: number]: { [key: number]: PointColorNode } };

    private uiSelectLightSprite: Phaser.Sprite;

    private uiOptionCycleSprite: Phaser.Sprite;
    private uiOptionCycleFileRank: FileRank | null;

    private originFileRank: FileRank | null;
    private originSprite: PieceView | null;

    private touchType = TouchTypes.NO_TOUCH;

    private originTouchLocation: Phaser.Point| null;
    private currentTouchLocation: Phaser.Point | null;

    private positionManager : PositionManager;
    public getPositionManager():PositionManager {
        return this.positionManager;
    }


    private m_width: number;
    private m_height: number;
    private controller: Controller;

    public getWidth():number{
        return this.m_width;
    }
    public getHeight():number{
        return this.m_height;
    }

    private fileRankNumberGroup : Phaser.Group;
    private pointGroup: Phaser.Group;
    private squareGroup : Phaser.Group;
    private bottomGroup : Phaser.Group;

    private predictSpriteGroup : Phaser.Group;

    private predictMoves : { [key : string] : PredictViewInterface };


    constructor(width: number, height: number, controller: Controller) {
        super(Global.game);

        this.m_width = width;
        this.m_height = height;
        this.controller = controller;

        this.boardFacing = SideType.WHITE;


        this.positionManager = new PositionManager();



        this.beginFill(this.getColorForColorType_inNum(SideType.WHITE));
        this.drawRect(-this.m_width / 2, -this.m_height / 2, this.m_width, this.m_height);


        let squareWidth = this.getSquareWidth();
        let squareHeight = this.getSquareHeight();


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


        this.predictSpriteGroup = new Phaser.Group(Global.game);
        this.addChild(this.predictSpriteGroup);


        this.pointGroup = new Phaser.Group(Global.game);
        this.addChild(this.pointGroup);

        this.squareGroup = new Phaser.Group(Global.game);
        this.addChild(this.squareGroup);

        this.bottomGroup = new Phaser.Group(Global.game);
        this.addChild(this.bottomGroup);


        let pieceSpriteGroup = new Phaser.Group(Global.game);
        this.addChild(pieceSpriteGroup);


        this.fileRankNumberGroup = new Phaser.Group(Global.game);
        this.addChild(this.fileRankNumberGroup);




        this.pieceViewInterface = new PieceViewInterface(this.controller, pieceSpriteGroup, this.getSquareWidth(), this.getSquareHeight());
        this.predictMoves = {};


        this.uiBoardFiles = {};
        this.uiBoardRanks = {};
        this.initBoardNumbers();
        this.updateBoardNumbersColorPosition();


        //The select light of the board
        this.uiSelectLightSprite = new Phaser.Sprite(Global.game, 0, 0, ImageTag.select_light);
        this.bottomGroup.add(this.uiSelectLightSprite);
        this.uiSelectLightSprite.scale.set(this.m_width / 700, this.m_height / 700);
        this.uiSelectLightSprite.anchor.set(0.5, 0.5);
        this.hideSelectLightSprite();

        //The option cycle sprite
        this.uiOptionCycleSprite = new Phaser.Sprite(Global.game, 0, 0, ImageTag.option_light);
        this.bottomGroup.add(this.uiOptionCycleSprite);
        this.uiOptionCycleSprite.scale.set(this.m_width / 700, this.m_height / 700);
        this.uiOptionCycleSprite.anchor.set(0.5, 0.5);
        this.uiOptionCycleFileRank = null;
        this.hideOptionCycleSprite();

        //The squares
        this.uiSquares = {};
        for (let squareColor = SQUARE_COLORS.FIRST_COLOR; squareColor <= SQUARE_COLORS.LAST_COLOR; squareColor++) {
            this.uiSquares[squareColor] = {};
        }


        this.uiPoints = {};
        for (let pointColor = POINT_COLORS.FIRST_COLOR; pointColor <= POINT_COLORS.LAST_COLOR; pointColor++) {
            this.uiPoints[pointColor] = {};
        }


        //The code related to the touchtype
        this.originFileRank = null;

        this.touchType = TouchTypes.NO_TOUCH;
        this.originSprite = null;
        this.originTouchLocation = null;
        this.currentTouchLocation = null;
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
        let squareWidth = this.m_width / ChessEngine.getNumOfFiles();

        return squareWidth;
    }

    public getSquareHeight(): number {
        let squareHeight = this.m_height / ChessEngine.getNumOfRanks();

        return squareHeight;
    }


        public onTouchBegan(worldLocation: Phaser.Point, chessEngine: ChessEngine) {
        this.currentTouchLocation = worldLocation;
        this._onTouchBegan(worldLocation, chessEngine);
    }

    public _onTouchBegan(worldLocation: Phaser.Point, chessEngine: ChessEngine) {
        let fileRank = this.getFileRankForWorldLocation(worldLocation);
        if (this.touchType === TouchTypes.NO_TOUCH) {
            if (chessEngine.getPieceForFileRank(fileRank) !== null && this.pieceViewInterface.getPieceSpriteForFileRank(fileRank) !== null) {
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
                this.originSprite = <PieceView>this.pieceViewInterface.getPieceSpriteForFileRank(this.originFileRank);
                this.originTouchLocation = worldLocation;


                Global.game.time.events.add(200, () => {
                    if (this.currentTouchLocation === null || this.originTouchLocation === null || this.originSprite == null) {
                        return;
                    }


                    this.touchType = TouchTypes.DRAG_TOUCH;

                    this.originSprite.setMoving();
                    this._onTouchMoved(this.currentTouchLocation, chessEngine);
                });

                while(this.positionManager.isMovingSprite(this.originSprite)){
                    this.positionManager.updateMovingSprites(60 * 60 * 1000, this.originSprite);
                }
                this.originSprite.bringToTop();
                this.touchType = TouchTypes.ONE_TOUCH;
            } else {
                this.touchType = TouchTypes.NO_TOUCH;
            }
        } else if (this.touchType === TouchTypes.ONE_TOUCH) {
            this.onTouchHelper(worldLocation, fileRank, chessEngine);
        }
    }

    public onTouchMoved(worldLocation: Phaser.Point, chessEngine: ChessEngine) {
        this.currentTouchLocation = worldLocation;

        this._onTouchMoved(worldLocation, chessEngine);
    }

    public _onTouchMoved(worldLocation: Phaser.Point, chessEngine: ChessEngine) {
        let fileRank = this.getFileRankForWorldLocation(worldLocation);

        if (this.touchType === TouchTypes.DRAG_TOUCH) {
            this.showOptionCycleSprite(fileRank);

            (<PieceView>this.originSprite).position = this.getPositionForWorldLocation(worldLocation);
        }
    }

    public onTouchEnded(worldLocation: Phaser.Point, chessEngine: ChessEngine | null) {
        this.currentTouchLocation = null;

        this._onTouchEnded(worldLocation, chessEngine);
    }

    public _onTouchEnded(worldLocation: Phaser.Point, chessEngine: ChessEngine | null) {
        if (this.touchType === TouchTypes.NO_TOUCH) {
            return;
        }

        let fileRank = this.getFileRankForWorldLocation(worldLocation);
        this.onTouchHelper(worldLocation, fileRank, chessEngine);
    }

    public onTouchHelper(worldLocation: Phaser.Point, fileRank: FileRank, chessEngine: ChessEngine | null) {
        this.removeAllPoints();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();

        let legalMoves : MoveClass[] = [];
        if(chessEngine != null){
            legalMoves = chessEngine.getLegalMoves(<FileRank>this.originFileRank, fileRank, true);
        }

        (<PieceView>this.originSprite).setNormal();



        let isIllegalMove : boolean = false;

        if (legalMoves.length === 0) {
            isIllegalMove = true;
        }else if(legalMoves.length >= 1) {
            if (legalMoves.length == 1) {
                isIllegalMove = this.controller.notifyMove(legalMoves[0], false);
            } else {
                //this.normalizeMoveClass(legalMoves);
            }
        }

        if(isIllegalMove){
            let positionFrom : Phaser.Point;
            if(this.positionManager.isMovingSprite(<PieceView>this.originSprite)){
                positionFrom = this.getPositionForFileRank(<FileRank>this.originFileRank);
            } else {
                positionFrom = (<PieceView>this.originSprite).position.clone();
            }


            let positionTo = this.getPositionForFileRank(<FileRank>this.originFileRank);
            let actionMovingType = ActionMovingTypes.ILLEGAL;
            let finishCallback = null;

            this.addMovingSprite(<PieceView>this.originSprite, positionFrom, positionTo, actionMovingType, finishCallback);
        }

        let lastTouchType = this.touchType;

        this.originFileRank = null;
        this.originTouchLocation = null;
        this.originSprite = null;

        this.touchType = TouchTypes.NO_TOUCH;

        if(lastTouchType == TouchTypes.ONE_TOUCH && chessEngine != null){
            this._onTouchBegan(worldLocation, chessEngine);
        }
    }

    public flipBoardFacing(){
        this.setBoardFacing(ChessEngine.getOppositeSideType(this.boardFacing));
    }

    public setBoardFacing(boardFacing : SideType){
        if(boardFacing == this.boardFacing){
            return;
        }

        let oldBoardFacing = this.boardFacing;
        let newBoardFacing = boardFacing;


        for(let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++){
            for(let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++){
                let fileRank = new FileRank(fileNumber, rank);


                let sprite = this.pieceViewInterface.getPieceSpriteForFileRank(fileRank);
                if(sprite != null) {
                    let positionFrom: Phaser.Point;
                    let positionTo: Phaser.Point;

                    this.boardFacing = oldBoardFacing;
                    positionFrom = this.getPositionForFileRank(fileRank);

                    this.boardFacing = newBoardFacing;
                    positionTo = this.getPositionForFileRank(fileRank);

                    this.addMovingSprite(sprite, positionFrom, positionTo, ActionMovingTypes.FLIP_BOARD, null);
                }
            }
        }

        this.boardFacing = newBoardFacing;

        this.updateBoardNumbersColorPosition();
    }
    public getBoardFacing():SideType{
        return this.boardFacing;
    }


    private initBoardNumbers() {
        for(let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++){
            let file = <string>ChessEngine.convertFileNumberToFile(fileNumber);

            let fileUi = new Phaser.Text(Global.game, 0, 0, file);
            this.uiBoardFiles[fileNumber] = fileUi;

            fileUi.anchor.set(0.0, 0.0);

            this.fileRankNumberGroup.add(fileUi);

            let scaleX = this.m_width/800;
            let scaleY = this.m_height/800;

            fileUi.scale.set(scaleX, scaleY);
        }
        for(let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++){

            let rankUi = new Phaser.Text(Global.game, 0, 0, String(rank));
            this.uiBoardRanks[rank] = rankUi;

            rankUi.anchor.set(1.0, 1.0);


            this.fileRankNumberGroup.add(rankUi);

            let scaleX = this.m_width/800;
            let scaleY = this.m_height/800;

            rankUi.scale.set(scaleX, scaleY);
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


            let phaserTextStyle : Phaser.PhaserTextStyle = {};

            let colorType = ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine.getOppositeSideType(colorType);

            phaserTextStyle["fill"] = this.getColorForColorType_inString(colorType);
            fileUi.setStyle(phaserTextStyle, false);
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


            let phaserTextStyle : Phaser.PhaserTextStyle = {};
            phaserTextStyle["fill"] = this.getColorForFileRank_inString(fileRank);

            let colorType = ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine.getOppositeSideType(colorType);

            phaserTextStyle["fill"] = this.getColorForColorType_inString(colorType);
            rankUi.setStyle(phaserTextStyle, true);
        }
    }



    public getPositionForFileRank(fileRank: FileRank): Phaser.Point {
        let x: number = 0;
        let y: number = 0;


        let minX = this.m_width / (ChessEngine.getNumOfFiles() * 2);
        let maxX = this.m_width - minX;

        minX -= this.m_width / 2;
        maxX -= this.m_width / 2;

        let minY = this.m_height / (ChessEngine.getNumOfRanks() * 2);
        let maxY = this.m_height - minY;

        minY -= this.m_height / 2;
        maxY -= this.m_height / 2;

        switch(this.boardFacing){
            case SideType.WHITE:
                x = minX + (maxX - minX) * (fileRank.fileNumber - 1) / (ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (ChessEngine.getNumOfRanks() - fileRank.rank) / (ChessEngine.getNumOfRanks() - 1);
                break;
            case SideType.BLACK:
                x = minX + (maxX - minX) * (ChessEngine.getNumOfFiles() - fileRank.fileNumber) / (ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (fileRank.rank - 1) / (ChessEngine.getNumOfRanks() - 1);
                break;
        }

        return new Phaser.Point(x, y);
    }

    public getFileRankForPosition(position: Phaser.Point): FileRank {
        position.x += this.m_width / 2;
        position.y += this.m_height / 2;

        let squareWidth = this.m_width / ChessEngine.getNumOfFiles();
        let squareHeight = this.m_height / ChessEngine.getNumOfRanks();

        let fileNumber: number = -1;
        let rank: number = -1;

        switch (this.boardFacing){
            case SideType.WHITE:
                fileNumber = Math.floor(position.x / squareWidth) + 1;
                rank = ChessEngine.getNumOfRanks() - (Math.floor(position.y / squareHeight) + 1) + 1;
                break;
            case SideType.BLACK:
                fileNumber = ChessEngine.getNumOfFiles() - (Math.floor(position.x / squareWidth) + 1) + 1;
                rank = Math.floor(position.y / squareHeight) + 1;
                break;
        }

        return new FileRank(fileNumber, rank);
    }

    public getPositionForWorldLocation(worldLocation: Phaser.Point): Phaser.Point {
        let position = new Phaser.Point();
        this.worldTransform.applyInverse(new Phaser.Point(worldLocation.x, worldLocation.y), position);


        return position;
    }

    public getFileRankForWorldLocation(worldLocation: Phaser.Point): FileRank {
        return this.getFileRankForPosition(this.getPositionForWorldLocation(worldLocation));
    }







    public addMovingSprite(sprite: PieceView, positionFrom: Phaser.Point, positionTo: Phaser.Point, actionMovingType: ActionMovingTypes, finishCallback: (() => void) | null) {
        let action = null;

        switch(actionMovingType){
            case ActionMovingTypes.MOVE:
            {
                let moveSpeed = Math.max(this.m_width, this.m_height)/700;
                action = new PositionMovePiece(sprite, positionFrom, positionTo, moveSpeed, 300 / ChessEngine.getNumOfFiles());
            }
                break;
            case ActionMovingTypes.UNMOVE:
            {

            }
                break;
            case ActionMovingTypes.ILLEGAL:
            {
                let invalidSpeed = Math.max(this.m_width, this.m_height)/400;

                action = new PositionConstantSpeed(sprite, positionFrom, positionTo, invalidSpeed);
            }
                break;
            case ActionMovingTypes.FLIP_BOARD:
            {
                let moveSpeed = Math.max(this.m_width, this.m_height)/700;
                action = new PositionMovePiece(sprite, positionFrom, positionTo, moveSpeed, 300 / ChessEngine.getNumOfFiles());
            }
                break;
            case ActionMovingTypes.PREDICT:
            {
                let moveSpeed = Math.max(this.m_width, this.m_height)/2100;
                action = new PositionMovePiece(sprite, positionFrom, positionTo, moveSpeed, 300 / ChessEngine.getNumOfFiles());
            }
            break;

        }

        if(action != null){
            this.positionManager.addMovingSprite(sprite, action, finishCallback);
        }

    }




    public updateViewToModel(chessEngine: ChessEngine | null) {
        //Hide all possible sprites, that can be displayed
        while (this.positionManager.getLength() != 0) {
            this.positionManager.updateMovingSprites(60 * 60, null);
        }

        this.removeAllPoints();
        this.removeAllSquares();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();

        //Remove all board sprites and draw them again
        for (let fileNumber = 1; fileNumber <= ChessEngine.getNumOfFiles(); fileNumber++) {
            for (let rank = 1; rank < ChessEngine.getNumOfRanks(); rank++) {
                let fileRank = new FileRank(fileNumber, rank);

                let pieceSprite = this.pieceViewInterface.getPieceSpriteForFileRank(fileRank);

                if (pieceSprite != null) {
                    this.pieceViewInterface.setPieceSpriteForFileRank(fileRank, null);
                    this.pieceViewInterface.removePieceView(pieceSprite);
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

                    let pieceSprite = this.pieceViewInterface.createPieceView(sideType, pieceType);

                    pieceSprite.position = this.getPositionForFileRank(fileRank);
                    this.pieceViewInterface.setPieceSpriteForFileRank(fileRank, pieceSprite);
                }
            }
        }


        this.addLastMoveSquares(chessEngine.getLastMoveClass());
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
            this.pointGroup.add(uiPoint);

            uiPoint.position = this.getPositionForFileRank(fileRank);

            this.uiPoints[pointColor][hash] = uiPoint;
        }
    }

    public removePointByColor(pointColor: POINT_COLORS) {
        for (let hash in this.uiPoints[pointColor]) {
            this.pointGroup.removeChild(this.uiPoints[pointColor][hash]);
        }
        this.uiPoints[pointColor] = {};
    }

    public removeAllPoints() {
        for (let pointColor = POINT_COLORS.FIRST_COLOR; pointColor <= POINT_COLORS.LAST_COLOR; pointColor++) {
            this.removePointByColor(pointColor);
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
        let hash = ChessEngine.getHashForFileRank(fileRank);

        if(this.uiSquares[squareColor][hash] == undefined){

            let uiSquare = new SquareColorNode(squareColor, this.getSquareWidth(), this.getSquareHeight());
            uiSquare.position = this.getPositionForFileRank(fileRank);

            this.uiSquares[squareColor][hash] = uiSquare;

            this.squareGroup.add(uiSquare);
        }
    }


    public removeSquaresByColor(squareColor: SQUARE_COLORS) {
        for(let _hash in this.uiSquares[squareColor]){
            let hash = Number(_hash);

            let uiSquare = this.uiSquares[squareColor][hash];

            this.squareGroup.remove(uiSquare);
        }


        this.uiSquares[squareColor] = {};
    }

    public removeAllSquares() {
        for (let squareColor = SQUARE_COLORS.FIRST_COLOR; squareColor <= SQUARE_COLORS.LAST_COLOR; squareColor++) {
            this.removeSquaresByColor(squareColor);
        }
    }


    public hideSelectLightSprite() {
        this.uiSelectLightSprite.visible = false;
    }

    public showSelectLightSprite(fileRank: FileRank) {
        this.uiSelectLightSprite.visible = true;

        this.uiSelectLightSprite.position = this.getPositionForFileRank(fileRank);
    }


    public hideOptionCycleSprite() {
        this.uiOptionCycleFileRank = null;
        this.uiOptionCycleSprite.visible = false;
    }

    public showOptionCycleSprite(fileRank: FileRank) {
        if (this.uiOptionCycleFileRank != null) {
            if (ChessEngine.fileRankEqual(fileRank, this.uiOptionCycleFileRank)) {
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







    public getRemoveAddMoveStructs(moveClass : MoveClass):{removeStructs : RemoveStruct[], addStructs : AddStruct[], moveStructs : MoveStruct[]} {
        //move class is a board centric structure
        //we need to change it into a piece centric structure



        let originHashPieces : { hash : number, piece : PieceModel | null}[] = [];
        let destHashPieces : { hash : number, piece : PieceModel | null}[] = [];
        {
            let _originPieces : { [key : number] : PieceModel | null} = {};
            let _destPieces : { [key : number] : PieceModel | null} = {};
            for(let i = 0; i < moveClass.getLength(); i++){
                let change = moveClass.get(i);

                let fileRank = change.fileRank;
                let originPiece = change.originPiece;
                let destPiece = change.destPiece;

                let hash = ChessEngine.getHashForFileRank(fileRank);

                if( !(hash in _originPieces)){
                    _originPieces[hash] = originPiece;
                }

                _destPieces[hash] = destPiece;
            }

            for(let _hash in _originPieces){
                let hash = Number(_hash);
                let originHashPiece = { hash : hash, piece : _originPieces[hash]};

                originHashPieces.push(originHashPiece);
            }
            for(let _hash in _destPieces){
                let hash = Number(_hash);
                let destHashPiece = { hash : hash, piece : _destPieces[hash]};

                destHashPieces.push(destHashPiece);
            }
        }

        let makeMoveStructs = (compareFunction : (originPiece : PieceModel, destPiece : PieceModel) => boolean) =>{
            let canMakeMoveStructs = true;
            while(canMakeMoveStructs) {
                canMakeMoveStructs = false;

                let moveStruct : MoveStruct | null = null;
                let i = 0;
                while( (moveStruct == null) && (i < originHashPieces.length) ){
                    let originHashPiece = originHashPieces[i];
                    let originPiece = originHashPiece.piece;
                    let originHash = originHashPiece.hash;

                    if(originPiece != null){
                        let j = 0;
                        while( (moveStruct == null) && (j < destHashPieces.length) ) {
                            let destHashPiece = destHashPieces[j];
                            let destPiece = destHashPiece.piece;
                            let destHash = destHashPiece.hash;

                            if(destPiece != null){
                                if (compareFunction(originPiece, destPiece)) {
                                    originHashPieces.splice(i, 1);
                                    destHashPieces.splice(j, 1);

                                    moveStruct = {
                                        originPiece : originPiece,
                                        destPiece : destPiece,
                                        originFileRank : ChessEngine.getFileRankForHash(originHash),
                                        destFileRank : ChessEngine.getFileRankForHash(destHash),
                                        sprite : null
                                    };
                                }

                            }

                            j = j + 1;
                        }
                    }


                    i = i + 1;
                }


                if(moveStruct != null){
                    moveStructs.push(moveStruct);
                    canMakeMoveStructs = true;
                }
            }
        };
        let removeStructs: RemoveStruct[] = [];
        let addStructs: AddStruct[] = [];
        let moveStructs: MoveStruct[] = [];




        let compareFunctionExact = (removePiece : PieceModel, addPiece : PieceModel) => {
            return PieceModel.isEqualTo(removePiece, addPiece);
        };

        let compareFunctionSide = (removePiece : PieceModel, addPiece : PieceModel) => {
            return removePiece.getSideType() == addPiece.getSideType();
        };

        let compareFunctionPiece = (removePiece : PieceModel, addPiece : PieceModel) => {
            return removePiece.getPieceType() == addPiece.getPieceType();
        };

        let compareFunctionStupid = (removePiece : PieceModel, addPiece : PieceModel) => {
            return true;
        };

        makeMoveStructs(compareFunctionExact);
        makeMoveStructs(compareFunctionSide);
        makeMoveStructs(compareFunctionPiece);
        makeMoveStructs(compareFunctionStupid);

        for(let i = 0; i < originHashPieces.length; i++){
            let originHashPiece = originHashPieces[i];
            if(originHashPiece.piece != null){
                let removeStruct : RemoveStruct = {
                    piece : originHashPiece.piece,
                    fileRank : ChessEngine.getFileRankForHash(originHashPiece.hash),
                    sprite : null
                };

                removeStructs.push(removeStruct);
            }
        }
        for(let i = 0; i < destHashPieces.length; i++){
            let destHashPiece = destHashPieces[i];
            if(destHashPiece.piece != null){
                let addStruct : AddStruct = {
                    piece : destHashPiece.piece,
                    fileRank : ChessEngine.getFileRankForHash(destHashPiece.hash),
                    sprite : null
                };

                addStructs.push(addStruct);
            }
        }

        return {removeStructs : removeStructs, addStructs : addStructs, moveStructs : moveStructs};
    }


    public doMove(moveClass : MoveClass){
        this.doMoveAnimation(moveClass, false, this.pieceViewInterface);
        this.addLastMoveSquares(moveClass);
    }

    public doMoveAnimation(moveClass : MoveClass, isUndoMove : boolean, abstractViewInterface : AbstractViewInterface){
        abstractViewInterface.startAnimation(moveClass, isUndoMove);

        if(abstractViewInterface.getViewInterfaceType() == AbstractViewInterfaceType.PIECE_VIEW){
            if (this.touchType != TouchTypes.NO_TOUCH) {
                this.onTouchEnded(new Phaser.Point(this.m_width * 100, this.m_height * 100), null);
            }
            this.removeAllSquares();
        }




        let removeAddMoveStructs = this.getRemoveAddMoveStructs(moveClass);
        let removeStructs = removeAddMoveStructs["removeStructs"];
        let addStructs = removeAddMoveStructs["addStructs"];
        let moveStructs = removeAddMoveStructs["moveStructs"];

        for(let i = 0; i < removeStructs.length; i++){
            let removeStruct = removeStructs[i];

            let fileRank = removeStruct.fileRank;
            let piece = removeStruct.piece;

            {
                let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(fileRank);
                if(pieceSprite == null){
                    pieceSprite = abstractViewInterface.createPieceView(piece.getSideType(), piece.getPieceType());
                    pieceSprite.position = this.getPositionForFileRank(fileRank)
                    abstractViewInterface.setPieceSpriteForFileRank(fileRank, pieceSprite);
                }
            }


            let pieceSprite = <PieceView>abstractViewInterface.getPieceSpriteForFileRank(fileRank);
            pieceSprite.setPiece(piece.getSideType(), piece.getPieceType());
            removeStruct.sprite = pieceSprite;

            abstractViewInterface.setPieceSpriteForFileRank(fileRank, null);
        }

        for(let i = 0; i < moveStructs.length; i++){
            let moveStruct = moveStructs[i];

            let originFileRank = moveStruct.originFileRank;
            let destFileRank = moveStruct.destFileRank;

            let originPiece = moveStruct.originPiece;
            let destPiece = moveStruct.destPiece;

            let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(originFileRank);
            if(pieceSprite == null){
                pieceSprite = abstractViewInterface.createPieceView(originPiece.getSideType(), originPiece.getPieceType());
                pieceSprite.position = this.getPositionForFileRank(originFileRank);
                abstractViewInterface.setPieceSpriteForFileRank(originFileRank, pieceSprite);
            }

            pieceSprite.setPiece(originPiece.getSideType(), originPiece.getPieceType());

            moveStruct.sprite = pieceSprite;

            abstractViewInterface.setPieceSpriteForFileRank(originFileRank, null);
        }
        for(let i = 0; i < moveStructs.length; i++){
            let moveStruct = moveStructs[i];

            let originFileRank = moveStruct.originFileRank;
            let destFileRank = moveStruct.destFileRank;

            let originPiece = moveStruct.originPiece;
            let destPiece = moveStruct.destPiece;

            {
                let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(destFileRank);
                if(pieceSprite != null){
                    abstractViewInterface.removePieceView(pieceSprite);
                    abstractViewInterface.setPieceSpriteForFileRank(destFileRank, null);
                }
            }

            abstractViewInterface.setPieceSpriteForFileRank(destFileRank, moveStruct.sprite);
        }


        for(let i = 0; i < addStructs.length; i++){
            let addStruct = addStructs[i];

            let fileRank = addStruct.fileRank;
            let piece = addStruct.piece;


            {
                let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(fileRank);
                if(pieceSprite != null){
                    abstractViewInterface.removePieceView(pieceSprite);
                    abstractViewInterface.setPieceSpriteForFileRank(fileRank, null);
                }
            }



            let pieceSprite = abstractViewInterface.createPieceView(piece.getSideType(), piece.getPieceType());
            pieceSprite.position = this.getPositionForFileRank(fileRank);

            pieceSprite.visible = false;

            addStruct.sprite = pieceSprite;

            abstractViewInterface.setPieceSpriteForFileRank(fileRank, pieceSprite);
        }


        let moveStructCounter = 0;
        let globalMoveCallback = (moveStruct : MoveStruct | null) => {
            if(moveStruct != null) {
                moveStructCounter = moveStructCounter + 1;

                let originPiece = moveStruct.originPiece;
                let destPiece = moveStruct.destPiece;

                (<PieceView>moveStruct.sprite).setPiece(destPiece.getSideType(), destPiece.getPieceType());
            }

            if(moveStructCounter != moveStructs.length) {
                return;
            }


            for(let i = 0; i < removeStructs.length; i++) {
                let removeStruct = removeStructs[i];

                abstractViewInterface.removePieceView(<PieceView>removeStruct.sprite);
            }

            for(let i = 0; i < addStructs.length; i++) {
                let addStruct = moveStructs[i];

                (<PieceView>addStruct.sprite).visible = true;
            }

            abstractViewInterface.endAnimation(moveClass, isUndoMove);
        };

        for(let i = 0; i < moveStructs.length; i++){
            let moveStruct = moveStructs[i];

            let originFileRank = moveStruct.originFileRank;
            let destFileRank = moveStruct.destFileRank;

            let sprite = <PieceView>moveStruct.sprite;

            let positionFrom : Phaser.Point;
            let positionTo : Phaser.Point;

            if (this.positionManager.isMovingSprite(sprite)) {
                positionFrom = this.getPositionForFileRank(originFileRank);
            } else {
                positionFrom = sprite.position.clone();
            }

            positionTo = this.getPositionForFileRank(destFileRank);


            let actionMovingType : ActionMovingTypes = ActionMovingTypes.PREDICT;
            switch(abstractViewInterface.getViewInterfaceType()){
                case AbstractViewInterfaceType.PIECE_VIEW:
                    if(isUndoMove){
                        actionMovingType = ActionMovingTypes.UNMOVE;
                    }else {
                        actionMovingType = ActionMovingTypes.MOVE;
                    }
                    break;
                case AbstractViewInterfaceType.PREDICT_VIEW:
                    actionMovingType = ActionMovingTypes.PREDICT;
                    break;
            }

            let localMoveCallback : ( () => void ) | null = () => {
                globalMoveCallback(moveStruct);
            };

            if(isUndoMove){
                localMoveCallback();
                localMoveCallback = null;
            }

            this.addMovingSprite(sprite, positionFrom, positionTo, <ActionMovingTypes>actionMovingType, localMoveCallback);
        }

        if(moveStructs.length == 0){
            globalMoveCallback(null);
        }
    }


    public showPredictMove(identifier : string, moveClass : MoveClass){
        if(this.isPredictMove(identifier)){
            return;
        }

        this.predictMoves[identifier] = new PredictViewInterface(moveClass, 0.7, this, this.predictSpriteGroup, this.getSquareWidth(), this.getSquareHeight());
    }

    public hidePredictMove(identifier : string){
        if(!this.isPredictMove(identifier)){
            return;
        }

        let predictMove = this.predictMoves[identifier];
        predictMove.destroy();
        delete this.predictMoves[identifier];
    }



    public isPredictMove(identifier : string):boolean{
        return this.predictMoves[identifier] != undefined;
    }



}




/*
function BoardView:normalizeMoveClass(legalMoves)
local removeStructs = {}
local addStructs = {}
local moveStructs = {}
removeStructs, addStructs, moveStructs = self:getRemoveAddMoveStructs(legalMoves[1])


local function normalizePromote()
local function choosePieceCallBack(moveClass)
self:moveGame(moveClass)
end

local sideType = self.model:getPieceForFileRank(legalMoves[1].originFileRank):getSideType()

self.promotePieceCallback(legalMoves, choosePieceCallBack, sideType, self.model)
end

if #moveStructs == 0 then
normalizePromote()
else
local moveStruct = moveStructs[1]
local removeStruct = moveStruct.removeStruct
local addStruct = moveStruct.addStruct
local piece = addStruct.piece


local pieceSprite = self:getPieceSpriteForFileRank(removeStruct.fileRank)

local positionFrom = nil
local positionTo = nil
if self:isMovingSprite(pieceSprite) then
positionFrom = cc.p(self:getPositionForFileRank(removeStruct.fileRank))
else
positionFrom = cc.p(pieceSprite:getPosition())
end

positionTo = cc.p(self:getPositionForFileRank(addStruct.fileRank))
local actionMovingType = ActionMovingTypes.MOVE


self:addMovingSprite(pieceSprite, positionFrom, positionTo, actionMovingType, normalizePromote)
end

end


return BoardView
*/