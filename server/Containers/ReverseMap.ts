export class ReverseMap<T, Q> {
    private map1 : Map<T, Q>;
    private map2 : Map<Q, T>;


    constructor(){
        this.map1 = new Map<T, Q>();
        this.map2 = new Map<Q, T>();
    }

    public clear(): void {
        this.map1.clear();
        this.map2.clear();
    }

    public deleteT(t : T):boolean{
        let q = this.map1.get(t);
        if(q != undefined){
            this.map2.delete(q);
        }

        return this.map1.delete(t);
    }
    public deleteQ(q : Q):boolean{
        let t = this.map2.get(q);
        if(t != undefined){
            this.map1.delete(t);
        }

        return this.map2.delete(q);
    }

    public getT(t : T):Q|undefined{
        return this.map1.get(t);
    }
    public getQ(q : Q):T|undefined{
        return this.map2.get(q);
    }

    public hasT(t : T):boolean{
        return this.map1.has(t);
    }
    public hasQ(q : Q):boolean{
        return this.map2.has(q);
    }

    public set(t : T, q : Q){
        this.map1.set(t, q);
        this.map2.set(q, t);
    }
}
