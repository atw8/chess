import {SideType} from "./SideType";
import {PieceType} from "./PieceType";
import {PieceModel} from "./PieceModel";
import {AbstractEngine} from "./AbstractEngine";
import {FileRank} from "./FileRank";
import {ChessGameStateEnum} from "./ChessGameStateEnum";
import {ChessGameResultEnum} from "./ChessGameResultEnum";
import {MoveClass} from "./MoveClass";
import {Fairy} from "./Fairy/Fairy";
import {FairyStupid} from "./Fairy/FairyStupid";
import {FairyLeaper} from "./Fairy/FairyLeaper";
import {FairyRider} from "./Fairy/FairyRider";
import {CastleType} from "./CastleType";
import {WinStateEnum} from "./WinStateEnum";


export namespace ChessEngine {
    export interface PromotionStruct {
        "isPromotion" : boolean;
        "promotionPieceModel" ?: PieceModel.Interface;
    }

    export interface CastlingStruct {
        "isCastling" : boolean;
        "sideType" ?: SideType;
        "castleType" ?: CastleType;
    }

    export interface TwoPawnMoveStruct {
        "isTwoPawn" : boolean;
        "enPassantSquare" ?: FileRank
    }
}

function getSanMoveAnnotationExpr():string {
    return "([\#\+\!\?]*)";
}
function getSanMovePiecePatternRegExp():RegExp{
    let pieceType = "([NBRQK])?";
    let fileFrom = "([a-h])?";
    let rankFrom = "([1-8])?";
    let isCapture = "(x)?";
    let fileRankTo = "([a-h][1-8])";
    let promotionPieceType = "(?:=([NBRQ]))?";

    let str = "^"  + pieceType + fileFrom + rankFrom + isCapture + fileRankTo + promotionPieceType + getSanMoveAnnotationExpr() + "$";
    let sanMovePiecePatternRegExp = new RegExp(str);

    return sanMovePiecePatternRegExp;
}
function getSanMoveKingCastleRegExp():RegExp{
    return new RegExp("^O-O" + getSanMoveAnnotationExpr() + "$");
}
function getSanMoveQueenCastleRegExp():RegExp{
    return new RegExp("^O-O-O" + getSanMoveAnnotationExpr() + "$");

}

function getFenStrRegExp():RegExp{
    let piecePlacementStr = "((?:[pnbrqkPNBRQK12345678]+\/){7}[pnbrqkPNBRQK12345678]+)";
    let sideTypeStr = "([wb])";
    let castlingStr = "((?:[KABCDEFGH]?[QABCDEFGH]?[kabcdefgh]?[qabcdefgh]?)|-)";
    let enPassantStr = "((?:[abcdefgh][12345678])|-)";
    let halfMoveStr = "(\\d+)";
    let moveNumberStr = "(\\d+)";


    let str = "^" + piecePlacementStr + " " + sideTypeStr + " " + castlingStr + " " + enPassantStr + " " + halfMoveStr + " " + moveNumberStr + "$";
    let fenStrRegExp = new RegExp(str);

    return fenStrRegExp;
}
function getFenStrRowRegExp():RegExp{
    return new RegExp("[pnbrqkPNBRQK12345678]+", "g");
}

function getUciMoveRegExp():RegExp{
    return new RegExp("^([a-h][1-8])([a-h][1-8])([nbrq])?$");
}



export class ChessEngine extends  AbstractEngine {
    public initParam : {isChess960 : boolean, beginFenStr : string, isAskDraw : boolean};

    private captureFairy:{ [key in SideType] : { [key in PieceType] : Fairy}};
    private normalFairy : { [key in SideType] : { [key in PieceType] : Fairy}};
    private pawn2MoveFairy : { [key in SideType] : Fairy};

    private moveTurn : SideType;

    private halfMoveClockVector : number[];
    private moveNumber : number;

    private fenStrKingOriginFileNumber : { [key in SideType] : number | null}; //key is the sideType
    private fenStrRookOriginFileNumber : { [key in SideType] : { [key in CastleType] : number | null} }; //key is the sideType, castleType


    private fenStrCastling : { [key in SideType] : { [key in CastleType] : boolean} };
    private enPassantSquare : FileRank | null;

    private fenStrings : string[];
    private uciMoves : string[];
    private sanMoves : string[];

    private fenStrEnPassant : FileRank | null;



    private m_gameState : ChessGameStateEnum;
    public m_isLoseByTime : { [key in SideType] : boolean};
    public m_isResign : { [key in SideType] : boolean};
    public m_isForfeit : { [key in SideType] : boolean};
    public m_askForDraw : { [key in SideType] : boolean};

    private static uciMoveRegExp : RegExp = getUciMoveRegExp();


    public static sanMovePiecePatternRegExp : RegExp = getSanMovePiecePatternRegExp();
    public static sanMoveKingCastleRegExp : RegExp = getSanMoveKingCastleRegExp();
    public static sanMoveQueenCastleRegExp : RegExp = getSanMoveQueenCastleRegExp();

    public static fenStrRegExp : RegExp = getFenStrRegExp();
    public static fenStrRowRegExp : RegExp = getFenStrRowRegExp();


    public static getNumOfFiles():number{
        return 8;
    }
    public static getNumOfRanks():number{
        return 8;
    }
    public static getHashForFileRank(fileRank: FileRank): number {
        return (fileRank.y - 1) * ChessEngine.getNumOfFiles() + (fileRank.x - 1);
    }
    public static getFileRankForHash(hash: number): FileRank {
        let fileNumber = (hash % ChessEngine.getNumOfFiles());
        let rank = (hash - fileNumber) / ChessEngine.getNumOfFiles();

        fileNumber = fileNumber + 1;
        rank = rank + 1;

        return new FileRank(fileNumber, rank);
    }
    public static isFileRankLegal(pos : FileRank) : boolean{
        return ( pos.x >= 1 && pos.x <= ChessEngine.getNumOfFiles() && pos.y >= 1 && pos.y <= ChessEngine.getNumOfRanks() );
    }
    public static getClosestLegalFileRank(inFileRank : FileRank, outFileRank ?: FileRank): FileRank {
        if(outFileRank == undefined){
            outFileRank =  inFileRank.clone();
        }

        outFileRank.x = Math.max(1, Math.min(ChessEngine.getNumOfFiles(), inFileRank.x));
        outFileRank.y = Math.max(1, Math.min(ChessEngine.getNumOfRanks(), inFileRank.y));

        return outFileRank;
    }



    /*
            generateSan : boolean;
        generateUCI : boolean;
        generateFenStr : boolean;
     */
    constructor(initParam : {isChess960 ?: boolean, beginFenStr ?: string, isAskDraw : boolean}){
        super(ChessEngine.getNumOfFiles(), ChessEngine.getNumOfRanks(),[PieceType.PAWN, PieceType.KNIGHT, PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN, PieceType.KING], [SideType.WHITE, SideType.BLACK]);

        this.initGlobal();
        this.init(initParam);
    }



    public initGlobal(){
        // @ts-ignore
        this.captureFairy = {};
        // @ts-ignore
        this.captureFairy[SideType.WHITE] = {};
        // @ts-ignore
        this.captureFairy[SideType.BLACK] = {};

        // @ts-ignore
        this.normalFairy = {};
        // @ts-ignore
        this.normalFairy[SideType.WHITE] = {};
        // @ts-ignore
        this.normalFairy[SideType.BLACK] = {};

        //IMPLEMENT THE PAWN FAIRY
        {
            let blackPawnNormalFairy = new FairyLeaper();
            let blackPawnCaptureFairy = new FairyLeaper();
            let whitePawnNormalFairy = new FairyLeaper();
            let whitePawnCaptureFairy = new FairyLeaper();

            blackPawnNormalFairy.addVector(new FileRank(0, -1));
            whitePawnNormalFairy.addVector(new FileRank(0, 1));

            blackPawnCaptureFairy.addVector(new FileRank(-1, -1));
            blackPawnCaptureFairy.addVector(new FileRank(1, -1));

            whitePawnCaptureFairy.addVector(new FileRank(-1, 1));
            whitePawnCaptureFairy.addVector(new FileRank(1, 1));

            this.normalFairy[SideType.WHITE][PieceType.PAWN] = whitePawnNormalFairy;
            this.normalFairy[SideType.BLACK][PieceType.PAWN] = blackPawnNormalFairy;

            this.captureFairy[SideType.WHITE][PieceType.PAWN] = whitePawnCaptureFairy;
            this.captureFairy[SideType.BLACK][PieceType.PAWN] = blackPawnCaptureFairy;
        }


        //IMPLEMENT THE KNIGHT FAIRY
        {
            let knightFairy = new FairyLeaper();
            knightFairy.addVector(new FileRank(1, 2));
            knightFairy.addVector(new FileRank(2, 1));
            knightFairy.addVector(new FileRank(2, -1));
            knightFairy.addVector(new FileRank(1, -2));
            knightFairy.addVector(new FileRank(-1, -2));
            knightFairy.addVector(new FileRank(-2, -1));
            knightFairy.addVector(new FileRank(-2, 1));
            knightFairy.addVector(new FileRank(-1, 2));

            this.captureFairy[SideType.WHITE][PieceType.KNIGHT] = knightFairy;
            this.captureFairy[SideType.BLACK][PieceType.KNIGHT] = knightFairy;

            this.normalFairy[SideType.WHITE][PieceType.KNIGHT] = knightFairy;
            this.normalFairy[SideType.BLACK][PieceType.KNIGHT] = knightFairy;
        }


        //IMPLEMENT THE BISHOP FAIRY
        {
            let bishopFairy = new FairyRider();
            bishopFairy.addVector(new FileRank(1,1));
            bishopFairy.addVector(new FileRank(1,-1));
            bishopFairy.addVector(new FileRank(-1, -1));
            bishopFairy.addVector(new FileRank(-1, 1));

            this.captureFairy[SideType.WHITE][PieceType.BISHOP] = bishopFairy;
            this.captureFairy[SideType.BLACK][PieceType.BISHOP] = bishopFairy;

            this.normalFairy[SideType.WHITE][PieceType.BISHOP] = bishopFairy;
            this.normalFairy[SideType.BLACK][PieceType.BISHOP] = bishopFairy ;
        }


        //IMPLEMENT THE ROOK FAIRY
        {
            let rookFairy = new FairyRider();
            rookFairy.addVector(new FileRank(1, 0));
            rookFairy.addVector(new FileRank(0, -1));
            rookFairy.addVector(new FileRank(-1, 0));
            rookFairy.addVector(new FileRank(0, 1));

            this.captureFairy[SideType.WHITE][PieceType.ROOK] = rookFairy;
            this.captureFairy[SideType.BLACK][PieceType.ROOK] = rookFairy;

            this.normalFairy[SideType.WHITE][PieceType.ROOK] = rookFairy;
            this.normalFairy[SideType.BLACK][PieceType.ROOK] = rookFairy;
        }


        //IMPLEMENT THE QUEEN FAIRY
        {
            let queenFairy = new FairyRider();
            queenFairy.addVector(new FileRank(1, 1));
            queenFairy.addVector(new FileRank(1, -1));
            queenFairy.addVector(new FileRank(-1, -1));
            queenFairy.addVector(new FileRank(-1, 1));

            queenFairy.addVector(new FileRank(1, 0));
            queenFairy.addVector(new FileRank(0, -1));
            queenFairy.addVector(new FileRank(-1, 0));
            queenFairy.addVector(new FileRank(0, 1));

            this.captureFairy[SideType.WHITE][PieceType.QUEEN] = queenFairy;
            this.captureFairy[SideType.BLACK][PieceType.QUEEN] = queenFairy;

            this.normalFairy[SideType.WHITE][PieceType.QUEEN] = queenFairy;
            this.normalFairy[SideType.BLACK][PieceType.QUEEN] = queenFairy;
        }


        //IMPLEMENT THE KING FAIRY
        {
            let kingFairy = new FairyLeaper();
            kingFairy.addVector(new FileRank(1, 1));
            kingFairy.addVector(new FileRank(1, -1));
            kingFairy.addVector(new FileRank(-1, -1));
            kingFairy.addVector(new FileRank(-1, 1));

            kingFairy.addVector(new FileRank(1, 0));
            kingFairy.addVector(new FileRank(0, -1));
            kingFairy.addVector(new FileRank(-1, 0));
            kingFairy.addVector(new FileRank(0, 1));

            this.captureFairy[SideType.WHITE][PieceType.KING] = kingFairy;
            this.captureFairy[SideType.BLACK][PieceType.KING] = kingFairy;

            this.normalFairy[SideType.WHITE][PieceType.KING] = kingFairy;
            this.normalFairy[SideType.BLACK][PieceType.KING] = kingFairy;
        }


        //IMPLEMENT THE PAWN MOVE BY TWO FAIRY
        {
            // @ts-ignore
            this.pawn2MoveFairy = {};

            let whiteFairyStupid = new FairyStupid();
            whiteFairyStupid.addVector({ "vec" : new FileRank(0, 2) , "emptyVec" : [new FileRank(0, 1)]});

            this.pawn2MoveFairy[SideType.WHITE] = whiteFairyStupid;


            let blackFairyStupid = new FairyStupid();
            blackFairyStupid.addVector( {"vec" : new FileRank(0, -2), "emptyVec" : [new FileRank(0, -1)]});

            this.pawn2MoveFairy[SideType.BLACK] = blackFairyStupid;
        }

    };



    public setMoveTurn(moveTurn : SideType){
        this.moveTurn = moveTurn;
    };
    public getMoveTurn() : SideType{
        return this.moveTurn;
    };
    public static getOppositeSideType(sideType : SideType) : SideType{
        let ret;

        switch (sideType){
            case SideType.WHITE:
                ret = SideType.BLACK;
                break;
            case SideType.BLACK:
                ret = SideType.WHITE;
                break;
        }


        return <SideType>ret;
    };



    public outit(){
        super.outit();

        this.halfMoveClockVector = [];
        this.halfMoveClockVector.push(0);

        this.moveNumber = 1;

        // @ts-ignore
        this.fenStrCastling = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            // @ts-ignore
            this.fenStrCastling[sideType] = {};
            for(let castleType = CastleType.FIRST_CASTLE; castleType <= CastleType.LAST_CASTLE; castleType++){
                this.fenStrCastling[sideType][castleType] = false;
            }
        }

        // @ts-ignore
        this.fenStrKingOriginFileNumber = {};
        // @ts-ignore
        this.fenStrRookOriginFileNumber = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.fenStrKingOriginFileNumber[sideType] = null;
            // @ts-ignore
            this.fenStrRookOriginFileNumber[sideType] = {};
            for(let castleType = CastleType.FIRST_CASTLE; castleType <= CastleType.LAST_CASTLE; castleType++){
                this.fenStrRookOriginFileNumber[sideType][castleType] = null;
            }
        }


        this.enPassantSquare = null;

        this.setMoveTurn(SideType.WHITE);

        this.uciMoves = [];
        this.sanMoves = [];
        this.fenStrings = [];
    }



    public static getColorTypeForFileRank(fileRank : FileRank):SideType{
        let fileNumber = fileRank.x;
        let rank = fileRank.y;

        let colorType: SideType;
        if ((fileNumber + rank) % 2 == 0) {
            colorType = SideType.BLACK;
        } else {
            colorType = SideType.WHITE;
        }

        return colorType;
    }

    public updateEnPassantSquare(){
        this.enPassantSquare = null;
        if(this.moveClasses.length === 0){
            this.enPassantSquare = this.fenStrEnPassant;
        }else {
            let isLastMoveTwoPawnMove = ChessEngine.isTwoPawnMove(this.moveClasses[this.moveClasses.length - 1]);

            if(isLastMoveTwoPawnMove.isTwoPawn){
                this.enPassantSquare = <FileRank>isLastMoveTwoPawnMove["enPassantSquare"];
            }

        }
    }








    public init(_initParam : {isChess960 ?: boolean, beginFenStr ?: string, isAskDraw : boolean}){
        let initParam : {isChess960 ?: boolean, beginFenStr ?: string, isAskDraw : boolean} =
            {isChess960 : _initParam.isChess960, beginFenStr : _initParam.beginFenStr, isAskDraw : _initParam.isAskDraw};

        if(initParam["isChess960"] == undefined){
            initParam["isChess960"] = false;
        }

        if(initParam["isChess960"]){
            if(initParam["beginFenStr"] == undefined){
                let beginArray : { [key : number] : PieceType } = {};

                let getRandFileNumber = () => {
                    let ret : number;
                    do {
                        ret = Math.floor(Math.random()*ChessEngine.getNumOfFiles() ) + 1;
                    }while(beginArray[ret] != undefined);


                    return ret;
                };


                let bishop1Square : number = getRandFileNumber();
                let bishop1ColorType = ChessEngine.getColorTypeForFileRank(new FileRank(bishop1Square, 1));
                beginArray[bishop1Square] = PieceType.BISHOP;

                let bishop2Square : number;
                let bishop2ColorType : SideType;
                do {
                    bishop2Square = getRandFileNumber();
                    bishop2ColorType = ChessEngine.getColorTypeForFileRank(new FileRank(bishop2Square, 1));
                }while(bishop1ColorType == bishop2ColorType);
                beginArray[bishop2Square] = PieceType.BISHOP;

                beginArray[getRandFileNumber()] = PieceType.KNIGHT;
                beginArray[getRandFileNumber()] = PieceType.KNIGHT;
                beginArray[getRandFileNumber()] = PieceType.QUEEN;


                let rook1Square : number = -1;
                for(let i = 1; i <= ChessEngine.getNumOfFiles() && rook1Square == -1; i++){
                    if(beginArray[i] == undefined){
                        rook1Square = i;
                    }
                }
                beginArray[rook1Square] = PieceType.ROOK;

                let rook2Square : number = -1;
                for(let i = ChessEngine.getNumOfFiles(); i >= 1 && rook2Square == -1; i--){
                    if(beginArray[i] == undefined){
                        rook2Square = i;
                    }
                }
                beginArray[rook2Square] = PieceType.ROOK;

                beginArray[getRandFileNumber()] = PieceType.KING;

                let beginFenStr = "";
                for(let i = 1; i <= ChessEngine.getNumOfFiles(); i++){
                    beginFenStr += ChessEngine.convertPieceModelToFenChar({sideType : SideType.BLACK, pieceType : beginArray[i]});
                }
                beginFenStr += "/pppppppp/8/8/8/8/PPPPPPPP/";
                for(let i = 1; i <= ChessEngine.getNumOfFiles(); i++){
                    beginFenStr += ChessEngine.convertPieceModelToFenChar({sideType : SideType.WHITE, pieceType : beginArray[i]});
                }
                beginFenStr += " w KQkq - 0 1";

                initParam["beginFenStr"] = beginFenStr;
            }
        }else {
            if(initParam["beginFenStr"] == undefined){
                initParam["beginFenStr"] = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
            }
        }
        this.initParam = <{isChess960 : boolean, beginFenStr : string, isAskDraw : boolean}>initParam;

        this.outit();
        //SET THE KINGS TO ROYAL PIECES
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.setPieceToRoyal(sideType, PieceType.KING);
        }



        let fenStrResult : RegExpExecArray | null = ChessEngine.fenStrRegExp.exec(this.initParam["beginFenStr"]);
        if(fenStrResult == null){
            return;
        }



        //set the board from fenString
        {
            let piecePlacementStr = fenStrResult[1];


            let regexMatch = <RegExpMatchArray>piecePlacementStr.match(ChessEngine.fenStrRowRegExp);

            for(let i = 0; i < regexMatch.length; i++){
                let rank = this.getNumOfRanks() - i;

                let fileNumber = 1;
                for(let j = 0; j < regexMatch[i].length; j++){
                    let c = regexMatch[i][j];

                    let piece = ChessEngine.convertFenCharToPieceModel(c);
                    if(piece != null){
                        let fileRank = new FileRank(fileNumber, rank);

                        this.setPieceForFileRank(fileRank, piece);
                        fileNumber += 1;
                    }else {
                        fileNumber += parseInt(c);

                    }
                }
            }
        }


        //set the moveturn from the fenString
        if(fenStrResult[2] === "w"){
            this.setMoveTurn(SideType.WHITE);
        }else if(fenStrResult[2] === "b"){
            this.setMoveTurn(SideType.BLACK);
        }



        //set the castling rights from the fenString
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let squares = this.getSquaresBySideTypePieceType(sideType, PieceType.KING);
            if(squares.length == 1){
                this.fenStrKingOriginFileNumber[sideType] = squares[0].x;
            }
        }




        for(let i = 0; i < fenStrResult[3].length; i++){
            let c = fenStrResult[3][i];

            if(c == "-"){
                continue;
            }

            let sType : SideType | null = null;
            let cType : CastleType | null = null;


            let pieceSet : PieceType[] = [PieceType.KING, PieceType.QUEEN];
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                for(let i = 0; i < pieceSet.length; i++){
                    let pType = pieceSet[i];
                    if(c == ChessEngine.convertPieceModelToFenChar({sideType : sideType, pieceType : pType})){
                        sType = sideType;
                        if(pType == PieceType.KING){
                            cType = CastleType.KING_SIDE;
                        }else if(pType == PieceType.QUEEN){
                            cType = CastleType.QUEEN_SIDE;
                        }
                    }
                }
            }

            if(sType == null || cType == null){
                let fileNumber = ChessEngine.convertFileToFileNumber(c.toLowerCase());
                if(fileNumber == null){
                    continue;
                }

                let sideType : SideType = c.toLowerCase() != c ? SideType.WHITE : SideType.BLACK;

                let fenStrKingOriginFileNumber = this.fenStrKingOriginFileNumber[sideType];

                if(fenStrKingOriginFileNumber == null){
                    continue;
                }

                let castleType: CastleType;
                if(fileNumber < fenStrKingOriginFileNumber){
                    castleType = CastleType.QUEEN_SIDE;
                }else if(fileNumber > fenStrKingOriginFileNumber){
                    castleType = CastleType.KING_SIDE;
                }else {
                    continue;
                }

                sType = sideType;
                cType = castleType;
                this.fenStrRookOriginFileNumber[sType][cType] = fileNumber;
            }


            if(sType != null && cType != null){
                this.fenStrCastling[sType][cType] = true;
            }


            if(this.fenStrCastling[sType][cType]){
                if(this.fenStrRookOriginFileNumber[sType][cType] == null){
                    let rookSquares = this.getSquaresBySideTypePieceType(sType, PieceType.ROOK);
                    let fileNumber : number | null = null;
                    for(let i = 0; i < rookSquares.length; i++){
                        let rookSquare : FileRank = rookSquares[i];
                        if(rookSquare.y == this.getRookOriginRank(sType)){
                            if(fileNumber == null){
                                fileNumber = rookSquares[i].x;
                            }else {
                                if(cType == CastleType.QUEEN_SIDE){
                                    fileNumber = Math.min(fileNumber, rookSquares[i].x);
                                }else if(cType == CastleType.KING_SIDE){
                                    fileNumber = Math.max(fileNumber, rookSquares[i].x);
                                }
                            }
                        }

                    }

                    this.fenStrRookOriginFileNumber[sType][cType] = fileNumber;
                }
            }
        }


        //Set the en passant fileRank from the fenString
        if(fenStrResult[4] == "-"){
            this.fenStrEnPassant = null;
        }else {
            this.fenStrEnPassant = <FileRank>ChessEngine.convertFileRankStrToFileRank(fenStrResult[4]);
        }


        //set the half move clock vector from the fenstring
        this.halfMoveClockVector = [];
        this.halfMoveClockVector.push(parseInt(fenStrResult[5]));

        //set the full move number from the fenstring
        this.moveNumber = parseInt(fenStrResult[6]);









        this.updateEnPassantSquare();


        this.fenStrings.push(this.getFenStrFromCurrentBoard());



        // @ts-ignore
        this.m_isLoseByTime = {};
        // @ts-ignore
        this.m_isResign = {};
        // @ts-ignore
        this.m_isForfeit = {};
        // @ts-ignore
        this.m_askForDraw = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.m_isLoseByTime[sideType] = false;
            this.m_isResign[sideType] = false;
            this.m_isForfeit[sideType] = false;
            this.m_askForDraw[sideType] = false;
        }





        this.m_gameState = ChessGameStateEnum.NORMAL;
        this.updateGameState();
    };



    public getIsForfeit(sideType : SideType) : boolean{
        return this.m_isForfeit[sideType];
    }
    public setIsForfeit(sideType : SideType, isForfeit : boolean){
        if(this.m_isForfeit[sideType] == isForfeit){
            return;
        }

        this.m_isForfeit[sideType] = isForfeit;
        this.updateGameState();
    }

    public getIsLoseByTime(sideType : SideType) : boolean{
        return this.m_isLoseByTime[sideType];
    }
    public setIsLoseByTime(sideType : SideType, isLose : boolean){
        if(this.m_isLoseByTime[sideType] == isLose){
            return;
        }
        this.m_isLoseByTime[sideType] = isLose;
        this.updateGameState();
    }

    public getIsResign(sideType : SideType) : boolean{
        return this.m_isResign[sideType];
    }
    public setIsResign(sideType : SideType, isResign : boolean){
        if(this.m_isResign[sideType] == isResign){
            return;
        }
        this.m_isResign[sideType] = isResign;
        this.updateGameState();
    }

    public getIsAskForDraw(sideType : SideType) : boolean{
        return this.m_askForDraw[sideType];
    }
    public setIsAskForDraw(sideType : SideType, isAskForDraw : boolean){
        if(this.m_askForDraw[sideType] == isAskForDraw){
            return;
        }
        this.m_askForDraw[sideType] = isAskForDraw;
        this.updateGameState();
    }




    public isCheck():boolean{
        let isCheck : boolean = false;

        let royalSquares = this.getRoyalPieceSquares(this.getMoveTurn());

        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        for(let i = 0; i < royalSquares.length; i++){
            let royalSquare = royalSquares[i];
            if(this.hasAllPossibleMoves(royalSquare)){
                isCheck = true;
            }
        }
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

        return isCheck;
    }
    public getGameState():ChessGameStateEnum{
        return this.m_gameState
    }
    public updateGameState(){
        this.m_gameState = ChessGameStateEnum.NORMAL;

        let hasLegalMoves = this.hasAllLegalMoves(null, false);
        if(!hasLegalMoves){
            if(this.isCheck()){
                if(this.getMoveTurn() === SideType.WHITE){
                    this.m_gameState = ChessGameStateEnum.BLACK_WIN_CHECKMATE
                }else if(this.getMoveTurn() === SideType.BLACK){
                    this.m_gameState = ChessGameStateEnum.WHITE_WIN_CHECKMATE
                }
            }else {
                this.m_gameState = ChessGameStateEnum.DRAW_STALEMATE
            }
        }else if(this.isDrawByInsufficientMaterial()){
            this.m_gameState = ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL;
        }else if(this.isDrawByRepetition(5)) {
            this.m_gameState = ChessGameStateEnum.DRAW_FIVEFOLD_REPETITION;
        }else if(this.isDrawByNMoves(75)){
            this.m_gameState = ChessGameStateEnum.DRAW_75MOVES;
        }else if(this.getIsLoseByTime(SideType.WHITE)){
            this.m_gameState = ChessGameStateEnum.BLACK_WIN_TIME;
        }else if(this.getIsLoseByTime(SideType.BLACK)){
            this.m_gameState = ChessGameStateEnum.WHITE_WIN_TIME;
        }else if(this.getIsResign(SideType.WHITE)){
            this.m_gameState = ChessGameStateEnum.BLACK_WIN_RESIGN;
        }else if(this.getIsResign(SideType.BLACK)){
            this.m_gameState = ChessGameStateEnum.WHITE_WIN_RESIGN;
        }else if(this.getIsForfeit(SideType.WHITE)){
            this.m_gameState = ChessGameStateEnum.BLACK_WIN_FORFEIT;
        }else if(this.getIsForfeit(SideType.BLACK)){
            this.m_gameState = ChessGameStateEnum.WHITE_WIN_FORFEIT;
        }else if(this.getIsAskForDraw(SideType.WHITE) || this.getIsAskForDraw(SideType.BLACK) || this.initParam.isAskDraw){
            if(this.getIsAskForDraw(SideType.WHITE) && this.getIsAskForDraw(SideType.BLACK)){
                this.m_gameState = ChessGameStateEnum.DRAW_AGREEMENT;
            }else if(this.isDrawByNMoves(50)){
                this.m_gameState = ChessGameStateEnum.DRAW_50MOVES;
            }else if(this.isDrawByRepetition(3)){
                this.m_gameState = ChessGameStateEnum.DRAW_THREEFOLD_REPETITION;
            }
        }

    }

    public static getGameResultForGameState(chessGameState : ChessGameStateEnum):ChessGameResultEnum{
        let chessGameResult : ChessGameResultEnum = ChessGameResultEnum.NORMAL;

        switch(chessGameState) {
            case ChessGameStateEnum.NORMAL:
                chessGameResult = ChessGameResultEnum.NORMAL;
                break;
            case ChessGameStateEnum.WHITE_WIN_TIME:
            case ChessGameStateEnum.WHITE_WIN_CHECKMATE:
            case ChessGameStateEnum.WHITE_WIN_RESIGN:
            case ChessGameStateEnum.WHITE_WIN_FORFEIT:
                chessGameResult = ChessGameResultEnum.WHITE_WIN;
                break;
            case ChessGameStateEnum.BLACK_WIN_TIME:
            case ChessGameStateEnum.BLACK_WIN_CHECKMATE:
            case ChessGameStateEnum.BLACK_WIN_RESIGN:
            case ChessGameStateEnum.BLACK_WIN_FORFEIT:
                chessGameResult = ChessGameResultEnum.BLACK_WIN;
                break;
            case ChessGameStateEnum.DRAW_STALEMATE:
            case ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
            case ChessGameStateEnum.DRAW_50MOVES:
            case ChessGameStateEnum.DRAW_75MOVES:
            case ChessGameStateEnum.DRAW_THREEFOLD_REPETITION:
            case ChessGameStateEnum.DRAW_FIVEFOLD_REPETITION:
            case ChessGameStateEnum.DRAW_AGREEMENT:
                chessGameResult = ChessGameResultEnum.DRAW;
                break;
        }

        return chessGameResult;
    }
    public static getWinStateForGameStateAndSideType(chessGameState : ChessGameStateEnum, sideType : SideType):WinStateEnum{
        let chessGameResult = ChessEngine.getGameResultForGameState(chessGameState);
        return ChessEngine.getWinStateForGameResultAndSideType(chessGameResult, sideType);
    }
    public static getWinStateForGameResultAndSideType(chessGameResult : ChessGameResultEnum, sideType : SideType):WinStateEnum{
        let winState : WinStateEnum = WinStateEnum.NORMAL;
        switch(chessGameResult){
            case ChessGameResultEnum.NORMAL:
                winState = WinStateEnum.NORMAL;
                break;
            case ChessGameResultEnum.WHITE_WIN:
                switch(sideType){
                    case SideType.WHITE:
                        winState = WinStateEnum.ME_WIN;
                        break;
                    case SideType.BLACK:
                        winState = WinStateEnum.ME_LOSE;
                        break;
                }
                break;
            case ChessGameResultEnum.BLACK_WIN:
                switch(sideType){
                    case SideType.WHITE:
                        winState = WinStateEnum.ME_LOSE;
                        break;
                    case SideType.BLACK:
                        winState = WinStateEnum.ME_WIN;
                        break;
                }
                break;
            case ChessGameResultEnum.DRAW:
                break;
        }

        return winState;
    }







    //The logic here has to do with castling
    public canCastle(sideType : SideType, castleType : CastleType) : boolean{
        if(!this.fenStrCastling[sideType][castleType]){
            return false;
        }

        let kingOriginFileRank = this.getKingOriginCastle(sideType);
        if(kingOriginFileRank == null){
            return false;
        }

        let rookOriginFileRank : FileRank | null = this.getRookOriginCastle(sideType, castleType);
        if(rookOriginFileRank == null){
            return false;
        }


        let kingPiece = this.getPieceForFileRank(kingOriginFileRank);
        let rookPiece = this.getPieceForFileRank(rookOriginFileRank);

        if(kingPiece === null || rookPiece === null){
            return false;
        }

        let ret = true;
        ret = ret && (kingPiece.getPieceType() === PieceType.KING && kingPiece.getSideType() === sideType);
        ret = ret && (rookPiece.getPieceType() === PieceType.ROOK && rookPiece.getSideType() === sideType);
        ret = ret && (kingPiece.getNumOfTimesMoved() === 0);
        ret = ret && (rookPiece.getNumOfTimesMoved() === 0);

        return ret;
    }


    private getRookOriginFileNumber(sideType : SideType, castleType : CastleType):number | null{
        return this.fenStrRookOriginFileNumber[sideType][castleType];
    }
    private getRookOriginRank(sideType : SideType):number{
        let rank : number = -1;
        switch (sideType){
            case SideType.WHITE:
                rank = 1;
                break;
            case SideType.BLACK:
                rank = ChessEngine.getNumOfRanks();
                break;
        }

        return rank;
    }


    private getRookOriginCastle(sideType : SideType, castleType : CastleType): FileRank | null {
        let rookOriginFileNumber = this.getRookOriginFileNumber(sideType, castleType);
        let rookOriginRank = this.getRookOriginRank(sideType);

        if(rookOriginFileNumber == null || rookOriginRank == null){
            return null
        }

        return new FileRank(rookOriginFileNumber, rookOriginRank);
    }


    private getKingOriginFileNumber(sideType : SideType): number | null {
        return this.fenStrKingOriginFileNumber[sideType];
    }
    private getKingOriginRank(sideType : SideType):number{
        let rank : number = -1;
        switch(sideType){
            case SideType.WHITE:
                rank = 1;
                break;
            case SideType.BLACK:
                rank = ChessEngine.getNumOfRanks();
                break;
        }

        return rank;
    }

    private getKingOriginCastle(sideType : SideType): FileRank | null {
        let kingOriginFileNumber : number | null = this.getKingOriginFileNumber(sideType);
        let kingOriginRank : number = this.getKingOriginRank(sideType);
        if(kingOriginFileNumber == null){
            return null;
        }

        return new FileRank(kingOriginFileNumber, kingOriginRank);
    }

    public getKingDestCastle(sideType : SideType, castleType : CastleType) : FileRank{
        let fileNumber : number = -1;
        switch (castleType){
            case CastleType.KING_SIDE:
                fileNumber = 7;
                break;
            case CastleType.QUEEN_SIDE:
                fileNumber = 3;
                break;
        }

        let rank : number = -1;
        switch (sideType){
            case SideType.WHITE:
                rank = 1;
                break;
            case SideType.BLACK:
                rank = ChessEngine.getNumOfRanks();
                break;
        }


        return new FileRank(fileNumber, rank);
    }



    public getRookDestCastle(sideType : SideType, castleType : CastleType) : FileRank{
        let ret = new FileRank(0, 0);
        let kingDestFileRank = this.getKingDestCastle(sideType, castleType);

        if(castleType === CastleType.KING_SIDE){
            ret.x = kingDestFileRank.x - 1;
        }else if(castleType === CastleType.QUEEN_SIDE){
            ret.x = kingDestFileRank.x + 1;
        }

        ret.y = kingDestFileRank.y;

        return ret;
    }



    public doMoveSan(sanMove : string):boolean{
        let moveClass = this.getMoveClassForCurrentBoardAndSanMove(sanMove);
        if(moveClass !== null){
            this.doMove(moveClass, true, true);
        }

        return (moveClass !== null);
    }

    public doMoveUCI(uciMove : string):boolean{
        let moveClass = this.getMoveClassForUCIMove(uciMove);
        if(moveClass !== null){
            this.doMove(moveClass, true, true);
        }

        return (moveClass !== null);
    }


    public doMove(moveClass : MoveClass, generateData : boolean = true, updateGameState : boolean = true){
        super.doMove(moveClass);

        //Update the move number
        if(this.getMoveTurn() === SideType.BLACK){
            this.moveNumber = this.moveNumber + 1;
        }

        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

        //Figure out if the half move clock should be reset or incremented
        let resetHalfMoveClock = false;
        if(ChessEngine.isCaptureMove(moveClass) || ChessEngine.isMoveWithPieceType(moveClass, PieceType.PAWN)){
            resetHalfMoveClock = true;
        }

        if(resetHalfMoveClock){
            this.halfMoveClockVector.push(0);
        }else{
            this.halfMoveClockVector.push(this.halfMoveClockVector[this.halfMoveClockVector.length - 1] + 1);
        }

        //Figure out if an en passant square occured
        this.updateEnPassantSquare();

        if(updateGameState){
            this.updateGameState();
        }


        if(generateData){
            this.uciMoves.push(this.getUCIMoveForMoveClass(moveClass));

            this.sanMoves.push(this.getSANMoveForLastMoveClass());

            this.fenStrings.push(this.getFenStrFromCurrentBoard());
        }
    }

    public undoMove(generateData : boolean = true, updateGameState : boolean = true){
        super.undoMove();

        if(this.getMoveTurn() == SideType.WHITE){
            this.moveNumber = this.moveNumber - 1
        }

        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

        //Decrements the half move clock
        this.halfMoveClockVector.pop();

        //Figure out if an en passant square occured
        this.updateEnPassantSquare();

        if(updateGameState) {
            this.updateGameState();
        }


        if(generateData){
            this.uciMoves.pop();

            this.sanMoves.pop();

            this.fenStrings.pop();
        }
    }



    public isMoveLegal(moveClass : MoveClass, isCheckGameState : boolean):boolean{
        if(isCheckGameState){
            if(this.getGameState() != ChessGameStateEnum.NORMAL){
                return false;
            }
        }

        let isInFakeCheck = false;
        this.doMove(moveClass, false, false);

        let royalSquares = this.getRoyalPieceSquares(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        for(let i = 0; i < royalSquares.length; i++){
            let royalSquare = royalSquares[i];
            if(this.hasAllPossibleMoves(royalSquare)){
                isInFakeCheck = true;
            }
        }
        this.undoMove(false, false);

        let isCastlingIllegal = false;
        let isCastlingMove = this.isCastlingMove(moveClass);

        //isCastlingMove, sideType, castleType = self.isCastlingMove(moveClass)
        if(isCastlingMove.isCastling){
            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

            let kingOrigin = this.getKingOriginCastle(<SideType>isCastlingMove.sideType);
            let kingDest = this.getKingDestCastle(<SideType>isCastlingMove.sideType, <CastleType>isCastlingMove.castleType);
            let checkSquares = this.getFileRankList(<FileRank>kingOrigin, kingDest, true, true);
            for(let i = 0; i < checkSquares.length; i++){
                let checkSquare = checkSquares[i];
                if(this.hasAllPossibleMoves(checkSquare)){
                    isCastlingIllegal = true;
                }
            }

            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        }

        return !(isCastlingIllegal || isInFakeCheck);
    }






    public hasAllLegalMoves(destFileRank:FileRank | null, isCheckGameState : boolean):boolean{
        let moveTurn = this.getMoveTurn();

        for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; pieceType++){
            let squares = this.getSquaresBySideTypePieceType(moveTurn, pieceType);
            for(let j = 0; j < squares.length; j++){
                if(this.hasLegalMoves(squares[j], destFileRank, isCheckGameState)){
                    return true;
                }
            }
        }

        return false;
    }
    public getAllLegalMoves(destFileRank : FileRank | null, isCheckGameState : boolean) : MoveClass[]{
        let ret : MoveClass[] = [];

        let sideType = this.getMoveTurn();
        for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; pieceType++){
            let squares = this.getSquaresBySideTypePieceType(sideType, pieceType);
            for(let j = 0; j < squares.length; j++){
                ret = ret.concat(this.getLegalMoves(squares[j], destFileRank, isCheckGameState));
            }
        }

        return ret;
    }

    public hasLegalMoves(originFileRank : FileRank, destFileRank : FileRank | null, isCheckGameState : boolean) : boolean{
        let possibleMoves = this.getPossibleMoves(originFileRank, destFileRank);

        for(let i = 0; i < possibleMoves.length; i++){
            let possibleMove = possibleMoves[i];
            if(this.isMoveLegal(possibleMove, isCheckGameState)){
                return true;
            }
        }

        return false;
    }
    public getLegalMoves(originFileRank : FileRank, destFileRank : FileRank | null, isCheckGameState : boolean) : MoveClass[]{
        let ret = [];

        let possibleMoves = this.getPossibleMoves(originFileRank, destFileRank);

        for(let i = 0; i < possibleMoves.length; i++){
            let possibleMove = possibleMoves[i];

            if(this.isMoveLegal(possibleMove, isCheckGameState)){
                ret.push(possibleMove);
            }
        }

        return ret;
    }


    public hasAllPossibleMoves(destFileRank : FileRank | null):boolean{
        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];

        for(let pieceType in squarePieces){
            let squarePiece = squarePieces[pieceType];
            for(let i = 0; i < squarePiece.length; i++){
                let square = squarePiece[i];
                if(this.hasPossibleMoves(square, destFileRank)){
                    return true;
                }
            }
        }

        return false;
    }
    public getAllPossibleMoves(destFileRank : FileRank | null) : MoveClass[]{
        let ret : MoveClass[] = [];

        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];

        for(let pieceType in squarePieces){
            let squarePiece = squarePieces[pieceType];
            for(let i = 0; i < squarePiece.length; i++){
                let square = squarePiece[i];
                ret = ret.concat(this.getPossibleMoves(square, destFileRank));
            }
        }

        return ret;
    }

    public hasPossibleMoves(originFileRank : FileRank, destFileRank : FileRank | null):boolean{
        return this.getPossibleMoves(originFileRank, destFileRank).length > 0;
    }
    public getPossibleMoves(originFileRank : FileRank, destFileRank : FileRank | null):MoveClass[]{
        if(!this.isFileRankLegal(originFileRank)){
            return [];
        }

        let originPiece = this.getPieceForFileRank(originFileRank);

        if(originPiece === null){
            return [];
        }

        if(originPiece.getSideType() !== this.getMoveTurn()){
            return [];
        }

        let moveClasses : MoveClass[] = [];
        let fairyCapture = this.captureFairy[originPiece.getSideType()][originPiece.getPieceType()];
        let fairyNormal = this.normalFairy[originPiece.getSideType()][originPiece.getPieceType()];

        this.getCaptureNormalMovesForFairy(originFileRank, destFileRank, fairyCapture, fairyNormal, moveClasses);

        if(originPiece.getPieceType() === PieceType.PAWN){
            //First move can move by two
            this.dealWithTwoMove(moveClasses, originPiece, originFileRank, destFileRank);

            //En passant capture
            this.dealWithEnPassant(moveClasses, originPiece, originFileRank, destFileRank);

            //Promote pawns
            this.dealWithPawnPromotion(moveClasses);
        }else if(originPiece.getPieceType() === PieceType.KING){
            this.dealWithCastling(moveClasses, originPiece, originFileRank, destFileRank);
        }


        return moveClasses;
    }


    public hasAllVectorMoves(destFileRank : FileRank | null):boolean{
        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];

        for(let pieceType in squarePieces){
            let squarePiece = squarePieces[pieceType];
            for(let i = 0; i < squarePiece.length; i++){
                let square = squarePiece[i];
                if(this.hasVectorMoves(square, destFileRank)){
                    return true;
                }
            }
        }

        return false;
    }
    public getAllVectorMoves(destFileRank : FileRank | null):MoveClass[]{
        let squarePieces = this.getPieceToSquareMap()[this.getMoveTurn()];


        let ret : MoveClass[] = [];

        for(let pieceType in squarePieces){
            let squarePiece = squarePieces[pieceType];
            for(let i = 0; i < squarePiece.length; i++){
                let originFileRank = squarePiece[i];

                ret = ret.concat(this.getVectorMoves(originFileRank, destFileRank));
            }
        }

        return ret;
    }
    public hasVectorMoves(originFileRank : FileRank, destFileRank : FileRank | null){
        let vectorMoves = this.getVectorMoves(originFileRank, destFileRank);

        return vectorMoves.length > 0;
    }
    public getVectorMoves(originFileRank : FileRank, destFileRank : FileRank | null):MoveClass[]{
        if(!this.isFileRankLegal(originFileRank)){
            return [];
        }

        let originPiece = this.getPieceForFileRank(originFileRank);

        if(originPiece === null){
            return [];
        }

        if(originPiece.getSideType() !== this.getMoveTurn()){
            return [];
        }

        let moveClasses : MoveClass[] = [];

        let fairyCapture = this.captureFairy[originPiece.getSideType()][originPiece.getPieceType()];
        let fairyNormal = this.normalFairy[originPiece.getSideType()][originPiece.getPieceType()];

        if(fairyCapture == fairyNormal){
            this.getVectorMovesForFairy(originFileRank, destFileRank, fairyCapture, moveClasses);
        }else {
            this.getVectorMovesForFairy(originFileRank, destFileRank, fairyCapture, moveClasses);
            this.getVectorMovesForFairy(originFileRank, destFileRank, fairyNormal, moveClasses);
        }


        if(originPiece.getPieceType() == PieceType.PAWN){
            if(originPiece.getSideType() == SideType.WHITE && (originFileRank.y == 2)){
                this.getVectorMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType.WHITE], moveClasses)
            }else if(originPiece.getSideType() == SideType.BLACK && (originFileRank.y == this.getNumOfRanks() - 2 + 1)){
                this.getVectorMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType.BLACK], moveClasses)
            }
        }

        return moveClasses;
    }

    public dealWithTwoMove(moveClasses : MoveClass[], originPiece : PieceModel, originFileRank : FileRank, destFileRank : FileRank | null){
        if((originPiece.getSideType() === SideType.WHITE) && (originFileRank.y === 2)){
            this.getNormalMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType.WHITE], moveClasses);
        }else if((originPiece.getSideType() === SideType.BLACK) && (originFileRank.y === this.getNumOfRanks() - 2 + 1)){
            this.getNormalMovesForFairy(originFileRank, destFileRank, this.pawn2MoveFairy[SideType.BLACK], moveClasses);
        }
    }

    public dealWithEnPassant(moveClasses : MoveClass[], originPiece : PieceModel, originFileRank : FileRank, destFileRank : FileRank | null){
        if(this.enPassantSquare == null){
            return;
        }


        let pruneFileRankEnPassant : (fileRank : FileRank) => boolean = (fileRank :FileRank) =>{
            if(destFileRank != null){
                if(!FileRank.isEqual(destFileRank, fileRank)){
                    return false;
                }
            }

            if(!FileRank.isEqual(<FileRank>this.enPassantSquare, fileRank)){
                return false;
            }

            if(!this.isFileRankLegal(fileRank)){
                return false;
            }

            return this.getPieceForFileRank(fileRank) == null;
        };


        let enPassantMoveVectors = (<FairyLeaper>this.captureFairy[originPiece.getSideType()][originPiece.getPieceType()]).getVectors();
        let enPassantFileRanks : FileRank[] = [];
        for(let i = 0; i < enPassantMoveVectors.length; i++){
            let enPassantFileRank = FileRank.addFileRank(originFileRank, enPassantMoveVectors[i]);
            if(pruneFileRankEnPassant(enPassantFileRank)){
                enPassantFileRanks.push(enPassantFileRank);
            }
        }

        for(let i = 0; i < enPassantFileRanks.length; i++){
            let enPassantFileRank = enPassantFileRanks[i];

            let enPassantCaptureFileRank = new FileRank(enPassantFileRank.x, originFileRank.y);

            let enPassantCapturePiece = this.getPieceForFileRank(enPassantCaptureFileRank);



            let enPassantMoveClass = new MoveClass(originFileRank, enPassantFileRank);
            this.getMoveClassForMovePiece(originFileRank, enPassantFileRank, enPassantMoveClass);
            this.getMoveClassAddRemovePiece(enPassantCaptureFileRank, null, enPassantMoveClass);
            //let enPassantMoveClass = this.getMoveClassForMovePiece(originFileRank, enPassantFileRank);
            //this.getMoveClassForCapturePiece(enPassantCaptureFileRank, enPassantMoveClass);


            moveClasses.push(enPassantMoveClass);
        }
    }

    public dealWithPawnPromotion(moveClasses : MoveClass[]){
        let index = 0;


        while(index < moveClasses.length){
            let moveClass = moveClasses[index];
            let removeAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(true);




            if(removeAddMoveStruct.moveStructs.length == 1){
                let moveStruct = removeAddMoveStruct.moveStructs[0];


                let pieceType = moveStruct.destPiece.getPieceType();
                let sideType = moveStruct.destPiece.getSideType();

                let destFileRank = moveStruct.destFileRank;

                let addPromoteType = false;
                if(pieceType == PieceType.PAWN){
                    if(sideType == SideType.WHITE && destFileRank.y == this.getNumOfRanks()){
                        addPromoteType = true;
                    }else if(sideType == SideType.BLACK && destFileRank.y == 1){
                        addPromoteType = true;
                    }
                }

                if(addPromoteType){
                    let promotionPieceTypes = [];
                    promotionPieceTypes.push(PieceType.KNIGHT);
                    promotionPieceTypes.push(PieceType.BISHOP);
                    promotionPieceTypes.push(PieceType.ROOK);
                    promotionPieceTypes.push(PieceType.QUEEN);

                    moveClasses.splice(index, 1);

                    for(let j = 0; j < promotionPieceTypes.length; j++){
                        let promotionPieceType = promotionPieceTypes[j];


                        let moveClassClone = moveClass.clone();
                        this.getMoveClassAddRemovePiece(destFileRank, new PieceModel(promotionPieceType, sideType), moveClassClone);

                        moveClasses.splice(index, 0, moveClassClone);

                        index = index + 4;
                    }
                }else {
                    index = index + 1;
                }

            }else {
                index = index + 1;
            }

        }
    }





    public dealWithCastling(moveClasses : MoveClass[], kingPiece : PieceModel, kingOriginFileRank : FileRank, destFileRank : FileRank | null){
        let sideType = kingPiece.getSideType();

        for(let castleType = CastleType.FIRST_CASTLE; castleType <= CastleType.LAST_CASTLE; castleType++){


            if(this.canCastle(sideType, castleType)){
                let rookOriginFileRank = <FileRank>this.getRookOriginCastle(sideType, castleType);
                let rookDestFileRank = this.getRookDestCastle(sideType, castleType);

                let rookPiece = this.getPieceForFileRank(rookOriginFileRank);

                let kingDestFileRank = this.getKingDestCastle(sideType, castleType);

                let canAddCastleMove = true;

                if(destFileRank !== null){
                    if(this.initParam.isChess960){
                        canAddCastleMove = canAddCastleMove && (FileRank.isEqual(destFileRank, rookOriginFileRank));
                    }else {
                        canAddCastleMove = canAddCastleMove && (FileRank.isEqual(destFileRank, kingDestFileRank));
                    }

                }

                let inKingPieces = this.getPiecesFromFileRankToFileRank(kingOriginFileRank, kingDestFileRank, true, true);
                for(let i = 0; i < inKingPieces.length && canAddCastleMove; i++){
                    let piece = inKingPieces[i];
                    if( !(piece == kingPiece || piece == rookPiece) ){
                        canAddCastleMove = false;
                    }
                }
                let inRookPieces = this.getPiecesFromFileRankToFileRank(rookOriginFileRank, rookDestFileRank, true, true);
                for(let i = 0; i < inRookPieces.length && canAddCastleMove; i++){
                    let piece = inRookPieces[i];
                    if(!(piece == kingPiece || piece == rookPiece)){
                        canAddCastleMove = false;
                    }
                }

                if(canAddCastleMove){
                    let castleMove : MoveClass;
                    if(this.initParam.isChess960){
                        castleMove = new MoveClass(kingOriginFileRank, rookOriginFileRank);
                    }else {
                        castleMove = new MoveClass(kingOriginFileRank, kingDestFileRank);
                    }

                    let originDest : {originFileRank : FileRank, destFileRank : FileRank}[] = [];
                    originDest.push({originFileRank : kingOriginFileRank, destFileRank : kingDestFileRank});
                    originDest.push({originFileRank : rookOriginFileRank, destFileRank : rookDestFileRank});

                    this.getMoveClassForMovePieces(originDest, castleMove);


                    moveClasses.push(castleMove);
                }
            }
        }
    };



    public isDrawByInsufficientMaterial(){
        let activePieceMap : {[key : number] : FileRank[]}= {};
        for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; pieceType++){
            activePieceMap[pieceType] = this.getSquaresByPieceType(pieceType);
        }


        let isDraw = true;
        isDraw = isDraw && activePieceMap[PieceType.QUEEN].length === 0;
        isDraw = isDraw && activePieceMap[PieceType.ROOK].length === 0;
        isDraw = isDraw && activePieceMap[PieceType.PAWN].length === 0;

        //We are interested in the cases of knights and bishops
        if(isDraw){
            let onlyKings = activePieceMap[PieceType.KNIGHT].length === 0 && activePieceMap[PieceType.BISHOP].length === 0;
            let oneKnight = activePieceMap[PieceType.KNIGHT].length === 1 && activePieceMap[PieceType.BISHOP].length === 0;
            let sameColorBishops = activePieceMap[PieceType.KNIGHT].length === 0;

            if(sameColorBishops){
                let isModOne = false;
                let isModZero = false;

                let bishopSquares = this.getSquaresByPieceType(PieceType.BISHOP);
                for(let i = 0; i < bishopSquares.length; i++){
                    let bishopSquare = bishopSquares[i];

                    let squareMod = (bishopSquare.x + bishopSquare.y) % 2;

                    if(squareMod === 1){
                        isModOne = true;
                    }else if(squareMod === 0){
                        isModZero = true;
                    }
                }


                sameColorBishops = (isModOne && (!isModZero)) || ((!isModOne) && isModZero);
            }
            isDraw = onlyKings || oneKnight || sameColorBishops;
        }

        return isDraw;
    }


    public isDrawByNMoves(numOfMoves : number):boolean{
        return this.halfMoveClockVector[this.halfMoveClockVector.length - 1] >= 2 * numOfMoves;
    }


    public isDrawByRepetition(numOfRepetition : number):boolean{
        let lastFenStr = this.getLastFenStr();
        let lastSplitFenStr = lastFenStr.split(" ");

        let lastPiecePlacement = lastSplitFenStr[0];
        let lastMoveTurn = lastSplitFenStr[1];
        let lastCastling = lastSplitFenStr[2];
        let lastEnPassant = lastSplitFenStr[3];

        let numSame = 0;

        let fromFenStrIndex = this.fenStrings.length - 1;
        let toFenStrIndex = Math.max(0, this.fenStrings.length - 1 - this.halfMoveClockVector[this.halfMoveClockVector.length - 1]);
        for(let fenStrIndex = fromFenStrIndex; fenStrIndex >= toFenStrIndex; fenStrIndex--){
            let iterFenStr = this.fenStrings[fenStrIndex];
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

            if(isSame){
                numSame += 1;

                if(numSame >= numOfRepetition){
                    return true;
                }
            }
        }

        return false;
    }



    public getMoveClassForCurrentBoardAndSanMove(sanMove : string):MoveClass | null {
        let ret: MoveClass | null = null;

        let sideType = this.getMoveTurn();



        if(ChessEngine.sanMoveKingCastleRegExp.test(sanMove) || ChessEngine.sanMoveQueenCastleRegExp.test(sanMove)){
            let castleType : CastleType = CastleType.KING_SIDE;
            if(ChessEngine.sanMoveKingCastleRegExp.test(sanMove)){
                castleType = CastleType.KING_SIDE;
            }else if(ChessEngine.sanMoveQueenCastleRegExp.test(sanMove)){
                castleType = CastleType.QUEEN_SIDE;
            }



            let kingOrigin = <FileRank>this.getKingOriginCastle(sideType);
            let kingDest = this.getKingDestCastle(sideType, castleType);

            let legalMove = this.getLegalMoves(kingOrigin, kingDest, false);
            if (legalMove.length == 1) {
                ret = legalMove[0]
            }
        }else {
            let sanPatternResult = ChessEngine.sanMovePiecePatternRegExp.exec(sanMove);
            if(sanPatternResult == null){
                return null;
            }


            let pieceType : PieceType;
            {
                let _pieceType = sanPatternResult[1];

                if(_pieceType == undefined){
                    pieceType = PieceType.PAWN;
                }else {
                    pieceType = (<PieceModel>ChessEngine.convertFenCharToPieceModel(_pieceType)).pieceType;
                }
            }

            let fileNumberFrom : number | null = null;
            {
                let _fileFrom = sanPatternResult[2];
                if(_fileFrom != undefined){
                    fileNumberFrom = ChessEngine.convertFileToFileNumber(_fileFrom);
                }
            }

            let rankFrom : number | null = null;
            {
                let _rankFrom = sanPatternResult[3];
                if(_rankFrom != undefined){
                    rankFrom = parseInt(_rankFrom);
                }
            }

            let isCapture : boolean = sanPatternResult[4] != undefined;

            let fileRankTo = <FileRank> ChessEngine.convertFileRankStrToFileRank(sanPatternResult[5]);

            let promotionPieceType : PieceType | null = null;
            {
                let _promotionPieceType = sanPatternResult[6];
                if(_promotionPieceType != undefined){
                    promotionPieceType = (<PieceModel>ChessEngine.convertFenCharToPieceModel(_promotionPieceType)).pieceType;
                }
            }


            //Logic of getting the pieces
            let squarePieces : FileRank[] = this.getSquaresBySideTypePieceType(sideType, pieceType);
            let newSquarePieces : FileRank[] = [];

            for(let i = 0; i < squarePieces.length; i++){
                let squarePiece = squarePieces[i];

                let insertNewSquare = true;

                if(fileNumberFrom != null){
                    if(fileNumberFrom != squarePiece.x){
                        insertNewSquare = false;
                    }
                }

                if(rankFrom != null){
                    if(rankFrom != squarePiece.y){
                        insertNewSquare = false;
                    }
                }

                if(insertNewSquare){
                    newSquarePieces.push(squarePiece);
                }
            }

            squarePieces = newSquarePieces;


            let legalMoves : MoveClass[] = [];
            for(let i = 0; i < squarePieces.length; i++){
                let squarePiece = squarePieces[i];

                legalMoves = legalMoves.concat(this.getLegalMoves(squarePiece, fileRankTo, false));
            }


            if(promotionPieceType == null){
                if(legalMoves.length == 1){
                    ret = legalMoves[0];
                }
            }else {
                for(let i = 0; i < legalMoves.length; i++){
                    let legalMove = legalMoves[i];
                    let promotionStruct : ChessEngine.PromotionStruct = ChessEngine.isPromotionMove(legalMove);

                    if(promotionStruct.isPromotion){
                        if(promotionPieceType == (<PieceModel.Interface>promotionStruct.promotionPieceModel).pieceType){
                            ret = legalMove;
                        }
                    }
                }
            }

            if(legalMoves.length == 1){
                ret = legalMoves[0];
            }else {
                for(let i = 0; i < legalMoves.length; i++){
                    let moveClass = legalMoves[i];
                    let isPromotionMove : ChessEngine.PromotionStruct = ChessEngine.isPromotionMove(moveClass);

                    if(isPromotionMove.isPromotion){
                        if(promotionPieceType == (<PieceModel.Interface>isPromotionMove.promotionPieceModel).pieceType){
                            ret = moveClass;
                        }
                    }
                }
            }
        }

        return ret
    }


    public getSANMoveForCurrentBoardAndUCIMove(uciMove : string):string | null {
        let moveClass = this.getMoveClassForUCIMove(uciMove);
        if(moveClass == null){
            return null;
        }
        let sanMove = this.getSANMoveForCurrentBoardAndMoveClass(moveClass);

        return sanMove;
    }

    public getSANMovesForCurrentBoardAndMoveClasses(moveClasses : MoveClass[] | null):string[]{
        if(moveClasses == null){
            moveClasses = this.getAllLegalMoves(null, true);
        }
        let ret : string[] = [];
        for(let i = 0; i < moveClasses.length; i++){
            ret.push(this.getSANMoveForCurrentBoardAndMoveClass(moveClasses[i]));
        }

        return ret;
    }
    public getSANMoveForCurrentBoardAndMoveClass(moveClass : MoveClass):string{
        this.doMove(moveClass, false, true);

        let str = this.getSANMoveForLastMoveClass();

        this.undoMove(false, true);

        return str;
    }
    public getSANMoveForLastMoveClass():string{
        let moveClass = <MoveClass>this.getLastMoveClass();


        let str = "";
        let originFileRank = moveClass.originFileRank;
        let destFileRank = moveClass.destFileRank;


        let castlingMove = this.isCastlingMove(moveClass);
        if(castlingMove.isCastling){
            let cType = <CastleType>castlingMove.castleType;

            if(cType == CastleType.KING_SIDE){
                str = "O-O";
            }else if(cType == CastleType.QUEEN_SIDE){
                str = "O-O-O";
            }
        }else {

            let isAmbiguous = false;
            let numOfFileAmbiguous = 0;
            let numOfRankAmbiguous = 0;

            this.undoMove(false, false);

            let piece = <PieceModel>this.getPieceForFileRank(moveClass.originFileRank);
            let pieceType = piece.getPieceType();

            let pieceSquares = this.getSquaresBySideTypePieceType(piece.getSideType(), piece.getPieceType());

            for(let i = 0; i < pieceSquares.length; i++){
                let pSquare = pieceSquares[i];
                if(!FileRank.isEqual(pSquare, originFileRank)){
                    if(this.hasLegalMoves(pSquare, destFileRank, false)){
                        isAmbiguous = true;

                        if(pSquare.x == originFileRank.x){
                            numOfFileAmbiguous++;
                        }
                        if(pSquare.y == originFileRank.y){
                            numOfRankAmbiguous++;
                        }
                    }
                }
            }

            this.doMove(moveClass, false, false);


            if(pieceType != PieceType.PAWN){
                str = ChessEngine.convertPieceModelToFenChar({sideType : SideType.WHITE, pieceType : pieceType});
            }

            if(isAmbiguous){
                if(numOfFileAmbiguous == 0){
                    str = str + ChessEngine.convertFileNumberToFile(originFileRank.x);
                }else if(numOfRankAmbiguous == 0){
                    str = str + String(originFileRank.y);
                }else {
                    str += ChessEngine.convertFileRankToFileRankStr(originFileRank);
                }
            }

            if(ChessEngine.isCaptureMove(moveClass)){
                str = str + "x";
            }

            str += ChessEngine.convertFileRankToFileRankStr(destFileRank);

            let isPromotionMove = ChessEngine.isPromotionMove(moveClass);
            if(isPromotionMove.isPromotion){
                str = str + "=";
                str = str + ChessEngine.convertPieceModelToFenChar({sideType : SideType.WHITE, pieceType : (<PieceModel.Interface>isPromotionMove.promotionPieceModel).pieceType});
            }
        }

        let gameState = this.getGameState();
        if(gameState == ChessGameStateEnum.BLACK_WIN_CHECKMATE || gameState == ChessGameStateEnum.WHITE_WIN_CHECKMATE){
            str = str + "#";
        }else if(this.isCheck()){
            str = str + "+";
        }

        return str;
    }



    public getUCIMoveForCurrentBoardAndSANMove(sanMove : string):string | null{
        let moveClass = this.getMoveClassForCurrentBoardAndSanMove(sanMove);
        if(moveClass == null){
            return null;
        }

        let uciMove = this.getUCIMoveForMoveClass(moveClass);

        return uciMove;
    }
    public getUCIMovesForMoveClasses(moveClasses : MoveClass[] | null):string[]{
        if(moveClasses == null){
            moveClasses = this.getAllLegalMoves(null, true);
        }
        let ret :string[] = [];
        for(let i = 0; i < moveClasses.length; i++){
            ret.push(this.getUCIMoveForMoveClass(moveClasses[i]));
        }

        return ret;
    }
    public getUCIMoveForMoveClass(moveClass : MoveClass):string{
        let originFileRankStr = ChessEngine.convertFileRankToFileRankStr(moveClass.originFileRank);
        let destFileRankStr = ChessEngine.convertFileRankToFileRankStr(moveClass.destFileRank);


        let uciMove = originFileRankStr + destFileRankStr;

        let isPromotionMove = ChessEngine.isPromotionMove(moveClass);

        if(isPromotionMove.isPromotion){
            uciMove = uciMove + ChessEngine.convertPieceModelToFenChar({sideType : SideType.BLACK, pieceType : (<PieceModel.Interface>isPromotionMove.promotionPieceModel).pieceType});
        }

        return uciMove;
    }

    public getMoveClassForUCIMove(uciMove : string):MoveClass | null {
        //checking whether this uciMove is valid


        let uciPatternResult : RegExpExecArray | null = ChessEngine.uciMoveRegExp.exec(uciMove);

        if(uciPatternResult == null){
            return null;
        }

        let fileRankFromStr = uciPatternResult[1];
        let fileRankToStr = uciPatternResult[2];
        let promoteFenChar = uciPatternResult[3];


        let fileRankFrom = ChessEngine.convertFileRankStrToFileRank(fileRankFromStr);
        let fileRankTo = ChessEngine.convertFileRankStrToFileRank(fileRankToStr);
        let promotionPieceType : null | PieceType = null;
        {

            let _promotionPieceType = ChessEngine.convertFenCharToPieceModel(promoteFenChar);
            if(_promotionPieceType != null){
                promotionPieceType = _promotionPieceType.pieceType;
            }
        }

        if(fileRankFrom == null || fileRankTo == null){
            return null;
        }


        let legalMoves = this.getLegalMoves(fileRankFrom, fileRankTo, false);

        let ret : MoveClass | null = null;

        if(promotionPieceType == null){
            if(legalMoves.length == 1){
                ret = legalMoves[0];
            }
        }else {
            for(let i = 0; i < legalMoves.length; i++){
                let legalMove = legalMoves[i];
                let promotionStruct : ChessEngine.PromotionStruct = ChessEngine.isPromotionMove(legalMove);

                if(promotionStruct.isPromotion){
                    if(promotionPieceType == (<PieceModel.Interface>promotionStruct.promotionPieceModel).pieceType){
                        ret = legalMove;
                    }
                }
            }
        }
        return ret;
    }


    public getFenStrFromCurrentBoard():string{
        let fenStr = "";

        //Deal with piece placement
        for(let rank = this.getNumOfRanks(); rank >= 1; rank--){
            let piecePlacementInt = 0;
            for(let fileNumber = 1; fileNumber <= this.getNumOfFiles(); fileNumber++){
                let fileRank = new FileRank(fileNumber, rank);
                let piece = this.getPieceForFileRank(fileRank);

                if(piece != null){
                    if(piecePlacementInt != 0){
                        fenStr += piecePlacementInt.toString();
                        piecePlacementInt = 0;
                    }
                    fenStr += ChessEngine.convertPieceModelToFenChar(piece);

                }else if(piece == null){
                    piecePlacementInt = piecePlacementInt + 1;
                }
            }
            if(piecePlacementInt != 0){
                fenStr += piecePlacementInt.toString();
            }

            if(rank != 1){
                fenStr += "/";
            }
        }

        fenStr += " ";

        //Deal with the move side
        switch(this.getMoveTurn()){
            case SideType.WHITE:
                fenStr += "w";
                break;
            case SideType.BLACK:
                fenStr += "b";
                break;
        }

        fenStr += " ";

        //Deal With castling
        let isCastling = false;
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            for(let castleType = CastleType.FIRST_CASTLE; castleType <= CastleType.LAST_CASTLE; castleType++){
                if(this.canCastle(sideType, castleType)){
                    isCastling = true;

                    let char :string = "";
                    switch(castleType){
                        case CastleType.KING_SIDE:
                            char = ChessEngine.convertPieceModelToFenChar({sideType : sideType, pieceType : PieceType.KING});
                            break;
                        case CastleType.QUEEN_SIDE:
                            char = ChessEngine.convertPieceModelToFenChar({sideType : sideType, pieceType : PieceType.QUEEN});
                            break;
                    }

                    let rookOriginSquare = this.getRookOriginCastle(sideType, castleType);


                    let cmpFunction = (castleType : CastleType, rookFileNumber : number, rookOriginFileNumber : number) => {
                        let ret : boolean = false;
                        switch (castleType){
                            case CastleType.KING_SIDE:
                                if(rookFileNumber > rookOriginFileNumber){
                                    ret = true;
                                }
                                break;
                            case CastleType.QUEEN_SIDE:
                                if(rookFileNumber < rookOriginFileNumber){
                                    ret = true;
                                }
                                break;
                        }

                        return ret;
                    };

                    let rookSquares = this.getSquaresBySideTypePieceType(sideType, PieceType.ROOK);
                    for(let i = 0; i < rookSquares.length; i++){
                        let rookSquare = rookSquares[i];
                        if(rookOriginSquare != null){
                            if(rookSquare.y == rookOriginSquare.y){
                                if(cmpFunction(castleType, rookSquare.x, rookOriginSquare.x)){
                                    char = <string>ChessEngine.convertFileNumberToFile(rookOriginSquare.x);
                                    if(sideType == SideType.WHITE){
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


        if(!isCastling){
            fenStr += "-";
        }

        fenStr += " ";

        //Deal with en passant

        if(this.enPassantSquare == null){
            fenStr += "-"
        }else if(this.enPassantSquare != null){
            fenStr += ChessEngine.convertFileRankToFileRankStr(this.enPassantSquare);
        }

        fenStr += " ";

        //Deal with the half move clock
        fenStr += this.halfMoveClockVector[this.halfMoveClockVector.length - 1].toString();

        fenStr += " ";

        //Deal with the full move number
        fenStr += this.moveNumber.toString();

        return fenStr;
    }



    public getSanMoves():string[]{
        return this.sanMoves;
    }
    public getFirstSanMove():string{
        return this.sanMoves[0];
    }
    public getLastSanMove():string{
        return this.sanMoves[this.sanMoves.length - 1];
    }


    public getUCIMoves():string[]{
        return this.uciMoves;
    }
    public getFirstUCIMove():string{
        return this.uciMoves[0];
    }
    public getLastUCIMove():string{
        return this.uciMoves[this.uciMoves.length - 1];
    }


    public getFenStrs():string[]{
        return this.fenStrings;
    }
    public getFirstFenStr():string{
        return this.fenStrings[0];
    }
    public getLastFenStr():string{
        return this.fenStrings[this.fenStrings.length - 1];
    }





















    public static isTwoPawnMove(moveClass : MoveClass):ChessEngine.TwoPawnMoveStruct{
        let ret : ChessEngine.TwoPawnMoveStruct = {"isTwoPawn" : false};

        let removeAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(true);

        if(removeAddMoveStruct.removeStructs.length != 0 ||
            removeAddMoveStruct.addStructs.length != 0 ||
            removeAddMoveStruct.moveStructs.length != 1){

            return ret;
        }

        let moveStruct = removeAddMoveStruct.moveStructs[0];

        if(moveStruct.destPiece.getPieceType() != PieceType.PAWN){
            return ret;
        }
        if(moveStruct.originFileRank.x != moveStruct.destFileRank.x){
            return ret;
        }
        if(Math.abs(moveStruct.destFileRank.y - moveStruct.originFileRank.y) != 2){
            return ret
        }

        ret.isTwoPawn = true;
        ret.enPassantSquare = new FileRank(moveStruct.originFileRank.x,
            (moveStruct.originFileRank.y + moveStruct.destFileRank.y)/2);

        return ret;
    }





    public isCastlingMove(moveClass : MoveClass):ChessEngine.CastlingStruct{
        let ret : ChessEngine.CastlingStruct = {"isCastling" : false};

        let removeAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(true);
        if(removeAddMoveStruct.removeStructs.length != 0
            || removeAddMoveStruct.addStructs.length != 0
            || removeAddMoveStruct.moveStructs.length != 2){

            return ret;
        }



        let kingMoveStruct : MoveClass.MoveStruct | null = null;
        let rookMoveStruct : MoveClass.MoveStruct | null = null;


        let moveStructs = removeAddMoveStruct.moveStructs;
        for(let i = 0; i < moveStructs.length; i++){
            if(moveStructs[i].destPiece.getPieceType() == PieceType.KING){
                kingMoveStruct = moveStructs[i];
            }else if(moveStructs[i].destPiece.getPieceType() == PieceType.ROOK){
                rookMoveStruct = moveStructs[i];
            }
        }


        if(kingMoveStruct == null){
            return ret;
        }
        if(rookMoveStruct == null){
            return ret;
        }


        let sideType : SideType | null = null;
        let castleType : CastleType | null = null;

        for(let sType = SideType.FIRST_SIDE; sType <= SideType.LAST_SIDE; sType++){
            let kingOriginCastle = this.getKingOriginCastle(sType);
            if(kingOriginCastle != null){
                if(FileRank.isEqual(kingOriginCastle, kingMoveStruct.originFileRank)){
                    sideType = sType;
                }
            }
        }
        //this.getKingOriginCastle(sideType);
        //this.getKingDestCastle(sideType, castleType);
        //this.getRookOriginCastle(sideType, castleType);
        //this.getRookDestCastle(sideType, castleType);
        if(sideType != null){
            for(let cType = CastleType.FIRST_CASTLE; cType <= CastleType.LAST_CASTLE; cType++){
                let isKingDest : boolean = false;
                let isRookOrigin : boolean = false;
                let isRookDest : boolean = false;

                let kingDestCastle = this.getKingDestCastle(sideType, cType);
                if(kingDestCastle != null){
                    if(FileRank.isEqual(kingDestCastle, kingMoveStruct.destFileRank)){
                        isKingDest = true;
                    }
                }
                let rookOriginCastle = this.getRookOriginCastle(sideType, cType);
                if(rookOriginCastle != null){
                    if(FileRank.isEqual(rookOriginCastle, rookMoveStruct.originFileRank)){
                        isRookOrigin = true;
                    }
                }
                let rookDestCastle = this.getRookDestCastle(sideType, cType);
                if(rookDestCastle != null){
                    if(FileRank.isEqual(rookDestCastle, rookMoveStruct.destFileRank)){
                        isRookDest = true;
                    }
                }

                if(isKingDest && isRookOrigin && isRookDest){
                    castleType = cType;
                }
            }
        }

        if(sideType != null && castleType != null){
            ret.isCastling = true;
            ret.sideType = sideType;
            ret.castleType = castleType;
        }

        return ret;
    }






    public static isPromotionMove(moveClass : MoveClass):ChessEngine.PromotionStruct{
        let ret : ChessEngine.PromotionStruct = {"isPromotion" : false};

        let removeAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(true);

        if(removeAddMoveStruct.addStructs.length != 1){
            return ret;
        }

        let addStruct = removeAddMoveStruct.addStructs[0];

        ret.isPromotion = true;
        ret.promotionPieceModel = {pieceType : addStruct.piece.getPieceType(), sideType : addStruct.piece.getSideType()};



        return ret;
    }

    public static isCaptureMove(moveClass : MoveClass):boolean{
        let removeAddMoveStruct : MoveClass.RemoveAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(true);

        return removeAddMoveStruct.removeStructs > removeAddMoveStruct.addStructs;
    }


    public static isMoveWithPieceTypeSideType(moveClass : MoveClass, pieceType : PieceType, sideType : SideType):boolean {
        let removeAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(true);

        if(removeAddMoveStruct.moveStructs.length != 1){
            return false;
        }
        let moveStruct = removeAddMoveStruct.moveStructs[0];
        let piece = moveStruct.destPiece;

        return piece.getPieceType() == pieceType && piece.getSideType() == sideType;
    }


    public static isMoveWithPieceType(moveClass : MoveClass, pieceType : PieceType):boolean {
        let removeAddMoveStruct = moveClass.getRemoveAddMoveMoveStruct(true);

        if(removeAddMoveStruct.moveStructs.length != 1){
            return false;
        }
        let moveStruct = removeAddMoveStruct.moveStructs[0];
        let piece = moveStruct.destPiece;

        return piece.getPieceType() == pieceType;
    }






    public static convertFenCharToPieceModel(char : string) : PieceModel | null{
        let sideType : SideType | null = null;
        let pieceType : PieceType | null = null;

        switch (char){
            case "P":
                sideType = SideType.WHITE;
                pieceType = PieceType.PAWN;
                break;
            case "N":
                sideType = SideType.WHITE;
                pieceType = PieceType.KNIGHT;
                break;
            case "B":
                sideType = SideType.WHITE;
                pieceType = PieceType.BISHOP;
                break;
            case "R":
                sideType = SideType.WHITE;
                pieceType = PieceType.ROOK;
                break;
            case "Q":
                sideType = SideType.WHITE;
                pieceType = PieceType.QUEEN;
                break;
            case "K":
                sideType = SideType.WHITE;
                pieceType = PieceType.KING;
                break;
            case "p":
                sideType = SideType.BLACK;
                pieceType = PieceType.PAWN;
                break;
            case "n":
                sideType = SideType.BLACK;
                pieceType = PieceType.KNIGHT;
                break;
            case "b":
                sideType = SideType.BLACK;
                pieceType = PieceType.BISHOP;
                break;
            case "r":
                sideType = SideType.BLACK;
                pieceType = PieceType.ROOK;
                break;
            case "q":
                sideType = SideType.BLACK;
                pieceType = PieceType.QUEEN;
                break;
            case "k":
                sideType = SideType.BLACK;
                pieceType = PieceType.KING;
                break;
        }

        let ret : PieceModel | null;
        if(sideType == null || pieceType == null){
            ret = null;
        }else {
            ret = new PieceModel(pieceType, sideType);
        }

        return ret;
    };



    public static convertPieceModelToFenChar(pieceModel : PieceModel.Interface):string{
        let char:string = "";

        switch(pieceModel.sideType){
            case SideType.WHITE:
                switch(pieceModel.pieceType){
                    case PieceType.PAWN:
                        char = "P";
                        break;
                    case PieceType.KNIGHT:
                        char = "N";
                        break;
                    case PieceType.BISHOP:
                        char = "B";
                        break;
                    case PieceType.ROOK:
                        char = "R";
                        break;
                    case PieceType.QUEEN:
                        char = "Q";
                        break;
                    case PieceType.KING:
                        char = "K";
                        break;
                }
                break;
            case SideType.BLACK:
                switch(pieceModel.pieceType){
                    case PieceType.PAWN:
                        char = "p";
                        break;
                    case PieceType.KNIGHT:
                        char = "n";
                        break;
                    case PieceType.BISHOP:
                        char = "b";
                        break;
                    case PieceType.ROOK:
                        char = "r";
                        break;
                    case PieceType.QUEEN:
                        char = "q";
                        break;
                    case PieceType.KING:
                        char = "k";
                        break;
                }
                break;
        }

        return char;
    };


    public static convertFileToFileNumber(file : string) : number | null{
        let fileNumber = null;

        switch (file){
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
    };


    public static convertFileNumberToFile(fileNumber : number):string|null{
        let file = null;

        switch (fileNumber){
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

    public static convertFileRankStrToFileRank(fileRankStr : string): FileRank | null {
        if(fileRankStr.length != 2){
            return null;
        }

        let file = fileRankStr[0];
        let rank = parseInt(fileRankStr[1]);
        if(isNaN(rank)){
            return null;
        }

        let fileNumber = ChessEngine.convertFileToFileNumber(file);

        if(fileNumber == null || rank == null){
            return null;
        }

        return new FileRank(fileNumber, rank);
    }
    public static convertFileRankToFileRankStr(fileRank : FileRank): string {
        let fileNumber = fileRank.x;
        let file = this.convertFileNumberToFile(fileNumber);

        let rank = fileRank.y;

        return file + rank.toString();
    }


}



