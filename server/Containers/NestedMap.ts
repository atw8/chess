interface NestedMapType<R> extends Map<(number | string | symbol), NestedMapType<R> | R> {

}

//type NSS = (number | string | symbol);
type NSS = any;

export class NestedMap<R> {
    private nestedMaps : {[key : number] : NestedMapType<R>};

    constructor(){
        this.nestedMaps = {};
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