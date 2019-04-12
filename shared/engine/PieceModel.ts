import {SideType} from "./SideType";
import {PieceType} from "./PieceType";

export class PieceModel {
    private pieceType : PieceType;
    private sideType : SideType;

    private numOfTimesAdded : number;
    private numOfTimesRemoved : number;

    constructor(pieceType : PieceType, sideType : SideType){
        this.pieceType = pieceType;
        this.sideType = sideType;

        this.numOfTimesAdded = 0;
        this.numOfTimesRemoved = 0;
    }

    public getSideType(): SideType{
        return this.sideType;
    };

    public getPieceType(): PieceType{
        return this.pieceType;
    };



    public getNumOfTimesMoved():number{
        return Math.min(this.numOfTimesRemoved, this.numOfTimesAdded);
    };


    public getNumOfTimesRemoved():number{
        return this.numOfTimesRemoved;
    };
    public setNumOfTimesRemoved(numOfTimesRemoved : number){
        this.numOfTimesRemoved = numOfTimesRemoved;
    };
    public addNumOfTimesRemoved(val : number){
        this.setNumOfTimesRemoved(this.getNumOfTimesRemoved() + val);
    };
    public incrNumOfTimesRemoved(){
        this.addNumOfTimesRemoved(1);
    };
    public decrNumOfTimesRemoved (){
        this.addNumOfTimesRemoved(-1);
    };



    public getNumOfTimesAdded():number{
        return this.numOfTimesAdded;
    };
    public setNumOfTimesAdded(numOfTimesAdded : number){
        this.numOfTimesAdded = numOfTimesAdded;
    };
    public addNumOfTimesAdded(val : number){
        this.setNumOfTimesAdded(this.getNumOfTimesAdded() + val);
    };
    public incrNumOfTimesAdded(){
        this.addNumOfTimesAdded(1);
    };
    public decrNumOfTimesAdded(){
        this.addNumOfTimesAdded(-1);
    };



    public static isEqualTo(pieceModel1 : any, pieceModel2 : any) : boolean {
        return pieceModel1.pieceType == pieceModel2.pieceType && pieceModel1.sideType == pieceModel2.sideType;
    }
}

