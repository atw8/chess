"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MoveClass_1 = require("./MoveClass");
const FileRank_1 = require("./FileRank");
const FairyType_1 = require("./Fairy/FairyType");
class AbstractEngine {
    constructor(numOfFiles, numOfRanks, pieceSet, sideSet) {
        this.isRay = function (origin, dest, vector) {
            let originX = origin["fileNumber"];
            let originY = origin["rank"];
            let destX = dest["fileNumber"];
            let destY = dest["rank"];
            let vecX = vector["x"];
            let vecY = vector["y"];
            let ret = false;
            if (vecX === 0 && vecY === 0) {
                ret = (originX === destX) && (originY === destY);
            }
            else if (vecX === 0 && vecY !== 0) {
                if (originX === destX) {
                    let tY = (destY - originY) / vecY;
                    ret = tY > 0;
                }
                else {
                    ret = false;
                }
            }
            else if (vecX !== 0 && vecY === 0) {
                if (originY === destY) {
                    let tX = (destX - originX) / vecX;
                    ret = tX > 0;
                }
                else {
                    ret = false;
                }
            }
            else if (vecX !== 0 && vecY !== 0) {
                let tX = (destX - originX) / vecX;
                let tY = (destY - originY) / vecY;
                ret = (tX === tY) && (tX > 0) && (tY > 0);
            }
            return ret;
        };
        this.numOfFiles = numOfFiles;
        this.numOfRanks = numOfRanks;
        this.pieceSet = pieceSet;
        this.sideSet = sideSet;
        this.fileRankPieces = {};
        this.outitModel();
    }
    getMoveClasses() {
        return this.moveClasses;
    }
    getFirstMoveClass() {
        let ret;
        if (this.moveClasses.length == 0) {
            ret = null;
        }
        else {
            ret = this.moveClasses[0];
        }
        return ret;
    }
    getLastMoveClass() {
        let ret;
        if (this.moveClasses.length == 0) {
            ret = null;
        }
        else {
            ret = this.moveClasses[this.moveClasses.length - 1];
        }
        return ret;
    }
    getNumOfFiles() {
        return this.numOfFiles;
    }
    getNumOfRanks() {
        return this.numOfRanks;
    }
    getPieceToSquareMap() {
        return this.pieceToSquareMap;
    }
    outitModel() {
        this.moveClasses = [];
        this.royalPieces = {};
        this.pieceToSquareMap = {};
        for (let fileNumber = 1; fileNumber <= this.getNumOfFiles(); fileNumber++) {
            this.fileRankPieces[fileNumber] = {};
            for (let rank = 1; rank <= this.getNumOfRanks(); rank++) {
                this.fileRankPieces[fileNumber][rank] = null;
            }
        }
        for (let i = 0; i < this.sideSet.length; i++) {
            let sideType = this.sideSet[i];
            this.royalPieces[sideType] = [];
            this.pieceToSquareMap[sideType] = {};
            for (let j = 0; j < this.pieceSet.length; j++) {
                let pieceType = this.pieceSet[j];
                this.pieceToSquareMap[sideType][pieceType] = [];
            }
        }
    }
    ;
    setPieceToRoyal(sideType, pieceType) {
        this.royalPieces[sideType].push(pieceType);
    }
    getSquaresBySideTypePieceType(sideType, pieceType) {
        return this.pieceToSquareMap[sideType][pieceType];
    }
    getSquaresByPieceType(pieceType) {
        let ret = [];
        for (let i = 0; i < this.sideSet.length; i++) {
            let sideType = this.sideSet[i];
            ret = ret.concat(this.getSquaresBySideTypePieceType(sideType, pieceType));
        }
        return ret;
    }
    getSquaresBySideType(sideType) {
        let ret = [];
        for (let i = 0; i < this.pieceSet.length; i++) {
            let pieceType = this.pieceSet[i];
            ret = ret.concat(this.getSquaresBySideTypePieceType(sideType, pieceType));
        }
        return ret;
    }
    getRoyalPieceSquares(sideType) {
        let ret = [];
        let royalSidePieces = this.royalPieces[sideType];
        for (let i = 0; i < royalSidePieces.length; i++) {
            let royalSidePiece = royalSidePieces[i];
            ret = ret.concat(this.getSquaresBySideTypePieceType(sideType, royalSidePiece));
        }
        return ret;
    }
    ;
    isFileRankLegal(pos) {
        return !(pos["fileNumber"] < 1 || pos["fileNumber"] > this.getNumOfFiles() || pos["rank"] < 1 || pos["rank"] > this.getNumOfRanks());
    }
    ;
    static fileRankEqual(fileRank1, fileRank2) {
        return fileRank1["fileNumber"] == fileRank2["fileNumber"] && fileRank1["rank"] == fileRank2["rank"];
    }
    ;
    static fileRankNotEqual(fileRank1, fileRank2) {
        return !AbstractEngine.fileRankEqual(fileRank1, fileRank2);
    }
    ;
    notLandOnPiece(destFileRank) {
        return this.getPieceForFileRank(destFileRank) === null;
    }
    ;
    landOnPiece(destFileRank) {
        return !this.notLandOnPiece(destFileRank);
    }
    ;
    landOnSideType(sideType, destFileRank) {
        let piece = this.getPieceForFileRank(destFileRank);
        let ret;
        if (piece !== null) {
            ret = piece.getSideType() === sideType;
        }
        else {
            ret = false;
        }
        return ret;
    }
    ;
    notLandOnSideType(sideType, destFileRank) {
        return !this.landOnSideType(sideType, destFileRank);
    }
    ;
    orFunctionHelper(pruneFunctions1, pruneFunctions2, destFileRank) {
        return this.pruneFileRankHelper(destFileRank, pruneFunctions1) || this.pruneFileRankHelper(destFileRank, pruneFunctions2);
    }
    ;
    andFunctionHelper(pruneFunctions1, pruneFunctions2, destFileRank) {
        return this.pruneFileRankHelper(destFileRank, pruneFunctions1) && this.pruneFileRankHelper(destFileRank, pruneFunctions2);
    }
    ;
    pruneFileRankHelper(destFileRank, pruneFunctions) {
        for (let i = 0; i < pruneFunctions.length; i++) {
            let pruneFunction = pruneFunctions[i];
            if (!pruneFunction(destFileRank)) {
                return false;
            }
        }
        return true;
    }
    ;
    pruneFileRanksHelper(destFileRanks, pruneFunctions) {
        let newDestFileRanks = [];
        for (let i = 0; i < destFileRanks.length; i++) {
            let destFileRank = destFileRanks[i];
            if (this.pruneFileRankHelper(destFileRank, pruneFunctions)) {
                newDestFileRanks.push(destFileRank);
            }
        }
        return newDestFileRanks;
    }
    ;
    getPieceForFileRank(pos) {
        let ret = null;
        if (this.isFileRankLegal(pos)) {
            ret = this.fileRankPieces[pos["fileNumber"]][pos["rank"]];
        }
        else {
            ret = null;
        }
        return ret;
    }
    ;
    setPieceForFileRank(pos, piece) {
        let oldPiece = this.fileRankPieces[pos["fileNumber"]][pos["rank"]];
        if (oldPiece !== null) {
            let sideType = oldPiece.getSideType();
            let pieceType = oldPiece.getPieceType();
            let squareArray = this.pieceToSquareMap[sideType][pieceType];
            let squareArrayIndex = null;
            for (let i = 0; i < squareArray.length; i++) {
                let square = squareArray[i];
                if (square["fileNumber"] === pos["fileNumber"] && square["rank"] === pos["rank"]) {
                    squareArrayIndex = i;
                }
            }
            if (squareArrayIndex !== null) {
                squareArray.splice(squareArrayIndex, 1);
            }
        }
        if (piece !== null) {
            let sideType = piece.getSideType();
            let pieceType = piece.getPieceType();
            this.pieceToSquareMap[sideType][pieceType].push(pos);
        }
        this.fileRankPieces[pos["fileNumber"]][pos["rank"]] = piece;
    }
    ;
    getMoveClassForOriginDest(originFileRank, destFileRank) {
        let moveClass = new MoveClass_1.MoveClass(originFileRank, destFileRank);
        moveClass.pushChange(originFileRank, this.getPieceForFileRank(originFileRank), null);
        moveClass.pushChange(destFileRank, this.getPieceForFileRank(destFileRank), this.getPieceForFileRank(originFileRank));
        return moveClass;
    }
    ;
    getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses) {
        for (let i = 0; i < destFileRanks.length; i++) {
            let destFileRank = destFileRanks[i];
            let moveClass = this.getMoveClassForOriginDest(originFileRank, destFileRank);
            moveClasses.push(moveClass);
        }
    }
    ;
    //Helper functions to deal with the different fairies
    fileRankSubMoveVector(oldFileRank, moveVector) {
        let newFileRank = new FileRank_1.FileRank(oldFileRank["fileNumber"] - moveVector["x"], oldFileRank["rank"] - moveVector["y"]);
        return newFileRank;
    }
    ;
    fileRankAddMoveVector(oldFileRank, moveVector) {
        let newFileRank = new FileRank_1.FileRank(oldFileRank["fileNumber"] + moveVector["x"], oldFileRank["rank"] + moveVector["y"]);
        return newFileRank;
    }
    ;
    getDestFileRankFromOriginFileRankMoveVector(oldFileRank, moveVectors) {
        let newFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            newFileRanks.push(this.fileRankAddMoveVector(oldFileRank, moveVector));
        }
        return newFileRanks;
    }
    ;
    //The function that deal with normal fairy moves
    getNormalMovesForFairy(originFileRank, destFileRank, fairy, moveClasses) {
        let fairyType = fairy.getFairyType();
        if (fairyType === FairyType_1.FairyType.RIDER) {
            this.getNormalMovesForFairyRider(originFileRank, destFileRank, fairy, moveClasses);
        }
        else if (fairyType === FairyType_1.FairyType.LEAPER) {
            this.getNormalMovesForFairyLeaper(originFileRank, destFileRank, fairy, moveClasses);
        }
        else if (fairyType === FairyType_1.FairyType.STUPID) {
            this.getNormalMovesForFairyStupid(originFileRank, destFileRank, fairy, moveClasses);
        }
    }
    ;
    getNormalMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        let normalMovePruneFunctions = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        normalMovePruneFunctions.push(this.notLandOnPiece.bind(this));
        let getFromMoveVector = (moveVector) => {
            if (destFileRank !== null) {
                if (!this.isRay(originFileRank, destFileRank, moveVector)) {
                    return;
                }
            }
            let normalMoveFileRank = this.fileRankAddMoveVector(originFileRank, moveVector);
            while (this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)) {
                if (destFileRank === null) {
                    destFileRanks.push(normalMoveFileRank);
                }
                else {
                    if (AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)) {
                        destFileRanks.push(normalMoveFileRank);
                    }
                }
                normalMoveFileRank = this.fileRankAddMoveVector(normalMoveFileRank, moveVector);
            }
        };
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            getFromMoveVector(moveVector);
        }
        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    getNormalMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);
        let pruneFunctions = [];
        if (destFileRank !== null) {
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }
        pruneFunctions.push(this.isFileRankLegal.bind(this));
        pruneFunctions.push(this.notLandOnPiece.bind(this));
        destFileRanks = this.pruneFileRanksHelper(destFileRanks, pruneFunctions);
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    getNormalMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let moveVectors = fairyStupid.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            let _destFileRank = this.fileRankAddMoveVector(originFileRank, moveVector["vec"]);
            let pruneFunctions = [];
            if (destFileRank !== null) {
                pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
            }
            pruneFunctions.push(this.isFileRankLegal.bind(this));
            for (let j = 0; j < moveVector["emptyVec"].length; j++) {
                let empPos = moveVector["emptyVec"][j];
                let pos = this.fileRankAddMoveVector(originFileRank, empPos);
                if (this.getPieceForFileRank(pos) !== null) {
                    pruneFunctions.push(function () { return false; });
                }
                pruneFunctions.push(this.notLandOnPiece.bind(this));
                if (this.pruneFileRankHelper(_destFileRank, pruneFunctions)) {
                    destFileRanks.push(_destFileRank);
                }
            }
        }
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    //The functions that deal with capture fairy moves
    getCaptureMovesForFairy(originFileRank, destFileRank, fairy, moveClasses) {
        let fairyType = fairy.getFairyType();
        if (fairyType === FairyType_1.FairyType.RIDER) {
            this.getCaptureMovesForFairyRider(originFileRank, destFileRank, fairy, moveClasses);
        }
        else if (fairyType === FairyType_1.FairyType.LEAPER) {
            this.getCaptureMovesForFairyLeaper(originFileRank, destFileRank, fairy, moveClasses);
        }
        else if (fairyType === FairyType_1.FairyType.STUPID) {
            this.getCaptureMovesForFairyStupid(originFileRank, destFileRank, fairy, moveClasses);
        }
    }
    ;
    getCaptureMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        let normalMovePruneFunctions = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        normalMovePruneFunctions.push(this.notLandOnPiece.bind(this));
        let captureMovePruneFunctions = [];
        captureMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        captureMovePruneFunctions.push(this.landOnPiece.bind(this));
        captureMovePruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));
        let getFromMoveVector = (moveVector) => {
            if (destFileRank !== null) {
                if (!this.isRay(originFileRank, destFileRank, moveVector)) {
                    return;
                }
            }
            let normalMoveFileRank = this.fileRankAddMoveVector(originFileRank, moveVector);
            while (this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)) {
                normalMoveFileRank = this.fileRankAddMoveVector(normalMoveFileRank, moveVector);
            }
            let captureMoveFileRank = normalMoveFileRank;
            if (destFileRank !== null) {
                if (AbstractEngine.fileRankNotEqual(captureMoveFileRank, destFileRank)) {
                    return;
                }
            }
            if (this.pruneFileRankHelper(captureMoveFileRank, captureMovePruneFunctions)) {
                destFileRanks.push((captureMoveFileRank));
            }
        };
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            getFromMoveVector(moveVector);
        }
        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    getCaptureMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);
        let originPiece = this.getPieceForFileRank(originFileRank);
        let pruneFunctions = [];
        if (destFileRank !== null) {
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }
        pruneFunctions.push(this.isFileRankLegal.bind(this));
        pruneFunctions.push(this.landOnPiece.bind(this));
        pruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));
        destFileRanks = this.pruneFileRanksHelper(destFileRanks, pruneFunctions);
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    getCaptureMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let moveVectors = fairyStupid.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            let _destFileRank = this.fileRankAddMoveVector(originFileRank, moveVector["vec"]);
            let pruneFunctions = [];
            if (destFileRank !== null) {
                pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
            }
            pruneFunctions.push(this.isFileRankLegal);
            for (let j = 0; j < moveVector["emptyVec"].length; j++) {
                let empPos = moveVector["emptyVec"][j];
                let pos = this.fileRankAddMoveVector(originFileRank, empPos);
                if (this.getPieceForFileRank(pos) !== null) {
                    pruneFunctions.push(function () { return false; });
                }
                pruneFunctions.push(this.landOnPiece.bind(this));
                pruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));
                if (this.pruneFileRankHelper(_destFileRank, pruneFunctions)) {
                    destFileRanks.push(_destFileRank);
                }
            }
        }
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    getCaptureNormalMovesForFairy(originFileRank, destFileRank, fairyCapture, fairyNormal, moveClasses) {
        if (fairyNormal !== fairyCapture) {
            this.getNormalMovesForFairy(originFileRank, destFileRank, fairyNormal, moveClasses);
            this.getCaptureMovesForFairy(originFileRank, destFileRank, fairyCapture, moveClasses);
        }
        else {
            let fairyType = fairyNormal.getFairyType();
            if (fairyType === FairyType_1.FairyType.RIDER) {
                this.getCaptureNormalMovesForFairyRider(originFileRank, destFileRank, fairyNormal, moveClasses);
            }
            else if (fairyType === FairyType_1.FairyType.LEAPER) {
                this.getCaptureNormalMovesForFairyLeaper(originFileRank, destFileRank, fairyNormal, moveClasses);
            }
            else if (fairyType === FairyType_1.FairyType.STUPID) {
                this.getCaptureNormalMovesForFairyStupid(originFileRank, destFileRank, fairyNormal, moveClasses);
            }
        }
    }
    ;
    getCaptureNormalMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        let normalMovePruneFunctions = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        normalMovePruneFunctions.push(this.notLandOnPiece.bind(this));
        let captureMovePruneFunctions = [];
        captureMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        captureMovePruneFunctions.push(this.landOnPiece.bind(this));
        captureMovePruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));
        let getFromMoveVector = (moveVector) => {
            if (destFileRank !== null) {
                if (!this.isRay(originFileRank, destFileRank, moveVector)) {
                    return;
                }
            }
            let normalMoveFileRank = this.fileRankAddMoveVector(originFileRank, moveVector);
            while (this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)) {
                if (destFileRank === null) {
                    destFileRanks.push(normalMoveFileRank);
                }
                else {
                    if (AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)) {
                        destFileRanks.push(normalMoveFileRank);
                    }
                }
                normalMoveFileRank = this.fileRankAddMoveVector(normalMoveFileRank, moveVector);
            }
            let captureMoveFileRank = normalMoveFileRank;
            if (destFileRank !== null) {
                if (AbstractEngine.fileRankNotEqual(captureMoveFileRank, destFileRank)) {
                    return;
                }
            }
            if (this.pruneFileRankHelper(captureMoveFileRank, captureMovePruneFunctions)) {
                destFileRanks.push((captureMoveFileRank));
            }
        };
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            getFromMoveVector(moveVector);
        }
        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    getCaptureNormalMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);
        let originPiece = this.getPieceForFileRank(originFileRank);
        let pruneFunctions = [];
        if (destFileRank !== null) {
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }
        pruneFunctions.push(this.isFileRankLegal.bind(this));
        let pruneFunctionsNormal = [];
        pruneFunctionsNormal.push(this.notLandOnPiece.bind(this));
        let pruneFunctionsCapture = [];
        pruneFunctionsCapture.push(this.landOnPiece.bind(this));
        pruneFunctionsCapture.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));
        pruneFunctions.push(this.orFunctionHelper.bind(this, pruneFunctionsNormal, pruneFunctionsCapture));
        destFileRanks = this.pruneFileRanksHelper(destFileRanks, pruneFunctions);
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    getCaptureNormalMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let moveVectors = fairyStupid.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            let _destFileRank = this.fileRankAddMoveVector(originFileRank, moveVector["vec"]);
            let pruneFunctions = [];
            if (destFileRank !== null) {
                pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
            }
            pruneFunctions.push(this.isFileRankLegal.bind(this));
            for (let j = 0; j < moveVector["emptyVec"].length; j++) {
                let empPos = moveVector["emptyVec"][j];
                let pos = this.fileRankAddMoveVector(originFileRank, empPos);
                if (this.getPieceForFileRank(pos) !== null) {
                    pruneFunctions.push(function () { return false; });
                }
                let pruneFunctionsNormal = [];
                pruneFunctionsNormal.push(this.notLandOnPiece.bind(this));
                let pruneFunctionsCapture = [];
                pruneFunctionsCapture.push(this.landOnPiece.bind(this));
                pruneFunctionsCapture.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));
                pruneFunctions.push(this.orFunctionHelper.bind(this, pruneFunctionsNormal, pruneFunctionsCapture));
                if (this.pruneFileRankHelper(_destFileRank, pruneFunctions)) {
                    destFileRanks.push(_destFileRank);
                }
            }
        }
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    ;
    //Functions that have to do with calculating vector moves
    getVectorMovesForFairy(originFileRank, destFileRank, fairy, moveClasses) {
        let fairyType = fairy.getFairyType();
        if (fairyType == FairyType_1.FairyType.RIDER) {
            this.getVectorMovesForFairyRider(originFileRank, destFileRank, fairy, moveClasses);
        }
        else if (fairyType == FairyType_1.FairyType.LEAPER) {
            this.getVectorMovesForFairyLeaper(originFileRank, destFileRank, fairy, moveClasses);
        }
        else if (fairyType == FairyType_1.FairyType.STUPID) {
            this.getVectorMovesForFairyStupid(originFileRank, destFileRank, fairy, moveClasses);
        }
    }
    getVectorMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        let normalMovePruneFunctions = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        let getFromMoveVector = (moveVector) => {
            if (destFileRank != null) {
                if (!this.isRay(originFileRank, destFileRank, moveVector)) {
                    return;
                }
            }
            let normalMoveFileRank = this.fileRankAddMoveVector(originFileRank, moveVector);
            while (this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)) {
                if (destFileRank == null) {
                    destFileRanks.push(normalMoveFileRank);
                }
                else {
                    if (AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)) {
                        destFileRanks.push(normalMoveFileRank);
                    }
                }
                normalMoveFileRank = this.fileRankAddMoveVector(normalMoveFileRank, moveVector);
            }
        };
        for (let i = 0; i < moveVectors.length; i++) {
            getFromMoveVector(moveVectors[i]);
        }
        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    getVectorMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);
        let originPiece = this.getPieceForFileRank(originFileRank);
        let pruneFunctions = [];
        if (destFileRank != null) {
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }
        pruneFunctions.push(this.isFileRankLegal.bind(this));
        destFileRanks = this.pruneFileRanksHelper(destFileRanks, pruneFunctions);
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    getVectorMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let moveVectors = fairyStupid.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            let _destFileRank = this.fileRankAddMoveVector(originFileRank, moveVector.vec);
            let pruneFunctions = [];
            if (destFileRank != null) {
                pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
            }
            pruneFunctions.push(this.isFileRankLegal.bind(this));
            if (this.pruneFileRankHelper(_destFileRank, pruneFunctions)) {
                destFileRanks.push(_destFileRank);
            }
        }
        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    getFileRankList(pos1, pos2, leftInclusive, rightInclusive) {
        let diffVec = { x: pos2["fileNumber"] - pos1["fileNumber"], y: pos2["rank"] - pos1["rank"] };
        if (diffVec["x"] !== diffVec["y"]) {
            if (diffVec["x"] !== 0 && diffVec["y"] !== 0) {
                return [];
            }
        }
        function getGradVec(diffVec) {
            let gradVec = { x: 0, y: 0 };
            if (diffVec["x"] === 0) {
                gradVec["x"] = 0;
            }
            else {
                gradVec["x"] = diffVec["x"] / Math.abs(diffVec["x"]);
            }
            if (diffVec["y"] === 0) {
                gradVec["y"] = 0;
            }
            else {
                gradVec["y"] = diffVec["y"] / Math.abs(diffVec["y"]);
            }
            return gradVec;
        }
        let gradVec = getGradVec(diffVec);
        let startPos = { fileNumber: pos1["fileNumber"], rank: pos1["rank"] };
        if (!leftInclusive) {
            startPos = this.fileRankAddMoveVector(startPos, gradVec);
        }
        let endPos = { fileNumber: pos2["fileNumber"], rank: pos2["rank"] };
        if (!rightInclusive) {
            endPos = this.fileRankSubMoveVector(endPos, gradVec);
        }
        {
            let tmpDiffVec = { x: endPos["fileNumber"] - startPos["fileNumber"], y: endPos["rank"] - startPos["rank"] };
            let tmpGradVec = getGradVec(tmpDiffVec);
            if (tmpGradVec["x"] !== gradVec["x"] || tmpGradVec["y"] !== gradVec["y"]) {
                return [];
            }
        }
        let ret = [];
        while (AbstractEngine.fileRankNotEqual(startPos, endPos)) {
            ret.push(startPos);
            startPos = this.fileRankAddMoveVector(startPos, gradVec);
        }
        ret.push(startPos);
        return ret;
    }
    ;
    getPiecesFromFileRankToFileRank(pos1, pos2, leftInclusive, rightInclusive) {
        let fileRankList = this.getFileRankList(pos1, pos2, leftInclusive, rightInclusive);
        let ret = [];
        for (let i = 0; i < fileRankList.length; i++) {
            let fileRank = fileRankList[i];
            let piece = this.getPieceForFileRank(fileRank);
            if (piece !== null) {
                ret.push(piece);
            }
        }
        return ret;
    }
    ;
    doMove(moveClass) {
        this.moveClasses.push(moveClass);
        for (let i = 0; i < moveClass.getLength(); i++) {
            let change = moveClass.get(i);
            let fileRank = change["fileRank"];
            let originPiece = change["originPiece"];
            let destPiece = change["destPiece"];
            if (originPiece != null) {
                originPiece.incrNumOfTimesRemoved();
            }
            if (destPiece != null) {
                destPiece.incrNumOfTimesAdded();
            }
            this.setPieceForFileRank(fileRank, destPiece);
        }
    }
    ;
    undoMove() {
        let moveClass = this.moveClasses[this.moveClasses.length - 1];
        this.moveClasses.pop();
        for (let i = moveClass.getLength() - 1; i >= 0; i--) {
            let change = moveClass.get(i);
            let fileRank = change["fileRank"];
            let originPiece = change["originPiece"];
            let destPiece = change["destPiece"];
            if (originPiece != null) {
                originPiece.decrNumOfTimesRemoved();
            }
            if (destPiece != null) {
                destPiece.decrNumOfTimesAdded();
            }
            this.setPieceForFileRank(fileRank, originPiece);
        }
    }
    ;
    static flipMoveClass(moveClass) {
        let ret = new MoveClass_1.MoveClass(moveClass.destFileRank, moveClass.originFileRank);
        for (let i = moveClass.getLength() - 1; i >= 0; i--) {
            let change = moveClass.get(i);
            let fileRank = change["fileRank"];
            let originPiece = change["originPiece"];
            let destPiece = change["destPiece"];
            ret.pushChange(fileRank, destPiece, originPiece);
        }
        return ret;
    }
    static concatMoveClasses(moveClasses) {
        let originFileRank = moveClasses[0].originFileRank;
        let destFileRank = moveClasses[moveClasses.length - 1].destFileRank;
        let ret = new MoveClass_1.MoveClass(originFileRank, destFileRank);
        for (let i = 0; i < moveClasses.length; i++) {
            let moveClass = moveClasses[i];
            for (let i = 0; i < moveClass.getLength(); i++) {
                let change = moveClass.get(i);
                let fileRank = change["fileRank"];
                let originPiece = change["originPiece"];
                let destPiece = change["destPiece"];
                ret.pushChange(fileRank, destPiece, originPiece);
            }
        }
        return ret;
    }
    getNumOfMoveClasses() {
        return this.moveClasses.length;
    }
    getHashForFileRank(fileRank) {
        let hash = (fileRank["rank"] - 1) * this.getNumOfFiles() + (fileRank["fileNumber"] - 1);
        return hash;
    }
}
exports.AbstractEngine = AbstractEngine;
//# sourceMappingURL=AbstractEngine.js.map