import {Fairy} from "./Fairy";
import {FairyType} from "./FairyType";
import {FileRank} from "../FileRank";

export class FairyRider extends Fairy{
    private vectors : FileRank[];

    constructor(){
        super(FairyType.RIDER);
        this.vectors = [];
    }

    public addVector(vector : FileRank){
        this.vectors.push(vector);
    }

    public getVectors():FileRank[]{
        return this.vectors;
    }
}
