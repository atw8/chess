import {Fairy} from "./Fairy";
import {FairyType} from "./FairyType";
import {FileRank} from "../FileRank";

export class FairyStupid extends  Fairy{
    private vectors : {vec : FileRank, emptyVec : FileRank[]} [];
    private maxX : number;
    private maxY : number;

    constructor(){
        super(FairyType.STUPID);
        this.vectors = [];

        this.maxX = 0;
        this.maxY = 0;
    }

    public addVector(vector : {vec : FileRank, emptyVec : FileRank[]} ){
        this.maxX = Math.max(this.maxX, Math.abs(vector.vec.x));
        this.maxY = Math.max(this.maxY, Math.abs(vector.vec.y));

        this.vectors.push(vector);
    }

    public getMaxX():number{
        return this.maxX;
    }
    public getMaxY():number{
        return this.maxY;
    }

    public getVectors(): {vec : FileRank, emptyVec : FileRank[]} [] {
        return this.vectors;
    }

}
