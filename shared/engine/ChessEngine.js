"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SideType_1 = require("./SideType");
const PieceType_1 = require("./PieceType");
const PieceModel_1 = require("./PieceModel");
const AbstractEngine_1 = require("./AbstractEngine");
const FileRank_1 = require("./FileRank");
const ChessGameStateEnum_1 = require("./ChessGameStateEnum");
const ChessGameResultEnum_1 = require("./ChessGameResultEnum");
const MoveClass_1 = require("./MoveClass");
const FairyStupid_1 = require("./Fairy/FairyStupid");
const FairyLeaper_1 = require("./Fairy/FairyLeaper");
const FairyRider_1 = require("./Fairy/FairyRider");
const CastleType_1 = require("./CastleType");
class ChessEngine extends AbstractEngine_1.AbstractEngine {
    constructor(initParam) {
        super(ChessEngine.getNumOfFiles(), ChessEngine.getNumOfRanks(), [PieceType_1.PieceType.PAWN, PieceType_1.PieceType.KNIGHT, PieceType_1.PieceType.BISHOP, PieceType_1.PieceType.ROOK, PieceType_1.PieceType.QUEEN, PieceType_1.PieceType.KING], [SideType_1.SideType.WHITE, SideType_1.SideType.BLACK]);
        this.m_isLooseTime = {};
        this.m_isResign = {};
        this.m_isForfeit = {};
        this.m_askForDraw = {};
        this.captureFairy = {};
        this.normalFairy = {};
        this.pawn2MoveFairy = {};
        this.initGlobal();
        this.init(initParam);
    }
    static getNumOfFiles() {
        return 8;
    }
    static getNumOfRanks() {
        return 8;
    }
    static getHashForFileRank(fileRank) {
        let hash = (fileRank.y - 1) * ChessEngine.getNumOfFiles() + (fileRank.x - 1);
        return hash;
    }
    static getFileRankForHash(hash) {
        let fileNumber = (hash % ChessEngine.getNumOfFiles());
        let rank = (hash - fileNumber) / ChessEngine.getNumOfFiles();
        fileNumber = fileNumber + 1;
        rank = rank + 1;
        return new FileRank_1.FileRank(fileNumber, rank);
    }
    initGlobal() {
        this.captureFairy = {};
        this.captureFairy[SideType_1.SideType.WHITE] = {};
        this.captureFairy[SideType_1.SideType.BLACK] = {};
        this.normalFairy = {};
        this.normalFairy[SideType_1.SideType.WHITE] = {};
        this.normalFairy[SideType_1.SideType.BLACK] = {};
        //IMPLEMENT THE PAWN FAIRY
        {
            let blackPawnNormalFairy = new FairyLeaper_1.FairyLeaper();
            let blackPawnCaptureFairy = new FairyLeaper_1.FairyLeaper();
            let whitePawnNormalFairy = new FairyLeaper_1.FairyLeaper();
            let whitePawnCaptureFairy = new FairyLeaper_1.FairyLeaper();
            blackPawnNormalFairy.addVector(new FileRank_1.FileRank(0, -1));
            whitePawnNormalFairy.addVector(new FileRank_1.FileRank(0, 1));
            blackPawnCaptureFairy.addVector(new FileRank_1.FileRank(-1, -1));
            blackPawnCaptureFairy.addVector(new FileRank_1.FileRank(1, -1));
            whitePawnCaptureFairy.addVector(new FileRank_1.FileRank(-1, 1));
            whitePawnCaptureFairy.addVector(new FileRank_1.FileRank(1, 1));
            this.normalFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.PAWN] = whitePawnNormalFairy;
            this.normalFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.PAWN] = blackPawnNormalFairy;
            this.captureFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.PAWN] = whitePawnCaptureFairy;
            this.captureFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.PAWN] = blackPawnCaptureFairy;
        }
        //IMPLEMENT THE KNIGHT FAIRY
        {
            let knightFairy = new FairyLeaper_1.FairyLeaper();
            knightFairy.addVector(new FileRank_1.FileRank(1, 2));
            knightFairy.addVector(new FileRank_1.FileRank(2, 1));
            knightFairy.addVector(new FileRank_1.FileRank(2, -1));
            knightFairy.addVector(new FileRank_1.FileRank(1, -2));
            knightFairy.addVector(new FileRank_1.FileRank(-1, -2));
            knightFairy.addVector(new FileRank_1.FileRank(-2, -1));
            knightFairy.addVector(new FileRank_1.FileRank(-2, 1));
            knightFairy.addVector(new FileRank_1.FileRank(-1, 2));
            this.captureFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.KNIGHT] = knightFairy;
            this.captureFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.KNIGHT] = knightFairy;
            this.normalFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.KNIGHT] = knightFairy;
            this.normalFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.KNIGHT] = knightFairy;
        }
        //IMPLEMENT THE BISHOP FAIRY
        {
            let bishopFairy = new FairyRider_1.FairyRider();
            bishopFairy.addVector(new FileRank_1.FileRank(1, 1));
            bishopFairy.addVector(new FileRank_1.FileRank(1, -1));
            bishopFairy.addVector(new FileRank_1.FileRank(-1, -1));
            bishopFairy.addVector(new FileRank_1.FileRank(-1, 1));
            this.captureFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.BISHOP] = bishopFairy;
            this.captureFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.BISHOP] = bishopFairy;
            this.normalFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.BISHOP] = bishopFairy;
            this.normalFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.BISHOP] = bishopFairy;
        }
        //IMPLEMENT THE ROOK FAIRY
        {
            let rookFairy = new FairyRider_1.FairyRider();
            rookFairy.addVector(new FileRank_1.FileRank(1, 0));
            rookFairy.addVector(new FileRank_1.FileRank(0, -1));
            rookFairy.addVector(new FileRank_1.FileRank(-1, 0));
            rookFairy.addVector(new FileRank_1.FileRank(0, 1));
            this.captureFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.ROOK] = rookFairy;
            this.captureFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.ROOK] = rookFairy;
            this.normalFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.ROOK] = rookFairy;
            this.normalFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.ROOK] = rookFairy;
        }
        //IMPLEMENT THE QUEEN FAIRY
        {
            let queenFairy = new FairyRider_1.FairyRider();
            queenFairy.addVector(new FileRank_1.FileRank(1, 1));
            queenFairy.addVector(new FileRank_1.FileRank(1, -1));
            queenFairy.addVector(new FileRank_1.FileRank(-1, -1));
            queenFairy.addVector(new FileRank_1.FileRank(-1, 1));
            queenFairy.addVector(new FileRank_1.FileRank(1, 0));
            queenFairy.addVector(new FileRank_1.FileRank(0, -1));
            queenFairy.addVector(new FileRank_1.FileRank(-1, 0));
            queenFairy.addVector(new FileRank_1.FileRank(0, 1));
            this.captureFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.QUEEN] = queenFairy;
            this.captureFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.QUEEN] = queenFairy;
            this.normalFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.QUEEN] = queenFairy;
            this.normalFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.QUEEN] = queenFairy;
        }
        //IMPLEMENT THE KING FAIRY
        {
            let kingFairy = new FairyLeaper_1.FairyLeaper();
            kingFairy.addVector(new FileRank_1.FileRank(1, 1));
            kingFairy.addVector(new FileRank_1.FileRank(1, -1));
            kingFairy.addVector(new FileRank_1.FileRank(-1, -1));
            kingFairy.addVector(new FileRank_1.FileRank(-1, 1));
            kingFairy.addVector(new FileRank_1.FileRank(1, 0));
            kingFairy.addVector(new FileRank_1.FileRank(0, -1));
            kingFairy.addVector(new FileRank_1.FileRank(-1, 0));
            kingFairy.addVector(new FileRank_1.FileRank(0, 1));
            this.captureFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.KING] = kingFairy;
            this.captureFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.KING] = kingFairy;
            this.normalFairy[SideType_1.SideType.WHITE][PieceType_1.PieceType.KING] = kingFairy;
            this.normalFairy[SideType_1.SideType.BLACK][PieceType_1.PieceType.KING] = kingFairy;
        }
        //IMPLEMENT THE PAWN MOVE BY TWO FAIRY
        {
            this.pawn2MoveFairy = {};
            let whiteFairyStupid = new FairyStupid_1.FairyStupid();
            whiteFairyStupid.addVector({ "vec": new FileRank_1.FileRank(0, 2), "emptyVec": [new FileRank_1.FileRank(0, 1)] });
            this.pawn2MoveFairy[SideType_1.SideType.WHITE] = whiteFairyStupid;
            let blackFairyStupid = new FairyStupid_1.FairyStupid();
            blackFairyStupid.addVector({ "vec": new FileRank_1.FileRank(0, -2), "emptyVec": [new FileRank_1.FileRank(0, -1)] });
            this.pawn2MoveFairy[SideType_1.SideType.BLACK] = blackFairyStupid;
        }
    }
    ;
    setMoveTurn(moveTurn) {
        this.moveTurn = moveTurn;
    }
    ;
    getMoveTurn() {
        return this.moveTurn;
    }
    ;
    static getOppositeSideType(sideType) {
        let ret;
        switch (sideType) {
            case SideType_1.SideType.WHITE:
                ret = SideType_1.SideType.BLACK;
                break;
            case SideType_1.SideType.BLACK:
                ret = SideType_1.SideType.WHITE;
                break;
        }
        return ret;
    }
    ;
    outitModel() {
        super.outitModel();
        this.halfMoveClockVector = [];
        this.halfMoveClockVector.push(0);
        this.moveNumber = 1;
        this.fenStrCastling = {};
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            this.fenStrCastling[sideType] = {};
            for (let castleType = CastleType_1.CastleType.FIRST_CASTLE; castleType <= CastleType_1.CastleType.LAST_CASTLE; castleType++) {
                this.fenStrCastling[sideType][castleType] = false;
            }
        }
        this.fenStrKingOriginFileNumber = {};
        this.fenStrRookOriginFileNumber = {};
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            this.fenStrKingOriginFileNumber[sideType] = null;
            this.fenStrRookOriginFileNumber[sideType] = {};
            for (let castleType = CastleType_1.CastleType.FIRST_CASTLE; castleType <= CastleType_1.CastleType.LAST_CASTLE; castleType++) {
                this.fenStrRookOriginFileNumber[sideType][castleType] = null;
            }
        }
        this.enPassantSquare = null;
        this.setMoveTurn(SideType_1.SideType.WHITE);
        this.uciMoves = [];
        this.sanMoves = [];
        this.fenStrings = [];
    }
    static getColorTypeForFileRank(fileRank) {
        let fileNumber = fileRank.x;
        let rank = fileRank.y;
        let colorType;
        if ((fileNumber + rank) % 2 == 0) {
            colorType = SideType_1.SideType.BLACK;
        }
        else {
            colorType = SideType_1.SideType.WHITE;
        }
        return colorType;
    }
    init(initParam) {
        if (initParam == undefined) {
            initParam = {};
        }
        if (initParam["isChess960"] == undefined) {
            initParam["isChess960"] = false;
        }
        if (initParam["isChess960"]) {
            if (initParam["beginFenStr"] == undefined) {
                let beginArray = {};
                let getRandFileNumber = () => {
                    let ret;
                    do {
                        ret = Math.floor(Math.random() * ChessEngine.getNumOfFiles()) + 1;
                    } while (beginArray[ret] != undefined);
                    return ret;
                };
                let bishop1Square = getRandFileNumber();
                let bishop1ColorType = ChessEngine.getColorTypeForFileRank(new FileRank_1.FileRank(bishop1Square, 1));
                beginArray[bishop1Square] = PieceType_1.PieceType.BISHOP;
                let bishop2Square;
                let bishop2ColorType;
                do {
                    bishop2Square = getRandFileNumber();
                    bishop2ColorType = ChessEngine.getColorTypeForFileRank(new FileRank_1.FileRank(bishop2Square, 1));
                } while (bishop1ColorType == bishop2ColorType);
                beginArray[bishop2Square] = PieceType_1.PieceType.BISHOP;
                beginArray[getRandFileNumber()] = PieceType_1.PieceType.KNIGHT;
                beginArray[getRandFileNumber()] = PieceType_1.PieceType.KNIGHT;
                beginArray[getRandFileNumber()] = PieceType_1.PieceType.QUEEN;
                let rook1Square = -1;
                for (let i = 1; i <= ChessEngine.getNumOfFiles() && rook1Square == -1; i++) {
                    if (beginArray[i] == undefined) {
                        rook1Square = i;
                    }
                }
                beginArray[rook1Square] = PieceType_1.PieceType.ROOK;
                let rook2Square = -1;
                for (let i = ChessEngine.getNumOfFiles(); i >= 1 && rook2Square == -1; i--) {
                    if (beginArray[i] == undefined) {
                        rook2Square = i;
                    }
                }
                beginArray[rook2Square] = PieceType_1.PieceType.ROOK;
                beginArray[getRandFileNumber()] = PieceType_1.PieceType.KING;
                let beginFenStr = "";
                for (let i = 1; i <= ChessEngine.getNumOfFiles(); i++) {
                    beginFenStr += ChessEngine.sideTypePieceTypeToFenChar(SideType_1.SideType.BLACK, beginArray[i]);
                }
                beginFenStr += "/pppppppp/8/8/8/8/PPPPPPPP/";
                for (let i = 1; i <= ChessEngine.getNumOfFiles(); i++) {
                    beginFenStr += ChessEngine.sideTypePieceTypeToFenChar(SideType_1.SideType.WHITE, beginArray[i]);
                }
                beginFenStr += " w KQkq - 0 1";
                initParam["beginFenStr"] = beginFenStr;
            }
        }
        else {
            if (initParam["beginFenStr"] == undefined) {
                initParam["beginFenStr"] = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
            }
        }
        this.initParam = initParam;
        this.outitModel();
        //SET THE KINGS TO ROYAL PIECES
        this.setPieceToRoyal(SideType_1.SideType.WHITE, PieceType_1.PieceType.KING);
        this.setPieceToRoyal(SideType_1.SideType.BLACK, PieceType_1.PieceType.KING);
        let splitFenString = this.initParam["beginFenStr"].split(" ");
        //set the board from fenString
        {
            let fileNumber = 1;
            let rank = this.getNumOfRanks();
            for (let i = 0; i < splitFenString[0].length; i++) {
                let c = splitFenString[0][i];
                if (c === "p" || c === "n" || c === "b" || c === "r" || c === "q" || c === "k" || c === "P" || c === "N" || c === "B" || c === "R" || c === "Q" || c === "K") {
                    let piece = ChessEngine.fenCharToSideTypePieceType(c);
                    let fileRank = new FileRank_1.FileRank(fileNumber, rank);
                    this.setPieceForFileRank(fileRank, piece);
                    fileNumber = fileNumber + 1;
                }
                else if (c === "1" || c === "2" || c === "3" || c === "4" || c === "5" || c === "6" || c === "7" || c === "8") {
                    fileNumber = fileNumber + parseInt(c);
                }
                else if (c === "/") {
                    fileNumber = 1;
                    rank = rank - 1;
                }
            }
        }
        //set the moveturn from the fenString
        {
            let c = splitFenString[1];
            if (c === "w") {
                this.setMoveTurn(SideType_1.SideType.WHITE);
            }
            else if (c === "b") {
                this.setMoveTurn(SideType_1.SideType.BLACK);
            }
        }
        //set the castling rights from the fenString
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            let squares = this.getSquaresBySideTypePieceType(sideType, PieceType_1.PieceType.KING);
            if (squares.length == 1) {
                this.fenStrKingOriginFileNumber[sideType] = squares[0].x;
            }
        }
        for (let i = 0; i < splitFenString[2].length; i++) {
            let c = splitFenString[2][i];
            let sType = null;
            let cType = null;
            let pieceSet = [PieceType_1.PieceType.KING, PieceType_1.PieceType.QUEEN];
            for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
                for (let i = 0; i < pieceSet.length; i++) {
                    let pType = pieceSet[i];
                    if (c == ChessEngine.sideTypePieceTypeToFenChar(sideType, pType)) {
                        sType = sideType;
                        if (pType == PieceType_1.PieceType.KING) {
                            cType = CastleType_1.CastleType.KING_SIDE;
                        }
                        else if (pType == PieceType_1.PieceType.QUEEN) {
                            cType = CastleType_1.CastleType.QUEEN_SIDE;
                        }
                    }
                }
            }
            if (sType == null || cType == null) {
                let lowerC = c.toLowerCase();
                let fileNumber = ChessEngine.convertFileToFileNumber(lowerC);
                if (fileNumber == null) {
                    continue;
                }
                let sideType = c.toLowerCase() == c ? SideType_1.SideType.WHITE : SideType_1.SideType.BLACK;
                let fenStrKingOriginFileNumber = this.fenStrKingOriginFileNumber[sideType];
                if (fenStrKingOriginFileNumber == null) {
                    continue;
                }
                let castleType;
                if (fileNumber < fenStrKingOriginFileNumber) {
                    castleType = CastleType_1.CastleType.QUEEN_SIDE;
                }
                else if (fileNumber > fenStrKingOriginFileNumber) {
                    castleType = CastleType_1.CastleType.KING_SIDE;
                }
                else {
                    continue;
                }
                this.fenStrCastling[sideType][castleType] = true;
                this.fenStrRookOriginFileNumber[sideType][castleType] = fileNumber;
            }
            else {
                this.fenStrCastling[sType][cType] = true;
            }
        }
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            for (let castleType = CastleType_1.CastleType.FIRST_CASTLE; castleType <= CastleType_1.CastleType.LAST_CASTLE; castleType++) {
                if (this.fenStrCastling[sideType][castleType]) {
                    if (this.fenStrRookOriginFileNumber[sideType][castleType] == null) {
                        let rookSquares = this.getSquaresBySideTypePieceType(sideType, PieceType_1.PieceType.ROOK);
                        let fileNumber = null;
                        for (let i = 0; i < rookSquares.length; i++) {
                            let rookSquare = rookSquares[i];
                            if (rookSquare.y == this.getRookOriginRank(sideType)) {
                                if (fileNumber == null) {
                                    fileNumber = rookSquares[i].x;
                                }
                                else {
                                    if (castleType == CastleType_1.CastleType.QUEEN_SIDE) {
                                        fileNumber = Math.min(fileNumber, rookSquares[i].x);
                                    }
                                    else if (castleType == CastleType_1.CastleType.KING_SIDE) {
                                        fileNumber = Math.max(fileNumber, rookSquares[i].x);
                                    }
                                }
                            }
                        }
                        this.fenStrRookOriginFileNumber[sideType][castleType] = fileNumber;
                    }
                }
            }
        }
        //Set the en passant fileRank from the fenString
        {
            if (splitFenString[3] === "-") {
                this.fenStrEnPassant = null;
            }
            else {
                let file = splitFenString[3][0];
                let fileNumber = ChessEngine.convertFileToFileNumber(file);
                let rank = parseInt(splitFenString[3][1]);
                this.fenStrEnPassant = new FileRank_1.FileRank(fileNumber, rank);
            }
        }
        //set the half move clock vector from the fenstring
        this.halfMoveClockVector = [];
        this.halfMoveClockVector.push(parseInt(splitFenString[4]));
        //set the full move number from the fenstring
        this.moveNumber = parseInt(splitFenString[5]);
        this.updateEnPassantSquare();
        this.fenStrings.push(this.initParam["beginFenStr"]);
        console.debug(this.getFenStrFromCurrentBoard());
        this.m_isLooseTime = {};
        this.setIsLooseByTime(SideType_1.SideType.WHITE, false);
        this.setIsLooseByTime(SideType_1.SideType.BLACK, false);
        this.m_isResign = {};
        this.setIsResign(SideType_1.SideType.WHITE, false);
        this.setIsResign(SideType_1.SideType.BLACK, false);
        this.m_isForfeit = {};
        this.setIsForfeit(SideType_1.SideType.WHITE, false);
        this.setIsForfeit(SideType_1.SideType.BLACK, false);
        this.m_askForDraw = {};
        this.setIsAskForDraw(SideType_1.SideType.WHITE, false);
        this.setIsAskForDraw(SideType_1.SideType.BLACK, false);
        this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.NORMAL;
        this.updateGameState();
    }
    ;
    static fenCharToSideTypePieceType(char) {
        let sideType = null;
        let pieceType = null;
        switch (char) {
            case "P":
                sideType = SideType_1.SideType.WHITE;
                pieceType = PieceType_1.PieceType.PAWN;
                break;
            case "N":
                sideType = SideType_1.SideType.WHITE;
                pieceType = PieceType_1.PieceType.KNIGHT;
                break;
            case "B":
                sideType = SideType_1.SideType.WHITE;
                pieceType = PieceType_1.PieceType.BISHOP;
                break;
            case "R":
                sideType = SideType_1.SideType.WHITE;
                pieceType = PieceType_1.PieceType.ROOK;
                break;
            case "Q":
                sideType = SideType_1.SideType.WHITE;
                pieceType = PieceType_1.PieceType.QUEEN;
                break;
            case "K":
                sideType = SideType_1.SideType.WHITE;
                pieceType = PieceType_1.PieceType.KING;
                break;
            case "p":
                sideType = SideType_1.SideType.BLACK;
                pieceType = PieceType_1.PieceType.PAWN;
                break;
            case "n":
                sideType = SideType_1.SideType.BLACK;
                pieceType = PieceType_1.PieceType.KNIGHT;
                break;
            case "b":
                sideType = SideType_1.SideType.BLACK;
                pieceType = PieceType_1.PieceType.BISHOP;
                break;
            case "r":
                sideType = SideType_1.SideType.BLACK;
                pieceType = PieceType_1.PieceType.ROOK;
                break;
            case "q":
                sideType = SideType_1.SideType.BLACK;
                pieceType = PieceType_1.PieceType.QUEEN;
                break;
            case "k":
                sideType = SideType_1.SideType.BLACK;
                pieceType = PieceType_1.PieceType.KING;
                break;
        }
        let ret;
        if (sideType == null || pieceType == null) {
            ret = null;
        }
        else {
            ret = new PieceModel_1.PieceModel(pieceType, sideType);
        }
        return ret;
    }
    ;
    static sideTypePieceTypeToFenChar(sideType, pieceType) {
        let char = "";
        switch (sideType) {
            case SideType_1.SideType.WHITE:
                switch (pieceType) {
                    case PieceType_1.PieceType.PAWN:
                        char = "P";
                        break;
                    case PieceType_1.PieceType.KNIGHT:
                        char = "N";
                        break;
                    case PieceType_1.PieceType.BISHOP:
                        char = "B";
                        break;
                    case PieceType_1.PieceType.ROOK:
                        char = "R";
                        break;
                    case PieceType_1.PieceType.QUEEN:
                        char = "Q";
                        break;
                    case PieceType_1.PieceType.KING:
                        char = "K";
                        break;
                }
                break;
            case SideType_1.SideType.BLACK:
                switch (pieceType) {
                    case PieceType_1.PieceType.PAWN:
                        char = "p";
                        break;
                    case PieceType_1.PieceType.KNIGHT:
                        char = "n";
                        break;
                    case PieceType_1.PieceType.BISHOP:
                        char = "b";
                        break;
                    case PieceType_1.PieceType.ROOK:
                        char = "r";
                        break;
                    case PieceType_1.PieceType.QUEEN:
                        char = "q";
                        break;
                    case PieceType_1.PieceType.KING:
                        char = "k";
                        break;
                }
                break;
        }
        return char;
    }
    ;
    static convertFileToFileNumber(file) {
        let fileNumber = null;
        switch (file) {
            case "a":
                fileNumber = 1;
                break;
            case "b":
                fileNumber = 2;
                break;
            case "c":
                fileNumber = 3;
                break;
            case "d":
                fileNumber = 4;
                break;
            case "e":
                fileNumber = 5;
                break;
            case "f":
                fileNumber = 6;
                break;
            case "g":
                fileNumber = 7;
                break;
            case "h":
                fileNumber = 8;
                break;
        }
        return fileNumber;
    }
    ;
    static convertFileNumberToFile(fileNumber) {
        let file = null;
        switch (fileNumber) {
            case 1:
                file = "a";
                break;
            case 2:
                file = "b";
                break;
            case 3:
                file = "c";
                break;
            case 4:
                file = "d";
                break;
            case 5:
                file = "e";
                break;
            case 6:
                file = "f";
                break;
            case 7:
                file = "g";
                break;
            case 8:
                file = "h";
                break;
        }
        return file;
    }
    updateEnPassantSquare() {
        this.enPassantSquare = null;
        if (this.moveClasses.length === 0) {
            this.enPassantSquare = this.fenStrEnPassant;
        }
        else {
            let isLastMoveTwoPawnMove = this.isLastMoveTwoPawnMove();
            if (isLastMoveTwoPawnMove["isTwoPawnMove"]) {
                this.enPassantSquare = isLastMoveTwoPawnMove["enPassantSquare"];
            }
        }
    }
    isLastMoveTwoPawnMove() {
        let ret = { "isTwoPawnMove": false, "enPassantSquare": null };
        ;
        if (this.moveClasses.length === 0) {
            ret["isTwoPawnMove"] = false;
            ret["enPassantSquare"] = null;
        }
        else {
            let moveClass = this.moveClasses[this.moveClasses.length - 1];
            ret = this.isTwoPawnMove(moveClass);
        }
        return ret;
    }
    isTwoPawnMove(moveClass) {
        let ret = { "isTwoPawnMove": false, "enPassantSquare": null };
        ;
        if (moveClass.getLength() === 2) {
            let change1 = moveClass.get(0);
            let change2 = moveClass.get(1);
            let fileRankFrom = change1["fileRank"];
            let fileRankTo = change2["fileRank"];
            let pieceFrom = change1["originPiece"];
            let pieceTo = change2["destPiece"];
            if ((pieceFrom !== null) && (pieceTo !== null)) {
                ret["isTwoPawnMove"] = true;
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && (pieceFrom.getPieceType() === PieceType_1.PieceType.PAWN);
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && PieceModel_1.PieceModel.isEqualTo(pieceFrom, pieceTo);
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && (fileRankFrom.x === fileRankTo.x);
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && (Math.abs(fileRankFrom.y - fileRankTo.y) === 2);
                if (ret["isTwoPawnMove"]) {
                    ret["enPassantSquare"] = new FileRank_1.FileRank(fileRankFrom.x, (fileRankFrom.y + fileRankTo.y) / 2);
                }
            }
        }
        return ret;
    }
    isLastMoveCastlingMove() {
        let ret = { "isCastlingMove": false, "sideType": null, "castleType": null };
        ;
        if (this.moveClasses.length === 0) {
            ret["isCastlingMove"] = false;
            ret["sideType"] = null;
            ret["castleType"] = null;
        }
        else {
            let moveClass = this.moveClasses[this.moveClasses.length - 1];
            ret = this.isCastlingMove(moveClass);
        }
        return ret;
    }
    isCastlingMove(moveClass) {
        let ret = false;
        let sideType = null;
        let castleType = null;
        if (moveClass.getLength() === 4) {
            let change1 = moveClass.get(0);
            let change2 = moveClass.get(1);
            let change3 = moveClass.get(2);
            let change4 = moveClass.get(3);
            let change1Origin = change1["originPiece"];
            let change1Dest = change1["destPiece"];
            let change1FileRank = change1["fileRank"];
            let change2Origin = change2["originPiece"];
            let change2Dest = change2["destPiece"];
            let change2FileRank = change2["fileRank"];
            let change3Origin = change3["originPiece"];
            let change3Dest = change3["destPiece"];
            let change3FileRank = change3["fileRank"];
            let change4Origin = change4["originPiece"];
            let change4Dest = change4["destPiece"];
            let change4FileRank = change4["fileRank"];
            if (change1Origin !== null && change1Dest === null && change2Origin === null && change2Dest !== null && change3Origin !== null && change3Dest === null && change4Origin === null && change4Dest !== null) {
                if (PieceModel_1.PieceModel.isEqualTo(change1Origin, change2Dest) && PieceModel_1.PieceModel.isEqualTo(change3Origin, change4Dest)) {
                    for (let sType = SideType_1.SideType.FIRST_SIDE; sType <= SideType_1.SideType.LAST_SIDE; sType++) {
                        let kingOriginCastle = this.getKingOriginCastle(sType);
                        if (kingOriginCastle != null) {
                            if (AbstractEngine_1.AbstractEngine.fileRankEqual(kingOriginCastle, change1FileRank)) {
                                sideType = sType;
                            }
                        }
                    }
                    if (sideType !== null) {
                        for (let cType = CastleType_1.CastleType.FIRST_CASTLE; cType <= CastleType_1.CastleType.LAST_CASTLE; cType++) {
                            let rookOriginFileRank = this.getRookOriginCastle(sideType, cType);
                            if (rookOriginFileRank != null) {
                                if (AbstractEngine_1.AbstractEngine.fileRankEqual(rookOriginFileRank, change3FileRank)) {
                                    castleType = cType;
                                }
                            }
                        }
                    }
                    if (sideType !== null && castleType !== null) {
                        ret = true;
                    }
                    else {
                        ret = false;
                        sideType = null;
                        castleType = null;
                    }
                }
            }
        }
        return { isCastlingMove: ret, sideType: sideType, castleType: castleType };
    }
    isLastMovePromotionMove() {
        let ret = { "isPromotionMove": false, "promotionPieceTypes": [], "unpromotionPieceTypes": [] };
        ;
        if (this.moveClasses.length !== 0) {
            let moveClass = this.moveClasses[this.moveClasses.length - 1];
            ret = this.isPromotionMove(moveClass);
        }
        return ret;
    }
    isPromotionMove(moveClass) {
        let ret = { "isPromotionMove": false, "promotionPieceTypes": [], "unpromotionPieceTypes": [] };
        ;
        let numCounter = {};
        numCounter[SideType_1.SideType.WHITE] = 0;
        numCounter[SideType_1.SideType.BLACK] = 0;
        let pieceTypeChanges = {};
        pieceTypeChanges[SideType_1.SideType.WHITE] = {};
        pieceTypeChanges[SideType_1.SideType.BLACK] = {};
        for (let pieceType = PieceType_1.PieceType.FIRST_PIECE; pieceType <= PieceType_1.PieceType.LAST_PIECE; ++pieceType) {
            pieceTypeChanges[SideType_1.SideType.WHITE][pieceType] = 0;
            pieceTypeChanges[SideType_1.SideType.BLACK][pieceType] = 0;
        }
        for (let i = 0; i < moveClass.getLength(); i++) {
            let change = moveClass.get(i);
            let changeOrigin = change.originPiece;
            let changeDest = change.destPiece;
            if (changeOrigin !== null) {
                let pieceType = changeOrigin.getPieceType();
                let sideType = changeOrigin.getSideType();
                numCounter[sideType] = numCounter[sideType] - 1;
                pieceTypeChanges[sideType][pieceType] = pieceTypeChanges[sideType][pieceType] - 1;
            }
            if (changeDest !== null) {
                let pieceType = changeDest.getPieceType();
                let sideType = changeDest.getSideType();
                numCounter[sideType] = numCounter[sideType] + 1;
                pieceTypeChanges[sideType][pieceType] = pieceTypeChanges[sideType][pieceType] + 1;
            }
        }
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            if (numCounter[sideType] == 0) {
                for (let pieceType = PieceType_1.PieceType.FIRST_PIECE; pieceType <= PieceType_1.PieceType.LAST_PIECE; ++pieceType) {
                    if (pieceTypeChanges[sideType][pieceType] > 0) {
                        ret["isPromotionMove"] = true;
                        ret["promotionPieceTypes"].push(pieceType);
                    }
                    else if (pieceTypeChanges[sideType][pieceType] < 0) {
                        ret["isPromotionMove"] = true;
                        ret["unpromotionPieceTypes"].push(pieceType);
                    }
                }
            }
        }
        return ret;
    }
    captureReverseCaptureHelper(moveClass) {
        let wbChanges = {};
        wbChanges[SideType_1.SideType.WHITE] = 0;
        wbChanges[SideType_1.SideType.BLACK] = 0;
        for (let i = 0; i < moveClass.getLength(); i++) {
            let change = moveClass.get(i);
            let originPiece = change.originPiece;
            let destPiece = change.destPiece;
            if (originPiece != null) {
                wbChanges[originPiece.getSideType()] = wbChanges[originPiece.getSideType()] - 1;
            }
            if (destPiece != null) {
                wbChanges[destPiece.getSideType()] = wbChanges[destPiece.getSideType()] + 1;
            }
        }
        return wbChanges;
    }
    isReverseCaptureMove(moveClass) {
        let wbChanges = this.captureReverseCaptureHelper(moveClass);
        return (wbChanges[SideType_1.SideType.WHITE] > 0) || (wbChanges[SideType_1.SideType.BLACK] > 0);
    }
    isCaptureMove(moveClass) {
        let wbChanges = this.captureReverseCaptureHelper(moveClass);
        return (wbChanges[SideType_1.SideType.WHITE] < 0) || (wbChanges[SideType_1.SideType.BLACK] < 0);
    }
    isLastMoveWithPieceTypeSideType(pieceType, sideType) {
        let ret;
        let lastMoveClass = this.getLastMoveClass();
        if (lastMoveClass == null) {
            ret = false;
        }
        else {
            ret = this.isMoveWithPieceTypeSideType(lastMoveClass, pieceType, sideType);
        }
        return ret;
    }
    isMoveWithPieceTypeSideType(moveClass, pieceType, sideType) {
        let ret = false;
        if (moveClass.getLength() > 0) {
            let change = moveClass.get(1);
            let changeOrigin = change.originPiece;
            if (changeOrigin != null) {
                let _pieceType = changeOrigin.getPieceType();
                let _sideType = changeOrigin.getSideType();
                ret = (pieceType == _pieceType) && (sideType == _sideType);
            }
        }
        return ret;
    }
    isLastMoveWithPieceType(pieceType) {
        let ret;
        let lastMoveClass = this.getLastMoveClass();
        if (lastMoveClass == null) {
            ret = false;
        }
        else {
            ret = this.isMoveWithPieceType(lastMoveClass, pieceType);
        }
        return ret;
    }
    isMoveWithPieceType(moveClass, pieceType) {
        let ret = false;
        if (moveClass.getLength() > 0) {
            let change = moveClass.get(1);
            let changeOrigin = change.originPiece;
            if (changeOrigin != null) {
                let _pieceType = changeOrigin.getPieceType();
                let _sideType = changeOrigin.getSideType();
                ret = (pieceType == _pieceType);
            }
        }
        return ret;
    }
    getIsForfeit(sideType) {
        return this.m_isForfeit[sideType];
    }
    setIsForfeit(sideType, isForfeit) {
        this.m_isForfeit[sideType] = isForfeit;
    }
    getIsLooseByTime(sideType) {
        return this.m_isLooseTime[sideType];
    }
    setIsLooseByTime(sideType, isLoose) {
        this.m_isLooseTime[sideType] = isLoose;
    }
    getIsResign(sideType) {
        return this.m_isResign[sideType];
    }
    setIsResign(sideType, isResign) {
        this.m_isResign[sideType] = isResign;
    }
    getIsAskForDraw(sideType) {
        return this.m_askForDraw[sideType];
    }
    setIsAskForDraw(sideType, isAskForDraw) {
        this.m_askForDraw[sideType] = isAskForDraw;
    }
    isCheck() {
        let isCheck = false;
        let royalSquares = this.getRoyalPieceSquares(this.getMoveTurn());
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        for (let i = 0; i < royalSquares.length; i++) {
            let royalSquare = royalSquares[i];
            if (this.hasAllPossibleMoves(royalSquare)) {
                isCheck = true;
            }
        }
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        return isCheck;
    }
    getGameState() {
        return this.m_gameState;
    }
    updateGameState() {
        this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.NORMAL;
        let hasLegalMoves = this.hasAllLegalMoves(null, false);
        if (!hasLegalMoves) {
            if (this.isCheck()) {
                if (this.getMoveTurn() === SideType_1.SideType.WHITE) {
                    this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_CHECKMATE;
                }
                else if (this.getMoveTurn() === SideType_1.SideType.BLACK) {
                    this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_CHECKMATE;
                }
            }
            else {
                this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.DRAW_STALEMATE;
            }
        }
        else if (this.isDrawByInsufficientMaterial()) {
            this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL;
        }
        else if (this.getIsLooseByTime(SideType_1.SideType.WHITE)) {
            this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_TIME;
        }
        else if (this.getIsLooseByTime(SideType_1.SideType.BLACK)) {
            this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_TIME;
        }
        else if (this.getIsResign(SideType_1.SideType.WHITE)) {
            this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_RESIGN;
        }
        else if (this.getIsResign(SideType_1.SideType.BLACK)) {
            this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_RESIGN;
        }
        else if (this.getIsForfeit(SideType_1.SideType.WHITE)) {
            this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_FORFEIT;
        }
        else if (this.getIsForfeit(SideType_1.SideType.BLACK)) {
            this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_FORFEIT;
        }
        else if (this.getIsAskForDraw(SideType_1.SideType.WHITE) || this.getIsAskForDraw(SideType_1.SideType.BLACK)) {
            if (this.getIsAskForDraw(SideType_1.SideType.WHITE) && this.getIsAskForDraw(SideType_1.SideType.BLACK)) {
                this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.DRAW_AGREEMENT;
            }
            else if (this.isDrawBy50Moves()) {
                this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.DRAW_50MOVES;
            }
            else if (this.isDrawByThreeRepetition()) {
                this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.DRAW_REPETITION;
            }
            else {
                this.m_gameState = ChessGameStateEnum_1.ChessGameStateEnum.NORMAL;
            }
        }
    }
    getGameResult() {
        let gameResult = ChessGameResultEnum_1.ChessGameResultEnum.NORMAL;
        switch (this.getGameState()) {
            case ChessGameStateEnum_1.ChessGameStateEnum.NORMAL:
                gameResult = ChessGameResultEnum_1.ChessGameResultEnum.NORMAL;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_TIME:
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_CHECKMATE:
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_RESIGN:
            case ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_FORFEIT:
                gameResult = ChessGameResultEnum_1.ChessGameResultEnum.WHITE_WIN;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_TIME:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_CHECKMATE:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_RESIGN:
            case ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_FORFEIT:
                gameResult = ChessGameResultEnum_1.ChessGameResultEnum.BLACK_WIN;
                break;
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_STALEMATE:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_50MOVES:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_REPETITION:
            case ChessGameStateEnum_1.ChessGameStateEnum.DRAW_AGREEMENT:
                gameResult = ChessGameResultEnum_1.ChessGameResultEnum.DRAW;
                break;
        }
        return gameResult;
    }
    //The logic here has to do with castling
    canCastle(sideType, castleType) {
        if (!this.fenStrCastling[sideType][castleType]) {
            return false;
        }
        let kingOriginFileRank = this.getKingOriginCastle(sideType);
        if (kingOriginFileRank == null) {
            return false;
        }
        let rookOriginFileRank = this.getRookOriginCastle(sideType, castleType);
        if (rookOriginFileRank == null) {
            return false;
        }
        let kingPiece = this.getPieceForFileRank(kingOriginFileRank);
        let rookPiece = this.getPieceForFileRank(rookOriginFileRank);
        if (kingPiece === null || rookPiece === null) {
            return false;
        }
        let ret = true;
        ret = ret && (kingPiece.getPieceType() === PieceType_1.PieceType.KING && kingPiece.getSideType() === sideType);
        ret = ret && (rookPiece.getPieceType() === PieceType_1.PieceType.ROOK && rookPiece.getSideType() === sideType);
        ret = ret && (kingPiece.getNumOfTimesMoved() === 0);
        ret = ret && (rookPiece.getNumOfTimesMoved() === 0);
        return ret;
    }
    getRookOriginFileNumber(sideType, castleType) {
        return this.fenStrRookOriginFileNumber[sideType][castleType];
    }
    getRookOriginRank(sideType) {
        let rank = -1;
        switch (sideType) {
            case SideType_1.SideType.WHITE:
                rank = 1;
                break;
            case SideType_1.SideType.BLACK:
                rank = ChessEngine.getNumOfRanks();
                break;
        }
        return rank;
    }
    getRookOriginCastle(sideType, castleType) {
        let rookOriginFileNumber = this.getRookOriginFileNumber(sideType, castleType);
        let rookOriginRank = this.getRookOriginRank(sideType);
        if (rookOriginFileNumber == null || rookOriginRank == null) {
            return null;
        }
        return new FileRank_1.FileRank(rookOriginFileNumber, rookOriginRank);
    }
    getKingOriginFileNumber(sideType) {
        return this.fenStrKingOriginFileNumber[sideType];
    }
    getKingOriginRank(sideType) {
        let rank = -1;
        switch (sideType) {
            case SideType_1.SideType.WHITE:
                rank = 1;
                break;
            case SideType_1.SideType.BLACK:
                rank = ChessEngine.getNumOfRanks();
                break;
        }
        return rank;
    }
    getKingOriginCastle(sideType) {
        let kingOriginFileNumber = this.getKingOriginFileNumber(sideType);
        let kingOriginRank = this.getKingOriginRank(sideType);
        if (kingOriginFileNumber == null) {
            return null;
        }
        return new FileRank_1.FileRank(kingOriginFileNumber, kingOriginRank);
    }
    getKingDestCastle(sideType, castleType) {
        let fileNumber = -1;
        switch (castleType) {
            case CastleType_1.CastleType.KING_SIDE:
                fileNumber = 7;
                break;
            case CastleType_1.CastleType.QUEEN_SIDE:
                fileNumber = 3;
                break;
        }
        let rank = -1;
        switch (sideType) {
            case SideType_1.SideType.WHITE:
                rank = 1;
                break;
            case SideType_1.SideType.BLACK:
                rank = ChessEngine.getNumOfRanks();
                break;
        }
        return new FileRank_1.FileRank(fileNumber, rank);
    }
    getRookDestCastle(sideType, castleType) {
        let ret = new FileRank_1.FileRank(0, 0);
        let kingDestFileRank = this.getKingDestCastle(sideType, castleType);
        if (castleType === CastleType_1.CastleType.KING_SIDE) {
            ret.x = kingDestFileRank.x - 1;
        }
        else if (castleType === CastleType_1.CastleType.QUEEN_SIDE) {
            ret.x = kingDestFileRank.x + 1;
        }
        ret.y = kingDestFileRank.y;
        return ret;
    }
    doMoveSan(sanMove) {
        let moveClass = this.getMoveClassForCurrentBoardAndSanMove(sanMove);
        if (moveClass !== null) {
            this.doMove(moveClass);
        }
        return (moveClass !== null);
    }
    doMoveUCI(uciMove) {
        let moveClass = this.getMoveClassForUCIMove(uciMove);
        if (moveClass !== null) {
            this.doMove(moveClass);
        }
        return (moveClass !== null);
    }
    doMove(moveClass) {
        super.doMove(moveClass);
        //Update the move number
        if (this.getMoveTurn() === SideType_1.SideType.BLACK) {
            this.moveNumber = this.moveNumber + 1;
        }
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        //Figure out if the half move clock should be reset or incremented
        let resetHalfMoveClock = false;
        if (this.isCaptureMove(moveClass) || this.isMoveWithPieceType(moveClass, PieceType_1.PieceType.PAWN)) {
            resetHalfMoveClock = true;
        }
        if (resetHalfMoveClock) {
            this.halfMoveClockVector.push(0);
        }
        else {
            this.halfMoveClockVector.push(this.halfMoveClockVector[this.halfMoveClockVector.length - 1] + 1);
        }
        //Figure out if an en passant square occured
        this.updateEnPassantSquare();
        this.updateGameState();
        this.uciMoves.push(this.getUCIMoveForMoveClass(moveClass));
        this.sanMoves.push(this.getSANMoveForLastMoveClass());
        this.fenStrings.push(this.getFenStrFromCurrentBoard());
        console.debug("the uciMove is " + this.getLastUCIMove());
        console.debug("the sanMove is " + this.getLastSanMove());
        console.debug("the fenStr is " + this.getLastFenStr());
    }
    //the logic of moving pieces
    isMoveLegal(moveClass, isCheckGameState) {
        if (isCheckGameState) {
            if (this.getGameState() != ChessGameStateEnum_1.ChessGameStateEnum.NORMAL) {
                return false;
            }
        }
        let isInFakeCheck = false;
        super.doMove(moveClass);
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        let royalSquares = this.getRoyalPieceSquares(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        for (let i = 0; i < royalSquares.length; i++) {
            let royalSquare = royalSquares[i];
            if (this.hasAllPossibleMoves(royalSquare)) {
                isInFakeCheck = true;
            }
        }
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        super.undoMove();
        let isCastlingIllegal = false;
        let isCastlingMove = this.isCastlingMove(moveClass);
        //isCastlingMove, sideType, castleType = self.isCastlingMove(moveClass)
        if (isCastlingMove["isCastlingMove"]) {
            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
            let kingOrigin = this.getKingOriginCastle(isCastlingMove["sideType"]);
            let kingDest = this.getKingDestCastle(isCastlingMove["sideType"], isCastlingMove["castleType"]);
            let checkSquares = this.getFileRankList(kingOrigin, kingDest, true, true);
            for (let i = 0; i < checkSquares.length; i++) {
                let checkSquare = checkSquares[i];
                if (this.hasAllPossibleMoves(checkSquare)) {
                    isCastlingIllegal = true;
                }
            }
            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        }
        return !(isCastlingIllegal || isInFakeCheck);
    }
    hasAllLegalMoves(destFileRank, isCheckGameState) {
        let possibleMoves = this.getAllPossibleMoves(destFileRank);
        for (let i = 0; i < possibleMoves.length; i++) {
            let possibleMove = possibleMoves[i];
            if (this.isMoveLegal(possibleMove, isCheckGameState)) {
                return true;
            }
        }
        return false;
    }
    getAllLegalMoves(destFileRank, isCheckGameState) {
        let ret = [];
        let possibleMoves = this.getAllPossibleMoves(destFileRank);
        for (let i = 0; i < possibleMoves.length; i++) {
            let possibleMove = possibleMoves[i];
            if (this.isMoveLegal(possibleMove, isCheckGameState)) {
                ret.push(possibleMove);
            }
        }
        return ret;
    }
    hasLegalMoves(originFileRank, destFileRank, isCheckGameState) {
        let possibleMoves = this.getPossibleMoves(originFileRank, destFileRank);
        for (let i = 0; i < possibleMoves.length; i++) {
            let possibleMove = possibleMoves[i];
            if (this.isMoveLegal(possibleMove, isCheckGameState)) {
                return true;
            }
        }
        return false;
    }
    getLegalMoves(originFileRank, destFileRank, isCheckGameState) {
        let ret = [];
        let possibleMoves = this.getPossibleMoves(originFileRank, destFileRank);
        for (let i = 0; i < possibleMoves.length; i++) {
            let possibleMove = possibleMoves[i];
            if (this.isMoveLegal(possibleMove, isCheckGameState)) {
                ret.push(possibleMove);
            }
        }
        return ret;
    }
    hasAllPossibleMoves(destFileRank) {
        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];
        for (let pieceType in squarePieces) {
            let squarePiece = squarePieces[pieceType];
            for (let i = 0; i < squarePiece.length; i++) {
                let square = squarePiece[i];
                if (this.hasPossibleMoves(square, destFileRank)) {
                    return true;
                }
            }
        }
        return false;
    }
    getAllPossibleMoves(destFileRank) {
        let ret = [];
        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];
        for (let pieceType in squarePieces) {
            let squarePiece = squarePieces[pieceType];
            for (let i = 0; i < squarePiece.length; i++) {
                let square = squarePiece[i];
                ret = ret.concat(this.getPossibleMoves(square, destFileRank));
            }
        }
        return ret;
    }
    hasPossibleMoves(originFileRank, destFileRank) {
        return this.getPossibleMoves(originFileRank, destFileRank).length > 0;
    }
    getPossibleMoves(originFileRank, destFileRank) {
        if (!this.isFileRankLegal(originFileRank)) {
            return [];
        }
        let originPiece = this.getPieceForFileRank(originFileRank);
        if (originPiece === null) {
            return [];
        }
        if (originPiece.getSideType() !== this.getMoveTurn()) {
            return [];
        }
        let moveClasses = [];
        let fairyCapture = this.captureFairy[originPiece.getSideType()][originPiece.getPieceType()];
        let fairyNormal = this.normalFairy[originPiece.getSideType()][originPiece.getPieceType()];
        this.getCaptureNormalMovesForFairy(originFileRank, destFileRank, fairyCapture, fairyNormal, moveClasses);
        if (originPiece.getPieceType() === PieceType_1.PieceType.PAWN) {
            //First move can move by two
            this.dealWithTwoMove(moveClasses, originPiece, originFileRank, destFileRank);
            //En passant capture
            this.dealWithEnPassant(moveClasses, originPiece, originFileRank, destFileRank);
        }
        else if (originPiece.getPieceType() === PieceType_1.PieceType.KING) {
            this.dealWithCastling(moveClasses, originPiece, originFileRank, destFileRank);
        }
        //Promote pawns
        this.dealWithPawnPromotion(moveClasses);
        return moveClasses;
    }
    hasAllVectorMoves(destFileRank) {
        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];
        for (let pieceType in squarePieces) {
            let squarePiece = squarePieces[pieceType];
            for (let i = 0; i < squarePiece.length; i++) {
                let square = squarePiece[i];
                if (this.hasVectorMoves(square, destFileRank)) {
                    return true;
                }
            }
        }
        return false;
    }
    getAllVectorMoves(destFileRank) {
        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];
        let ret = [];
        for (let pieceType in squarePieces) {
            let squarePiece = squarePieces[pieceType];
            for (let i = 0; i < squarePiece.length; i++) {
                let originFileRank = squarePiece[i];
                ret = ret.concat(this.getVectorMoves(originFileRank, destFileRank));
            }
        }
        return ret;
    }
    hasVectorMoves(originFileRank, destFileRank) {
        let vectorMoves = this.getVectorMoves(originFileRank, destFileRank);
        return vectorMoves.length > 0;
    }
    getVectorMoves(originFileRank, destFileRank) {
        if (!this.isFileRankLegal(originFileRank)) {
            return [];
        }
        let originPiece = this.getPieceForFileRank(originFileRank);
        if (originPiece === null) {
            return [];
        }
        if (originPiece.getSideType() !== this.getMoveTurn()) {
            return [];
        }
        let moveClasses = [];
        let fairyCapture = this.captureFairy[originPiece.getSideType()][originPiece.getPieceType()];
        let fairyNormal = this.normalFairy[originPiece.getSideType()][originPiece.getPieceType()];
        if (fairyCapture == fairyNormal) {
            this.getVectorMovesForFairy(originFileRank, destFileRank, fairyCapture, moveClasses);
        }
        else {
            this.getVectorMovesForFairy(originFileRank, destFileRank, fairyCapture, moveClasses);
            this.getVectorMovesForFairy(originFileRank, destFileRank, fairyNormal, moveClasses);
        }
        if (originPiece.getPieceType() == PieceType_1.PieceType.PAWN) {
            if (originPiece.getSideType() == SideType_1.SideType.WHITE && (originFileRank.y == 2)) {
                this.getVectorMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType_1.SideType.WHITE], moveClasses);
            }
            else if (originPiece.getSideType() == SideType_1.SideType.BLACK && (originFileRank.y == this.getNumOfRanks() - 2 + 1)) {
                this.getVectorMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType_1.SideType.BLACK], moveClasses);
            }
        }
        return moveClasses;
    }
    dealWithTwoMove(moveClasses, originPiece, originFileRank, destFileRank) {
        if ((originPiece.getSideType() === SideType_1.SideType.WHITE) && (originFileRank.y === 2)) {
            this.getNormalMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType_1.SideType.WHITE], moveClasses);
        }
        else if ((originPiece.getSideType() === SideType_1.SideType.BLACK) && (originFileRank.y === this.getNumOfRanks() - 2 + 1)) {
            this.getNormalMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType_1.SideType.BLACK], moveClasses);
        }
    }
    dealWithEnPassant(moveClasses, originPiece, originFileRank, destFileRank) {
        if (this.enPassantSquare === null) {
            return;
        }
        let fairy = this.captureFairy[originPiece.getSideType()][originPiece.getPieceType()];
        let enPassantMoveVectors = fairy.getVectors();
        let enPassantFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, enPassantMoveVectors);
        let pruneFunctions = [];
        if (destFileRank !== null) {
            pruneFunctions.push(AbstractEngine_1.AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }
        pruneFunctions.push(AbstractEngine_1.AbstractEngine.fileRankEqual.bind(this, this.enPassantSquare));
        pruneFunctions.push(this.notLandOnPiece.bind(this));
        enPassantFileRanks = this.pruneFileRanksHelper(enPassantFileRanks, pruneFunctions);
        for (let i = 0; i < enPassantFileRanks.length; i++) {
            let enPassantFileRank = enPassantFileRanks[i];
            let enPassantCaptureFileRank = new FileRank_1.FileRank(enPassantFileRank.x, originFileRank.y);
            let enPassantCapturePiece = this.getPieceForFileRank(enPassantCaptureFileRank);
            let enPassantMoveClass = new MoveClass_1.MoveClass(originFileRank, enPassantFileRank);
            enPassantMoveClass.pushChange(originFileRank, originPiece, null);
            enPassantMoveClass.pushChange(enPassantCaptureFileRank, enPassantCapturePiece, null);
            enPassantMoveClass.pushChange(enPassantFileRank, null, originPiece);
            moveClasses.push(enPassantMoveClass);
        }
    }
    dealWithPawnPromotion(moveClasses) {
        let index = 0;
        while (index < moveClasses.length) {
            let moveClass = moveClasses[index];
            for (let i = 0; i < moveClass.getLength(); i++) {
                let change = moveClass.get(i);
                let fileRank = change["fileRank"];
                let originPiece = change["originPiece"];
                let destPiece = change["destPiece"];
                let addPromoteType = false;
                if (destPiece !== null) {
                    if (destPiece.getPieceType() === PieceType_1.PieceType.PAWN) {
                        if (destPiece.getSideType() === SideType_1.SideType.WHITE && fileRank["rank"] === this.getNumOfRanks()) {
                            addPromoteType = true;
                        }
                        else if (destPiece.getSideType() === SideType_1.SideType.BLACK && fileRank["rank"] === 1) {
                            addPromoteType = true;
                        }
                    }
                }
                if (addPromoteType) {
                    destPiece = destPiece;
                    change["destPiece"] = new PieceModel_1.PieceModel(PieceType_1.PieceType.KNIGHT, destPiece.getSideType());
                    let promotionPieceTypes = [];
                    //promotionPieceTypes.push(PieceType.KNIGHT)
                    promotionPieceTypes.push(PieceType_1.PieceType.BISHOP);
                    promotionPieceTypes.push(PieceType_1.PieceType.ROOK);
                    promotionPieceTypes.push(PieceType_1.PieceType.QUEEN);
                    for (let j = 0; j < promotionPieceTypes.length; j++) {
                        let promotionPieceType = promotionPieceTypes[j];
                        let moveClassClone = moveClass.clone();
                        let moveClassCloneChange = moveClass.get(i);
                        moveClassCloneChange["destPiece"] = new PieceModel_1.PieceModel(promotionPieceType, destPiece.getSideType());
                        moveClasses.push(moveClassClone);
                    }
                }
                else {
                    index = index + 1;
                }
            }
        }
    }
    dealWithCastling(moveClasses, kingPiece, kingOriginFileRank, destFileRank) {
        let sideType = kingPiece.getSideType();
        for (let castleType = CastleType_1.CastleType.FIRST_CASTLE; castleType <= CastleType_1.CastleType.LAST_CASTLE; castleType++) {
            if (this.canCastle(sideType, castleType)) {
                let rookOriginFileRank = this.getRookOriginCastle(sideType, castleType);
                let rookDestFileRank = this.getRookDestCastle(sideType, castleType);
                let rookPiece = this.getPieceForFileRank(rookOriginFileRank);
                let kingDestFileRank = this.getKingDestCastle(sideType, castleType);
                let canAddCastleMove = true;
                if (destFileRank !== null) {
                    if (this.initParam.isChess960) {
                        canAddCastleMove = canAddCastleMove && (AbstractEngine_1.AbstractEngine.fileRankEqual(destFileRank, rookOriginFileRank));
                    }
                    else {
                        canAddCastleMove = canAddCastleMove && (AbstractEngine_1.AbstractEngine.fileRankEqual(destFileRank, kingDestFileRank));
                    }
                }
                let inKingPieces = this.getPiecesFromFileRankToFileRank(kingOriginFileRank, kingDestFileRank, true, true);
                for (let i = 0; i < inKingPieces.length && canAddCastleMove; i++) {
                    let piece = inKingPieces[i];
                    if (!(piece == kingPiece || piece == rookPiece)) {
                        canAddCastleMove = false;
                    }
                }
                let inRookPieces = this.getPiecesFromFileRankToFileRank(rookOriginFileRank, rookDestFileRank, true, true);
                for (let i = 0; i < inRookPieces.length && canAddCastleMove; i++) {
                    let piece = inRookPieces[i];
                    if (!(piece == kingPiece || piece == rookPiece)) {
                        canAddCastleMove = false;
                    }
                }
                if (canAddCastleMove) {
                    let castleMove;
                    if (this.initParam.isChess960) {
                        castleMove = new MoveClass_1.MoveClass(kingOriginFileRank, rookOriginFileRank);
                    }
                    else {
                        castleMove = new MoveClass_1.MoveClass(kingOriginFileRank, kingDestFileRank);
                    }
                    castleMove.pushChange(kingDestFileRank, this.getPieceForFileRank(kingDestFileRank), kingPiece);
                    castleMove.pushChange(rookDestFileRank, this.getPieceForFileRank(rookDestFileRank), rookPiece);
                    if (!(AbstractEngine_1.AbstractEngine.fileRankEqual(kingOriginFileRank, kingDestFileRank) || AbstractEngine_1.AbstractEngine.fileRankEqual(kingOriginFileRank, rookDestFileRank))) {
                        castleMove.pushChange(kingOriginFileRank, kingPiece, null);
                    }
                    if (!(AbstractEngine_1.AbstractEngine.fileRankEqual(rookOriginFileRank, kingDestFileRank) || AbstractEngine_1.AbstractEngine.fileRankEqual(rookOriginFileRank, rookDestFileRank))) {
                        castleMove.pushChange(rookOriginFileRank, rookPiece, null);
                    }
                    moveClasses.push(castleMove);
                }
            }
        }
    }
    ;
    isDrawByInsufficientMaterial() {
        let activePieceMap = {};
        for (let pieceType = PieceType_1.PieceType.FIRST_PIECE; pieceType <= PieceType_1.PieceType.LAST_PIECE; pieceType++) {
            activePieceMap[pieceType] = [];
        }
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            for (let pieceType = PieceType_1.PieceType.FIRST_PIECE; pieceType <= PieceType_1.PieceType.LAST_PIECE; pieceType++) {
                activePieceMap[pieceType] = activePieceMap[pieceType].concat(this.getSquaresBySideTypePieceType(sideType, pieceType));
            }
        }
        let isDraw = true;
        isDraw = isDraw && activePieceMap[PieceType_1.PieceType.QUEEN].length === 0;
        isDraw = isDraw && activePieceMap[PieceType_1.PieceType.ROOK].length === 0;
        isDraw = isDraw && activePieceMap[PieceType_1.PieceType.PAWN].length === 0;
        //We are interested in the cases of knights and bishops
        if (isDraw) {
            let onlyKings = activePieceMap[PieceType_1.PieceType.KNIGHT].length === 0 && activePieceMap[PieceType_1.PieceType.BISHOP].length === 0;
            let oneKnight = activePieceMap[PieceType_1.PieceType.KNIGHT].length === 1 && activePieceMap[PieceType_1.PieceType.BISHOP].length === 0;
            let sameColorBishops = activePieceMap[PieceType_1.PieceType.KNIGHT].length === 0;
            if (sameColorBishops) {
                let isModOne = false;
                let isModZero = false;
                let bishopSquares = this.getSquaresByPieceType(PieceType_1.PieceType.BISHOP);
                for (let i = 0; i < bishopSquares.length; i++) {
                    let bishopSquare = bishopSquares[i];
                    let squareMod = (bishopSquare.x + bishopSquare.y) % 2;
                    if (squareMod === 1) {
                        isModOne = true;
                    }
                    else if (squareMod === 0) {
                        isModZero = true;
                    }
                }
                sameColorBishops = (isModOne && (!isModZero)) || ((!isModOne) && isModZero);
            }
            isDraw = onlyKings || oneKnight || sameColorBishops;
        }
        return isDraw;
    }
    ;
    isDrawBy50Moves() {
        return this.halfMoveClockVector[this.halfMoveClockVector.length - 1] >= 100;
    }
    isDrawByThreeRepetition() {
        let lastFenStr = this.getLastFenStr();
        let lastSplitFenStr = lastFenStr.split(" ");
        let lastPiecePlacement = lastSplitFenStr[0];
        let lastMoveTurn = lastSplitFenStr[1];
        let lastCastling = lastSplitFenStr[2];
        let lastEnPassant = lastSplitFenStr[3];
        let numSame = 0;
        for (let i = this.fenStrings.length - 1; i >= 0; i--) {
            let iterFenStr = this.fenStrings[i];
            let iterFenStrSplit = iterFenStr.split(" ");
            let iterPiecePlacement = iterFenStrSplit[0];
            let iterMoveTurn = iterFenStrSplit[1];
            let iterCastling = iterFenStrSplit[2];
            let iterEnPassant = iterFenStrSplit[3];
            let isSame = true;
            isSame = isSame && (lastPiecePlacement == iterPiecePlacement);
            isSame = isSame && (lastMoveTurn == iterMoveTurn);
            isSame = isSame && (lastCastling == iterCastling);
            isSame = isSame && (lastEnPassant == iterEnPassant);
            if (isSame) {
                numSame += 1;
            }
        }
        return numSame >= 3;
    }
    getMoveClassForCurrentBoardAndSanMove(sanMove) {
        let retMove = null;
        let sideType = this.getMoveTurn();
        console.debug("parsing sanMove ", sanMove);
        //Remove all the charectars at the end of the string
        let isBreak = false;
        do {
            isBreak = true;
            let lastChar = sanMove[sanMove.length - 1];
            if (lastChar == "#" || lastChar == "+" || lastChar == "!" || lastChar == "?") {
                isBreak = false;
                sanMove = sanMove.slice(0, -1);
            }
        } while (!isBreak);
        if (sanMove == "O-O" || sanMove == "O-O-O") { //CastlingType
            let castleType = CastleType_1.CastleType.KING_SIDE;
            if (sanMove == "O-O") {
                castleType = CastleType_1.CastleType.KING_SIDE;
            }
            else if (sanMove == "O-O-O") {
                castleType = CastleType_1.CastleType.QUEEN_SIDE;
            }
            let kingOrigin = this.getKingOriginCastle(sideType);
            let kingDest = this.getKingDestCastle(sideType, castleType);
            let legalMove = this.getLegalMoves(kingOrigin, kingDest, false);
            if (legalMove.length == 1) {
                retMove = legalMove[0];
            }
        }
        else {
            //Extract the promotion piece
            let promotionPieceType = null;
            {
                let lastChar = sanMove[sanMove.length - 1];
                let piece = ChessEngine.fenCharToSideTypePieceType(lastChar);
                if (piece != null) {
                    promotionPieceType = piece.getPieceType();
                    sanMove = sanMove.slice(0, -1);
                }
            }
            //Extract the destination fileRank
            let destFileRank;
            {
                let file = sanMove[sanMove.length - 2];
                let rank = Number(sanMove[sanMove.length - 1]);
                destFileRank = new FileRank_1.FileRank(ChessEngine.convertFileToFileNumber(file), rank);
                sanMove = sanMove.slice(0, -1);
                sanMove = sanMove.slice(0, -1);
            }
            //Get rid of unwanted x
            if (sanMove[sanMove.length - 1] == "x") {
                sanMove = sanMove.slice(0, -1);
            }
            //Extract the origin file rank
            let originFileNumber = null;
            let originRank = null;
            if (sanMove.length > 0) {
                let _originRank = Number(sanMove[sanMove.length - 1]);
                if (!isNaN(_originRank)) {
                    originRank = _originRank;
                    sanMove = sanMove.slice(0, -1);
                }
                let _originFile = sanMove[sanMove.length - 1];
                originFileNumber = ChessEngine.convertFileToFileNumber(_originFile);
                if (originFileNumber != null) {
                    sanMove = sanMove.slice(0, -1);
                }
            }
            //Extract the piecetype
            let pieceType;
            if (sanMove.length == 0) {
                pieceType = PieceType_1.PieceType.PAWN;
            }
            else {
                let piece = ChessEngine.fenCharToSideTypePieceType(sanMove);
                pieceType = piece.getPieceType();
            }
            let squarePieces = this.getSquaresBySideTypePieceType(sideType, pieceType);
            let newSquarePieces = [];
            for (let i = 0; i < squarePieces.length; i++) {
                let squarePiece = squarePieces[i];
                let insertNewSquare = true;
                if (originFileNumber != null) {
                    if (originFileNumber != squarePiece.x) {
                        insertNewSquare = false;
                    }
                }
                if (originRank != null) {
                    if (originRank != squarePiece.y) {
                        insertNewSquare = false;
                    }
                }
                if (insertNewSquare) {
                    newSquarePieces.push(squarePiece);
                }
            }
            squarePieces = newSquarePieces;
            let moveClasses = [];
            for (let i = 0; i < squarePieces.length; i++) {
                let squarePiece = squarePieces[i];
                let legalMoves = this.getLegalMoves(squarePiece, destFileRank, false);
                moveClasses = moveClasses.concat(legalMoves);
            }
            if (moveClasses.length == 1) {
                retMove = moveClasses[0];
            }
            else {
                for (let i = 0; i < moveClasses.length; i++) {
                    let moveClass = moveClasses[i];
                    let isPromotionMove = this.isPromotionMove(moveClass);
                    if (isPromotionMove["isPromotionMove"]) {
                        let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
                        if (promotionPieceTypes.length == 1) {
                            if (promotionPieceType == promotionPieceTypes[0]) {
                                retMove = moveClass;
                            }
                        }
                    }
                }
            }
        }
        return retMove;
    }
    getSANMovesForCurrentBoardAndMoveClasses(moveClasses) {
        let ret = [];
        for (let i = 0; i < moveClasses.length; i++) {
            ret.push(this.getSANMoveForCurrentBoardAndMoveClass(moveClasses[i]));
        }
        return ret;
    }
    getSANMoveForCurrentBoardAndMoveClass(moveClass) {
        super.doMove(moveClass);
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        this.updateGameState();
        let str = this.getSANMoveForLastMoveClass();
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        super.undoMove();
        this.updateGameState();
        return str;
    }
    getSANMoveForLastMoveClass() {
        let moveClass = this.getLastMoveClass();
        let str = "";
        let originFileRank = moveClass.originFileRank;
        let destFileRank = moveClass.destFileRank;
        let castlingMove = this.isCastlingMove(moveClass);
        if (castlingMove["isCastlingMove"]) {
            let sType = castlingMove["sideType"];
            let cType = castlingMove["castleType"];
            if (cType == CastleType_1.CastleType.KING_SIDE) {
                str = "O-O";
            }
            else if (cType == CastleType_1.CastleType.QUEEN_SIDE) {
                str = "O-O-O";
            }
        }
        else {
            let isAmbiguous = false;
            let numOfFileAmbiguous = 0;
            let numOfRankAmbiguous = 0;
            super.undoMove();
            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
            let piece = this.getPieceForFileRank(moveClass.originFileRank);
            let pieceType = piece.getPieceType();
            let pieceSquares = this.getSquaresBySideTypePieceType(piece.getSideType(), piece.getPieceType());
            for (let i = 0; i < pieceSquares.length; i++) {
                let pSquare = pieceSquares[i];
                if (AbstractEngine_1.AbstractEngine.fileRankNotEqual(pSquare, originFileRank)) {
                    if (this.hasLegalMoves(pSquare, destFileRank, false)) {
                        isAmbiguous = true;
                        if (pSquare.x == originFileRank.x) {
                            numOfFileAmbiguous++;
                        }
                        if (pSquare.y == originFileRank.y) {
                            numOfRankAmbiguous++;
                        }
                    }
                }
            }
            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
            super.doMove(moveClass);
            if (pieceType != PieceType_1.PieceType.PAWN) {
                str = ChessEngine.sideTypePieceTypeToFenChar(SideType_1.SideType.WHITE, pieceType);
            }
            if (isAmbiguous) {
                if (numOfFileAmbiguous == 0) {
                    str = str + ChessEngine.convertFileNumberToFile(originFileRank.fileNumber);
                }
                else if (numOfRankAmbiguous == 0) {
                    str = str + String(originFileRank.rank);
                }
                else {
                    str = str + ChessEngine.convertFileNumberToFile(originFileRank.fileNumber);
                    str = str + String(originFileRank.rank);
                }
            }
            if (this.isCaptureMove(moveClass)) {
                str = str + "x";
            }
            str = str + ChessEngine.convertFileNumberToFile(destFileRank.fileNumber);
            str = str + String(destFileRank.rank);
            let isPromotionMove = this.isPromotionMove(moveClass);
            if (isPromotionMove["isPromotionMove"]) {
                str = str + "=";
                let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
                for (let i = 0; i < promotionPieceTypes.length; i++) {
                    let promotionPieceType = promotionPieceTypes[i];
                    str = str + ChessEngine.sideTypePieceTypeToFenChar(SideType_1.SideType.WHITE, promotionPieceType);
                }
            }
        }
        let gameState = this.getGameState();
        if (gameState == ChessGameStateEnum_1.ChessGameStateEnum.BLACK_WIN_CHECKMATE || gameState == ChessGameStateEnum_1.ChessGameStateEnum.WHITE_WIN_CHECKMATE) {
            str = str + "#";
        }
        else if (this.isCheck()) {
            str = str + "+";
        }
        return str;
    }
    getUCIMovesForMoveClasses(moveClasses) {
        let ret = [];
        for (let i = 0; i < moveClasses.length; i++) {
            ret.push(this.getUCIMoveForMoveClass(moveClasses[i]));
        }
        return ret;
    }
    getUCIMoveForMoveClass(moveClass) {
        let uciMove = "";
        let originFileRank = moveClass.originFileRank;
        let originFileNumber = originFileRank.fileNumber;
        let originFile = ChessEngine.convertFileNumberToFile(originFileNumber);
        let originRank = originFileRank.rank;
        let destFileRank = moveClass.destFileRank;
        let destFileNumber = destFileRank.fileNumber;
        let destFile = ChessEngine.convertFileNumberToFile(destFileNumber);
        let destRank = destFileRank.rank;
        uciMove = originFile + originRank.toString() + destFile + destRank.toString();
        let isPromotionMove = this.isPromotionMove(moveClass);
        if (isPromotionMove["isPromotionMove"]) {
            let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
            for (let i = 0; i < promotionPieceTypes.length; i++) {
                let promotionPieceType = promotionPieceTypes[i];
                uciMove = uciMove + ChessEngine.sideTypePieceTypeToFenChar(SideType_1.SideType.BLACK, promotionPieceType);
            }
        }
        return uciMove;
    }
    getMoveClassForUCIMove(uciMove) {
        //checking whether this uciMove is valid
        if (uciMove.length !== 4 && uciMove.length !== 5) {
            return null;
        }
        let file1 = uciMove[0];
        let fileNumber1 = ChessEngine.convertFileToFileNumber(file1);
        if (fileNumber1 == null) {
            return null;
        }
        let rank1 = parseInt(uciMove[1]);
        if (isNaN(rank1)) {
            return null;
        }
        if (rank1 < 1 || rank1 > this.getNumOfRanks()) {
            return null;
        }
        let fileRank1 = new FileRank_1.FileRank(fileNumber1, rank1);
        let file2 = uciMove[2];
        let fileNumber2 = ChessEngine.convertFileToFileNumber(file2);
        if (fileNumber2 == null) {
            return null;
        }
        let rank2 = parseInt(uciMove[3]);
        if (isNaN(rank2)) {
            return null;
        }
        if (rank2 < 1 || rank2 > this.getNumOfRanks()) {
            return null;
        }
        let fileRank2 = new FileRank_1.FileRank(fileNumber2, rank2);
        let legalMoves = this.getLegalMoves(fileRank1, fileRank2, false);
        let ret = null;
        if (legalMoves.length == 1) {
            if (uciMove.length !== 4) {
                return null;
            }
            ret = legalMoves[0];
        }
        else {
            if (uciMove.length !== 5) {
                return null;
            }
            let c = uciMove[5];
            let sideTypePieceType = ChessEngine.fenCharToSideTypePieceType(c);
            if (sideTypePieceType == null) {
                return null;
            }
            else {
                for (let i = 0; i < legalMoves.length; i++) {
                    let legalMove = legalMoves[i];
                    let isPromotionMove = this.isPromotionMove(legalMove);
                    if (isPromotionMove["isPromotionMove"]) {
                        let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
                        if (promotionPieceTypes[0] == sideTypePieceType["pieceType"]) {
                            ret = legalMove;
                        }
                    }
                }
            }
        }
        return ret;
    }
    getFenStrFromCurrentBoard() {
        let fenStr = "";
        //Deal with piece placement
        for (let rank = this.getNumOfRanks(); rank >= 1; rank--) {
            let piecePlacementInt = 0;
            for (let fileNumber = 1; fileNumber <= this.getNumOfFiles(); fileNumber++) {
                let fileRank = new FileRank_1.FileRank(fileNumber, rank);
                let piece = this.getPieceForFileRank(fileRank);
                if (piece != null) {
                    if (piecePlacementInt != 0) {
                        fenStr += piecePlacementInt.toString();
                        piecePlacementInt = 0;
                    }
                    fenStr += ChessEngine.sideTypePieceTypeToFenChar(piece.getSideType(), piece.getPieceType());
                }
                else if (piece == null) {
                    piecePlacementInt = piecePlacementInt + 1;
                }
            }
            if (piecePlacementInt != 0) {
                fenStr += piecePlacementInt.toString();
            }
            if (rank != 1) {
                fenStr += "/";
            }
        }
        fenStr += " ";
        //Deal with the move side
        if (this.getMoveTurn() == SideType_1.SideType.WHITE) {
            fenStr += "w";
        }
        else if (this.getMoveTurn() == SideType_1.SideType.BLACK) {
            fenStr += "b";
        }
        fenStr += " ";
        //Deal With castling
        let isCastling = false;
        for (let sideType = SideType_1.SideType.FIRST_SIDE; sideType <= SideType_1.SideType.LAST_SIDE; sideType++) {
            for (let castleType = CastleType_1.CastleType.FIRST_CASTLE; castleType <= CastleType_1.CastleType.LAST_CASTLE; castleType++) {
                if (this.canCastle(sideType, castleType)) {
                    isCastling = true;
                    let char = "";
                    switch (castleType) {
                        case CastleType_1.CastleType.KING_SIDE:
                            char = ChessEngine.sideTypePieceTypeToFenChar(sideType, PieceType_1.PieceType.KING);
                            break;
                        case CastleType_1.CastleType.QUEEN_SIDE:
                            char = ChessEngine.sideTypePieceTypeToFenChar(sideType, PieceType_1.PieceType.QUEEN);
                            break;
                    }
                    let rookOriginSquare = this.getRookOriginCastle(sideType, castleType);
                    let cmpFunction = (castleType, rookFileNumber, rookOriginFileNumber) => {
                        let ret = false;
                        switch (castleType) {
                            case CastleType_1.CastleType.KING_SIDE:
                                if (rookFileNumber > rookOriginFileNumber) {
                                    ret = true;
                                }
                                break;
                            case CastleType_1.CastleType.QUEEN_SIDE:
                                if (rookFileNumber < rookOriginFileNumber) {
                                    ret = true;
                                }
                                break;
                        }
                        return ret;
                    };
                    let rookSquares = this.getSquaresBySideTypePieceType(sideType, PieceType_1.PieceType.ROOK);
                    for (let i = 0; i < rookSquares.length; i++) {
                        let rookSquare = rookSquares[i];
                        if (rookOriginSquare != null) {
                            if (rookSquare.y == rookOriginSquare.y) {
                                if (cmpFunction(castleType, rookSquare.x, rookOriginSquare.x)) {
                                    char = ChessEngine.convertFileNumberToFile(rookOriginSquare.x);
                                    if (sideType == SideType_1.SideType.WHITE) {
                                        char = char.toUpperCase();
                                    }
                                }
                            }
                        }
                    }
                    fenStr += char;
                }
            }
        }
        if (!isCastling) {
            fenStr += "-";
        }
        fenStr += " ";
        //Deal with en passant
        if (this.enPassantSquare == null) {
            fenStr += "-";
        }
        else if (this.enPassantSquare != null) {
            let fileNumber = this.enPassantSquare.x;
            let file = ChessEngine.convertFileNumberToFile(fileNumber);
            let rank = this.enPassantSquare.y;
            fenStr += file.toString() + rank.toString();
        }
        fenStr += " ";
        //Deal with the half move clock
        fenStr += this.halfMoveClockVector[this.halfMoveClockVector.length - 1].toString();
        fenStr += " ";
        //Deal with the full move number
        fenStr += this.moveNumber.toString();
        return fenStr;
    }
    getSanMoves() {
        return this.sanMoves;
    }
    getFirstSanMove() {
        return this.sanMoves[0];
    }
    getLastSanMove() {
        return this.sanMoves[this.sanMoves.length - 1];
    }
    getUCIMoves() {
        return this.uciMoves;
    }
    getFirstUCIMove() {
        return this.uciMoves[0];
    }
    getLastUCIMove() {
        return this.uciMoves[this.uciMoves.length - 1];
    }
    getFenStrs() {
        return this.fenStrings;
    }
    getFirstFenStr() {
        return this.fenStrings[0];
    }
    getLastFenStr() {
        return this.fenStrings[this.fenStrings.length - 1];
    }
}
exports.ChessEngine = ChessEngine;
//# sourceMappingURL=ChessEngine.js.map