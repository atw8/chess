import {SetArray} from "./SetArray";
import {OneToManyMap} from "./OneToManyMap";

type NSS = any;

export class ManyToManyMap<T, Q>{
    private firstDomain : OneToManyMap<Q>;
    private secondDomain : OneToManyMap<T>;

    constructor(){
        this.firstDomain = new OneToManyMap<Q>();
        this.secondDomain = new OneToManyMap<T>();
    }

    public clear(){
        this.firstDomain.clear();
        this.secondDomain.clear();

    }

    public getForFirst(first : T):Q[]{
        return this.firstDomain.get(first);
    }

    public getForSecond(second : Q):T[]{
        return this.secondDomain.get(second);
    }

    public hasFirst(first : T):boolean{
        return this.firstDomain.hasKey(first);
    }
    public hasSecond(second : Q):boolean{
        return this.secondDomain.hasKey(second);
    }
    public hasKeyValue(first : T, second : Q):boolean{
        return this.firstDomain.hasKeyValue(second, first);
    }

    public set(first : T, second : Q){
        this.firstDomain.set(second, first);
        this.secondDomain.set(first, second);
    }
    public deleteFirst(first : T):boolean{
        let secondArray = this.firstDomain.get(first);
        for(let i = 0; i < secondArray.length; i++){
            this.secondDomain.deleteKeyValue(first, secondArray[i]);
        }

        return this.firstDomain.deleteKey(first);
    }
    public deleteSecond(second : Q):boolean{
        let firstArray = this.secondDomain.get(second);
        for(let i = 0; firstArray.length; i++){
            this.firstDomain.deleteKeyValue(second, firstArray[i]);
        }
        return this.secondDomain.deleteKey(second);
    }
    public delete(first : T, second : Q):boolean{
        this.firstDomain.deleteKeyValue(second, first);
        return this.secondDomain.deleteKeyValue(first, second);
    }
}