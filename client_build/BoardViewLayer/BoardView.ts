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



import {PositionManager} from "./PositionControl/PositionManager";


import {ImageTag} from "../ImageTag";
import {ControllerAbstract} from "../controller/ControllerAbstract";


let MOVING_SPEED_FLIP_BOARD = 0.003;
let MOVING_SPEED_ILLEGAL = 0.003;
let MOVING_SPEED_NORMAL = 0.001;






enum TouchTypes {
    NO_TOUCH = 0,
    DRAG_TOUCH = 1,
    ONE_TOUCH = 2,
}


export class BoardView extends PIXI.Graphics {

    private boardFacing: SideType;

    private fileRankPieceSprites : { [key : number] : { [key : number] : PieceView | null } };
    private uiBoardFiles: { [key: number]: PIXI.Text };
    private uiBoardRanks: { [key: number]: PIXI.Text };

    private uiSquares: { [key: number]: { [key: number]: SquareColorNode } };
    private uiPoints: { [key: number]: { [key: number]: PointColorNode } };

    private uiSelectLightSprite: PIXI.Sprite;

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

    private m_size : number;

    private controller: ControllerAbstract;



    private fileRankNumberGroup : PIXI.Container;
    private pointGroup: PIXI.Container;
    private squareGroup : PIXI.Container;
    private bottomGroup : PIXI.Container;


    private pieceSpriteGroup : PIXI.Container;
    private movingSpriteGroup : PIXI.Container;


    constructor(m_size: number, controller: ControllerAbstract) {
        super();
        this.m_size = m_size;

        this.controller = controller;

        this.boardFacing = SideType.WHITE;


        this.positionManager = new PositionManager();



        this.beginFill(this.getColorForColorType_inNum(SideType.WHITE));
        this.drawRect(-this.m_size / 2, -this.m_size / 2, this.m_size, this.m_size);


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






        this.uiBoardFiles = {};
        this.uiBoardRanks = {};
        this.initBoardNumbers();
        this.updateBoardNumbersColorPosition();


        //The select light of the board
        this.uiSelectLightSprite = PIXI.Sprite.from(ImageTag.select_light);
        this.bottomGroup.addChild(this.uiSelectLightSprite);
        this.uiSelectLightSprite.scale.set(this.m_size / 700, this.m_size / 700);
        this.uiSelectLightSprite.anchor.set(0.5, 0.5);
        this.hideSelectLightSprite();

        //The option cycle sprite
        this.uiOptionCycleSprite = PIXI.Sprite.from(ImageTag.option_light);
        this.bottomGroup.addChild(this.uiOptionCycleSprite);
        this.uiOptionCycleSprite.scale.set(this.m_size / 700, this.m_size / 700);
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
    }

    public getPieceSpriteForFileRank(fileRank : FileRank):PieceView | null{
        return this.fileRankPieceSprites[fileRank.x][fileRank.y];
    }
    public setPieceSpriteForFileRank(fileRank : FileRank, pieceView : PieceView | null){
        this.fileRankPieceSprites[fileRank.x][fileRank.y] = pieceView;
    }


    public createPieceView(pieceModel : PieceModel.Interface):PieceView{
        let pieceSprite = new PieceView(pieceModel, this.getSquareWidth(), this.getSquareHeight());
        pieceSprite.buttonMode = true;
        this.pieceSpriteGroup.addChild(pieceSprite);

        return pieceSprite;
    }

    public removePieceView(pieceView : PieceView){
        pieceView.parent.removeChild(pieceView);
    }
    public moveToPieceSpriteGroup(pieceView : PieceView){
        pieceView.setNormal();

        if(pieceView.parent != null){
            pieceView.parent.removeChild(pieceView);
        }

        this.pieceSpriteGroup.addChild(pieceView);
    }
    public moveToMovingSpriteGroup(pieceView : PieceView){
        pieceView.setMoving();

        if(pieceView.parent != null){
            pieceView.parent.removeChild(pieceView);
        }

        this.movingSpriteGroup.addChild(pieceView);
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
        let squareWidth = this.m_size / ChessEngine.getNumOfFiles();

        return squareWidth;
    }

    public getSquareHeight(): number {
        let squareHeight = this.m_size / ChessEngine.getNumOfRanks();

        return squareHeight;
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

                    this.moveToMovingSpriteGroup(this.originSprite);
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

            let minX = -this.m_size/2 + halfSquareWidth;
            let maxX = this.m_size/2 - halfSquareWidth;

            let minY = -this.m_size/2 + halfSquareHeight;
            let maxY = this.m_size/2 - halfSquareHeight;

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

        this.moveToPieceSpriteGroup(<PieceView>this.originSprite);

        for(let i = legalMoves.length - 1; i >= 0; i--){
            if(!(<ChessEngine>chessEngine).isMoveLegal(legalMoves[i], false)){
                legalMoves.splice(i, 1);
            }
        }



        let lastTouchType = this.touchType;
        let lastOriginFileRank = this.originFileRank;
        let lastOriginSprite = this.originSprite;

        this.originFileRank = null;
        this.originTouchLocation = null;
        this.originSprite = null;

        this.touchType = TouchTypes.NO_TOUCH;


        if(legalMoves.length == 0){
            let positionTo = this.getPositionForFileRank(<FileRank>lastOriginFileRank);

            this.positionManager.moveTo(<PieceView>lastOriginSprite, null, positionTo,MOVING_SPEED_ILLEGAL*this.m_size);

            if(lastTouchType == TouchTypes.ONE_TOUCH && chessEngine != null){
                this._onTouchBegan(worldLocation, chessEngine);
            }
        }else if(legalMoves.length == 1){
            this.controller.notifyMove(legalMoves[0]);
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
                        this.positionManager.moveTo(sprite, null, positionTo,MOVING_SPEED_FLIP_BOARD*this.m_size);
                    }else {
                        sprite.position = positionTo;
                    }

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

            let fileUi = new PIXI.Text(file);
            this.uiBoardFiles[fileNumber] = fileUi;

            fileUi.anchor.set(0.0, 0.0);

            this.fileRankNumberGroup.addChild(fileUi);

            let scale = this.m_size/800;

            fileUi.scale.set(scale, scale);
        }
        for(let rank = 1; rank <= ChessEngine.getNumOfRanks(); rank++){

            let rankUi = new PIXI.Text(String(rank));
            this.uiBoardRanks[rank] = rankUi;

            rankUi.anchor.set(1.0, 1.0);


            this.fileRankNumberGroup.addChild(rankUi);

            let scale = this.m_size/800;

            rankUi.scale.set(scale, scale);
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


            let textStyleOptions : PIXI.TextStyleOptions = {};

            let colorType = ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine.getOppositeSideType(colorType);
            textStyleOptions.fill = this.getColorForColorType_inString(colorType);

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


            let textStyleOptions : PIXI.TextStyleOptions = {};
            let colorType = ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine.getOppositeSideType(colorType);
            textStyleOptions.fill = this.getColorForColorType_inString(colorType);

            rankUi.style = new PIXI.TextStyle(textStyleOptions);
        }
    }



    public getPositionForFileRank(fileRank: FileRank): PIXI.Point {
        let x: number = 0;
        let y: number = 0;


        let minX = this.m_size / (ChessEngine.getNumOfFiles() * 2);
        let maxX = this.m_size - minX;

        minX -= this.m_size / 2;
        maxX -= this.m_size / 2;

        let minY = this.m_size / (ChessEngine.getNumOfRanks() * 2);
        let maxY = this.m_size - minY;

        minY -= this.m_size / 2;
        maxY -= this.m_size / 2;

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
                fileNumber = Math.floor((position.x + this.m_size / 2) / squareWidth) + 1;
                rank = ChessEngine.getNumOfRanks() - (Math.floor((position.y + this.m_size / 2) / squareHeight) + 1) + 1;
                break;
            case SideType.BLACK:
                fileNumber = ChessEngine.getNumOfFiles() - (Math.floor((position.x + this.m_size / 2) / squareWidth) + 1) + 1;
                rank = Math.floor((position.y + this.m_size / 2) / squareHeight) + 1;
                break;
        }




        return new FileRank(fileNumber, rank);
    }

    public getPositionForWorldLocation(worldLocation: PIXI.Point): PIXI.Point {
        let position = new PIXI.Point();
        this.worldTransform.applyInverse(new PIXI.Point(worldLocation.x, worldLocation.y), position);


        return position;
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

                    pieceSprite.setNormal();

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
                        this.moveToPieceSpriteGroup(pieceSprite);
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
            this.pointGroup.addChild(uiPoint);

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

            this.squareGroup.addChild(uiSquare);
        }
    }


    public removeSquaresByColor(squareColor: SQUARE_COLORS) {
        for(let _hash in this.uiSquares[squareColor]){
            let hash = Number(_hash);

            let uiSquare = this.uiSquares[squareColor][hash];

            this.squareGroup.removeChild(uiSquare);
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
            this.controller.notifyPromote(legalMoves);
        };
        this.doMoveAnimation(legalMoves[0], false, false, cb);
    }
    public doMove(moveClass : MoveClass){
        this.doMoveAnimation(moveClass, false, true, null);
        this.addLastMoveSquares(moveClass);
    }

    public doMoveAnimation(moveClass : MoveClass, isUndoMove : boolean, isStrictMove : boolean, endAnimation : ((moveClass : MoveClass, isUndoMove : boolean) => void) | null){
        if(this.touchType != TouchTypes.NO_TOUCH) {
            this.onTouchEnded(new PIXI.Point(this.m_size * 100, this.m_size * 100), null);
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

                this.positionManager.moveTo(sprite, localMoveCallback, positionTo, this.m_size*MOVING_SPEED_NORMAL);
            }


        }

        if(moveStructs.length == 0){
            globalMoveCallback(null);
        }
    }
}



