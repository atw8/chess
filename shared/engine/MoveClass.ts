import {PieceModel} from "./PieceModel";
import {FileRank} from "./FileRank";
import {ChessEngine} from "./ChessEngine";


export namespace MoveClass {
    export interface ChangeInterface {
        fileRank: FileRank;
        originPiece: PieceModel | null;
        destPiece: PieceModel | null;
    }

    export interface RemoveAddMoveStruct {
        removeStructs : RemoveStruct[];

        addStructs : AddStruct[];

        moveStructs : MoveStruct[];
    }


    export interface AddStruct {
        fileRank : FileRank;
        piece : PieceModel;
    }

    export interface RemoveStruct {
        fileRank: FileRank;
        piece: PieceModel;
    }

    export interface MoveStruct {
        originPiece : PieceModel;
        destPiece : PieceModel;
        originFileRank : FileRank;
        destFileRank : FileRank;
    }

}

export class MoveClass{
    public originFileRank : FileRank;
    public destFileRank : FileRank;

    private changeSequence : MoveClass.ChangeInterface[];

    private removeAddMoveStructs : {[key : number] : MoveClass.RemoveAddMoveStruct} = {};

    constructor(originFileRank : FileRank, destFileRank : FileRank){
        this.originFileRank = originFileRank;
        this.destFileRank = destFileRank;

        this.changeSequence = [];

        this.removeAddMoveStructs = {};
    }



    public pushChange(change : MoveClass.ChangeInterface){
        this.removeAddMoveStructs = {};

        this.changeSequence.push(change);
    }

    public getLength() :number{
        return this.changeSequence.length;
    };

    public get(i : number) : MoveClass.ChangeInterface{
        return this.changeSequence[i];
    };

    public getLastChangeForFileRank(fileRank : FileRank):MoveClass.ChangeInterface | null {
        if(this.changeSequence.length == 0){
            return null;
        }

        let ret: MoveClass.ChangeInterface | null = null;
        for(let i = this.changeSequence.length - 1; i >= 0 && ret == null; i--){
            let change : MoveClass.ChangeInterface = this.changeSequence[i];

            if(FileRank.isEqual(change.fileRank, fileRank)){
                ret = change;
            }
        }

        return ret;
    }


    public clone() : MoveClass{
        let ret = new MoveClass(this.originFileRank, this.destFileRank);
        for(let i = 0; i < this.getLength(); i++){
            let change = this.get(i);
            ret.pushChange({fileRank : change["fileRank"],
                originPiece : change["originPiece"],
                destPiece : change["destPiece"]});
        }

        return ret;
    }




    public getRemoveAddMoveMoveStruct(isStrict : boolean):MoveClass.RemoveAddMoveStruct{
        let isStrictIndex : number = isStrict ? 0 : 1;

        if(!(isStrictIndex in this.removeAddMoveStructs)){
            this.removeAddMoveStructs[isStrictIndex] =  this._getRemoveAddMoveStruct(isStrict);
        }

        return this.removeAddMoveStructs[isStrictIndex];
    }

    private _getRemoveAddMoveStruct(isStrict : boolean):MoveClass.RemoveAddMoveStruct{
        let originHashPieces : { hash : number, piece : PieceModel | null}[] = [];
        let destHashPieces : { hash : number, piece : PieceModel | null}[] = [];
        {
            let _originPieces : { [key : number] : PieceModel | null} = {};
            let _destPieces : { [key : number] : PieceModel | null} = {};
            for(let i = 0; i < this.getLength(); i++){
                let change = this.get(i);

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

                let moveStruct : MoveClass.MoveStruct | null = null;
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
        let removeStructs: MoveClass.RemoveStruct[] = [];
        let addStructs: MoveClass.AddStruct[] = [];
        let moveStructs: MoveClass.MoveStruct[] = [];


        let compareFunctionExact = (removePiece : PieceModel, addPiece : PieceModel) => {
            return PieceModel.isEqualTo(removePiece, addPiece);
        };

        let compareFunctionSide = (removePiece : PieceModel, addPiece : PieceModel) => {
            return removePiece.getSideType() == addPiece.getSideType();
        };

        let compareFunctionPieceType = (removePiece : PieceModel, addPiece : PieceModel) => {
            return removePiece.getPieceType() == addPiece.getPieceType();
        };

        let compareFunctionStupid = (removePiece : PieceModel, addPiece : PieceModel) => {
            return true;
        };

        makeMoveStructs(compareFunctionExact);
        if(!isStrict){
            makeMoveStructs(compareFunctionSide);
            makeMoveStructs(compareFunctionPieceType);
            makeMoveStructs(compareFunctionStupid);
        }


        for(let i = 0; i < originHashPieces.length; i++){
            let originHashPiece = originHashPieces[i];
            if(originHashPiece.piece != null){
                let removeStruct : MoveClass.RemoveStruct = {
                    piece : originHashPiece.piece,
                    fileRank : ChessEngine.getFileRankForHash(originHashPiece.hash),
                };

                removeStructs.push(removeStruct);
            }
        }
        for(let i = 0; i < destHashPieces.length; i++){
            let destHashPiece = destHashPieces[i];
            if(destHashPiece.piece != null){
                let addStruct : MoveClass.AddStruct = {
                    piece : destHashPiece.piece,
                    fileRank : ChessEngine.getFileRankForHash(destHashPiece.hash),
                };

                addStructs.push(addStruct);
            }
        }



        return {removeStructs : removeStructs, addStructs : addStructs, moveStructs : moveStructs};
    }

}











