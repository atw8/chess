import {Fairy} from "./Fairy";
import {FairyType} from "./FairyType";

export class FairyRider extends Fairy{
    private vectors : {x : number, y : number}[];

    constructor(){
        super(FairyType.RIDER);
        this.vectors = [];
    }

    public addVector(vector : {x : number, y : number}){
        this.vectors.push(vector);
    }

    public getVectors():{x : number, y : number}[]{
        return this.vectors;
    }
}
