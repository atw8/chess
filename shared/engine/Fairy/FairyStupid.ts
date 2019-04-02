import {Fairy} from "./Fairy";
import {FairyType} from "./FairyType";
import {FileRank} from "../FileRank";

export class FairyStupid extends  Fairy{
    private vectors : {vec : FileRank, emptyVec : FileRank[]} [];

    constructor(){
        super(FairyType.STUPID);
        this.vectors = [];
    }

    public addVector(vector : {vec : FileRank, emptyVec : FileRank[]} ){
        this.vectors.push(vector);
    }

    public getVectors(): {vec : FileRank, emptyVec : FileRank[]} [] {
        return this.vectors;
    }

}
