export enum SideType {
    WHITE = 1,
    BLACK = 2,
    FIRST_SIDE = WHITE,
    LAST_SIDE = BLACK,
}

export namespace SideType {
    export function Random():SideType{
        let sideTypes = [SideType.WHITE, SideType.BLACK];

        return sideTypes[Math.floor(Math.random()*sideTypes.length)];
    }
}