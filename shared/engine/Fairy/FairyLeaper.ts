import {Fairy} from "./Fairy";
import {FairyType} from "./FairyType";
import {FileRank} from "../FileRank";

export class FairyLeaper extends Fairy {

    private vectors : FileRank[];


    constructor(){
        super(FairyType.LEAPER);
        this.vectors = [];
    }


    public addVector(vector : FileRank){
        this.vectors.push(vector);
    }

    public getVectors():FileRank[] {
        return this.vectors;
    }
}




