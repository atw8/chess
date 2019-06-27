import {SideType} from "./SideType";

export namespace SanObject {
    export interface Interface {
        sanStr : string,
        sideType : SideType
    }

    export function isEqual(a : SanObject.Interface, b : SanObject.Interface):boolean{
        return a.sideType == b.sideType && a.sanStr == b.sanStr;
    }
}
