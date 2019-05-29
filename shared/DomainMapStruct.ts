export class DomainMapStruct<T extends (string | number | symbol), Q>{
    private domainMap : { [key in T] ?: Q};

    private domain : T[];

    public getDomain():T[]{
        return this.domain;
    }



    constructor(domain : T[]){
        this.domain = domain;

        this.domainMap = {};
    }



    public getKeyForValue(value : Q):T | undefined {
        let ret : T | undefined = undefined;

        for(let i = 0; i < this.domain.length; i++){
            let key : T = this.domain[i];
            if(this.domainMap[key] == value){
                ret = key;
            }
        }

        return ret;
    }

    public getValueForKey(key : T):Q|undefined{
        return this.domainMap[key];
    }
    public setValueForKey(key : T, value : Q){
        this.domainMap[key] = value;
    }

    public getFreeKeys():T[]{
        let ret : T[] = [];

        for(let i = 0; i < this.domain.length; i++){
            let key : T = this.domain[i];
            if(typeof(this.getValueForKey(key)) == "undefined"){
                ret.push(key);
            }
        }

        return ret;
    }
    public hasFreeKeys():boolean{
        for(let i = 0; i < this.domain.length; i++){
            let key : T = this.domain[i];
            if(typeof(this.getValueForKey(key)) == "undefined"){
                return true;
            }
        }

        return false;
    }



    public getDomainMap():{ [key in T] ?: Q}{
        return this.domainMap;
    }
    public setDomainMap(domainMap : { [key in T] ?: Q}){
        this.domainMap = domainMap;
    }




}