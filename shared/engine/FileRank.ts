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


    public addFileRank(fileRank2 : FileRank):void{
        this.x += fileRank2.x;
        this.y += fileRank2.y;
    }
    public static addFileRank(fileRank1 : FileRank, fileRank2 : FileRank):FileRank {
        return new FileRank(fileRank1.x + fileRank2.x, fileRank1.y + fileRank2.y);
    }


    public static subFileRank(fileRank1 : FileRank, fileRank2 : FileRank):FileRank {
        return new FileRank(fileRank1.x - fileRank2.x, fileRank1.x - fileRank2.y);
    }
    public subFileRank(fileRank2 : FileRank):void{
        this.x -= fileRank2.x;
        this.y -= fileRank2.y;
    }

    public static isEqual(fileRank1 : FileRank, fileRank2 : FileRank):boolean{
        return fileRank1.x == fileRank2.x && fileRank1.y == fileRank2.y;
    }



}