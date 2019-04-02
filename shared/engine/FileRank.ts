export class FileRank {
    public x : number;
    public y : number;

    constructor(x : number, y : number){
        this.x = x;
        this.y = y;
    }

    public clone():FileRank{
        return new FileRank(this.x, this.y);
    }
}