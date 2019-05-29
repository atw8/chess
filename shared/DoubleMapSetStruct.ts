class SetArray<T>  {
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
    public delete(t : T){
        if(!this.has(t)){
            return;
        }

        let arrayIndex : number = -1;
        for(let i = 0; i < this.array.length && arrayIndex == -1; i++){
            if(this.array[i] == t){
                arrayIndex = i;
            }
        }

        this.array.splice(arrayIndex, 1);
        this.set.delete(t);
    }
    public size():number{
        return this.set.size;
    }
}


class MapSetArrayStruct<T, Q>{
    private setArrayMap : Map<T, SetArray<Q> >;

    constructor(){
        this.setArrayMap = new Map<T, SetArray<Q>>();
    }

    public getArrayForKey(key : T):Q[]{
        let setArray = this.setArrayMap.get(key);
        if(setArray == undefined){
            return [];
        }
        return setArray.getArray();
    }
    public getSetForKey(key : T):Set<Q>{
        let setArray = this.setArrayMap.get(key);
        if(setArray == undefined){
            return new Set<Q>();
        }
        return setArray.getSet();
    }

    public hasKeyValue(key : T, value : Q):boolean{
        let setArray = this.setArrayMap.get(key);
        if(setArray == undefined){
            return false;
        }

        return setArray.has(value);
    }

    public addKeyValue(key : T, value : Q){
        if(this.hasKeyValue(key, value)){
            return;
        }

        if(!this.setArrayMap.has(key)){
            this.setArrayMap.set(key, new SetArray<Q>())
        }
        let setArray = <SetArray<Q> > this.setArrayMap.get(key);
        setArray.add(value);
    }

    public removeKeyValue(key : T, value : Q){
        if(!this.hasKeyValue(key, value)){
            return;
        }

        let setArray = <SetArray<Q> > this.setArrayMap.get(key);
        setArray.delete(value);

        if(setArray.size() == 0){
            this.setArrayMap.delete(key);
        }
    }
    public removeKey(key : T){
        this.setArrayMap.delete(key);
    }
}


export class DoubleMapSetStruct<T, Q> {
    private firstDomain : MapSetArrayStruct<T, Q> = new MapSetArrayStruct<T, Q>();
    private secondDomain : MapSetArrayStruct<Q, T> = new MapSetArrayStruct<Q, T>();

    public getArrayForFirstValue(first : T):Q[]{
        return this.firstDomain.getArrayForKey(first);
    }
    public getArrayForSecondValue(second : Q):T[]{
        return this.secondDomain.getArrayForKey(second);
    }

    public addFirstSecondRelationship(first : T, second : Q){
        this.firstDomain.addKeyValue(first, second);
        this.secondDomain.addKeyValue(second, first);
    }
    public removeFirstSecondRelationship(first : T, second : Q){
        this.firstDomain.removeKeyValue(first, second);
        this.secondDomain.removeKeyValue(second, first);
    }
    public removeFirstValue(first : T){
        let secondArray = this.getArrayForFirstValue(first);
        for(let i = 0; i < secondArray.length; i++){
            this.secondDomain.removeKeyValue(secondArray[i], first);
        }
        this.firstDomain.removeKey(first);
    }
    public removeSecondValue(second : Q){
        let firstArray = this.getArrayForSecondValue(second);
        for(let i = 0; i < firstArray.length; i++){
            this.firstDomain.removeKeyValue(firstArray[i], second);
        }
        this.secondDomain.removeKey(second);
    }
}