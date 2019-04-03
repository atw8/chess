import {Fairy} from "./Fairy";
import {FairyType} from "./FairyType";
import {FileRank} from "../FileRank";

export class FairyLeaper extends Fairy {
    private maxX : number;
    private maxY : number;

    private vectors : FileRank[];


    constructor(){
        super(FairyType.LEAPER);
        this.vectors = [];

        this.maxX = 0;
        this.maxY = 0;
    }


    public addVector(vector : FileRank){
        this.maxX = Math.max(this.maxX, Math.abs(vector.x));
        this.maxY = Math.max(this.maxY, Math.abs(vector.y));

        this.vectors.push(vector);
    }

    public getMaxX():number{
        return this.maxX;
    }
    public getMaxY():number{
        return this.maxY;
    }

    public getVectors():FileRank[] {
        return this.vectors;
    }
}




