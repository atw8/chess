"use strict";
/// <reference path="../../node_modules/phaser-ce/typescript/phaser.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const FileRank_1 = require("../../shared/engine/FileRank");
const PieceModel_1 = require("../../shared/engine/PieceModel");
const SideType_1 = require("../../shared/engine/SideType");
const PieceType_1 = require("../../shared/engine/PieceType");
const ChessEngine_1 = require("../../shared/engine/ChessEngine");
const SquareColorNode_1 = require("./SquareColorNode");
const SquareColorCons_1 = require("./SquareColorCons");
const PointColorNode_1 = require("./PointColorNode");
const PointColorCons_1 = require("./PointColorCons");
const AbstractViewInterface_1 = require("./viewInterface/AbstractViewInterface");
const PredictViewInterface_1 = require("./viewInterface/PredictViewInterface");
const PieceViewInterface_1 = require("./viewInterface/PieceViewInterface");
const PositionManager_1 = require("./PositionControl/PositionManager");
const PositionConstantSpeed_1 = require("./PositionControl/PositionConstantSpeed");
const PositionMovePiece_1 = require("./PositionControl/PositionMovePiece");
require("p2");
require("pixi");
require("phaser");
const ImageTag_1 = require("../ImageTag");
const Global = require("./../Global");
var TouchTypes;
(function (TouchTypes) {
    TouchTypes[TouchTypes["NO_TOUCH"] = 0] = "NO_TOUCH";
    TouchTypes[TouchTypes["DRAG_TOUCH"] = 1] = "DRAG_TOUCH";
    TouchTypes[TouchTypes["ONE_TOUCH"] = 2] = "ONE_TOUCH";
})(TouchTypes || (TouchTypes = {}));
var ActionMovingTypes;
(function (ActionMovingTypes) {
    ActionMovingTypes[ActionMovingTypes["MOVE"] = 1] = "MOVE";
    ActionMovingTypes[ActionMovingTypes["UNMOVE"] = 2] = "UNMOVE";
    ActionMovingTypes[ActionMovingTypes["ILLEGAL"] = 3] = "ILLEGAL";
    ActionMovingTypes[ActionMovingTypes["FLIP_BOARD"] = 4] = "FLIP_BOARD";
    ActionMovingTypes[ActionMovingTypes["PREDICT"] = 5] = "PREDICT";
})(ActionMovingTypes || (ActionMovingTypes = {}));
class BoardView extends Phaser.Graphics {
    constructor(width, height, controller) {
        super(Global.game);
        this.touchType = TouchTypes.NO_TOUCH;
        this.m_width = width;
        this.m_height = height;
        this.controller = controller;
        this.boardFacing = SideType_1.SideType.WHITE;
        this.positionManager = new PositionManager_1.PositionManager();
        this.beginFill(this.getColorForColorType_inNum(SideType_1.SideType.WHITE));
        this.drawRect(-this.m_width / 2, -this.m_height / 2, this.m_width, this.m_height);
        let squareWidth = this.getSquareWidth();
        let squareHeight = this.getSquareHeight();
        this.beginFill(this.getColorForColorType_inNum(SideType_1.SideType.BLACK));
        for (let fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            for (let rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                let fileRank = new FileRank_1.FileRank(fileNumber, rank);
                if (ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank) == SideType_1.SideType.BLACK) {
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
        this.pieceViewInterface = new PieceViewInterface_1.PieceViewInterface(this.controller, pieceSpriteGroup, this.getSquareWidth(), this.getSquareHeight());
        this.predictMoves = {};
        this.uiBoardFiles = {};
        this.uiBoardRanks = {};
        this.initBoardNumbers();
        this.updateBoardNumbersColorPosition();
        //The select light of the board
        this.uiSelectLightSprite = new Phaser.Sprite(Global.game, 0, 0, ImageTag_1.ImageTag.select_light);
        this.bottomGroup.add(this.uiSelectLightSprite);
        this.uiSelectLightSprite.scale.set(this.m_width / 700, this.m_height / 700);
        this.uiSelectLightSprite.anchor.set(0.5, 0.5);
        this.hideSelectLightSprite();
        //The option cycle sprite
        this.uiOptionCycleSprite = new Phaser.Sprite(Global.game, 0, 0, ImageTag_1.ImageTag.option_light);
        this.bottomGroup.add(this.uiOptionCycleSprite);
        this.uiOptionCycleSprite.scale.set(this.m_width / 700, this.m_height / 700);
        this.uiOptionCycleSprite.anchor.set(0.5, 0.5);
        this.uiOptionCycleFileRank = null;
        this.hideOptionCycleSprite();
        //The squares
        this.uiSquares = {};
        for (let squareColor = SquareColorCons_1.SQUARE_COLORS.FIRST_COLOR; squareColor <= SquareColorCons_1.SQUARE_COLORS.LAST_COLOR; squareColor++) {
            this.uiSquares[squareColor] = {};
        }
        this.uiPoints = {};
        for (let pointColor = PointColorCons_1.POINT_COLORS.FIRST_COLOR; pointColor <= PointColorCons_1.POINT_COLORS.LAST_COLOR; pointColor++) {
            this.uiPoints[pointColor] = {};
        }
        //The code related to the touchtype
        this.originFileRank = null;
        this.touchType = TouchTypes.NO_TOUCH;
        this.originSprite = null;
        this.originTouchLocation = null;
        this.currentTouchLocation = null;
    }
    getPositionManager() {
        return this.positionManager;
    }
    getWidth() {
        return this.m_width;
    }
    getHeight() {
        return this.m_height;
    }
    getColorForFileRank_inNum(fileRank) {
        return this.getColorForColorType_inNum(ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank));
    }
    getColorForFileRank_inString(fileRank) {
        return this.getColorForColorType_inString(ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank));
    }
    getColorForColorType_inNum(colorType) {
        let colors = {};
        colors[SideType_1.SideType.WHITE] = 0xFFFFFF;
        colors[SideType_1.SideType.BLACK] = 0x333333;
        colors[SideType_1.SideType.WHITE] = 0xFBE2B2;
        colors[SideType_1.SideType.BLACK] = 0xA66325;
        return colors[colorType];
    }
    getColorForColorType_inString(colorType) {
        let colors = {};
        colors[SideType_1.SideType.WHITE] = "#FFFFFF";
        colors[SideType_1.SideType.BLACK] = "#333333";
        colors[SideType_1.SideType.WHITE] = "#FBE2B2";
        colors[SideType_1.SideType.BLACK] = "#A66325";
        return colors[colorType];
    }
    getSquareWidth() {
        let squareWidth = this.m_width / ChessEngine_1.ChessEngine.getNumOfFiles();
        return squareWidth;
    }
    getSquareHeight() {
        let squareHeight = this.m_height / ChessEngine_1.ChessEngine.getNumOfRanks();
        return squareHeight;
    }
    onTouchBegan(worldLocation, chessEngine) {
        this.currentTouchLocation = worldLocation;
        this._onTouchBegan(worldLocation, chessEngine);
    }
    _onTouchBegan(worldLocation, chessEngine) {
        let fileRank = this.getFileRankForWorldLocation(worldLocation);
        if (this.touchType === TouchTypes.NO_TOUCH) {
            if (chessEngine.getPieceForFileRank(fileRank) !== null && this.pieceViewInterface.getPieceSpriteForFileRank(fileRank) !== null) {
                let possibleMoves = chessEngine.getPossibleMoves(fileRank, null);
                for (let i = 0; i < possibleMoves.length; i++) {
                    let possibleMove = possibleMoves[i];
                    let pointColor = null;
                    if (chessEngine.isMoveLegal(possibleMove, true)) {
                        pointColor = PointColorCons_1.POINT_COLORS.GREEN;
                    }
                    else {
                        pointColor = PointColorCons_1.POINT_COLORS.RED;
                    }
                    this.addPoint(possibleMove.destFileRank, pointColor);
                }
                let vectorMoves = chessEngine.getVectorMoves(fileRank, null);
                for (let i = 0; i < vectorMoves.length; i++) {
                    let vectorMove = vectorMoves[i];
                    if (!this.hasPoint(vectorMove.destFileRank, PointColorCons_1.POINT_COLORS.GREEN)) {
                        this.addPoint(vectorMove.destFileRank, PointColorCons_1.POINT_COLORS.RED);
                    }
                }
                this.showSelectLightSprite(fileRank);
                this.originFileRank = fileRank;
                this.originSprite = this.pieceViewInterface.getPieceSpriteForFileRank(this.originFileRank);
                this.originTouchLocation = worldLocation;
                Global.game.time.events.add(200, () => {
                    if (this.currentTouchLocation === null || this.originTouchLocation === null || this.originSprite == null) {
                        return;
                    }
                    this.touchType = TouchTypes.DRAG_TOUCH;
                    this.originSprite.setMoving();
                    this._onTouchMoved(this.currentTouchLocation, chessEngine);
                });
                while (this.positionManager.isMovingSprite(this.originSprite)) {
                    this.positionManager.updateMovingSprites(60 * 60 * 1000, this.originSprite);
                }
                this.originSprite.bringToTop();
                this.touchType = TouchTypes.ONE_TOUCH;
            }
            else {
                this.touchType = TouchTypes.NO_TOUCH;
            }
        }
        else if (this.touchType === TouchTypes.ONE_TOUCH) {
            this.onTouchHelper(worldLocation, fileRank, chessEngine);
        }
    }
    onTouchMoved(worldLocation, chessEngine) {
        this.currentTouchLocation = worldLocation;
        this._onTouchMoved(worldLocation, chessEngine);
    }
    _onTouchMoved(worldLocation, chessEngine) {
        let fileRank = this.getFileRankForWorldLocation(worldLocation);
        if (this.touchType === TouchTypes.DRAG_TOUCH) {
            this.showOptionCycleSprite(fileRank);
            this.originSprite.position = this.getPositionForWorldLocation(worldLocation);
        }
    }
    onTouchEnded(worldLocation, chessEngine) {
        this.currentTouchLocation = null;
        this._onTouchEnded(worldLocation, chessEngine);
    }
    _onTouchEnded(worldLocation, chessEngine) {
        if (this.touchType === TouchTypes.NO_TOUCH) {
            return;
        }
        let fileRank = this.getFileRankForWorldLocation(worldLocation);
        this.onTouchHelper(worldLocation, fileRank, chessEngine);
    }
    onTouchHelper(worldLocation, fileRank, chessEngine) {
        this.removeAllPoints();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();
        let legalMoves = [];
        if (chessEngine != null) {
            legalMoves = chessEngine.getLegalMoves(this.originFileRank, fileRank, true);
        }
        this.originSprite.setNormal();
        let isIllegalMove = false;
        if (legalMoves.length === 0) {
            isIllegalMove = true;
        }
        else if (legalMoves.length >= 1) {
            if (legalMoves.length == 1) {
                isIllegalMove = this.controller.notifyMove(legalMoves[0], false);
            }
            else {
                //this.normalizeMoveClass(legalMoves);
            }
        }
        if (isIllegalMove) {
            let positionFrom;
            if (this.positionManager.isMovingSprite(this.originSprite)) {
                positionFrom = this.getPositionForFileRank(this.originFileRank);
            }
            else {
                positionFrom = this.originSprite.position.clone();
            }
            let positionTo = this.getPositionForFileRank(this.originFileRank);
            let actionMovingType = ActionMovingTypes.ILLEGAL;
            let finishCallback = null;
            this.addMovingSprite(this.originSprite, positionFrom, positionTo, actionMovingType, finishCallback);
        }
        let lastTouchType = this.touchType;
        this.originFileRank = null;
        this.originTouchLocation = null;
        this.originSprite = null;
        this.touchType = TouchTypes.NO_TOUCH;
        if (lastTouchType == TouchTypes.ONE_TOUCH && chessEngine != null) {
            this._onTouchBegan(worldLocation, chessEngine);
        }
    }
    flipBoardFacing() {
        this.setBoardFacing(ChessEngine_1.ChessEngine.getOppositeSideType(this.boardFacing));
    }
    setBoardFacing(boardFacing) {
        if (boardFacing == this.boardFacing) {
            return;
        }
        let oldBoardFacing = this.boardFacing;
        let newBoardFacing = boardFacing;
        for (let fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            for (let rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                let fileRank = new FileRank_1.FileRank(fileNumber, rank);
                let sprite = this.pieceViewInterface.getPieceSpriteForFileRank(fileRank);
                if (sprite != null) {
                    let positionFrom;
                    let positionTo;
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
    getBoardFacing() {
        return this.boardFacing;
    }
    initBoardNumbers() {
        for (let fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            let file = ChessEngine_1.ChessEngine.convertFileNumberToFile(fileNumber);
            let fileUi = new Phaser.Text(Global.game, 0, 0, file);
            this.uiBoardFiles[fileNumber] = fileUi;
            fileUi.anchor.set(0.0, 0.0);
            this.fileRankNumberGroup.add(fileUi);
            let scaleX = this.m_width / 800;
            let scaleY = this.m_height / 800;
            fileUi.scale.set(scaleX, scaleY);
        }
        for (let rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
            let rankUi = new Phaser.Text(Global.game, 0, 0, String(rank));
            this.uiBoardRanks[rank] = rankUi;
            rankUi.anchor.set(1.0, 1.0);
            this.fileRankNumberGroup.add(rankUi);
            let scaleX = this.m_width / 800;
            let scaleY = this.m_height / 800;
            rankUi.scale.set(scaleX, scaleY);
        }
    }
    updateBoardNumbersColorPosition() {
        let squareWidth = this.getSquareWidth();
        let squareHeight = this.getSquareHeight();
        for (let fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            let fileUi = this.uiBoardFiles[fileNumber];
            let rank = -1;
            switch (this.boardFacing) {
                case SideType_1.SideType.WHITE:
                    rank = 1;
                    break;
                case SideType_1.SideType.BLACK:
                    rank = ChessEngine_1.ChessEngine.getNumOfRanks();
                    break;
            }
            let fileRank = new FileRank_1.FileRank(fileNumber, rank);
            let fileUiPosition = this.getPositionForFileRank(fileRank);
            fileUiPosition.x = fileUiPosition.x - squareWidth / 2;
            fileUiPosition.y = fileUiPosition.y - squareHeight / 2;
            fileUi.position = fileUiPosition;
            let phaserTextStyle = {};
            let colorType = ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine_1.ChessEngine.getOppositeSideType(colorType);
            phaserTextStyle["fill"] = this.getColorForColorType_inString(colorType);
            fileUi.setStyle(phaserTextStyle, false);
        }
        for (let rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
            let rankUi = this.uiBoardRanks[rank];
            let fileNumber = -1;
            switch (this.boardFacing) {
                case SideType_1.SideType.WHITE:
                    fileNumber = ChessEngine_1.ChessEngine.getNumOfFiles();
                    break;
                case SideType_1.SideType.BLACK:
                    fileNumber = 1;
                    break;
            }
            let fileRank = new FileRank_1.FileRank(fileNumber, rank);
            let rankUiPosition = this.getPositionForFileRank(fileRank);
            rankUiPosition.x = rankUiPosition.x + squareWidth / 2;
            rankUiPosition.y = rankUiPosition.y + squareHeight / 2;
            rankUi.position = rankUiPosition;
            let phaserTextStyle = {};
            phaserTextStyle["fill"] = this.getColorForFileRank_inString(fileRank);
            let colorType = ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine_1.ChessEngine.getOppositeSideType(colorType);
            phaserTextStyle["fill"] = this.getColorForColorType_inString(colorType);
            rankUi.setStyle(phaserTextStyle, true);
        }
    }
    getPositionForFileRank(fileRank) {
        let x = 0;
        let y = 0;
        let minX = this.m_width / (ChessEngine_1.ChessEngine.getNumOfFiles() * 2);
        let maxX = this.m_width - minX;
        minX -= this.m_width / 2;
        maxX -= this.m_width / 2;
        let minY = this.m_height / (ChessEngine_1.ChessEngine.getNumOfRanks() * 2);
        let maxY = this.m_height - minY;
        minY -= this.m_height / 2;
        maxY -= this.m_height / 2;
        switch (this.boardFacing) {
            case SideType_1.SideType.WHITE:
                x = minX + (maxX - minX) * (fileRank.fileNumber - 1) / (ChessEngine_1.ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (ChessEngine_1.ChessEngine.getNumOfRanks() - fileRank.rank) / (ChessEngine_1.ChessEngine.getNumOfRanks() - 1);
                break;
            case SideType_1.SideType.BLACK:
                x = minX + (maxX - minX) * (ChessEngine_1.ChessEngine.getNumOfFiles() - fileRank.fileNumber) / (ChessEngine_1.ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (fileRank.rank - 1) / (ChessEngine_1.ChessEngine.getNumOfRanks() - 1);
                break;
        }
        return new Phaser.Point(x, y);
    }
    getFileRankForPosition(position) {
        position.x += this.m_width / 2;
        position.y += this.m_height / 2;
        let squareWidth = this.m_width / ChessEngine_1.ChessEngine.getNumOfFiles();
        let squareHeight = this.m_height / ChessEngine_1.ChessEngine.getNumOfRanks();
        let fileNumber = -1;
        let rank = -1;
        switch (this.boardFacing) {
            case SideType_1.SideType.WHITE:
                fileNumber = Math.floor(position.x / squareWidth) + 1;
                rank = ChessEngine_1.ChessEngine.getNumOfRanks() - (Math.floor(position.y / squareHeight) + 1) + 1;
                break;
            case SideType_1.SideType.BLACK:
                fileNumber = ChessEngine_1.ChessEngine.getNumOfFiles() - (Math.floor(position.x / squareWidth) + 1) + 1;
                rank = Math.floor(position.y / squareHeight) + 1;
                break;
        }
        return new FileRank_1.FileRank(fileNumber, rank);
    }
    getPositionForWorldLocation(worldLocation) {
        let position = new Phaser.Point();
        this.worldTransform.applyInverse(new Phaser.Point(worldLocation.x, worldLocation.y), position);
        return position;
    }
    getFileRankForWorldLocation(worldLocation) {
        return this.getFileRankForPosition(this.getPositionForWorldLocation(worldLocation));
    }
    addMovingSprite(sprite, positionFrom, positionTo, actionMovingType, finishCallback) {
        let action = null;
        switch (actionMovingType) {
            case ActionMovingTypes.MOVE:
                {
                    let moveSpeed = Math.max(this.m_width, this.m_height) / 700;
                    action = new PositionMovePiece_1.PositionMovePiece(sprite, positionFrom, positionTo, moveSpeed, 300 / ChessEngine_1.ChessEngine.getNumOfFiles());
                }
                break;
            case ActionMovingTypes.UNMOVE:
                {
                }
                break;
            case ActionMovingTypes.ILLEGAL:
                {
                    let invalidSpeed = Math.max(this.m_width, this.m_height) / 400;
                    action = new PositionConstantSpeed_1.PositionConstantSpeed(sprite, positionFrom, positionTo, invalidSpeed);
                }
                break;
            case ActionMovingTypes.FLIP_BOARD:
                {
                    let moveSpeed = Math.max(this.m_width, this.m_height) / 700;
                    action = new PositionMovePiece_1.PositionMovePiece(sprite, positionFrom, positionTo, moveSpeed, 300 / ChessEngine_1.ChessEngine.getNumOfFiles());
                }
                break;
            case ActionMovingTypes.PREDICT:
                {
                    let moveSpeed = Math.max(this.m_width, this.m_height) / 2100;
                    action = new PositionMovePiece_1.PositionMovePiece(sprite, positionFrom, positionTo, moveSpeed, 300 / ChessEngine_1.ChessEngine.getNumOfFiles());
                }
                break;
        }
        if (action != null) {
            this.positionManager.addMovingSprite(sprite, action, finishCallback);
        }
    }
    updateViewToModel(chessEngine) {
        //Hide all possible sprites, that can be displayed
        while (this.positionManager.getLength() != 0) {
            this.positionManager.updateMovingSprites(60 * 60, null);
        }
        this.removeAllPoints();
        this.removeAllSquares();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();
        //Remove all board sprites and draw them again
        for (let fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            for (let rank = 1; rank < ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                let fileRank = new FileRank_1.FileRank(fileNumber, rank);
                let pieceSprite = this.pieceViewInterface.getPieceSpriteForFileRank(fileRank);
                if (pieceSprite != null) {
                    this.pieceViewInterface.setPieceSpriteForFileRank(fileRank, null);
                    this.pieceViewInterface.removePieceView(pieceSprite);
                }
            }
        }
        if (chessEngine == null) {
            return;
        }
        let pieceToSquareMap = chessEngine.getPieceToSquareMap();
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            for (let pieceType = PieceType_1.PieceType.FIRST_PIECE; pieceType <= PieceType_1.PieceType.LAST_PIECE; pieceType++) {
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
    hasPoint(fileRank, pointColor) {
        let hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        let ret = false;
        if (pointColor == null) {
            for (pointColor = PointColorCons_1.POINT_COLORS.FIRST_COLOR; pointColor <= PointColorCons_1.POINT_COLORS.LAST_COLOR; pointColor) {
                ret = ret || (this.uiPoints[pointColor][hash] != undefined);
            }
        }
        else {
            ret = this.uiPoints[pointColor][hash] != undefined;
        }
        return ret;
    }
    addPoint(fileRank, pointColor) {
        let hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        if (this.uiPoints[pointColor][hash] == undefined) {
            let uiPoint = new PointColorNode_1.PointColorNode(pointColor, this.getSquareWidth(), this.getSquareHeight());
            this.pointGroup.add(uiPoint);
            uiPoint.position = this.getPositionForFileRank(fileRank);
            this.uiPoints[pointColor][hash] = uiPoint;
        }
    }
    removePointByColor(pointColor) {
        for (let hash in this.uiPoints[pointColor]) {
            this.pointGroup.removeChild(this.uiPoints[pointColor][hash]);
        }
        this.uiPoints[pointColor] = {};
    }
    removeAllPoints() {
        for (let pointColor = PointColorCons_1.POINT_COLORS.FIRST_COLOR; pointColor <= PointColorCons_1.POINT_COLORS.LAST_COLOR; pointColor++) {
            this.removePointByColor(pointColor);
        }
    }
    //Code to do with adding squares
    hasSquare(fileRank, squareColor) {
        let hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        let ret;
        if (squareColor == null) {
            ret = false;
            for (squareColor = SquareColorCons_1.SQUARE_COLORS.FIRST_COLOR; squareColor <= SquareColorCons_1.SQUARE_COLORS.LAST_COLOR; squareColor++) {
                ret = ret || this.uiSquares[squareColor][hash] != undefined;
            }
        }
        else {
            ret = this.uiSquares[squareColor][hash] != undefined;
        }
        return ret;
    }
    addSquare(fileRank, squareColor) {
        let hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        if (this.uiSquares[squareColor][hash] == undefined) {
            let uiSquare = new SquareColorNode_1.SquareColorNode(squareColor, this.getSquareWidth(), this.getSquareHeight());
            uiSquare.position = this.getPositionForFileRank(fileRank);
            this.uiSquares[squareColor][hash] = uiSquare;
            this.squareGroup.add(uiSquare);
        }
    }
    removeSquaresByColor(squareColor) {
        for (let _hash in this.uiSquares[squareColor]) {
            let hash = Number(_hash);
            let uiSquare = this.uiSquares[squareColor][hash];
            this.squareGroup.remove(uiSquare);
        }
        this.uiSquares[squareColor] = {};
    }
    removeAllSquares() {
        for (let squareColor = SquareColorCons_1.SQUARE_COLORS.FIRST_COLOR; squareColor <= SquareColorCons_1.SQUARE_COLORS.LAST_COLOR; squareColor++) {
            this.removeSquaresByColor(squareColor);
        }
    }
    hideSelectLightSprite() {
        this.uiSelectLightSprite.visible = false;
    }
    showSelectLightSprite(fileRank) {
        this.uiSelectLightSprite.visible = true;
        this.uiSelectLightSprite.position = this.getPositionForFileRank(fileRank);
    }
    hideOptionCycleSprite() {
        this.uiOptionCycleFileRank = null;
        this.uiOptionCycleSprite.visible = false;
    }
    showOptionCycleSprite(fileRank) {
        if (this.uiOptionCycleFileRank != null) {
            if (ChessEngine_1.ChessEngine.fileRankEqual(fileRank, this.uiOptionCycleFileRank)) {
                return;
            }
        }
        this.uiOptionCycleFileRank = fileRank;
        this.uiOptionCycleSprite.position = this.getPositionForFileRank(this.uiOptionCycleFileRank);
        this.uiOptionCycleSprite.visible = true;
    }
    addLastMoveSquares(moveClass) {
        if (moveClass == null) {
            return;
        }
        let originFileRank = moveClass.originFileRank;
        let destFileRank = moveClass.destFileRank;
        this.addSquare(originFileRank, SquareColorCons_1.SQUARE_COLORS.BLUE);
        this.addSquare(destFileRank, SquareColorCons_1.SQUARE_COLORS.BLUE);
    }
    getRemoveAddMoveStructs(moveClass) {
        //move class is a board centric structure
        //we need to change it into a piece centric structure
        let originHashPieces = [];
        let destHashPieces = [];
        {
            let _originPieces = {};
            let _destPieces = {};
            for (let i = 0; i < moveClass.getLength(); i++) {
                let change = moveClass.get(i);
                let fileRank = change.fileRank;
                let originPiece = change.originPiece;
                let destPiece = change.destPiece;
                let hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
                if (!(hash in _originPieces)) {
                    _originPieces[hash] = originPiece;
                }
                _destPieces[hash] = destPiece;
            }
            for (let _hash in _originPieces) {
                let hash = Number(_hash);
                let originHashPiece = { hash: hash, piece: _originPieces[hash] };
                originHashPieces.push(originHashPiece);
            }
            for (let _hash in _destPieces) {
                let hash = Number(_hash);
                let destHashPiece = { hash: hash, piece: _destPieces[hash] };
                destHashPieces.push(destHashPiece);
            }
        }
        let makeMoveStructs = (compareFunction) => {
            let canMakeMoveStructs = true;
            while (canMakeMoveStructs) {
                canMakeMoveStructs = false;
                let moveStruct = null;
                let i = 0;
                while ((moveStruct == null) && (i < originHashPieces.length)) {
                    let originHashPiece = originHashPieces[i];
                    let originPiece = originHashPiece.piece;
                    let originHash = originHashPiece.hash;
                    if (originPiece != null) {
                        let j = 0;
                        while ((moveStruct == null) && (j < destHashPieces.length)) {
                            let destHashPiece = destHashPieces[j];
                            let destPiece = destHashPiece.piece;
                            let destHash = destHashPiece.hash;
                            if (destPiece != null) {
                                if (compareFunction(originPiece, destPiece)) {
                                    originHashPieces.splice(i, 1);
                                    destHashPieces.splice(j, 1);
                                    moveStruct = {
                                        originPiece: originPiece,
                                        destPiece: destPiece,
                                        originFileRank: ChessEngine_1.ChessEngine.getFileRankForHash(originHash),
                                        destFileRank: ChessEngine_1.ChessEngine.getFileRankForHash(destHash),
                                        sprite: null
                                    };
                                }
                            }
                            j = j + 1;
                        }
                    }
                    i = i + 1;
                }
                if (moveStruct != null) {
                    moveStructs.push(moveStruct);
                    canMakeMoveStructs = true;
                }
            }
        };
        let removeStructs = [];
        let addStructs = [];
        let moveStructs = [];
        let compareFunctionExact = (removePiece, addPiece) => {
            return PieceModel_1.PieceModel.isEqualTo(removePiece, addPiece);
        };
        let compareFunctionSide = (removePiece, addPiece) => {
            return removePiece.getSideType() == addPiece.getSideType();
        };
        let compareFunctionPiece = (removePiece, addPiece) => {
            return removePiece.getPieceType() == addPiece.getPieceType();
        };
        let compareFunctionStupid = (removePiece, addPiece) => {
            return true;
        };
        makeMoveStructs(compareFunctionExact);
        makeMoveStructs(compareFunctionSide);
        makeMoveStructs(compareFunctionPiece);
        makeMoveStructs(compareFunctionStupid);
        for (let i = 0; i < originHashPieces.length; i++) {
            let originHashPiece = originHashPieces[i];
            if (originHashPiece.piece != null) {
                let removeStruct = {
                    piece: originHashPiece.piece,
                    fileRank: ChessEngine_1.ChessEngine.getFileRankForHash(originHashPiece.hash),
                    sprite: null
                };
                removeStructs.push(removeStruct);
            }
        }
        for (let i = 0; i < destHashPieces.length; i++) {
            let destHashPiece = destHashPieces[i];
            if (destHashPiece.piece != null) {
                let addStruct = {
                    piece: destHashPiece.piece,
                    fileRank: ChessEngine_1.ChessEngine.getFileRankForHash(destHashPiece.hash),
                    sprite: null
                };
                addStructs.push(addStruct);
            }
        }
        return { removeStructs: removeStructs, addStructs: addStructs, moveStructs: moveStructs };
    }
    doMove(moveClass) {
        this.doMoveAnimation(moveClass, false, this.pieceViewInterface);
        this.addLastMoveSquares(moveClass);
    }
    doMoveAnimation(moveClass, isUndoMove, abstractViewInterface) {
        abstractViewInterface.startAnimation(moveClass, isUndoMove);
        if (abstractViewInterface.getViewInterfaceType() == AbstractViewInterface_1.AbstractViewInterfaceType.PIECE_VIEW) {
            if (this.touchType != TouchTypes.NO_TOUCH) {
                this.onTouchEnded(new Phaser.Point(this.m_width * 100, this.m_height * 100), null);
            }
            this.removeAllSquares();
        }
        let removeAddMoveStructs = this.getRemoveAddMoveStructs(moveClass);
        let removeStructs = removeAddMoveStructs["removeStructs"];
        let addStructs = removeAddMoveStructs["addStructs"];
        let moveStructs = removeAddMoveStructs["moveStructs"];
        for (let i = 0; i < removeStructs.length; i++) {
            let removeStruct = removeStructs[i];
            let fileRank = removeStruct.fileRank;
            let piece = removeStruct.piece;
            {
                let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(fileRank);
                if (pieceSprite == null) {
                    pieceSprite = abstractViewInterface.createPieceView(piece.getSideType(), piece.getPieceType());
                    pieceSprite.position = this.getPositionForFileRank(fileRank);
                    abstractViewInterface.setPieceSpriteForFileRank(fileRank, pieceSprite);
                }
            }
            let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(fileRank);
            pieceSprite.setPiece(piece.getSideType(), piece.getPieceType());
            removeStruct.sprite = pieceSprite;
            abstractViewInterface.setPieceSpriteForFileRank(fileRank, null);
        }
        for (let i = 0; i < moveStructs.length; i++) {
            let moveStruct = moveStructs[i];
            let originFileRank = moveStruct.originFileRank;
            let destFileRank = moveStruct.destFileRank;
            let originPiece = moveStruct.originPiece;
            let destPiece = moveStruct.destPiece;
            let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(originFileRank);
            if (pieceSprite == null) {
                pieceSprite = abstractViewInterface.createPieceView(originPiece.getSideType(), originPiece.getPieceType());
                pieceSprite.position = this.getPositionForFileRank(originFileRank);
                abstractViewInterface.setPieceSpriteForFileRank(originFileRank, pieceSprite);
            }
            pieceSprite.setPiece(originPiece.getSideType(), originPiece.getPieceType());
            moveStruct.sprite = pieceSprite;
            abstractViewInterface.setPieceSpriteForFileRank(originFileRank, null);
        }
        for (let i = 0; i < moveStructs.length; i++) {
            let moveStruct = moveStructs[i];
            let originFileRank = moveStruct.originFileRank;
            let destFileRank = moveStruct.destFileRank;
            let originPiece = moveStruct.originPiece;
            let destPiece = moveStruct.destPiece;
            {
                let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(destFileRank);
                if (pieceSprite != null) {
                    abstractViewInterface.removePieceView(pieceSprite);
                    abstractViewInterface.setPieceSpriteForFileRank(destFileRank, null);
                }
            }
            abstractViewInterface.setPieceSpriteForFileRank(destFileRank, moveStruct.sprite);
        }
        for (let i = 0; i < addStructs.length; i++) {
            let addStruct = addStructs[i];
            let fileRank = addStruct.fileRank;
            let piece = addStruct.piece;
            {
                let pieceSprite = abstractViewInterface.getPieceSpriteForFileRank(fileRank);
                if (pieceSprite != null) {
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
        let globalMoveCallback = (moveStruct) => {
            if (moveStruct != null) {
                moveStructCounter = moveStructCounter + 1;
                let originPiece = moveStruct.originPiece;
                let destPiece = moveStruct.destPiece;
                moveStruct.sprite.setPiece(destPiece.getSideType(), destPiece.getPieceType());
            }
            if (moveStructCounter != moveStructs.length) {
                return;
            }
            for (let i = 0; i < removeStructs.length; i++) {
                let removeStruct = removeStructs[i];
                abstractViewInterface.removePieceView(removeStruct.sprite);
            }
            for (let i = 0; i < addStructs.length; i++) {
                let addStruct = moveStructs[i];
                addStruct.sprite.visible = true;
            }
            abstractViewInterface.endAnimation(moveClass, isUndoMove);
        };
        for (let i = 0; i < moveStructs.length; i++) {
            let moveStruct = moveStructs[i];
            let originFileRank = moveStruct.originFileRank;
            let destFileRank = moveStruct.destFileRank;
            let sprite = moveStruct.sprite;
            let positionFrom;
            let positionTo;
            if (this.positionManager.isMovingSprite(sprite)) {
                positionFrom = this.getPositionForFileRank(originFileRank);
            }
            else {
                positionFrom = sprite.position.clone();
            }
            positionTo = this.getPositionForFileRank(destFileRank);
            let actionMovingType = ActionMovingTypes.PREDICT;
            switch (abstractViewInterface.getViewInterfaceType()) {
                case AbstractViewInterface_1.AbstractViewInterfaceType.PIECE_VIEW:
                    if (isUndoMove) {
                        actionMovingType = ActionMovingTypes.UNMOVE;
                    }
                    else {
                        actionMovingType = ActionMovingTypes.MOVE;
                    }
                    break;
                case AbstractViewInterface_1.AbstractViewInterfaceType.PREDICT_VIEW:
                    actionMovingType = ActionMovingTypes.PREDICT;
                    break;
            }
            let localMoveCallback = () => {
                globalMoveCallback(moveStruct);
            };
            if (isUndoMove) {
                localMoveCallback();
                localMoveCallback = null;
            }
            this.addMovingSprite(sprite, positionFrom, positionTo, actionMovingType, localMoveCallback);
        }
        if (moveStructs.length == 0) {
            globalMoveCallback(null);
        }
    }
    showPredictMove(identifier, moveClass) {
        if (this.isPredictMove(identifier)) {
            return;
        }
        this.predictMoves[identifier] = new PredictViewInterface_1.PredictViewInterface(moveClass, 0.7, this, this.predictSpriteGroup, this.getSquareWidth(), this.getSquareHeight());
    }
    hidePredictMove(identifier) {
        if (!this.isPredictMove(identifier)) {
            return;
        }
        let predictMove = this.predictMoves[identifier];
        predictMove.destroy();
        delete this.predictMoves[identifier];
    }
    isPredictMove(identifier) {
        return this.predictMoves[identifier] != undefined;
    }
}
exports.BoardView = BoardView;
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
//# sourceMappingURL=BoardView.js.map