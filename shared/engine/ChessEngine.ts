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

export class ChessEngine extends  AbstractEngine {
    private initParam : {isChess960 : boolean, beginFenStr : string};

    private captureFairy:{ [key : number] : { [key:number] : Fairy}};
    private normalFairy : { [ key : number] : { [key : number] : Fairy}};
    private pawn2MoveFairy : { [key : number] : Fairy};

    private moveTurn : SideType;

    private halfMoveClockVector : number[];
    private moveNumber : number;

    private fenStrKingOriginFileNumber : { [key : number] : number | null}; //key is the sideType
    private fenStrRookOriginFileNumber : { [key : number] : { [key : number] : number | null} }; //key is the sideType, castleType


    private fenStrCastling : { [key : number] : { [key : number] : boolean} };
    private enPassantSquare : FileRank | null;

    private fenStrings : string[];
    private uciMoves : string[];
    private sanMoves : string[];

    private fenStrEnPassant : FileRank | null;



    private m_gameState : ChessGameStateEnum;
    private m_isLooseTime : { [key : number] : boolean} = {};
    private m_isResign : { [key : number] : boolean} = {};
    private m_isForfeit : { [key : number] : boolean} = {};
    private m_askForDraw : { [key : number] : boolean} = {};


    public static getNumOfFiles():number{
        return 8;
    }
    public static getNumOfRanks():number{
        return 8;
    }
    public static getHashForFileRank(fileRank: FileRank): number {
        let hash = (fileRank.y - 1) * ChessEngine.getNumOfFiles() + (fileRank.x - 1);

        return hash;
    }
    public static getFileRankForHash(hash: number): FileRank {
        let fileNumber = (hash % ChessEngine.getNumOfFiles());
        let rank = (hash - fileNumber) / ChessEngine.getNumOfFiles();

        fileNumber = fileNumber + 1;
        rank = rank + 1;

        return new FileRank(fileNumber, rank);
    }



    constructor(initParam ?: {isChess960 ?: boolean, beginFenStr ?: string}){
        super(ChessEngine.getNumOfFiles(), ChessEngine.getNumOfRanks(),[PieceType.PAWN, PieceType.KNIGHT, PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN, PieceType.KING], [SideType.WHITE, SideType.BLACK]);

        this.captureFairy = {};
        this.normalFairy = {};

        this.pawn2MoveFairy = {};

        this.initGlobal();
        this.init(initParam);
    }



    public initGlobal(){

        this.captureFairy = {};
        this.captureFairy[SideType.WHITE] = {};
        this.captureFairy[SideType.BLACK] = {};

        this.normalFairy = {};
        this.normalFairy[SideType.WHITE] = {};
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



    public outitModel(){
        super.outitModel();

        this.halfMoveClockVector = [];
        this.halfMoveClockVector.push(0);

        this.moveNumber = 1;

        this.fenStrCastling = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.fenStrCastling[sideType] = {};
            for(let castleType = CastleType.FIRST_CASTLE; castleType <= CastleType.LAST_CASTLE; castleType++){
                this.fenStrCastling[sideType][castleType] = false;
            }
        }
        this.fenStrKingOriginFileNumber = {};
        this.fenStrRookOriginFileNumber = {};
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.fenStrKingOriginFileNumber[sideType] = null;
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

    public init(initParam ?: {isChess960 ?: boolean, beginFenStr ?: string}){
        if(initParam == undefined){
            initParam = {};
        }

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
                    beginFenStr += ChessEngine.sideTypePieceTypeToFenChar(SideType.BLACK, beginArray[i]);
                }
                beginFenStr += "/pppppppp/8/8/8/8/PPPPPPPP/";
                for(let i = 1; i <= ChessEngine.getNumOfFiles(); i++){
                    beginFenStr += ChessEngine.sideTypePieceTypeToFenChar(SideType.WHITE, beginArray[i]);
                }
                beginFenStr += " w KQkq - 0 1";

                initParam["beginFenStr"] = beginFenStr;
            }
        }else {
            if(initParam["beginFenStr"] == undefined){
                initParam["beginFenStr"] = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
            }
        }
        this.initParam = <{isChess960 : boolean, beginFenStr : string}>initParam;

        this.outitModel();

        //SET THE KINGS TO ROYAL PIECES
        this.setPieceToRoyal(SideType.WHITE, PieceType.KING);
        this.setPieceToRoyal(SideType.BLACK, PieceType.KING);

        
        let splitFenString = this.initParam["beginFenStr"].split(" ");
        //set the board from fenString
        {
            let fileNumber = 1;
            let rank = this.getNumOfRanks();
            for(let i = 0; i < splitFenString[0].length; i++){
                let c = splitFenString[0][i];


                if(c === "p" || c === "n" || c === "b" || c === "r" || c === "q" || c === "k" || c === "P" || c === "N" || c === "B" || c === "R" || c === "Q" || c === "K"){
                    let piece = <PieceModel>ChessEngine.fenCharToSideTypePieceType(c);
                    let fileRank = new FileRank(fileNumber, rank);


                    this.setPieceForFileRank(fileRank, piece);
                    fileNumber = fileNumber + 1;
                }else if(c === "1" || c === "2" || c === "3" || c === "4" || c === "5" || c === "6" || c === "7" || c === "8"){
                    fileNumber = fileNumber + parseInt(c);
                }else if(c === "/"){
                    fileNumber = 1;
                    rank = rank - 1;
                }
            }
        }



        //set the moveturn from the fenString
        {
            let c = splitFenString[1];
            if(c === "w"){
                this.setMoveTurn(SideType.WHITE);
            }else if(c === "b"){
                this.setMoveTurn(SideType.BLACK);
            }
        }

        //set the castling rights from the fenString
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            let squares = this.getSquaresBySideTypePieceType(sideType, PieceType.KING);
            if(squares.length == 1){
                this.fenStrKingOriginFileNumber[sideType] = squares[0].x;
            }
        }


        for(let i = 0; i < splitFenString[2].length; i++){
            let c = splitFenString[2][i];

            let sType : SideType | null = null;
            let cType : CastleType | null = null;

            let pieceSet : PieceType[] = [PieceType.KING, PieceType.QUEEN];
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                for(let i = 0; i < pieceSet.length; i++){
                    let pType = pieceSet[i];
                    if(c == ChessEngine.sideTypePieceTypeToFenChar(sideType, pType)){
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
                let lowerC = c.toLowerCase();

                let fileNumber = ChessEngine.convertFileToFileNumber(lowerC);
                if(fileNumber == null){
                    continue;
                }

                let sideType : SideType = c.toLowerCase() == c ? SideType.WHITE : SideType.BLACK;

                let fenStrKingOriginFileNumber = this.fenStrKingOriginFileNumber[sideType]

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

                this.fenStrCastling[sideType][castleType] = true;
                this.fenStrRookOriginFileNumber[sideType][castleType] = fileNumber;
            }else {
                this.fenStrCastling[sType][cType] = true;
            }
        }

        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++) {
            for (let castleType = CastleType.FIRST_CASTLE; castleType <= CastleType.LAST_CASTLE; castleType++) {
                if(this.fenStrCastling[sideType][castleType]){
                    if(this.fenStrRookOriginFileNumber[sideType][castleType] == null){
                        let rookSquares = this.getSquaresBySideTypePieceType(sideType, PieceType.ROOK);
                        let fileNumber : number | null = null;
                        for(let i = 0; i < rookSquares.length; i++){
                            let rookSquare : FileRank = rookSquares[i];
                            if(rookSquare.y == this.getRookOriginRank(sideType)){
                                if(fileNumber == null){
                                    fileNumber = rookSquares[i].x;
                                }else {
                                    if(castleType == CastleType.QUEEN_SIDE){
                                        fileNumber = Math.min(fileNumber, rookSquares[i].x);
                                    }else if(castleType == CastleType.KING_SIDE){
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
            if(splitFenString[3] === "-"){
                this.fenStrEnPassant = null;
            }else {
                let file = splitFenString[3][0];
                let fileNumber = <number>ChessEngine.convertFileToFileNumber(file);

                let rank = parseInt(splitFenString[3][1]);
                this.fenStrEnPassant = new FileRank(fileNumber, rank)
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
        this.setIsLooseByTime(SideType.WHITE, false);
        this.setIsLooseByTime(SideType.BLACK, false);

        this.m_isResign = {};
        this.setIsResign(SideType.WHITE, false);
        this.setIsResign(SideType.BLACK, false);

        this.m_isForfeit = {};
        this.setIsForfeit(SideType.WHITE, false);
        this.setIsForfeit(SideType.BLACK, false);

        this.m_askForDraw = {};
        this.setIsAskForDraw(SideType.WHITE, false);
        this.setIsAskForDraw(SideType.BLACK, false);


        this.m_gameState = ChessGameStateEnum.NORMAL;
        this.updateGameState();
    };


    public static fenCharToSideTypePieceType(char : string) : PieceModel | null{
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



    public static sideTypePieceTypeToFenChar(sideType : SideType, pieceType : PieceType):string{
        let char:string = "";

        switch(sideType){
            case SideType.WHITE:
                switch(pieceType){
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
                switch(pieceType){
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


    public updateEnPassantSquare(){
        this.enPassantSquare = null;
        if(this.moveClasses.length === 0){
            this.enPassantSquare = this.fenStrEnPassant;
        }else {
            let isLastMoveTwoPawnMove = this.isLastMoveTwoPawnMove();

            if(isLastMoveTwoPawnMove["isTwoPawnMove"]){
                this.enPassantSquare = isLastMoveTwoPawnMove["enPassantSquare"];
            }
        }
    }


    public isLastMoveTwoPawnMove():{ "isTwoPawnMove" : boolean, "enPassantSquare" : FileRank | null}{
        let ret : { "isTwoPawnMove" : boolean, "enPassantSquare" : FileRank | null}  = { "isTwoPawnMove" : false, "enPassantSquare" : null};;

        if(this.moveClasses.length === 0){
            ret["isTwoPawnMove"] = false;
            ret["enPassantSquare"] = null;
        }else {
            let moveClass = this.moveClasses[this.moveClasses.length - 1];
            ret = this.isTwoPawnMove(moveClass);
        }

        return ret;
    }
    public isTwoPawnMove(moveClass : MoveClass):{ "isTwoPawnMove" : boolean, "enPassantSquare" : FileRank | null}{
        let ret :{ "isTwoPawnMove" : boolean, "enPassantSquare" : FileRank | null} = { "isTwoPawnMove" : false, "enPassantSquare" : null};;

        if(moveClass.getLength() === 2){
            let change1 = moveClass.get(0);
            let change2 = moveClass.get(1);

            let fileRankFrom = change1["fileRank"];
            let fileRankTo = change2["fileRank"];

            let pieceFrom = change1["originPiece"];
            let pieceTo = change2["destPiece"];

            if((pieceFrom !== null) && (pieceTo !== null)){
                ret["isTwoPawnMove"] = true;
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && (pieceFrom.getPieceType() === PieceType.PAWN);
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && PieceModel.isEqualTo(pieceFrom, pieceTo);
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && (fileRankFrom.x === fileRankTo.x);
                ret["isTwoPawnMove"] = ret["isTwoPawnMove"] && (Math.abs(fileRankFrom.y - fileRankTo.y) === 2);

                if(ret["isTwoPawnMove"]){
                    ret["enPassantSquare"] = new FileRank(fileRankFrom.x, (fileRankFrom.y + fileRankTo.y) / 2);
                }
            }
        }

        return ret;
    }



    public isLastMoveCastlingMove():{"isCastlingMove": boolean, "sideType": SideType | null, "castleType": CastleType | null}{
        let ret : {"isCastlingMove": boolean, "sideType": SideType | null, "castleType": CastleType | null}  = { "isCastlingMove" : false, "sideType" : null, "castleType" : null};;

        if(this.moveClasses.length === 0){
            ret["isCastlingMove"] = false;
            ret["sideType"] = null;
            ret["castleType"] = null;
        }else {
            let moveClass = this.moveClasses[this.moveClasses.length - 1];
            ret = this.isCastlingMove(moveClass);
        }

        return ret;
    }


    public isCastlingMove(moveClass : MoveClass):{isCastlingMove: boolean, sideType: SideType | null, castleType: CastleType | null}{
        let ret = false;
        let sideType = null;
        let castleType = null;

        if(moveClass.getLength() === 4){
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

            if(change1Origin !== null && change1Dest === null && change2Origin === null && change2Dest !== null && change3Origin !== null && change3Dest === null && change4Origin === null && change4Dest !== null){
                if(PieceModel.isEqualTo(change1Origin, change2Dest) && PieceModel.isEqualTo(change3Origin, change4Dest)){
                    for(let sType = SideType.FIRST_SIDE; sType <= SideType.LAST_SIDE; sType++){
                        let kingOriginCastle = this.getKingOriginCastle(sType);
                        if(kingOriginCastle != null){
                            if(AbstractEngine.fileRankEqual(kingOriginCastle, change1FileRank)){
                                sideType = sType;
                            }
                        }
                    }

                    if(sideType !== null){
                        for(let cType = CastleType.FIRST_CASTLE; cType <= CastleType.LAST_CASTLE; cType++){
                            let rookOriginFileRank = this.getRookOriginCastle(sideType, cType);
                            if(rookOriginFileRank != null){
                                if(AbstractEngine.fileRankEqual(rookOriginFileRank, change3FileRank)){
                                    castleType = cType;
                                }
                            }
                        }
                    }


                    if(sideType !== null && castleType !== null){
                        ret = true;
                    }else {
                        ret = false;
                        sideType = null;
                        castleType = null;
                    }
                }
            }
        }

        return {isCastlingMove: ret, sideType: sideType, castleType: castleType};
    }

    public isLastMovePromotionMove():{"isPromotionMove": boolean, "promotionPieceTypes": PieceType[], unpromotionPieceTypes : PieceType[]}{
        let ret : {"isPromotionMove": boolean, "promotionPieceTypes": PieceType[], unpromotionPieceTypes : PieceType[]}  = { "isPromotionMove" : false, "promotionPieceTypes" : [], "unpromotionPieceTypes" : []};;

        if(this.moveClasses.length !== 0){
            let moveClass = this.moveClasses[this.moveClasses.length - 1];
            ret = this.isPromotionMove(moveClass);
        }

        return ret;
    }

    public isPromotionMove(moveClass : MoveClass):{"isPromotionMove": boolean, "promotionPieceTypes": PieceType[], unpromotionPieceTypes : PieceType[]}{
        let ret : {"isPromotionMove": boolean, "promotionPieceTypes": PieceType[], unpromotionPieceTypes : PieceType[]}  = { "isPromotionMove" : false, "promotionPieceTypes" : [], "unpromotionPieceTypes" : []};;

        let numCounter : { [key : number] : number} = {};
        numCounter[SideType.WHITE] = 0;
        numCounter[SideType.BLACK] = 0;

        let pieceTypeChanges : { [key : number] : { [key : number] : number}} = {};
        pieceTypeChanges[SideType.WHITE] = {};
        pieceTypeChanges[SideType.BLACK] = {};

        for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; ++pieceType){
            pieceTypeChanges[SideType.WHITE][pieceType] = 0;
            pieceTypeChanges[SideType.BLACK][pieceType] = 0;
        }

        for(let i = 0; i < moveClass.getLength(); i++) {
            let change = moveClass.get(i);

            let changeOrigin =  change.originPiece;
            let changeDest = change.destPiece;

            if(changeOrigin !== null){
                let pieceType = changeOrigin.getPieceType();
                let sideType = changeOrigin.getSideType();

                numCounter[sideType] = numCounter[sideType] - 1;
                pieceTypeChanges[sideType][pieceType] = pieceTypeChanges[sideType][pieceType] - 1;
            }

            if(changeDest !== null){
                let pieceType = changeDest.getPieceType();
                let sideType = changeDest.getSideType();

                numCounter[sideType] = numCounter[sideType] + 1;
                pieceTypeChanges[sideType][pieceType] = pieceTypeChanges[sideType][pieceType] + 1;
            }
        }

        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(numCounter[sideType] == 0){
                for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; ++pieceType){
                    if(pieceTypeChanges[sideType][pieceType] > 0){
                        ret["isPromotionMove"] = true;
                        ret["promotionPieceTypes"].push(pieceType);
                    }else if(pieceTypeChanges[sideType][pieceType] < 0){
                        ret["isPromotionMove"] = true;
                        ret["unpromotionPieceTypes"].push(pieceType);
                    }
                }
            }
        }

        return ret;
    }


    private captureReverseCaptureHelper(moveClass : MoveClass) : { [key : number] : number } {
        let wbChanges : { [key : number] : number }  = {};
        wbChanges[SideType.WHITE] = 0;
        wbChanges[SideType.BLACK] = 0;

        for(let i = 0; i < moveClass.getLength(); i++){
            let change = moveClass.get(i);
            let originPiece = change.originPiece;
            let destPiece = change.destPiece;

            if(originPiece != null){
                wbChanges[originPiece.getSideType()] = wbChanges[originPiece.getSideType()] - 1;
            }

            if(destPiece != null){
                wbChanges[destPiece.getSideType()] = wbChanges[destPiece.getSideType()] + 1;
            }
        }

        return wbChanges;
    }
    public isReverseCaptureMove(moveClass : MoveClass):boolean {
        let wbChanges = this.captureReverseCaptureHelper(moveClass);

        return (wbChanges[SideType.WHITE] > 0) || (wbChanges[SideType.BLACK] > 0);
    }
    public isCaptureMove(moveClass : MoveClass):boolean{
        let wbChanges = this.captureReverseCaptureHelper(moveClass);

        return (wbChanges[SideType.WHITE] < 0) || (wbChanges[SideType.BLACK] < 0);
    }


    public isLastMoveWithPieceTypeSideType(pieceType : PieceType, sideType : SideType):boolean {
        let ret : boolean;

        let lastMoveClass : MoveClass | null = this.getLastMoveClass();
        if(lastMoveClass == null){
            ret = false;
        }else {
            ret = this.isMoveWithPieceTypeSideType(lastMoveClass, pieceType, sideType);
        }


        return ret;
    }

    public isMoveWithPieceTypeSideType(moveClass : MoveClass, pieceType : PieceType, sideType : SideType):boolean {
        let ret : boolean = false;
        if(moveClass.getLength() > 0) {
            let change = moveClass.get(1);

            let changeOrigin = change.originPiece;
            if (changeOrigin != null) {
                let _pieceType = changeOrigin.getPieceType();
                let _sideType = changeOrigin.getSideType();

                ret = (pieceType == _pieceType)  && (sideType == _sideType);
            }
        }

        return ret;
    }


    public isLastMoveWithPieceType(pieceType : PieceType):boolean {
        let ret : boolean;

        let lastMoveClass : MoveClass | null = this.getLastMoveClass();

        if(lastMoveClass == null){
            ret = false;
        }else {
            ret = this.isMoveWithPieceType(lastMoveClass, pieceType);
        }

        return ret;
    }

    public isMoveWithPieceType(moveClass : MoveClass, pieceType : PieceType):boolean {
        let ret : boolean = false;
        if(moveClass.getLength() > 0) {
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

    public getIsForfeit(sideType : SideType) : boolean{
        return this.m_isForfeit[sideType];
    }
    public setIsForfeit(sideType : SideType, isForfeit : boolean){
        this.m_isForfeit[sideType] = isForfeit;
    }

    public getIsLooseByTime(sideType : SideType) : boolean{
        return this.m_isLooseTime[sideType];
    }
    public setIsLooseByTime(sideType : SideType, isLoose : boolean){
        this.m_isLooseTime[sideType] = isLoose;
    }


    public getIsResign(sideType : SideType) : boolean{
        return this.m_isResign[sideType];
    }
    public setIsResign(sideType : SideType, isResign : boolean){
        this.m_isResign[sideType] = isResign;
    }


    public getIsAskForDraw(sideType : SideType) : boolean{
        return this.m_askForDraw[sideType];
    }
    public setIsAskForDraw(sideType : SideType, isAskForDraw : boolean){
        this.m_askForDraw[sideType] = isAskForDraw;
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
        }else if(this.getIsLooseByTime(SideType.WHITE)){
            this.m_gameState = ChessGameStateEnum.BLACK_WIN_TIME;
        }else if(this.getIsLooseByTime(SideType.BLACK)){
            this.m_gameState = ChessGameStateEnum.WHITE_WIN_TIME;
        }else if(this.getIsResign(SideType.WHITE)){
            this.m_gameState = ChessGameStateEnum.BLACK_WIN_RESIGN;
        }else if(this.getIsResign(SideType.BLACK)){
            this.m_gameState = ChessGameStateEnum.WHITE_WIN_RESIGN;
        }else if(this.getIsForfeit(SideType.WHITE)){
            this.m_gameState = ChessGameStateEnum.BLACK_WIN_FORFEIT;
        }else if(this.getIsForfeit(SideType.BLACK)){
            this.m_gameState = ChessGameStateEnum.WHITE_WIN_FORFEIT;
        }else if(this.getIsAskForDraw(SideType.WHITE) || this.getIsAskForDraw(SideType.BLACK)){
            if(this.getIsAskForDraw(SideType.WHITE) && this.getIsAskForDraw(SideType.BLACK)){
                this.m_gameState = ChessGameStateEnum.DRAW_AGREEMENT;
            }else if(this.isDrawBy50Moves()){
                this.m_gameState = ChessGameStateEnum.DRAW_50MOVES;
            }else if(this.isDrawByThreeRepetition()){
                this.m_gameState = ChessGameStateEnum.DRAW_REPETITION;
            }else {
                this.m_gameState = ChessGameStateEnum.NORMAL;
            }
        }

    }

    public getGameResult():ChessGameResultEnum{
        let gameResult : ChessGameResultEnum = ChessGameResultEnum.NORMAL;
        switch(this.getGameState()) {
            case ChessGameStateEnum.NORMAL:
                gameResult = ChessGameResultEnum.NORMAL;
                break;
            case ChessGameStateEnum.WHITE_WIN_TIME:
            case ChessGameStateEnum.WHITE_WIN_CHECKMATE:
            case ChessGameStateEnum.WHITE_WIN_RESIGN:
            case ChessGameStateEnum.WHITE_WIN_FORFEIT:
                gameResult = ChessGameResultEnum.WHITE_WIN;
                break;
            case ChessGameStateEnum.BLACK_WIN_TIME:
            case ChessGameStateEnum.BLACK_WIN_CHECKMATE:
            case ChessGameStateEnum.BLACK_WIN_RESIGN:
            case ChessGameStateEnum.BLACK_WIN_FORFEIT:
                gameResult = ChessGameResultEnum.BLACK_WIN;
                break;
            case ChessGameStateEnum.DRAW_STALEMATE:
            case ChessGameStateEnum.DRAW_INSUFFICIENT_MATERIAL:
            case ChessGameStateEnum.DRAW_50MOVES:
            case ChessGameStateEnum.DRAW_REPETITION:
            case ChessGameStateEnum.DRAW_AGREEMENT:
                gameResult = ChessGameResultEnum.DRAW;
                break;
        }

        return gameResult;
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
            this.doMove(moveClass);
        }

        return (moveClass !== null);
    }

    public doMoveUCI(uciMove : string):boolean{
        let moveClass = this.getMoveClassForUCIMove(uciMove);
        if(moveClass !== null){
            this.doMove(moveClass);
        }

        return (moveClass !== null);
    }


    public doMove(moveClass : MoveClass){
        super.doMove(moveClass);

        //Update the move number
        if(this.getMoveTurn() === SideType.BLACK){
            this.moveNumber = this.moveNumber + 1;
        }

        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

        //Figure out if the half move clock should be reset or incremented
        let resetHalfMoveClock = false;
        if(this.isCaptureMove(moveClass) || this.isMoveWithPieceType(moveClass, PieceType.PAWN)){
            resetHalfMoveClock = true;
        }

        if(resetHalfMoveClock){
            this.halfMoveClockVector.push(0);
        }else{
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
    public isMoveLegal(moveClass : MoveClass, isCheckGameState : boolean):boolean{
        if(isCheckGameState){
            if(this.getGameState() != ChessGameStateEnum.NORMAL){
                return false;
            }
        }

        let isInFakeCheck = false;
        super.doMove(moveClass);
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

        let royalSquares = this.getRoyalPieceSquares(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        for(let i = 0; i < royalSquares.length; i++){
            let royalSquare = royalSquares[i];
            if(this.hasAllPossibleMoves(royalSquare)){
                isInFakeCheck = true;
            }
        }

        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        super.undoMove();

        let isCastlingIllegal = false;
        let isCastlingMove = this.isCastlingMove(moveClass);

        //isCastlingMove, sideType, castleType = self.isCastlingMove(moveClass)
        if(isCastlingMove["isCastlingMove"]){
            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

            let kingOrigin = this.getKingOriginCastle(<SideType>isCastlingMove["sideType"]);
            let kingDest = this.getKingDestCastle(<SideType>isCastlingMove["sideType"], <CastleType>isCastlingMove["castleType"]);
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
        let possibleMoves = this.getAllPossibleMoves(destFileRank);

        for(let i = 0; i < possibleMoves.length; i++){
            let possibleMove = possibleMoves[i];
            if(this.isMoveLegal(possibleMove, isCheckGameState)){
                return true;
            }
        }

        return false;
    }
    public getAllLegalMoves(destFileRank : FileRank | null, isCheckGameState : boolean) : MoveClass[]{
        let ret = [];

        let possibleMoves = this.getAllPossibleMoves(destFileRank);

        for(let i = 0; i < possibleMoves.length; i++){
            let possibleMove = possibleMoves[i];
            if(this.isMoveLegal(possibleMove, isCheckGameState)){
                ret.push(possibleMove);
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
        }else if(originPiece.getPieceType() === PieceType.KING){
            this.dealWithCastling(moveClasses, originPiece, originFileRank, destFileRank);
        }

        //Promote pawns
        this.dealWithPawnPromotion(moveClasses);

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
        if(this.enPassantSquare === null){
            return;
        }


        let fairy = <FairyLeaper>this.captureFairy[originPiece.getSideType()][originPiece.getPieceType()];

        let enPassantMoveVectors = fairy.getVectors();
        let enPassantFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, enPassantMoveVectors);

        let pruneFunctions = [];
        if(destFileRank !== null){
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }

        pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, this.enPassantSquare));
        pruneFunctions.push(this.notLandOnPiece.bind(this));

        enPassantFileRanks = this.pruneFileRanksHelper(enPassantFileRanks, pruneFunctions);

        for(let i = 0; i < enPassantFileRanks.length; i++){
            let enPassantFileRank = enPassantFileRanks[i];

            let enPassantCaptureFileRank = new FileRank(enPassantFileRank.x, originFileRank.y);

            let enPassantCapturePiece = this.getPieceForFileRank(enPassantCaptureFileRank);

            let enPassantMoveClass = new MoveClass(originFileRank, enPassantFileRank);
            enPassantMoveClass.pushChange(originFileRank, originPiece, null);
            enPassantMoveClass.pushChange(enPassantCaptureFileRank, enPassantCapturePiece, null);
            enPassantMoveClass.pushChange(enPassantFileRank, null, originPiece);

            moveClasses.push(enPassantMoveClass);
        }
    }

    public dealWithPawnPromotion(moveClasses : MoveClass[]){
        let index = 0;
        while(index < moveClasses.length){
            let moveClass = moveClasses[index];
            for(let i = 0; i < moveClass.getLength(); i++){
                let change = moveClass.get(i);

                let fileRank = change["fileRank"];
                let originPiece = change["originPiece"];
                let destPiece = change["destPiece"];

                let addPromoteType = false;

                if(destPiece !== null){
                    if(destPiece.getPieceType() === PieceType.PAWN){
                        if(destPiece.getSideType() === SideType.WHITE && fileRank["rank"] === this.getNumOfRanks()){
                            addPromoteType = true;
                        }else if(destPiece.getSideType() === SideType.BLACK && fileRank["rank"] === 1){
                            addPromoteType = true;
                        }
                    }
                }


                if(addPromoteType){
                    destPiece = <PieceModel>destPiece;

                    change["destPiece"] = new PieceModel(PieceType.KNIGHT, destPiece.getSideType());

                    let promotionPieceTypes = [];

                    //promotionPieceTypes.push(PieceType.KNIGHT)
                    promotionPieceTypes.push(PieceType.BISHOP);
                    promotionPieceTypes.push(PieceType.ROOK);
                    promotionPieceTypes.push(PieceType.QUEEN);

                    for(let j = 0; j < promotionPieceTypes.length; j++){
                        let promotionPieceType = promotionPieceTypes[j];

                        let moveClassClone = moveClass.clone();
                        let moveClassCloneChange = moveClass.get(i);
                        moveClassCloneChange["destPiece"] = new PieceModel(promotionPieceType, destPiece.getSideType());

                        moveClasses.push(moveClassClone);
                    }
                }else{
                    index = index + 1;
                }
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
                        canAddCastleMove = canAddCastleMove && (AbstractEngine.fileRankEqual(destFileRank, rookOriginFileRank));
                    }else {
                        canAddCastleMove = canAddCastleMove && (AbstractEngine.fileRankEqual(destFileRank, kingDestFileRank));
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

                    castleMove.pushChange(kingDestFileRank, this.getPieceForFileRank(kingDestFileRank), kingPiece);
                    castleMove.pushChange(rookDestFileRank, this.getPieceForFileRank(rookDestFileRank), rookPiece);

                    if(!(AbstractEngine.fileRankEqual(kingOriginFileRank, kingDestFileRank) || AbstractEngine.fileRankEqual(kingOriginFileRank, rookDestFileRank))){
                        castleMove.pushChange(kingOriginFileRank, kingPiece, null);
                    }

                    if(!(AbstractEngine.fileRankEqual(rookOriginFileRank, kingDestFileRank) || AbstractEngine.fileRankEqual(rookOriginFileRank, rookDestFileRank))){
                        castleMove.pushChange(rookOriginFileRank, rookPiece, null);
                    }

                    moveClasses.push(castleMove);
                }
            }
        }
    };



    public isDrawByInsufficientMaterial(){
        let activePieceMap : {[key : number] : FileRank[]}= {};
        for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; pieceType++){
            activePieceMap[pieceType] = [];
        }


        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            for(let pieceType = PieceType.FIRST_PIECE; pieceType <= PieceType.LAST_PIECE; pieceType++){
                activePieceMap[pieceType] = activePieceMap[pieceType].concat(this.getSquaresBySideTypePieceType(sideType, pieceType));
            }
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
    };

    public isDrawBy50Moves():boolean{
        return this.halfMoveClockVector[this.halfMoveClockVector.length - 1] >= 100;
    }
    public isDrawByThreeRepetition():boolean {
        let lastFenStr = this.getLastFenStr();
        let lastSplitFenStr = lastFenStr.split(" ");

        let lastPiecePlacement = lastSplitFenStr[0];
        let lastMoveTurn = lastSplitFenStr[1];
        let lastCastling = lastSplitFenStr[2];
        let lastEnPassant = lastSplitFenStr[3];

        let numSame = 0;
        for(let i = this.fenStrings.length - 1; i >= 0; i--){
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

            if(isSame){
                numSame += 1;
            }
        }

        return numSame >= 3
    }



    public getMoveClassForCurrentBoardAndSanMove(sanMove : string):MoveClass | null {
        let retMove: MoveClass | null = null;

        let sideType = this.getMoveTurn();

        console.debug("parsing sanMove ", sanMove);
        //Remove all the charectars at the end of the string
        let isBreak = false;
        do {
            isBreak = true;

            let lastChar = sanMove[sanMove.length - 1];
            if(lastChar == "#" || lastChar == "+" || lastChar == "!" || lastChar == "?"){
                isBreak = false;
                sanMove = sanMove.slice(0, -1);
            }
        }while(!isBreak);


        if (sanMove == "O-O" || sanMove == "O-O-O"){ //CastlingType
            let castleType: CastleType = CastleType.KING_SIDE;
            if (sanMove == "O-O") {
                castleType = CastleType.KING_SIDE
            } else if (sanMove == "O-O-O") {
                castleType = CastleType.QUEEN_SIDE
            }


            let kingOrigin = <FileRank>this.getKingOriginCastle(sideType);
            let kingDest = this.getKingDestCastle(sideType, <CastleType>castleType);

            let legalMove = this.getLegalMoves(kingOrigin, kingDest, false);
            if (legalMove.length == 1) {
                retMove = legalMove[0]
            }
        }else {
            //Extract the promotion piece
            let promotionPieceType : PieceType | null = null;
            {
                let lastChar = sanMove[sanMove.length - 1];
                let piece : PieceModel | null = ChessEngine.fenCharToSideTypePieceType(lastChar);

                if(piece != null){
                    promotionPieceType = piece.getPieceType();
                    sanMove = sanMove.slice(0, -1);
                }
            }
            //Extract the destination fileRank
            let destFileRank : FileRank;
            {
                let file = sanMove[sanMove.length - 2];
                let rank = Number(sanMove[sanMove.length - 1]);

                destFileRank = new FileRank(<number>ChessEngine.convertFileToFileNumber(file), rank);

                sanMove = sanMove.slice(0, -1);
                sanMove = sanMove.slice(0, -1);
            }
            //Get rid of unwanted x
            if(sanMove[sanMove.length - 1] == "x"){
                sanMove = sanMove.slice(0, -1);
            }


            //Extract the origin file rank
            let originFileNumber :number | null = null;
            let originRank : number | null = null;
            if(sanMove.length > 0){
                let _originRank = Number(sanMove[sanMove.length - 1]);
                if(!isNaN(_originRank)){
                    originRank = _originRank;
                    sanMove = sanMove.slice(0, -1);
                }

                let _originFile = sanMove[sanMove.length - 1];
                originFileNumber = ChessEngine.convertFileToFileNumber(_originFile);
                if(originFileNumber != null){
                    sanMove = sanMove.slice(0, -1);
                }

            }
            //Extract the piecetype
            let pieceType : PieceType;
            if(sanMove.length == 0){
                pieceType = PieceType.PAWN;
            }else {
                let piece = <PieceModel>ChessEngine.fenCharToSideTypePieceType(sanMove);
                pieceType = piece.getPieceType();
            }


            let squarePieces : FileRank[] = this.getSquaresBySideTypePieceType(sideType, pieceType);
            let newSquarePieces : FileRank[] = [];

            for(let i = 0; i < squarePieces.length; i++){
                let squarePiece = squarePieces[i];

                let insertNewSquare = true;

                if(originFileNumber != null){
                    if(originFileNumber != squarePiece.x){
                        insertNewSquare = false;
                    }
                }

                if(originRank != null){
                    if(originRank != squarePiece.y){
                        insertNewSquare = false;
                    }
                }

                if(insertNewSquare){
                    newSquarePieces.push(squarePiece);
                }
            }

            squarePieces = newSquarePieces;


            let moveClasses : MoveClass[] = [];
            for(let i = 0; i < squarePieces.length; i++){
                let squarePiece = squarePieces[i];
                let legalMoves = this.getLegalMoves(squarePiece, destFileRank, false);

                moveClasses = moveClasses.concat(legalMoves);
            }

            if(moveClasses.length == 1){
                retMove = moveClasses[0]
            }else {
                for(let i = 0; i < moveClasses.length; i++){
                    let moveClass = moveClasses[i];
                    let isPromotionMove = this.isPromotionMove(moveClass);
                    if(isPromotionMove["isPromotionMove"]){
                        let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
                        if(promotionPieceTypes.length == 1){
                            if(promotionPieceType == promotionPieceTypes[0]){
                                retMove = moveClass;
                            }
                        }
                    }
                }
            }
        }

        return retMove
    }

    public getSANMovesForCurrentBoardAndMoveClasses(moveClasses : MoveClass[]):string[]{
        let ret : string[] = [];
        for(let i = 0; i < moveClasses.length; i++){
            ret.push(this.getSANMoveForCurrentBoardAndMoveClass(moveClasses[i]));
        }

        return ret;
    }
    public getSANMoveForCurrentBoardAndMoveClass(moveClass : MoveClass):string{
        super.doMove(moveClass);
        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        this.updateGameState();

        let str = this.getSANMoveForLastMoveClass();

        this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
        super.undoMove();
        this.updateGameState();

        return str;
    }
    public getSANMoveForLastMoveClass():string{
        let moveClass = <MoveClass>this.getLastMoveClass();


        let str = "";
        let originFileRank = moveClass.originFileRank;
        let destFileRank = moveClass.destFileRank;


        let castlingMove = this.isCastlingMove(moveClass);
        if(castlingMove["isCastlingMove"]){
            let sType = <SideType>castlingMove["sideType"];
            let cType = <CastleType>castlingMove["castleType"];

            if(cType == CastleType.KING_SIDE){
                str = "O-O";
            }else if(cType == CastleType.QUEEN_SIDE){
                str = "O-O-O";
            }
        }else {

            let isAmbiguous = false;
            let numOfFileAmbiguous = 0;
            let numOfRankAmbiguous = 0;

            super.undoMove();
            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));

            let piece = <PieceModel>this.getPieceForFileRank(moveClass.originFileRank);
            let pieceType = piece.getPieceType();

            let pieceSquares = this.getSquaresBySideTypePieceType(piece.getSideType(), piece.getPieceType());

            for(let i = 0; i < pieceSquares.length; i++){
                let pSquare = pieceSquares[i];
                if(AbstractEngine.fileRankNotEqual(pSquare, originFileRank)){
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

            this.setMoveTurn(ChessEngine.getOppositeSideType(this.getMoveTurn()));
            super.doMove(moveClass);


            if(pieceType != PieceType.PAWN){
                str = ChessEngine.sideTypePieceTypeToFenChar(SideType.WHITE, pieceType);
            }

            if(isAmbiguous){
                if(numOfFileAmbiguous == 0){
                    str = str + ChessEngine.convertFileNumberToFile(originFileRank.fileNumber);
                }else if(numOfRankAmbiguous == 0){
                    str = str + String(originFileRank.rank);
                }else {
                    str = str + ChessEngine.convertFileNumberToFile(originFileRank.fileNumber);
                    str = str + String(originFileRank.rank);
                }
            }

            if(this.isCaptureMove(moveClass)){
                str = str + "x";
            }

            str = str + ChessEngine.convertFileNumberToFile(destFileRank.fileNumber);
            str = str + String(destFileRank.rank);

            let isPromotionMove = this.isPromotionMove(moveClass);
            if(isPromotionMove["isPromotionMove"]){
                str = str + "=";
                let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
                for(let i = 0; i < promotionPieceTypes.length; i++){
                    let promotionPieceType = promotionPieceTypes[i];
                    str = str + ChessEngine.sideTypePieceTypeToFenChar(SideType.WHITE, promotionPieceType);
                }
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



    public getUCIMovesForMoveClasses(moveClasses : MoveClass[]):string[]{
        let ret :string[] = [];
        for(let i = 0; i < moveClasses.length; i++){
            ret.push(this.getUCIMoveForMoveClass(moveClasses[i]));
        }

        return ret;
    }
    public getUCIMoveForMoveClass(moveClass : MoveClass):string{
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

        if(isPromotionMove["isPromotionMove"]){
            let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
            for(let i = 0; i < promotionPieceTypes.length; i++){
                let promotionPieceType = promotionPieceTypes[i];
                uciMove = uciMove + ChessEngine.sideTypePieceTypeToFenChar(SideType.BLACK, promotionPieceType);
            }
        }


        return uciMove;
    }

    public getMoveClassForUCIMove(uciMove : string):MoveClass | null {
        //checking whether this uciMove is valid
        if(uciMove.length !== 4 && uciMove.length !== 5){
            return null;
        }

        let file1 = uciMove[0];
        let fileNumber1 = ChessEngine.convertFileToFileNumber(file1);

        if(fileNumber1 == null){
            return null;
        }

        let rank1 = parseInt(uciMove[1]);
        if(isNaN(rank1)){
            return null;
        }

        if(rank1 < 1 || rank1 > this.getNumOfRanks()){
            return null;
        }

        let fileRank1 = new FileRank(fileNumber1, rank1);


        let file2 = uciMove[2];
        let fileNumber2 = ChessEngine.convertFileToFileNumber(file2);

        if(fileNumber2 == null){
            return null;
        }

        let rank2 = parseInt(uciMove[3]);
        if(isNaN(rank2)){
            return null;
        }

        if(rank2 < 1 || rank2 > this.getNumOfRanks()){
            return null;
        }

        let fileRank2 = new FileRank(fileNumber2, rank2);


        let legalMoves = this.getLegalMoves(fileRank1, fileRank2, false);


        let ret = null;
        if(legalMoves.length == 1){
            if(uciMove.length !== 4){
                return null;
            }

            ret = legalMoves[0];
        }else {
            if(uciMove.length !== 5){
                return null;
            }

            let c = uciMove[5];
            let sideTypePieceType = ChessEngine.fenCharToSideTypePieceType(c);
            if(sideTypePieceType == null){
                return null;
            }else {
                for(let i = 0; i < legalMoves.length; i++){
                    let legalMove = legalMoves[i];

                    let isPromotionMove = this.isPromotionMove(legalMove);

                    if(isPromotionMove["isPromotionMove"]){
                        let promotionPieceTypes = isPromotionMove["promotionPieceTypes"];
                        if(promotionPieceTypes[0] == sideTypePieceType["pieceType"]){
                            ret = legalMove;
                        }
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
                    fenStr += ChessEngine.sideTypePieceTypeToFenChar(piece.getSideType(), piece.getPieceType());
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
        if(this.getMoveTurn() == SideType.WHITE){
            fenStr += "w"
        }else if(this.getMoveTurn() == SideType.BLACK){
            fenStr += "b";
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
                            char = ChessEngine.sideTypePieceTypeToFenChar(sideType, PieceType.KING);
                            break;
                        case CastleType.QUEEN_SIDE:
                            char = ChessEngine.sideTypePieceTypeToFenChar(sideType, PieceType.QUEEN);
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
            let fileNumber = this.enPassantSquare.x;
            let file = <string>ChessEngine.convertFileNumberToFile(fileNumber);
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
}
