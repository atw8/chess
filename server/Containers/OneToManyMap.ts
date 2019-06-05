import {SetArray} from "./SetArray";
import {NestedMap} from "./NestedMap";

type NSS = any;

export class OneToManyMap<T>{
    private innerMap : NestedMap<SetArray<T>>;

    constructor(){
        this.innerMap = new NestedMap<SetArray<T>>();
    }

    public clear(): void {
        this.innerMap.clear();
    }


    public get(...keys : NSS[]):T[]{
        let _innerMap = this.innerMap.get(keys);


        let ret :T[];
        if(_innerMap == undefined) {
            ret = [];
        }else {
            ret = _innerMap.getArray();
        }

        return ret;
    }

    public hasKey(...keys : NSS[]):boolean{
        return this.innerMap.has(keys);
    }
    public hasKeyValue(value : T, ...keys : NSS[]):boolean{
        let _innerMap = this.innerMap.get(keys);
        if(_innerMap == undefined){
            return false;
        }


        return _innerMap.has(value);
    }

    public set(value : T, ...keys : NSS[]){
        if(!this.innerMap.has(keys)){
            this.innerMap.set(new SetArray<T>(), keys);
        }
        let _innerMap = <SetArray<T> > this.innerMap.get(keys);
        _innerMap.add(value);
    }


    public deleteKey(...keys : NSS[]):boolean{
        return this.innerMap.delete(keys);
    }

    public deleteKeyValue(value : T, ...keys : NSS[]):boolean{
        let _innerMap = this.innerMap.get(keys);
        if(_innerMap == undefined){
            return false;
        }

        let ret = _innerMap.delete(value);
        if(_innerMap.size() == 0){
            this.innerMap.delete(keys);
        }

        return ret;
    }
}