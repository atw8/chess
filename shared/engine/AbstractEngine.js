"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MoveClass_1 = require("./MoveClass");
const FileRank_1 = require("./FileRank");
const FairyType_1 = require("./Fairy/FairyType");
class AbstractEngine {
    constructor(numOfFiles, numOfRanks, pieceSet, sideSet) {
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
        return !(pos.x < 1 || pos.x > this.getNumOfFiles() || pos.y < 1 || pos.y > this.getNumOfRanks());
    }
    ;
    static fileRankEqual(fileRank1, fileRank2) {
        return fileRank1.x == fileRank2.x && fileRank1.y == fileRank2.y;
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
            ret = this.fileRankPieces[pos.x][pos.y];
        }
        else {
            ret = null;
        }
        return ret;
    }
    ;
    setPieceForFileRank(pos, piece) {
        let oldPiece = this.fileRankPieces[pos.x][pos.y];
        if (oldPiece !== null) {
            let sideType = oldPiece.getSideType();
            let pieceType = oldPiece.getPieceType();
            let squareArray = this.pieceToSquareMap[sideType][pieceType];
            let squareArrayIndex = null;
            for (let i = 0; i < squareArray.length; i++) {
                let square = squareArray[i];
                if (square.x === pos.x && square.y === pos.y) {
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
        this.fileRankPieces[pos.x][pos.y] = piece;
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
    getDestFileRankFromOriginFileRankMoveVector(oldFileRank, moveVectors) {
        let newFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            newFileRanks.push(FileRank_1.FileRank.addFileRank(oldFileRank, moveVector));
        }
        return newFileRanks;
    }
    ;
    isRay(origin, dest, vector) {
        let originX = origin.x;
        let originY = origin.y;
        let destX = dest.x;
        let destY = dest.y;
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
    }
    ;
    pruneFileRankNormal(destFileRank, fileRank) {
        if (destFileRank != null) {
            if (AbstractEngine.fileRankNotEqual(destFileRank, fileRank)) {
                return false;
            }
        }
        if (!this.isFileRankLegal(fileRank)) {
            return false;
        }
        return this.getPieceForFileRank(fileRank) == null;
    }
    pruneFileRankCapture(mySideType, destFileRank, fileRank) {
        if (destFileRank != null) {
            if (AbstractEngine.fileRankNotEqual(destFileRank, fileRank)) {
                return false;
            }
        }
        let piece = this.getPieceForFileRank(fileRank);
        if (piece == null) {
            return false;
        }
        return piece.getSideType() != mySideType;
    }
    pruneFileRankCaptureOrNormal(mySideType, destFileRank, fileRank) {
        if (destFileRank != null) {
            if (AbstractEngine.fileRankNotEqual(destFileRank, fileRank)) {
                return false;
            }
        }
        let piece = this.getPieceForFileRank(fileRank);
        if (piece == null) {
            return true;
        }
        return piece.getSideType() != mySideType;
    }
    pruneFileRankVector(destFileRank, fileRank) {
        if (destFileRank != null) {
            if (AbstractEngine.fileRankNotEqual(destFileRank, fileRank)) {
                return false;
            }
        }
        return this.isFileRankLegal(fileRank);
    }
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
    //The functions that deal with capture/normal fairy moves
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
    getMovesForFairyRiderHelper(originFileRank, destFileRank, fairyRider, moveClasses, isNormal, isCapture) {
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            if (destFileRank != null) {
                if (!this.isRay(originFileRank, destFileRank, moveVector)) {
                    continue;
                }
            }
            let normalMoveFileRank = FileRank_1.FileRank.addFileRank(originFileRank, moveVector);
            while (this.pruneFileRankNormal(null, normalMoveFileRank)) {
                if (isNormal) {
                    if (destFileRank == null) {
                        destFileRanks.push(normalMoveFileRank);
                    }
                    else if (AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)) {
                        destFileRanks.push(normalMoveFileRank);
                    }
                }
                normalMoveFileRank.addFileRank(moveVector);
            }
            let captureMoveFileRank = normalMoveFileRank;
            if (isCapture && this.pruneFileRankCapture(originPiece.getSideType(), destFileRank, captureMoveFileRank)) {
                destFileRanks.push(captureMoveFileRank);
            }
        }
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    getNormalMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        this.getMovesForFairyRiderHelper(originFileRank, destFileRank, fairyRider, moveClasses, true, false);
    }
    getCaptureMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        this.getMovesForFairyRiderHelper(originFileRank, destFileRank, fairyRider, moveClasses, false, true);
    }
    getCaptureNormalMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        this.getMovesForFairyRiderHelper(originFileRank, destFileRank, fairyRider, moveClasses, true, true);
    }
    getVectorMovesForFairyRider(originFileRank, destFileRank, fairyRider, moveClasses) {
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);
        let destFileRanks = [];
        for (let i = 1; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            if (destFileRank != null) {
                if (!this.isRay(originFileRank, destFileRank, moveVector)) {
                    continue;
                }
            }
            let normalMoveFileRank = FileRank_1.FileRank.addFileRank(originFileRank, moveVector);
            while (this.pruneFileRankVector(null, normalMoveFileRank)) {
                if (destFileRank == null) {
                    destFileRanks.push(normalMoveFileRank);
                }
                else if (AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)) {
                    destFileRanks.push(normalMoveFileRank);
                }
                normalMoveFileRank.addFileRank(moveVector);
            }
        }
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    getMovesForFairyLeaperHelper(originFileRank, destFileRank, fairyLeaper, moveClasses, func) {
        if (destFileRank != null) {
            let diffVec = FileRank_1.FileRank.subFileRank(destFileRank, originFileRank);
            if (Math.abs(diffVec.x) > fairyLeaper.getMaxX() || Math.abs(diffVec.y) > fairyLeaper.getMaxY()) {
                return;
            }
        }
        let destFileRanks = [];
        let moveVectors = fairyLeaper.getVectors();
        for (let i = 0; i < moveVectors.length; i++) {
            let fileRank = FileRank_1.FileRank.addFileRank(originFileRank, moveVectors[i]);
            if (func(fileRank)) {
                destFileRanks.push(fileRank);
            }
        }
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    getNormalMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let func = this.pruneFileRankNormal.bind(this, destFileRank);
        this.getMovesForFairyLeaperHelper(originFileRank, destFileRank, fairyLeaper, moveClasses, func);
    }
    getCaptureMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let originPiece = this.getPieceForFileRank(originFileRank);
        let mySideType = originPiece.getSideType();
        let func = this.pruneFileRankCapture.bind(this, mySideType, destFileRank);
        this.getMovesForFairyLeaperHelper(originFileRank, destFileRank, fairyLeaper, moveClasses, func);
    }
    getCaptureNormalMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let originPiece = this.getPieceForFileRank(originFileRank);
        let mySideType = originPiece.getSideType();
        let func = this.pruneFileRankCaptureOrNormal.bind(this, mySideType, destFileRank);
        this.getMovesForFairyLeaperHelper(originFileRank, destFileRank, fairyLeaper, moveClasses, func);
    }
    getVectorMovesForFairyLeaper(originFileRank, destFileRank, fairyLeaper, moveClasses) {
        let func = this.pruneFileRankVector.bind(this, destFileRank);
        this.getMovesForFairyLeaperHelper(originFileRank, destFileRank, fairyLeaper, moveClasses, func);
    }
    getMovesForFairyStupidHelper(originFileRank, destFileRank, fairyStupid, moveClasses, func) {
        if (destFileRank != null) {
            let diffVec = FileRank_1.FileRank.subFileRank(destFileRank, originFileRank);
            if (Math.abs(diffVec.x) > fairyStupid.getMaxX() || Math.max(diffVec.y) > fairyStupid.getMaxY()) {
                return;
            }
        }
        let moveVectors = fairyStupid.getVectors();
        let destFileRanks = [];
        for (let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            let isEmpty = true;
            for (let j = 0; j <= moveVector.emptyVec.length; i++) {
                let empPos = moveVector.emptyVec[j];
                let pos = FileRank_1.FileRank.addFileRank(originFileRank, moveVector.emptyVec[i]);
                if (this.getPieceForFileRank(pos) != null) {
                    isEmpty = false;
                }
            }
            if (isEmpty) {
                let destFileRank = FileRank_1.FileRank.addFileRank(originFileRank, moveVector["vec"]);
                if (func(destFileRank)) {
                    destFileRanks.push(destFileRank);
                }
            }
        }
        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }
    getNormalMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let func = this.pruneFileRankNormal.bind(this, destFileRank);
        this.getMovesForFairyStupidHelper(originFileRank, destFileRank, fairyStupid, moveClasses, func);
    }
    getCaptureMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let originPiece = this.getPieceForFileRank(originFileRank);
        let mySideType = originPiece.getSideType();
        let func = this.pruneFileRankCapture.bind(this, mySideType, destFileRank);
        this.getMovesForFairyStupidHelper(originFileRank, destFileRank, fairyStupid, moveClasses, func);
    }
    getCaptureNormalMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let originPiece = this.getPieceForFileRank(originFileRank);
        let mySideType = originPiece.getSideType();
        let func = this.pruneFileRankCaptureOrNormal.bind(this, mySideType, destFileRank);
        this.getMovesForFairyStupidHelper(originFileRank, destFileRank, fairyStupid, moveClasses, func);
    }
    getVectorMovesForFairyStupid(originFileRank, destFileRank, fairyStupid, moveClasses) {
        let func = this.pruneFileRankVector.bind(this, destFileRank);
        this.getMovesForFairyStupidHelper(originFileRank, destFileRank, fairyStupid, moveClasses, func);
    }
    getFileRankList(pos1, pos2, leftInclusive, rightInclusive) {
        //let diffVec = { x : pos2.x - pos1.x, y : pos2.y - pos1.y};
        let diffVec = FileRank_1.FileRank.subFileRank(pos2, pos1);
        if (diffVec["x"] !== diffVec["y"]) {
            if (diffVec["x"] !== 0 && diffVec["y"] !== 0) {
                return [];
            }
        }
        function getGradVec(diffVec) {
            let gradVec = new FileRank_1.FileRank(0, 0);
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
        let startPos = pos1.clone();
        if (!leftInclusive) {
            startPos.addFileRank(gradVec);
        }
        let endPos = pos2.clone();
        if (!rightInclusive) {
            endPos.subFileRank(gradVec);
        }
        {
            let tmpDiffVec = FileRank_1.FileRank.subFileRank(endPos, startPos);
            let tmpGradVec = getGradVec(tmpDiffVec);
            if (tmpGradVec["x"] !== gradVec["x"] || tmpGradVec["y"] !== gradVec["y"]) {
                return [];
            }
        }
        let ret = [];
        while (AbstractEngine.fileRankNotEqual(startPos, endPos)) {
            ret.push(startPos);
            startPos.addFileRank(gradVec);
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
        let hash = (fileRank.y - 1) * this.getNumOfFiles() + (fileRank.x - 1);
        return hash;
    }
}
exports.AbstractEngine = AbstractEngine;
//# sourceMappingURL=AbstractEngine.js.map