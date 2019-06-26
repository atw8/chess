import Matrix = PIXI.Matrix;

interface NestedMapType<R> extends Map<any, NestedMapType<R> | R> {
}


//type NSS = (number | string | symbol);
type NSS = any;


export class NestedMap<R> {
    private nestedMaps : {[key : number] : NestedMapType<R>};

    constructor(){
        this.nestedMaps = {};
    }

    public size():number{
        let size : number = 0;

        this.forEach(()=>{
           size++;
        });

        return size;
    }


    
    public forEach(callbackfn : (value : R, ...keys : NSS[])=>void, thisArg?: any){
        let keys : NSS[] = [];
        let forEachInner = (depth : number, value : NestedMapType<R> | R, key : NSS)=>{
            keys.push(key);

            if(depth == 0){
                let v = <R>value;
                callbackfn(v, ...keys);
            }else {
                let v = <NestedMapType<R>> value;

                v.forEach(forEachInner.bind(this, depth - 1));
            }

            keys.pop();
        };

        // (value: V, key: K, map: Map<K, V>)

        for(let _keysLength in this.nestedMaps){
            let keysLength = parseInt(_keysLength);

            this.nestedMaps[keysLength].forEach(forEachInner.bind(this, keysLength - 1));
        }
    }


    public clear(): void {
        this.nestedMaps = {};
    }


    public delete(...keys : NSS[]):boolean{
        let nestedMap = this.nestedMaps[keys.length];
        if(nestedMap == undefined){
            return false;
        }


        let nestedMapsArray : NestedMapType<R>[] = [];
        nestedMapsArray.push(nestedMap);

        for(let i = 0; i < keys.length - 1; i++){
            let _nestedMap = nestedMap.get(keys[i]);
            if(_nestedMap == undefined){
                return false;
            }
            nestedMap = <NestedMapType<R> >_nestedMap;

            nestedMapsArray.push(nestedMap);
        }

        let value = <R> nestedMap.get(keys[keys.length - 1]);
        if(value == undefined){
            return false;
        }

        nestedMapsArray[nestedMapsArray.length -1].delete(keys[keys.length - 1]);
        for(let i = nestedMapsArray.length -2; i >= 0; i--){
            let key = keys[i];
            let n = nestedMapsArray[nestedMapsArray.length - 2];
            let n2 = <NestedMapType<R> >n.get(key);

            if(n2.size == 0){
                n2.delete(key);
            }else {
                break;
            }
        }

        if(this.nestedMaps[keys.length].size == 0){
            delete this.nestedMaps[keys.length];
        }

        return true;
    }


    public get(...keys : NSS[]):R | undefined {
        let nestedMap : NestedMapType<R> = this.nestedMaps[keys.length];
        if(nestedMap == undefined){
            return undefined;
        }

        for(let i = 0; i < keys.length - 1; i++){
            let _nestedMap = nestedMap.get(keys[i]);
            if(_nestedMap == undefined){
                return undefined;
            }
            nestedMap = <NestedMapType<R> >_nestedMap;
        }

        let value = <R | undefined>nestedMap.get(keys[keys.length - 1]);

        return value;
    }


    public has(...keys : NSS[]):boolean{
        let nestedMap : NestedMapType<R> = this.nestedMaps[keys.length];
        if(nestedMap == undefined){
            return false;
        }

        for(let i = 0; i < keys.length - 1; i++){
            let _nestedMap = nestedMap.get(keys[i]);
            if(_nestedMap == undefined){
                return false;
            }
            nestedMap = <NestedMapType<R> >_nestedMap;
        }

        let value = <R | undefined>nestedMap.get(keys[keys.length - 1]);

        return value != undefined;
    }


    public set(value : R, ...keys : NSS[]){
        let nestedMap : NestedMapType<R> = this.nestedMaps[keys.length];
        if(nestedMap == undefined){
            nestedMap = new Map<NSS, R>();
            this.nestedMaps[keys.length] = nestedMap;
        }

        for(let i = 0; i < keys.length - 1; i++){
            let _nestedMap = nestedMap.get(keys[i]);
            if(_nestedMap == undefined){
                _nestedMap = new Map<NSS, R>();
                nestedMap.set(keys[i], _nestedMap);
            }
            nestedMap = <NestedMapType<R> >_nestedMap;
        }

        nestedMap.set(keys[keys.length - 1], value);
    }
}

export namespace NestedMap {
    export class Double<T, U, V> extends NestedMap<V>{
        constructor(){
            super();
        }

        public forEach(callbackfn : (value : V, key1 : T, key2 : U)=>void, thisArg?: any){
            return super.forEach(callbackfn, thisArg);
        }

        public delete(key1 : T, key2 : U):boolean{
            return super.delete(key1, key2);
        }

        public get(key1 : T, key2 : U):V  | undefined {
            return super.get(key1, key2);
        }

        public has(key1 : T, key2 : U):boolean{
            return super.has(key1, key2);
        }
        public set(value : V, key1 : T, key2 : U){
            super.set(value, key1, key2);
        }
    }

    export class Triple<T, U, V, W> extends NestedMap<W>{
        constructor(){
            super();
        }

        public forEach(callbackfn : (value : W, key1 : T, key2 : U, key3 : V)=>void, thisArg?: any){
            return super.forEach(callbackfn, thisArg);
        }

        public delete(key1 : T, key2 : U, key3 : V):boolean{
            return super.delete(key1, key2, key3);
        }

        public get(key1 : T, key2 : U, key3 : V):W  | undefined {
            return super.get(key1, key2, key3);
        }

        public has(key1 : T, key2 : U, key3 : V):boolean{
            return super.has(key1, key2, key3);
        }
        public set(value : W, key1 : T, key2 : U, key3 : V){
            super.set(value, key1, key2, key3);
        }
    }
}