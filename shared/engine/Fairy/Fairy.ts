export class Fairy {
    private fairyType : FairyType;

    constructor(fairyType : FairyType){
        this.fairyType = fairyType;
    }

    public getFairyType():FairyType {
        return this.fairyType;
    }
}

