"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FileRank_1 = require("../../shared/engine/FileRank");
var PieceType_1 = require("../../shared/engine/PieceType");
var ChessEngine_1 = require("../../shared/engine/ChessEngine");
var PieceView_1 = require("./PieceView");
var SquareColorNode_1 = require("./SquareColorNode");
var SquareColorCons_1 = require("./SquareColorCons");
var PointColorNode_1 = require("./PointColorNode");
var PointColorCons_1 = require("./PointColorCons");
var PositionManager_1 = require("./PositionControl/PositionManager");
var ImageTag_1 = require("../ImageTag");
var MOVING_SPEED_FLIP_BOARD = 0.003;
var MOVING_SPEED_ILLEGAL = 0.003;
var MOVING_SPEED_NORMAL = 0.001;
var TouchTypes;
(function (TouchTypes) {
    TouchTypes[TouchTypes["NO_TOUCH"] = 0] = "NO_TOUCH";
    TouchTypes[TouchTypes["DRAG_TOUCH"] = 1] = "DRAG_TOUCH";
    TouchTypes[TouchTypes["ONE_TOUCH"] = 2] = "ONE_TOUCH";
})(TouchTypes || (TouchTypes = {}));
var BoardView = /** @class */ (function (_super) {
    __extends(BoardView, _super);
    function BoardView(m_size, controller) {
        var _this = _super.call(this) || this;
        _this.touchType = TouchTypes.NO_TOUCH;
        _this.m_size = m_size;
        _this.controller = controller;
        _this.boardFacing = 1 /* WHITE */;
        _this.positionManager = new PositionManager_1.PositionManager();
        _this.beginFill(_this.getColorForColorType_inNum(1 /* WHITE */));
        _this.drawRect(-_this.m_size / 2, -_this.m_size / 2, _this.m_size, _this.m_size);
        var squareWidth = _this.getSquareWidth();
        var squareHeight = _this.getSquareHeight();
        _this.beginFill(_this.getColorForColorType_inNum(2 /* BLACK */));
        for (var fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            for (var rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                var fileRank = new FileRank_1.FileRank(fileNumber, rank);
                if (ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank) == 2 /* BLACK */) {
                    var position = _this.getPositionForFileRank(fileRank);
                    _this.drawRect(position.x - squareWidth / 2, position.y - squareHeight / 2, squareWidth, squareHeight);
                }
            }
        }
        _this.pointGroup = new PIXI.Container();
        _this.addChild(_this.pointGroup);
        _this.squareGroup = new PIXI.Container();
        _this.addChild(_this.squareGroup);
        _this.bottomGroup = new PIXI.Container();
        _this.addChild(_this.bottomGroup);
        _this.pieceSpriteGroup = new PIXI.Container();
        _this.addChild(_this.pieceSpriteGroup);
        _this.movingSpriteGroup = new PIXI.Container();
        _this.addChild(_this.movingSpriteGroup);
        _this.fileRankNumberGroup = new PIXI.Container();
        _this.addChild(_this.fileRankNumberGroup);
        _this.uiBoardFiles = {};
        _this.uiBoardRanks = {};
        _this.initBoardNumbers();
        _this.updateBoardNumbersColorPosition();
        //The select light of the board
        _this.uiSelectLightSprite = PIXI.Sprite.from(ImageTag_1.ImageTag.select_light);
        _this.bottomGroup.addChild(_this.uiSelectLightSprite);
        _this.uiSelectLightSprite.scale.set(_this.m_size / 700, _this.m_size / 700);
        _this.uiSelectLightSprite.anchor.set(0.5, 0.5);
        _this.hideSelectLightSprite();
        //The option cycle sprite
        _this.uiOptionCycleSprite = PIXI.Sprite.from(ImageTag_1.ImageTag.option_light);
        _this.bottomGroup.addChild(_this.uiOptionCycleSprite);
        _this.uiOptionCycleSprite.scale.set(_this.m_size / 700, _this.m_size / 700);
        _this.uiOptionCycleSprite.anchor.set(0.5, 0.5);
        _this.uiOptionCycleSprite.alpha = 0.3;
        _this.uiOptionCycleFileRank = null;
        _this.hideOptionCycleSprite();
        //The squares
        _this.uiSquares = {};
        for (var squareColor = SquareColorCons_1.SQUARE_COLORS.FIRST_COLOR; squareColor <= SquareColorCons_1.SQUARE_COLORS.LAST_COLOR; squareColor++) {
            _this.uiSquares[squareColor] = {};
        }
        //the points
        _this.uiPoints = {};
        for (var pointColor = PointColorCons_1.POINT_COLORS.FIRST_COLOR; pointColor <= PointColorCons_1.POINT_COLORS.LAST_COLOR; pointColor++) {
            _this.uiPoints[pointColor] = {};
        }
        //the filerank pieces
        _this.fileRankPieceSprites = {};
        for (var fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            _this.fileRankPieceSprites[fileNumber] = {};
            for (var rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                _this.fileRankPieceSprites[fileNumber][rank] = null;
            }
        }
        //The code related to the touchtype
        _this.originFileRank = null;
        _this.touchType = TouchTypes.NO_TOUCH;
        _this.originSprite = null;
        _this.originTouchLocation = null;
        _this.currentTouchLocation = null;
        return _this;
    }
    BoardView.prototype.getPositionManager = function () {
        return this.positionManager;
    };
    BoardView.prototype.getPieceSpriteForFileRank = function (fileRank) {
        return this.fileRankPieceSprites[fileRank.x][fileRank.y];
    };
    BoardView.prototype.setPieceSpriteForFileRank = function (fileRank, pieceView) {
        this.fileRankPieceSprites[fileRank.x][fileRank.y] = pieceView;
    };
    BoardView.prototype.createPieceView = function (pieceModel) {
        var pieceSprite = new PieceView_1.PieceView(pieceModel, this.getSquareWidth(), this.getSquareHeight());
        pieceSprite.buttonMode = true;
        this.pieceSpriteGroup.addChild(pieceSprite);
        return pieceSprite;
    };
    BoardView.prototype.removePieceView = function (pieceView) {
        pieceView.parent.removeChild(pieceView);
    };
    BoardView.prototype.moveToPieceSpriteGroup = function (pieceView) {
        pieceView.setNormal();
        if (pieceView.parent != null) {
            pieceView.parent.removeChild(pieceView);
        }
        this.pieceSpriteGroup.addChild(pieceView);
    };
    BoardView.prototype.moveToMovingSpriteGroup = function (pieceView) {
        pieceView.setMoving();
        if (pieceView.parent != null) {
            pieceView.parent.removeChild(pieceView);
        }
        this.movingSpriteGroup.addChild(pieceView);
    };
    BoardView.prototype.getColorForFileRank_inNum = function (fileRank) {
        return this.getColorForColorType_inNum(ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank));
    };
    BoardView.prototype.getColorForFileRank_inString = function (fileRank) {
        return this.getColorForColorType_inString(ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank));
    };
    BoardView.prototype.getColorForColorType_inNum = function (colorType) {
        var colors = {};
        colors[1 /* WHITE */] = 0xFFFFFF;
        colors[2 /* BLACK */] = 0x333333;
        colors[1 /* WHITE */] = 0xFBE2B2;
        colors[2 /* BLACK */] = 0xA66325;
        return colors[colorType];
    };
    BoardView.prototype.getColorForColorType_inString = function (colorType) {
        var colors = {};
        colors[1 /* WHITE */] = "#FFFFFF";
        colors[2 /* BLACK */] = "#333333";
        colors[1 /* WHITE */] = "#FBE2B2";
        colors[2 /* BLACK */] = "#A66325";
        return colors[colorType];
    };
    BoardView.prototype.getSquareWidth = function () {
        var squareWidth = this.m_size / ChessEngine_1.ChessEngine.getNumOfFiles();
        return squareWidth;
    };
    BoardView.prototype.getSquareHeight = function () {
        var squareHeight = this.m_size / ChessEngine_1.ChessEngine.getNumOfRanks();
        return squareHeight;
    };
    BoardView.prototype.onTouchBegan = function (worldLocation, chessEngine) {
        this.currentTouchLocation = worldLocation;
        this._onTouchBegan(worldLocation, chessEngine);
    };
    BoardView.prototype._onTouchBegan = function (worldLocation, chessEngine) {
        var _this = this;
        var fileRank = this.getFileRankForWorldLocation(worldLocation);
        if (this.touchType === TouchTypes.NO_TOUCH) {
            if (chessEngine.getPieceForFileRank(fileRank) !== null && this.getPieceSpriteForFileRank(fileRank) !== null) {
                var possibleMoves = chessEngine.getPossibleMoves(fileRank, null);
                for (var i = 0; i < possibleMoves.length; i++) {
                    var possibleMove = possibleMoves[i];
                    var pointColor = null;
                    if (chessEngine.isMoveLegal(possibleMove, true)) {
                        pointColor = PointColorCons_1.POINT_COLORS.GREEN;
                    }
                    else {
                        pointColor = PointColorCons_1.POINT_COLORS.RED;
                    }
                    this.addPoint(possibleMove.destFileRank, pointColor);
                }
                var vectorMoves = chessEngine.getVectorMoves(fileRank, null);
                for (var i = 0; i < vectorMoves.length; i++) {
                    var vectorMove = vectorMoves[i];
                    if (!this.hasPoint(vectorMove.destFileRank, PointColorCons_1.POINT_COLORS.GREEN)) {
                        this.addPoint(vectorMove.destFileRank, PointColorCons_1.POINT_COLORS.RED);
                    }
                }
                this.showSelectLightSprite(fileRank);
                this.originFileRank = fileRank;
                this.originSprite = this.getPieceSpriteForFileRank(this.originFileRank);
                this.originTouchLocation = worldLocation;
                setTimeout(function () {
                    if (_this.currentTouchLocation === null || _this.originTouchLocation === null || _this.originSprite == null) {
                        return;
                    }
                    _this.touchType = TouchTypes.DRAG_TOUCH;
                    _this.moveToMovingSpriteGroup(_this.originSprite);
                    _this._onTouchMoved(_this.currentTouchLocation, chessEngine);
                }, 200);
                this.positionManager.stopMoving(this.originSprite);
                this.touchType = TouchTypes.ONE_TOUCH;
            }
            else {
                this.touchType = TouchTypes.NO_TOUCH;
            }
        }
        else if (this.touchType === TouchTypes.ONE_TOUCH) {
            this.onTouchHelper(worldLocation, fileRank, chessEngine);
        }
    };
    BoardView.prototype.onTouchMoved = function (worldLocation, chessEngine) {
        this.currentTouchLocation = worldLocation;
        this._onTouchMoved(worldLocation, chessEngine);
    };
    BoardView.prototype._onTouchMoved = function (worldLocation, chessEngine) {
        var position = this.getPositionForWorldLocation(worldLocation);
        var fileRank = this.getFileRankForPosition(position);
        if (this.touchType === TouchTypes.DRAG_TOUCH) {
            this.showOptionCycleSprite(ChessEngine_1.ChessEngine.getClosestLegalFileRank(fileRank));
            var halfSquareWidth = this.getSquareWidth() / 2;
            var halfSquareHeight = this.getSquareHeight() / 2;
            var minX = -this.m_size / 2 + halfSquareWidth;
            var maxX = this.m_size / 2 - halfSquareWidth;
            var minY = -this.m_size / 2 + halfSquareHeight;
            var maxY = this.m_size / 2 - halfSquareHeight;
            //console.log("original position", position);
            position.x = Math.max(minX, Math.min(maxX, position.x));
            position.y = Math.max(minY, Math.min(maxY, position.y));
            //console.log("new position", position);
            this.originSprite.position = position;
            //(<PieceView>this.originSprite).position.set(0, 0);
        }
    };
    BoardView.prototype.onTouchEnded = function (worldLocation, chessEngine) {
        this.currentTouchLocation = null;
        this._onTouchEnded(worldLocation, chessEngine);
    };
    BoardView.prototype._onTouchEnded = function (worldLocation, chessEngine) {
        if (this.touchType === TouchTypes.NO_TOUCH) {
            return;
        }
        var fileRank = this.getFileRankForWorldLocation(worldLocation);
        this.onTouchHelper(worldLocation, fileRank, chessEngine);
    };
    BoardView.prototype.onTouchHelper = function (worldLocation, fileRank, chessEngine) {
        this.removeAllPoints();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();
        var legalMoves = [];
        if (chessEngine != null) {
            legalMoves = chessEngine.getLegalMoves(this.originFileRank, fileRank, true);
        }
        this.moveToPieceSpriteGroup(this.originSprite);
        for (var i = legalMoves.length - 1; i >= 0; i--) {
            if (!chessEngine.isMoveLegal(legalMoves[i], false)) {
                legalMoves.splice(i, 1);
            }
        }
        var lastTouchType = this.touchType;
        var lastOriginFileRank = this.originFileRank;
        var lastOriginSprite = this.originSprite;
        this.originFileRank = null;
        this.originTouchLocation = null;
        this.originSprite = null;
        this.touchType = TouchTypes.NO_TOUCH;
        if (legalMoves.length == 0) {
            var positionTo = this.getPositionForFileRank(lastOriginFileRank);
            this.positionManager.moveTo(lastOriginSprite, null, positionTo, MOVING_SPEED_ILLEGAL * this.m_size);
            if (lastTouchType == TouchTypes.ONE_TOUCH && chessEngine != null) {
                this._onTouchBegan(worldLocation, chessEngine);
            }
        }
        else if (legalMoves.length == 1) {
            this.controller.notifyMove(legalMoves[0]);
        }
        else {
            this.normalizePromote(legalMoves);
        }
    };
    BoardView.prototype.flipBoardFacing = function (isAnimation) {
        this.setBoardFacing(ChessEngine_1.ChessEngine.getOppositeSideType(this.boardFacing), isAnimation);
    };
    BoardView.prototype.setBoardFacing = function (boardFacing, isAnimation) {
        if (boardFacing == this.boardFacing) {
            return;
        }
        var oldBoardFacing = this.boardFacing;
        var newBoardFacing = boardFacing;
        for (var fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            for (var rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                var fileRank = new FileRank_1.FileRank(fileNumber, rank);
                var sprite = this.getPieceSpriteForFileRank(fileRank);
                if (sprite != null) {
                    var positionFrom = void 0;
                    var positionTo = void 0;
                    this.boardFacing = oldBoardFacing;
                    positionFrom = this.getPositionForFileRank(fileRank);
                    this.boardFacing = newBoardFacing;
                    positionTo = this.getPositionForFileRank(fileRank);
                    if (isAnimation) {
                        this.positionManager.moveTo(sprite, null, positionTo, MOVING_SPEED_FLIP_BOARD * this.m_size);
                    }
                    else {
                        sprite.position = positionTo;
                    }
                }
            }
        }
        this.boardFacing = newBoardFacing;
        this.updateBoardNumbersColorPosition();
    };
    BoardView.prototype.getBoardFacing = function () {
        return this.boardFacing;
    };
    BoardView.prototype.initBoardNumbers = function () {
        for (var fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            var file = ChessEngine_1.ChessEngine.convertFileNumberToFile(fileNumber);
            var fileUi = new PIXI.Text(file);
            this.uiBoardFiles[fileNumber] = fileUi;
            fileUi.anchor.set(0.0, 0.0);
            this.fileRankNumberGroup.addChild(fileUi);
            var scale = this.m_size / 800;
            fileUi.scale.set(scale, scale);
        }
        for (var rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
            var rankUi = new PIXI.Text(String(rank));
            this.uiBoardRanks[rank] = rankUi;
            rankUi.anchor.set(1.0, 1.0);
            this.fileRankNumberGroup.addChild(rankUi);
            var scale = this.m_size / 800;
            rankUi.scale.set(scale, scale);
        }
    };
    BoardView.prototype.updateBoardNumbersColorPosition = function () {
        var squareWidth = this.getSquareWidth();
        var squareHeight = this.getSquareHeight();
        for (var fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            var fileUi = this.uiBoardFiles[fileNumber];
            var rank = -1;
            switch (this.boardFacing) {
                case 1 /* WHITE */:
                    rank = 1;
                    break;
                case 2 /* BLACK */:
                    rank = ChessEngine_1.ChessEngine.getNumOfRanks();
                    break;
            }
            var fileRank = new FileRank_1.FileRank(fileNumber, rank);
            var fileUiPosition = this.getPositionForFileRank(fileRank);
            fileUiPosition.x = fileUiPosition.x - squareWidth / 2;
            fileUiPosition.y = fileUiPosition.y - squareHeight / 2;
            fileUi.position = fileUiPosition;
            var textStyleOptions = {};
            var colorType = ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine_1.ChessEngine.getOppositeSideType(colorType);
            textStyleOptions.fill = this.getColorForColorType_inString(colorType);
            fileUi.style = new PIXI.TextStyle(textStyleOptions);
        }
        for (var rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
            var rankUi = this.uiBoardRanks[rank];
            var fileNumber = -1;
            switch (this.boardFacing) {
                case 1 /* WHITE */:
                    fileNumber = ChessEngine_1.ChessEngine.getNumOfFiles();
                    break;
                case 2 /* BLACK */:
                    fileNumber = 1;
                    break;
            }
            var fileRank = new FileRank_1.FileRank(fileNumber, rank);
            var rankUiPosition = this.getPositionForFileRank(fileRank);
            rankUiPosition.x = rankUiPosition.x + squareWidth / 2;
            rankUiPosition.y = rankUiPosition.y + squareHeight / 2;
            rankUi.position = rankUiPosition;
            var textStyleOptions = {};
            var colorType = ChessEngine_1.ChessEngine.getColorTypeForFileRank(fileRank);
            colorType = ChessEngine_1.ChessEngine.getOppositeSideType(colorType);
            textStyleOptions.fill = this.getColorForColorType_inString(colorType);
            rankUi.style = new PIXI.TextStyle(textStyleOptions);
        }
    };
    BoardView.prototype.getPositionForFileRank = function (fileRank) {
        var x = 0;
        var y = 0;
        var minX = this.m_size / (ChessEngine_1.ChessEngine.getNumOfFiles() * 2);
        var maxX = this.m_size - minX;
        minX -= this.m_size / 2;
        maxX -= this.m_size / 2;
        var minY = this.m_size / (ChessEngine_1.ChessEngine.getNumOfRanks() * 2);
        var maxY = this.m_size - minY;
        minY -= this.m_size / 2;
        maxY -= this.m_size / 2;
        switch (this.boardFacing) {
            case 1 /* WHITE */:
                x = minX + (maxX - minX) * (fileRank.x - 1) / (ChessEngine_1.ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (ChessEngine_1.ChessEngine.getNumOfRanks() - fileRank.y) / (ChessEngine_1.ChessEngine.getNumOfRanks() - 1);
                break;
            case 2 /* BLACK */:
                x = minX + (maxX - minX) * (ChessEngine_1.ChessEngine.getNumOfFiles() - fileRank.x) / (ChessEngine_1.ChessEngine.getNumOfFiles() - 1);
                y = minY + (maxY - minY) * (fileRank.y - 1) / (ChessEngine_1.ChessEngine.getNumOfRanks() - 1);
                break;
        }
        return new PIXI.Point(x, y);
    };
    BoardView.prototype.getFileRankForPosition = function (position) {
        var squareWidth = this.getSquareWidth();
        var squareHeight = this.getSquareHeight();
        var fileNumber = -1;
        var rank = -1;
        switch (this.boardFacing) {
            case 1 /* WHITE */:
                fileNumber = Math.floor((position.x + this.m_size / 2) / squareWidth) + 1;
                rank = ChessEngine_1.ChessEngine.getNumOfRanks() - (Math.floor((position.y + this.m_size / 2) / squareHeight) + 1) + 1;
                break;
            case 2 /* BLACK */:
                fileNumber = ChessEngine_1.ChessEngine.getNumOfFiles() - (Math.floor((position.x + this.m_size / 2) / squareWidth) + 1) + 1;
                rank = Math.floor((position.y + this.m_size / 2) / squareHeight) + 1;
                break;
        }
        return new FileRank_1.FileRank(fileNumber, rank);
    };
    BoardView.prototype.getPositionForWorldLocation = function (worldLocation) {
        var position = new PIXI.Point();
        this.worldTransform.applyInverse(new PIXI.Point(worldLocation.x, worldLocation.y), position);
        return position;
    };
    BoardView.prototype.getFileRankForWorldLocation = function (worldLocation) {
        return this.getFileRankForPosition(this.getPositionForWorldLocation(worldLocation));
    };
    BoardView.prototype.updateViewToModel = function (chessEngine) {
        //Hide all possible sprites, that can be displayed
        this.positionManager.stopMoving(null);
        this.removeAllPoints();
        this.removeAllSquares();
        this.hideSelectLightSprite();
        this.hideOptionCycleSprite();
        // @ts-ignore
        var rememPieceMap = {};
        for (var sideType = 1 /* FIRST_SIDE */; sideType <= 2 /* LAST_SIDE */; sideType++) {
            // @ts-ignore
            rememPieceMap[sideType] = {};
            for (var pieceType = PieceType_1.PieceType.FIRST_PIECE; pieceType <= PieceType_1.PieceType.LAST_PIECE; pieceType++) {
                rememPieceMap[sideType][pieceType] = [];
            }
        }
        //Remove all board sprites and draw them again
        for (var fileNumber = 1; fileNumber <= ChessEngine_1.ChessEngine.getNumOfFiles(); fileNumber++) {
            for (var rank = 1; rank <= ChessEngine_1.ChessEngine.getNumOfRanks(); rank++) {
                var fileRank = new FileRank_1.FileRank(fileNumber, rank);
                var pieceSprite = this.getPieceSpriteForFileRank(fileRank);
                if (pieceSprite != null) {
                    this.setPieceSpriteForFileRank(fileRank, null);
                    this.removePieceView(pieceSprite);
                    pieceSprite.setNormal();
                    rememPieceMap[pieceSprite.getSideType()][pieceSprite.getPieceType()].push(pieceSprite);
                }
            }
        }
        if (chessEngine == null) {
            return;
        }
        var pieceToSquareMap = chessEngine.getPieceToSquareMap();
        for (var sideType = 1 /* FIRST_SIDE */; sideType <= 2 /* LAST_SIDE */; sideType++) {
            for (var pieceType = PieceType_1.PieceType.FIRST_PIECE; pieceType <= PieceType_1.PieceType.LAST_PIECE; pieceType++) {
                var positions = pieceToSquareMap[sideType][pieceType];
                for (var i = 0; i < positions.length; i++) {
                    var fileRank = positions[i];
                    var pieceSprite = void 0;
                    if (rememPieceMap[sideType][pieceType].length > 0) {
                        pieceSprite = rememPieceMap[sideType][pieceType].pop();
                        this.moveToPieceSpriteGroup(pieceSprite);
                    }
                    else {
                        pieceSprite = this.createPieceView({ sideType: sideType, pieceType: pieceType });
                    }
                    pieceSprite.position = this.getPositionForFileRank(fileRank);
                    this.setPieceSpriteForFileRank(fileRank, pieceSprite);
                }
            }
        }
        this.addLastMoveSquares(chessEngine.getLastMoveClass());
    };
    BoardView.prototype.hasPoint = function (fileRank, pointColor) {
        var hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        var ret = false;
        if (pointColor == null) {
            for (pointColor = PointColorCons_1.POINT_COLORS.FIRST_COLOR; pointColor <= PointColorCons_1.POINT_COLORS.LAST_COLOR; pointColor) {
                ret = ret || (this.uiPoints[pointColor][hash] != undefined);
            }
        }
        else {
            ret = this.uiPoints[pointColor][hash] != undefined;
        }
        return ret;
    };
    BoardView.prototype.addPoint = function (fileRank, pointColor) {
        var hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        if (this.uiPoints[pointColor][hash] == undefined) {
            var uiPoint = new PointColorNode_1.PointColorNode(pointColor, this.getSquareWidth(), this.getSquareHeight());
            this.pointGroup.addChild(uiPoint);
            uiPoint.position = this.getPositionForFileRank(fileRank);
            this.uiPoints[pointColor][hash] = uiPoint;
        }
    };
    BoardView.prototype.removePointByColor = function (pointColor) {
        for (var hash in this.uiPoints[pointColor]) {
            this.pointGroup.removeChild(this.uiPoints[pointColor][hash]);
        }
        this.uiPoints[pointColor] = {};
    };
    BoardView.prototype.removeAllPoints = function () {
        for (var pointColor = PointColorCons_1.POINT_COLORS.FIRST_COLOR; pointColor <= PointColorCons_1.POINT_COLORS.LAST_COLOR; pointColor++) {
            this.removePointByColor(pointColor);
        }
    };
    //Code to do with adding squares
    BoardView.prototype.hasSquare = function (fileRank, squareColor) {
        var hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        var ret;
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
    };
    BoardView.prototype.addSquare = function (fileRank, squareColor) {
        var hash = ChessEngine_1.ChessEngine.getHashForFileRank(fileRank);
        if (this.uiSquares[squareColor][hash] == undefined) {
            var uiSquare = new SquareColorNode_1.SquareColorNode(squareColor, this.getSquareWidth(), this.getSquareHeight());
            uiSquare.position = this.getPositionForFileRank(fileRank);
            this.uiSquares[squareColor][hash] = uiSquare;
            this.squareGroup.addChild(uiSquare);
        }
    };
    BoardView.prototype.removeSquaresByColor = function (squareColor) {
        for (var _hash in this.uiSquares[squareColor]) {
            var hash = Number(_hash);
            var uiSquare = this.uiSquares[squareColor][hash];
            this.squareGroup.removeChild(uiSquare);
        }
        this.uiSquares[squareColor] = {};
    };
    BoardView.prototype.removeAllSquares = function () {
        for (var squareColor = SquareColorCons_1.SQUARE_COLORS.FIRST_COLOR; squareColor <= SquareColorCons_1.SQUARE_COLORS.LAST_COLOR; squareColor++) {
            this.removeSquaresByColor(squareColor);
        }
    };
    BoardView.prototype.hideSelectLightSprite = function () {
        this.uiSelectLightSprite.visible = false;
    };
    BoardView.prototype.showSelectLightSprite = function (fileRank) {
        this.uiSelectLightSprite.visible = true;
        this.uiSelectLightSprite.position = this.getPositionForFileRank(fileRank);
    };
    BoardView.prototype.hideOptionCycleSprite = function () {
        this.uiOptionCycleFileRank = null;
        this.uiOptionCycleSprite.visible = false;
    };
    BoardView.prototype.showOptionCycleSprite = function (fileRank) {
        if (this.uiOptionCycleFileRank != null) {
            if (FileRank_1.FileRank.isEqual(fileRank, this.uiOptionCycleFileRank)) {
                return;
            }
        }
        this.uiOptionCycleFileRank = fileRank;
        this.uiOptionCycleSprite.position = this.getPositionForFileRank(this.uiOptionCycleFileRank);
        this.uiOptionCycleSprite.visible = true;
    };
    BoardView.prototype.addLastMoveSquares = function (moveClass) {
        if (moveClass == null) {
            return;
        }
        var originFileRank = moveClass.originFileRank;
        var destFileRank = moveClass.destFileRank;
        this.addSquare(originFileRank, SquareColorCons_1.SQUARE_COLORS.BLUE);
        this.addSquare(destFileRank, SquareColorCons_1.SQUARE_COLORS.BLUE);
    };
    BoardView.prototype.normalizePromote = function (legalMoves) {
        var _this = this;
        var cb = function (_, __) {
            _this.controller.notifyPromote(legalMoves);
        };
        this.doMoveAnimation(legalMoves[0], false, false, cb);
    };
    BoardView.prototype.doMove = function (moveClass) {
        this.doMoveAnimation(moveClass, false, true, null);
        this.addLastMoveSquares(moveClass);
    };
    BoardView.prototype.doMoveAnimation = function (moveClass, isUndoMove, isStrictMove, endAnimation) {
        var _this = this;
        if (this.touchType != TouchTypes.NO_TOUCH) {
            this.onTouchEnded(new PIXI.Point(this.m_size * 100, this.m_size * 100), null);
        }
        this.removeAllSquares();
        var removeAddMoveStructs = moveClass.getRemoveAddMoveMoveStruct(false);
        // @ts-ignore
        var removeStructs = removeAddMoveStructs.removeStructs;
        for (var i = 0; i < removeStructs.length; i++) {
            removeStructs[i].sprite = null;
        }
        // @ts-ignore
        var addStructs = removeAddMoveStructs.addStructs;
        for (var i = 0; i < addStructs.length; i++) {
            addStructs[i].sprite = null;
        }
        // @ts-ignore
        var moveStructs = removeAddMoveStructs.moveStructs;
        for (var i = 0; i < moveStructs.length; i++) {
            moveStructs[i].sprite = null;
        }
        if (isStrictMove) {
            for (var i = 0; i < removeStructs.length; i++) {
                var removeStruct = removeStructs[i];
                var fileRank = removeStruct.fileRank;
                var piece = removeStruct.piece;
                {
                    var pieceSprite_1 = this.getPieceSpriteForFileRank(fileRank);
                    if (pieceSprite_1 == null) {
                        pieceSprite_1 = this.createPieceView(piece);
                        pieceSprite_1.position = this.getPositionForFileRank(fileRank);
                        this.setPieceSpriteForFileRank(fileRank, pieceSprite_1);
                    }
                }
                var pieceSprite = this.getPieceSpriteForFileRank(fileRank);
                pieceSprite.setPiece(piece);
                removeStruct.sprite = pieceSprite;
                this.setPieceSpriteForFileRank(fileRank, null);
            }
            for (var i = 0; i < moveStructs.length; i++) {
                var moveStruct = moveStructs[i];
                var originFileRank = moveStruct.originFileRank;
                var destFileRank = moveStruct.destFileRank;
                var originPiece = moveStruct.originPiece;
                var destPiece = moveStruct.destPiece;
                var pieceSprite = this.getPieceSpriteForFileRank(originFileRank);
                if (pieceSprite == null) {
                    pieceSprite = this.createPieceView(originPiece);
                    pieceSprite.position = this.getPositionForFileRank(originFileRank);
                    this.setPieceSpriteForFileRank(originFileRank, pieceSprite);
                }
                pieceSprite.setPiece(originPiece);
                moveStruct.sprite = pieceSprite;
                this.setPieceSpriteForFileRank(originFileRank, null);
            }
            for (var i = 0; i < moveStructs.length; i++) {
                var moveStruct = moveStructs[i];
                var originFileRank = moveStruct.originFileRank;
                var destFileRank = moveStruct.destFileRank;
                var originPiece = moveStruct.originPiece;
                var destPiece = moveStruct.destPiece;
                {
                    var pieceSprite = this.getPieceSpriteForFileRank(destFileRank);
                    if (pieceSprite != null) {
                        this.removePieceView(pieceSprite);
                        this.setPieceSpriteForFileRank(destFileRank, null);
                    }
                }
                this.setPieceSpriteForFileRank(destFileRank, moveStruct.sprite);
            }
            for (var i = 0; i < addStructs.length; i++) {
                var addStruct = addStructs[i];
                var fileRank = addStruct.fileRank;
                var piece = addStruct.piece;
                {
                    var pieceSprite_2 = this.getPieceSpriteForFileRank(fileRank);
                    if (pieceSprite_2 != null) {
                        this.removePieceView(pieceSprite_2);
                        this.setPieceSpriteForFileRank(fileRank, null);
                    }
                }
                var pieceSprite = this.createPieceView(piece);
                pieceSprite.position = this.getPositionForFileRank(fileRank);
                pieceSprite.visible = false;
                addStruct.sprite = pieceSprite;
                this.setPieceSpriteForFileRank(fileRank, pieceSprite);
            }
        }
        else {
            for (var i = 0; i < moveStructs.length; i++) {
                var moveStruct = moveStructs[i];
                moveStruct.sprite = this.getPieceSpriteForFileRank(moveStruct.originFileRank);
            }
        }
        var moveStructCounter = 0;
        var globalMoveCallback = function (moveStruct) {
            if (moveStruct != null) {
                moveStructCounter = moveStructCounter + 1;
                var originPiece = moveStruct.originPiece;
                var destPiece = moveStruct.destPiece;
                if (isStrictMove) {
                    moveStruct.sprite.setPiece(destPiece);
                }
            }
            if (moveStructCounter == moveStructs.length && isStrictMove) {
                for (var i = 0; i < removeStructs.length; i++) {
                    var removeStruct = removeStructs[i];
                    _this.removePieceView(removeStruct.sprite);
                }
                for (var i = 0; i < addStructs.length; i++) {
                    var addStruct = moveStructs[i];
                    addStruct.sprite.visible = true;
                }
            }
            if (endAnimation != null) {
                endAnimation(moveClass, isUndoMove);
            }
        };
        var _loop_1 = function (i) {
            var moveStruct = moveStructs[i];
            var originFileRank = moveStruct.originFileRank;
            var destFileRank = moveStruct.destFileRank;
            var sprite = moveStruct.sprite;
            var localMoveCallback = function () {
                globalMoveCallback(moveStruct);
            };
            if (sprite == null) {
                localMoveCallback();
            }
            else {
                var positionTo = this_1.getPositionForFileRank(destFileRank);
                if (isUndoMove) {
                    localMoveCallback();
                    localMoveCallback = null;
                }
                this_1.positionManager.moveTo(sprite, localMoveCallback, positionTo, this_1.m_size * MOVING_SPEED_NORMAL);
            }
        };
        var this_1 = this;
        for (var i = 0; i < moveStructs.length; i++) {
            _loop_1(i);
        }
        if (moveStructs.length == 0) {
            globalMoveCallback(null);
        }
    };
    return BoardView;
}(PIXI.Graphics));
exports.BoardView = BoardView;
//# sourceMappingURL=BoardView.js.map