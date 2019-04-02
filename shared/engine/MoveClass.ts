import {PieceModel} from "./PieceModel";

export class MoveClass{

    public originFileRank : FileRank;
    public destFileRank : FileRank;

    public changeSequence : { fileRank : FileRank, originPiece : PieceModel | null, destPiece : PieceModel | null}[];

    constructor(originFileRank : FileRank, destFileRank : FileRank){
        this.originFileRank = originFileRank;
        this.destFileRank = destFileRank;

        this.changeSequence = [];
    }

    public pushChange(fileRank : FileRank, originPiece : PieceModel | null, destPiece : PieceModel | null){
        let change = { fileRank : fileRank, originPiece : originPiece, destPiece : destPiece};

        this.changeSequence.push(change);
    };

    public getLength() :number{
        return this.changeSequence.length;
    };

    public get(i : number) : { fileRank : FileRank, originPiece : PieceModel | null, destPiece : PieceModel | null}{
        return this.changeSequence[i];
    };

    public clone() : MoveClass{
        let ret = new MoveClass(this.originFileRank, this.destFileRank);
        for(let i = 0; i < this.getLength(); i++){
            let change = this.get(i);
            ret.pushChange(change["fileRank"], change["originPiece"], change["destPiece"]);
        }

        return ret;
    };

};











