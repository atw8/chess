/*
import {DoubleMapSetStruct} from "../shared/DoubleMapSetStruct";

export class RoomAvaliableStruct<T> {
    private domain : T[];

    private roomIdRoomInitConfigMap : DoubleMapSetStruct<number, string>;
    private roomIdDomainDependentMap : { [key : number] : boolean};


    constructor(domain : T[]){
        this.domain = domain;

        this.roomIdRoomInitConfigMap = new DoubleMapSetStruct<number, string>();
        this.roomIdDomainDependentMap = {};
    }


    public addRoom(roomId : number, roomInitConfig : string, isDomainDependent : boolean){
        this.roomIdRoomInitConfigMap.addFirstSecondRelationship(roomId, roomInitConfig);
        this.roomIdDomainDependentMap[roomId] = isDomainDependent;
    }

}

*/