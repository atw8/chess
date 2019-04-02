import {SideType} from "./SideType";
import {PieceType} from "./PieceType";
import {MoveClass} from "./MoveClass";
import {FileRank} from "./FileRank";
import {PieceModel} from "./PieceModel";
import {Fairy} from "./Fairy/Fairy";
import {FairyType} from "./Fairy/FairyType";
import {FairyStupid} from "./Fairy/FairyStupid";
import {FairyLeaper} from "./Fairy/FairyLeaper";
import {FairyRider} from "./Fairy/FairyRider";


export class AbstractEngine {
    private readonly numOfFiles : number;
    private readonly numOfRanks : number;
    private readonly pieceSet : PieceType[];
    private readonly sideSet : SideType[];

    protected moveClasses : MoveClass[];

    private royalPieces : { [key : number] : PieceType[] };

    protected pieceToSquareMap : { [key : number] : { [key : number] : FileRank[] }};

    private fileRankPieces :  {[key : number]  : { [key : number] : PieceModel | null }};


    constructor(numOfFiles : number, numOfRanks : number, pieceSet : PieceType[], sideSet : SideType[]){
        this.numOfFiles = numOfFiles;
        this.numOfRanks = numOfRanks;
        this.pieceSet = pieceSet;
        this.sideSet = sideSet;

        this.fileRankPieces = {};


        this.outitModel();

    }

    public getMoveClasses():MoveClass[]{
        return this.moveClasses;
    }
    public getFirstMoveClass():MoveClass | null{
        let ret : MoveClass | null;
        if(this.moveClasses.length == 0){
            ret = null;
        }else {
            ret = this.moveClasses[0];
        }

        return ret;
    }
    public getLastMoveClass():MoveClass | null{
        let ret : MoveClass | null;
        if(this.moveClasses.length == 0){
            ret = null;
        }else {
            ret = this.moveClasses[this.moveClasses.length - 1];
        }

        return ret;
    }

    public getNumOfFiles():number{
        return this.numOfFiles;
    }
    public getNumOfRanks():number{
        return this.numOfRanks;
    }

    public getPieceToSquareMap():{ [key : number] : { [key : number] : FileRank[] }}{
        return this.pieceToSquareMap;
    }


    protected outitModel(){
        this.moveClasses = [];
        this.royalPieces = {};

        this.pieceToSquareMap = {};


        for(let fileNumber = 1; fileNumber <= this.getNumOfFiles(); fileNumber++){
            this.fileRankPieces[fileNumber] = {};
            for(let rank = 1; rank <= this.getNumOfRanks(); rank++){
                this.fileRankPieces[fileNumber][rank] = null;
            }
        }

        for(let i = 0; i < this.sideSet.length; i++){
            let sideType = this.sideSet[i];

            this.royalPieces[sideType] = [];
            this.pieceToSquareMap[sideType] = {};

            for(let j = 0; j < this.pieceSet.length; j++){
                let pieceType = this.pieceSet[j];

                this.pieceToSquareMap[sideType][pieceType] = [];
            }
        }
    };


    public setPieceToRoyal(sideType : SideType, pieceType : PieceType){
        this.royalPieces[sideType].push(pieceType);
    }
    public getSquaresBySideTypePieceType(sideType : SideType, pieceType : PieceType) : FileRank[] {
        return this.pieceToSquareMap[sideType][pieceType];
    }

    public getSquaresByPieceType(pieceType : PieceType) : FileRank[]{
        let ret : FileRank[] = [];

        for(let i = 0; i < this.sideSet.length; i++){
            let sideType = this.sideSet[i];
            ret = ret.concat(this.getSquaresBySideTypePieceType(sideType, pieceType));
        }

        return ret;
    }
    public getSquaresBySideType(sideType : SideType){
        let ret : FileRank[] = [];

        for(let i = 0; i < this.pieceSet.length; i++){
            let pieceType = this.pieceSet[i];
            ret = ret.concat(this.getSquaresBySideTypePieceType(sideType, pieceType));
        }

        return ret;
    }


    public getRoyalPieceSquares(sideType : SideType):FileRank[]{
        let ret = [] as FileRank[];
        let royalSidePieces = this.royalPieces[sideType];
        for(let i = 0; i < royalSidePieces.length; i++){
            let royalSidePiece = royalSidePieces[i];
            ret = ret.concat(this.getSquaresBySideTypePieceType(sideType, royalSidePiece));
        }

        return ret;
    };


    public isFileRankLegal(pos : FileRank) : boolean{
        return ! ( pos.x < 1 || pos.x > this.getNumOfFiles() || pos.y < 1 || pos.y > this.getNumOfRanks() );
    };

    public static fileRankEqual(fileRank1 : FileRank, fileRank2 : FileRank) : boolean{
        return fileRank1.x == fileRank2.x && fileRank1.y == fileRank2.y;
    };

    public static fileRankNotEqual(fileRank1 : FileRank, fileRank2 : FileRank) : boolean{
        return !AbstractEngine.fileRankEqual(fileRank1, fileRank2);
    };

    public notLandOnPiece(destFileRank : FileRank) :boolean{
        return this.getPieceForFileRank(destFileRank) === null;
    };

    public landOnPiece(destFileRank : FileRank) : boolean{
        return !this.notLandOnPiece(destFileRank);
    };

    public landOnSideType(sideType : SideType, destFileRank : FileRank) : boolean{
        let piece = this.getPieceForFileRank(destFileRank);

        let ret;
        if(piece !== null){
            ret = piece.getSideType() === sideType;
        }else {
            ret = false;
        }

        return ret;
    };

    public notLandOnSideType(sideType : SideType, destFileRank : FileRank):boolean{
        return !this.landOnSideType(sideType, destFileRank);
    };

    public orFunctionHelper(pruneFunctions1:( (x : FileRank) => boolean )[], pruneFunctions2 : ( (x : FileRank) => boolean )[], destFileRank : FileRank):boolean{
        return this.pruneFileRankHelper(destFileRank, pruneFunctions1) || this.pruneFileRankHelper(destFileRank, pruneFunctions2);
    };


    public andFunctionHelper(pruneFunctions1:( (x : FileRank) => boolean )[], pruneFunctions2:( (x : FileRank) => boolean )[], destFileRank : FileRank):boolean{
        return this.pruneFileRankHelper(destFileRank, pruneFunctions1) && this.pruneFileRankHelper(destFileRank, pruneFunctions2);
    };


    public pruneFileRankHelper(destFileRank : FileRank, pruneFunctions:( (x : FileRank) => boolean )[]):boolean{
        for(let i = 0; i < pruneFunctions.length; i++){
            let pruneFunction = pruneFunctions[i];
            if(!pruneFunction(destFileRank)){
                return false;
            }
        }

        return true;
    };
    public pruneFileRanksHelper(destFileRanks : FileRank[], pruneFunctions:( (x : FileRank) => boolean )[]):FileRank[]{
        let newDestFileRanks = [];
        for(let i = 0; i < destFileRanks.length; i++){
            let destFileRank = destFileRanks[i];
            if(this.pruneFileRankHelper(destFileRank, pruneFunctions)){
                newDestFileRanks.push(destFileRank);
            }
        }

        return newDestFileRanks;
    };





    public getPieceForFileRank( pos : FileRank):PieceModel|null{
        let ret = null;
        if(this.isFileRankLegal(pos)){
            ret = this.fileRankPieces[pos.x][pos.y];
        }else {
            ret = null;
        }

        return ret;
    };

    public setPieceForFileRank(pos : FileRank, piece : PieceModel | null){
        let oldPiece = this.fileRankPieces[pos.x][pos.y];
        if(oldPiece !== null){
            let sideType = oldPiece.getSideType();
            let pieceType = oldPiece.getPieceType();

            let squareArray = this.pieceToSquareMap[sideType][pieceType];
            let squareArrayIndex = null;

            for(let i = 0; i < squareArray.length; i++){
                let square = squareArray[i];

                if(square.x === pos.x && square.y === pos.y){
                    squareArrayIndex = i;
                }
            }

            if(squareArrayIndex !== null){
                squareArray.splice(squareArrayIndex, 1);
            }

        }

        if(piece !== null){
            let sideType = piece.getSideType();
            let pieceType = piece.getPieceType();

            this.pieceToSquareMap[sideType][pieceType].push(pos);
        }

        this.fileRankPieces[pos.x][pos.y] = piece;
    };


    public getMoveClassForOriginDest(originFileRank : FileRank, destFileRank : FileRank) : MoveClass{
        let moveClass = new MoveClass(originFileRank, destFileRank);

        moveClass.pushChange(originFileRank, this.getPieceForFileRank(originFileRank), null);
        moveClass.pushChange(destFileRank, this.getPieceForFileRank(destFileRank), this.getPieceForFileRank(originFileRank));

        return moveClass;
    };
    public getMoveClassesForOriginDestinations(originFileRank : FileRank, destFileRanks : FileRank[], moveClasses : MoveClass[]){
        for(let i = 0; i < destFileRanks.length; i++){
            let destFileRank = destFileRanks[i];
            let moveClass = this.getMoveClassForOriginDest(originFileRank, destFileRank);

            moveClasses.push(moveClass);
        }
    };



    //Helper functions to deal with the different fairies
    public getDestFileRankFromOriginFileRankMoveVector(oldFileRank : FileRank, moveVectors : FileRank[]) :FileRank[]{
        let newFileRanks = [];

        for(let i = 0; i < moveVectors.length; i++){
            let moveVector = moveVectors[i];
            newFileRanks.push(FileRank.addFileRank(oldFileRank, moveVector));
        }

        return newFileRanks;
    };


    public isRay(origin : FileRank, dest : FileRank, vector : {x : number, y : number}) : boolean{
        let originX = origin.x;
        let originY = origin.y;

        let destX = dest.x;
        let destY = dest.y;

        let vecX = vector["x"];
        let vecY = vector["y"];

        let ret = false;

        if(vecX === 0 && vecY === 0){
            ret = (originX === destX) && (originY === destY);
        }else if(vecX === 0 && vecY !== 0){
            if(originX === destX){
                let tY = (destY - originY)/vecY;

                ret = tY > 0;
            }else {
                ret = false;
            }
        }else if(vecX !== 0 && vecY === 0){
            if(originY === destY){
                let tX = (destX - originX)/vecX;

                ret = tX > 0;
            }else {
                ret = false;
            }
        }else if(vecX !== 0 && vecY !== 0){
            let tX = (destX - originX)/vecX;
            let tY = (destY - originY)/vecY;

            ret = (tX === tY) && (tX > 0) && (tY > 0);
        }

        return ret;
    };



    //The function that deal with normal fairy moves
    public getNormalMovesForFairy(originFileRank : FileRank, destFileRank : FileRank | null , fairy : Fairy, moveClasses : MoveClass[]){
        let fairyType = fairy.getFairyType();
        if(fairyType === FairyType.RIDER){
            this.getNormalMovesForFairyRider(originFileRank, destFileRank, <FairyRider>fairy, moveClasses);
        }else if(fairyType === FairyType.LEAPER){
            this.getNormalMovesForFairyLeaper(originFileRank, destFileRank, <FairyLeaper>fairy, moveClasses);
        }else if(fairyType === FairyType.STUPID){
            this.getNormalMovesForFairyStupid(originFileRank, destFileRank, <FairyStupid>fairy, moveClasses);
        }
    };

    public getNormalMovesForFairyRider(originFileRank : FileRank, destFileRank :FileRank | null, fairyRider : FairyRider, moveClasses : MoveClass[]){
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);

        let destFileRanks : FileRank[] = [];

        let normalMovePruneFunctions : ( ( x: FileRank) => boolean )[] = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        normalMovePruneFunctions.push(this.notLandOnPiece.bind(this));

        let getFromMoveVector = (moveVector : FileRank) =>{
            if(destFileRank !== null){
                if(! this.isRay(originFileRank, destFileRank, moveVector)){
                    return;
                }
            }

            let normalMoveFileRank = FileRank.addFileRank(originFileRank, moveVector);
            while(this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)){
                if(destFileRank === null){
                    destFileRanks.push(normalMoveFileRank);
                }else {
                    if(AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)){
                        destFileRanks.push(normalMoveFileRank);
                    }
                }

                normalMoveFileRank.addFileRank(moveVector);
            }
        };


        for(let i = 0; i < moveVectors.length; i++){
            let moveVector = moveVectors[i];

            getFromMoveVector(moveVector);
        }

        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };

    public getNormalMovesForFairyLeaper(originFileRank : FileRank, destFileRank : FileRank | null, fairyLeaper : FairyLeaper, moveClasses : MoveClass[]){
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);

        let pruneFunctions : ( (x : FileRank) => boolean)[]= [];
        if(destFileRank !== null){
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }

        pruneFunctions.push(this.isFileRankLegal.bind(this));

        pruneFunctions.push(this.notLandOnPiece.bind(this));

        destFileRanks = this.pruneFileRanksHelper(destFileRanks, pruneFunctions);

        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };

    public getNormalMovesForFairyStupid(originFileRank : FileRank, destFileRank : FileRank | null, fairyStupid : FairyStupid , moveClasses : MoveClass[]){
        let moveVectors = fairyStupid.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);

        let destFileRanks = [];

        for(let i = 0; i < moveVectors.length; i++){
            let moveVector = moveVectors[i];

            let _destFileRank = FileRank.addFileRank(originFileRank, moveVector["vec"]);

            let pruneFunctions = [];
            if(destFileRank !== null){
                pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
            }

            pruneFunctions.push(this.isFileRankLegal.bind(this));
            for(let j = 0; j < moveVector["emptyVec"].length; j++){
                let empPos = moveVector["emptyVec"][j];

                let pos = FileRank.addFileRank(originFileRank, empPos);
                if(this.getPieceForFileRank(pos) !== null){
                    pruneFunctions.push(function(){ return false;});
                }

                pruneFunctions.push(this.notLandOnPiece.bind(this));

                if(this.pruneFileRankHelper(_destFileRank, pruneFunctions)){
                    destFileRanks.push(_destFileRank);
                }
            }
        }


        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };


    //The functions that deal with capture fairy moves
    public getCaptureMovesForFairy(originFileRank : FileRank, destFileRank : FileRank | null, fairy : Fairy, moveClasses : MoveClass[]){
        let fairyType = fairy.getFairyType();
        if(fairyType === FairyType.RIDER){
            this.getCaptureMovesForFairyRider(originFileRank, destFileRank, <FairyRider>fairy, moveClasses);
        }else if(fairyType === FairyType.LEAPER){
            this.getCaptureMovesForFairyLeaper(originFileRank, destFileRank, <FairyLeaper>fairy, moveClasses);
        }else if(fairyType === FairyType.STUPID){
            this.getCaptureMovesForFairyStupid(originFileRank, destFileRank, <FairyStupid>fairy, moveClasses);
        }
    };


    public getCaptureMovesForFairyRider(originFileRank : FileRank, destFileRank : FileRank | null, fairyRider : FairyRider, moveClasses : MoveClass[]){
        let moveVectors = fairyRider.getVectors();
        let originPiece = <PieceModel>this.getPieceForFileRank(originFileRank);

        let destFileRanks : FileRank[] = [];

        let normalMovePruneFunctions : ( ( x: FileRank) => boolean )[] = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        normalMovePruneFunctions.push(this.notLandOnPiece.bind(this));

        let captureMovePruneFunctions :( ( x: FileRank) => boolean )[] = [];
        captureMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        captureMovePruneFunctions.push(this.landOnPiece.bind(this));
        captureMovePruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));



        let getFromMoveVector = (moveVector : FileRank) => {
            if(destFileRank !== null){
                if(! this.isRay(originFileRank, destFileRank, moveVector)){
                    return;
                }
            }

            let normalMoveFileRank = FileRank.addFileRank(originFileRank, moveVector);
            while(this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)){
                normalMoveFileRank.addFileRank(moveVector);
            }

            let captureMoveFileRank = normalMoveFileRank;

            if(destFileRank !== null){
                if(AbstractEngine.fileRankNotEqual(captureMoveFileRank, destFileRank)){
                    return;
                }
            }

            if(this.pruneFileRankHelper(captureMoveFileRank, captureMovePruneFunctions)){
                destFileRanks.push((captureMoveFileRank));
            }
        };


        for(let i = 0; i < moveVectors.length; i++){
            let moveVector = moveVectors[i];

            getFromMoveVector(moveVector);
        }

        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };

    public getCaptureMovesForFairyLeaper(originFileRank : FileRank, destFileRank : FileRank | null, fairyLeaper : FairyLeaper, moveClasses : MoveClass[]){
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);
        let originPiece = <PieceModel>this.getPieceForFileRank(originFileRank);


        let pruneFunctions : ( ( x: FileRank) => boolean )[] = [];
        if(destFileRank !== null){
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }

        pruneFunctions.push(this.isFileRankLegal.bind(this));


        pruneFunctions.push(this.landOnPiece.bind(this));
        pruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));


        destFileRanks = this.pruneFileRanksHelper(destFileRanks, pruneFunctions);

        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };

    public getCaptureMovesForFairyStupid(originFileRank : FileRank, destFileRank : FileRank | null, fairyStupid : FairyStupid, moveClasses : MoveClass[]){
        let moveVectors = fairyStupid.getVectors();
        let originPiece = <PieceModel>this.getPieceForFileRank(originFileRank);

        let destFileRanks = [];

        for(let i = 0; i < moveVectors.length; i++){
            let moveVector = moveVectors[i];

            let _destFileRank = FileRank.addFileRank(originFileRank, moveVector["vec"]);

            let pruneFunctions : ( ( x: FileRank) => boolean )[] = [];
            if(destFileRank !== null){
                pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
            }

            pruneFunctions.push(this.isFileRankLegal);
            for(let j = 0; j < moveVector["emptyVec"].length; j++){
                let empPos = moveVector["emptyVec"][j];

                let pos = FileRank.addFileRank(originFileRank, empPos);
                if(this.getPieceForFileRank(pos) !== null){
                    pruneFunctions.push(function(){ return false;});
                }

                pruneFunctions.push(this.landOnPiece.bind(this));
                pruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));


                if(this.pruneFileRankHelper(_destFileRank, pruneFunctions)){
                    destFileRanks.push(_destFileRank);
                }
            }
        }


        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };




    public getCaptureNormalMovesForFairy(originFileRank : FileRank, destFileRank : FileRank | null, fairyCapture : Fairy, fairyNormal : Fairy, moveClasses : MoveClass[]){
        if(fairyNormal !== fairyCapture){
            this.getNormalMovesForFairy(originFileRank, destFileRank, fairyNormal, moveClasses);
            this.getCaptureMovesForFairy(originFileRank, destFileRank, fairyCapture, moveClasses);
        }else {
            let fairyType = fairyNormal.getFairyType();
            if(fairyType === FairyType.RIDER){
                this.getCaptureNormalMovesForFairyRider(originFileRank, destFileRank, <FairyRider>fairyNormal, moveClasses);
            }else if(fairyType === FairyType.LEAPER){
                this.getCaptureNormalMovesForFairyLeaper(originFileRank, destFileRank, <FairyLeaper>fairyNormal, moveClasses);
            }else if(fairyType === FairyType.STUPID){
                this.getCaptureNormalMovesForFairyStupid(originFileRank, destFileRank, <FairyStupid>fairyNormal, moveClasses);
            }
        }
    };

    public getCaptureNormalMovesForFairyRider(originFileRank : FileRank, destFileRank : FileRank | null, fairyRider : FairyRider, moveClasses : MoveClass[]){
        let moveVectors = fairyRider.getVectors();
        let originPiece = <PieceModel>this.getPieceForFileRank(originFileRank);

        let destFileRanks : FileRank[] = [];

        let normalMovePruneFunctions: ( ( x: FileRank) => boolean )[] = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        normalMovePruneFunctions.push(this.notLandOnPiece.bind(this));

        let captureMovePruneFunctions: ( ( x: FileRank) => boolean )[] = [];
        captureMovePruneFunctions.push(this.isFileRankLegal.bind(this));
        captureMovePruneFunctions.push(this.landOnPiece.bind(this));
        captureMovePruneFunctions.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));

        let getFromMoveVector = (moveVector : FileRank) =>{
            if(destFileRank !== null){
                if(! this.isRay(originFileRank, destFileRank, moveVector)){
                    return;
                }
            }

            let normalMoveFileRank = FileRank.addFileRank(originFileRank, moveVector);
            while(this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)){
                if(destFileRank === null){
                    destFileRanks.push(normalMoveFileRank);
                }else {
                    if(AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)){
                        destFileRanks.push(normalMoveFileRank);
                    }
                }

                normalMoveFileRank.addFileRank(moveVector);
            }

            let captureMoveFileRank = normalMoveFileRank;

            if(destFileRank !== null){
                if(AbstractEngine.fileRankNotEqual(captureMoveFileRank, destFileRank)){
                    return;
                }
            }

            if(this.pruneFileRankHelper(captureMoveFileRank, captureMovePruneFunctions)){
                destFileRanks.push((captureMoveFileRank));
            }
        };


        for(let i = 0; i < moveVectors.length; i++){
            let moveVector = moveVectors[i];

            getFromMoveVector(moveVector);
        }

        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };

    public getCaptureNormalMovesForFairyLeaper(originFileRank : FileRank, destFileRank : FileRank | null, fairyLeaper : FairyLeaper, moveClasses : MoveClass[]){
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);
        let originPiece = <PieceModel>this.getPieceForFileRank(originFileRank);

        let pruneFunctions : ( ( x: FileRank) => boolean )[] = [];
        if(destFileRank !== null){
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
    };
    public getCaptureNormalMovesForFairyStupid(originFileRank : FileRank, destFileRank : FileRank | null, fairyStupid : FairyStupid, moveClasses : MoveClass[]){
        let moveVectors = fairyStupid.getVectors();
        let originPiece = <PieceModel>this.getPieceForFileRank(originFileRank);

        let destFileRanks = [];

        for(let i = 0; i < moveVectors.length; i++){
            let moveVector = moveVectors[i];

            let _destFileRank = FileRank.addFileRank(originFileRank, moveVector["vec"]);

            let pruneFunctions : ( ( x: FileRank) => boolean )[] = [];
            if(destFileRank !== null){
                pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
            }

            pruneFunctions.push(this.isFileRankLegal.bind(this));
            for(let j = 0; j < moveVector["emptyVec"].length; j++){
                let empPos = moveVector["emptyVec"][j];

                let pos = FileRank.addFileRank(originFileRank, empPos);
                if(this.getPieceForFileRank(pos) !== null){
                    pruneFunctions.push(function(){ return false;});
                }

                let pruneFunctionsNormal = [];
                pruneFunctionsNormal.push(this.notLandOnPiece.bind(this));

                let pruneFunctionsCapture = [];
                pruneFunctionsCapture.push(this.landOnPiece.bind(this));
                pruneFunctionsCapture.push(this.notLandOnSideType.bind(this, originPiece.getSideType()));

                pruneFunctions.push(this.orFunctionHelper.bind(this, pruneFunctionsNormal, pruneFunctionsCapture));

                if(this.pruneFileRankHelper(_destFileRank, pruneFunctions)){
                    destFileRanks.push(_destFileRank);
                }
            }
        }


        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    };



    //Functions that have to do with calculating vector moves
    public getVectorMovesForFairy(originFileRank : FileRank, destFileRank : FileRank | null, fairy : Fairy, moveClasses : MoveClass[]){
        let fairyType = fairy.getFairyType();
        if(fairyType == FairyType.RIDER){
            this.getVectorMovesForFairyRider(originFileRank, destFileRank, <FairyRider>fairy, moveClasses);
        }else if(fairyType == FairyType.LEAPER){
            this.getVectorMovesForFairyLeaper(originFileRank, destFileRank, <FairyLeaper>fairy, moveClasses);
        }else if(fairyType == FairyType.STUPID){
            this.getVectorMovesForFairyStupid(originFileRank, destFileRank, <FairyStupid>fairy, moveClasses);
        }
    }

    public getVectorMovesForFairyRider(originFileRank : FileRank, destFileRank : FileRank | null, fairyRider : FairyRider, moveClasses : MoveClass[]){
        let moveVectors = fairyRider.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);


        let destFileRanks : FileRank[] = [];

        let normalMovePruneFunctions : ( ( x: FileRank) => boolean )[] = [];
        normalMovePruneFunctions.push(this.isFileRankLegal.bind(this));

        let getFromMoveVector = (moveVector  : FileRank) => {
            if(destFileRank != null){
                if(!this.isRay(originFileRank, destFileRank, moveVector)){
                    return;
                }
            }

            let normalMoveFileRank = FileRank.addFileRank(originFileRank, moveVector);

            while(this.pruneFileRankHelper(normalMoveFileRank, normalMovePruneFunctions)){
                if(destFileRank == null){
                    destFileRanks.push(normalMoveFileRank);
                } else {
                    if(AbstractEngine.fileRankEqual(normalMoveFileRank, destFileRank)){
                        destFileRanks.push(normalMoveFileRank);
                    }
                }

                normalMoveFileRank.addFileRank(moveVector);
            }
        };


        for(let i = 0; i < moveVectors.length; i++){
            getFromMoveVector(moveVectors[i]);
        }


        return this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }

    public getVectorMovesForFairyLeaper(originFileRank : FileRank, destFileRank : FileRank | null, fairyLeaper : FairyLeaper, moveClasses : MoveClass[]){
        let moveVectors = fairyLeaper.getVectors();
        let destFileRanks = this.getDestFileRankFromOriginFileRankMoveVector(originFileRank, moveVectors);
        let originPiece = this.getPieceForFileRank(originFileRank);

        let pruneFunctions : ( ( x: FileRank) => boolean )[] = [];

        if(destFileRank != null){
            pruneFunctions.push(AbstractEngine.fileRankEqual.bind(this, destFileRank));
        }
        pruneFunctions.push(this.isFileRankLegal.bind(this));


        destFileRanks = this.pruneFileRanksHelper(destFileRanks, pruneFunctions);

        this.getMoveClassesForOriginDestinations(originFileRank, destFileRanks, moveClasses);
    }



    public getVectorMovesForFairyStupid(originFileRank : FileRank, destFileRank : FileRank | null, fairyStupid : FairyStupid, moveClasses : MoveClass[]){
        let moveVectors = fairyStupid.getVectors();
        let originPiece = this.getPieceForFileRank(originFileRank);

        let destFileRanks = [];
        for(let i = 0; i < moveVectors.length; i++) {
            let moveVector = moveVectors[i];
            let _destFileRank = FileRank.addFileRank(originFileRank, moveVector.vec);

            let pruneFunctions : ( ( x: FileRank) => boolean )[] = [];
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






    public getFileRankList(pos1 : FileRank, pos2 : FileRank, leftInclusive : boolean, rightInclusive : boolean) : FileRank[]{
        //let diffVec = { x : pos2.x - pos1.x, y : pos2.y - pos1.y};
        let diffVec = FileRank.subFileRank(pos2, pos1);


        if(diffVec["x"] !== diffVec["y"]){
            if(diffVec["x"] !== 0 && diffVec["y"] !== 0){
                return [];
            }
        }

        function getGradVec(diffVec : FileRank) : FileRank{
            let gradVec = new FileRank(0, 0);
            if(diffVec["x"] === 0){
                gradVec["x"] = 0;
            }else {
                gradVec["x"] = diffVec["x"] / Math.abs(diffVec["x"]);
            }

            if(diffVec["y"] === 0){
                gradVec["y"] = 0;
            }else {
                gradVec["y"] = diffVec["y"] / Math.abs(diffVec["y"]);
            }

            return gradVec;
        }


        let gradVec = getGradVec(diffVec);




        let startPos = pos1.clone();
        if(!leftInclusive){
            startPos.addFileRank(gradVec);
        }

        let endPos = pos2.clone();
        if(!rightInclusive){
            endPos.subFileRank(gradVec);
        }

        {
            let tmpDiffVec = FileRank.subFileRank(endPos, startPos);

            let tmpGradVec = getGradVec(tmpDiffVec);

            if(tmpGradVec["x"] !== gradVec["x"] || tmpGradVec["y"] !== gradVec["y"]){
                return [];
            }
        }


        let ret = [];
        while(AbstractEngine.fileRankNotEqual(startPos, endPos)){
            ret.push(startPos);
            startPos.addFileRank(gradVec);
        }
        ret.push(startPos);


        return ret;
    };

    public getPiecesFromFileRankToFileRank(pos1 : FileRank, pos2 : FileRank, leftInclusive : boolean, rightInclusive : boolean) : PieceModel[]{
        let fileRankList = this.getFileRankList(pos1, pos2, leftInclusive, rightInclusive);

        let ret : PieceModel[] = [];
        for(let i = 0; i < fileRankList.length; i++){
            let fileRank = fileRankList[i];
            let piece = this.getPieceForFileRank(fileRank);
            if(piece !== null){
                ret.push(piece);
            }
        }

        return ret;
    };









    public doMove(moveClass : MoveClass){
        this.moveClasses.push(moveClass);

        for(let i = 0; i < moveClass.getLength(); i++){
            let change = moveClass.get(i);

            let fileRank = change["fileRank"];
            let originPiece = change["originPiece"];
            let destPiece = change["destPiece"];


            if(originPiece != null){
                originPiece.incrNumOfTimesRemoved();
            }

            if(destPiece != null){
                destPiece.incrNumOfTimesAdded();
            }


            this.setPieceForFileRank(fileRank, destPiece);
        }
    };

    public undoMove(){
        let moveClass = this.moveClasses[this.moveClasses.length - 1];
        this.moveClasses.pop();

        for(let i = moveClass.getLength() - 1; i >= 0; i--){
            let change = moveClass.get(i);

            let fileRank = change["fileRank"];
            let originPiece = change["originPiece"];
            let destPiece = change["destPiece"];


            if(originPiece != null){
                originPiece.decrNumOfTimesRemoved();
            }

            if(destPiece != null){
                destPiece.decrNumOfTimesAdded();
            }

            this.setPieceForFileRank(fileRank, originPiece);
        }
    };


    public static flipMoveClass(moveClass : MoveClass):MoveClass{
        let ret : MoveClass = new MoveClass(moveClass.destFileRank, moveClass.originFileRank);

        for(let i = moveClass.getLength() - 1; i >= 0; i--){
            let change = moveClass.get(i);

            let fileRank = change["fileRank"];
            let originPiece = change["originPiece"];
            let destPiece = change["destPiece"];

            ret.pushChange(fileRank, destPiece, originPiece);
        }

        return ret;
    }

    public static concatMoveClasses(moveClasses : MoveClass[]){
        let originFileRank = moveClasses[0].originFileRank;
        let destFileRank = moveClasses[moveClasses.length - 1].destFileRank;

        let ret : MoveClass = new MoveClass(originFileRank, destFileRank);


        for(let i = 0; i < moveClasses.length; i++){
            let moveClass = moveClasses[i];

            for(let i = 0; i < moveClass.getLength(); i++){
                let change = moveClass.get(i);

                let fileRank = change["fileRank"];
                let originPiece = change["originPiece"];
                let destPiece = change["destPiece"];

                ret.pushChange(fileRank, destPiece, originPiece);
            }
        }

        return ret;
    }





    public getNumOfMoveClasses():number{
        return this.moveClasses.length;
    }


    public getHashForFileRank(fileRank : FileRank){
        let hash = (fileRank.y - 1) * this.getNumOfFiles() + (fileRank.x - 1);

        return hash;
    }

}