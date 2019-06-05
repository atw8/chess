export class SetArray<T>  {
    private array : T[];
    private set : Set<T>;

    constructor(){
        this.array = [];
        this.set = new Set<T>();
    }

    public getArray():T[]{
        return this.array;
    }
    public getSet():Set<T>{
        return this.set;
    }

    public has(t : T):boolean{
        return this.set.has(t);
    }
    public add(t : T):void{
        if(this.has(t)){
            return;
        }

        this.array.push(t);
        this.set.add(t);
    }
    public delete(t : T):boolean{
        if(!this.has(t)){
            return false;
        }

        let arrayIndex : number = -1;
        for(let i = 0; i < this.array.length && arrayIndex == -1; i++){
            if(this.array[i] == t){
                arrayIndex = i;
            }
        }

        this.array.splice(arrayIndex, 1);
        this.set.delete(t);

        return true;
    }
    public size():number{
        return this.set.size;
    }
}