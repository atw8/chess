import {Fairy} from "./Fairy";
import {FairyType} from "./FairyType";

export class FairyStupid extends  Fairy{
    private vectors : {vec : {x : number, y : number}, emptyVec : {x : number, y : number}[]} [];

    constructor(){
        super(FairyType.STUPID);
        this.vectors = [];
    }

    public addVector(vector : {vec : {x : number, y : number}, emptyVec : {x : number, y : number}[]} ){
        this.vectors.push(vector);
    }

    public getVectors(): {vec : {x : number, y : number}, emptyVec : {x : number, y : number}[]} [] {
        return this.vectors;
    }

}
