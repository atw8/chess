import {SideType} from "../shared/engine/SideType";
import {RoomInitConfig} from "../shared/MessageTypes";
import {DoubleMapSetStruct} from "../shared/DoubleMapSetStruct";


export class RoomContainer {
    private avaliableStructMap : {[key : string] : {[key in SideType] : { [key : number] : boolean}}};
    private roomIdRoomInitConfigStrMap : {[key : number] : string};

    private playerIdRoomIdRelations : DoubleMapSetStruct<number, number>;

    //private roomIdPlayerIdMap : {[key : number] : number[]};
    //private playerIdRoomIdMap : {[key : number] : number[]};

    constructor(){
        this.avaliableStructMap = {};
        this.roomIdRoomInitConfigStrMap = {};

        this.playerIdRoomIdRelations = new DoubleMapSetStruct();
    }

    public addPlayerIdRoomId(playerId : number, roomId : number){
        this.playerIdRoomIdRelations.addFirstSecondRelationship(playerId, roomId);
    }
    public getRoomIdsForPlayerId(playerId : number):number[]{
        return this.playerIdRoomIdRelations.getArrayForFirstValue(playerId);
    }
    public getPlayerIdsForRoomId(roomId : number):number[]{
        return this.playerIdRoomIdRelations.getArrayForSecondValue(roomId);
    }

    public setAvaliable(roomId : number, sideType : SideType, isAvaliable : boolean){
        if(!(roomId in this.roomIdRoomInitConfigStrMap)){
            return;
        }
        let roomInitConfigStr = this.roomIdRoomInitConfigStrMap[roomId];


        if(isAvaliable){
            this.avaliableStructMap[roomInitConfigStr][sideType][roomId] = true;
        }else {
            delete this.avaliableStructMap[roomInitConfigStr][sideType][roomId];
        }

    }
    public addRoom(roomId : number, roomInitConfig : RoomInitConfig){
        if(roomId in this.roomIdRoomInitConfigStrMap){
            return;
        }
        let roomInitConfigStr = RoomInitConfig.getRoomInitConfigStr(roomInitConfig);


        this.roomIdRoomInitConfigStrMap[roomId] = roomInitConfigStr;

        this.initAvaliableStructMapWithRoomInitConfigStr(roomInitConfigStr);

        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            this.avaliableStructMap[roomInitConfigStr][sideType][roomId] = true;
        }
    }

    private initAvaliableStructMapWithRoomInitConfigStr(roomInitConfigStr : string){
        if(!(roomInitConfigStr in this.avaliableStructMap)){
            // @ts-ignore
            this.avaliableStructMap[roomInitConfigStr] = {};
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                this.avaliableStructMap[roomInitConfigStr][sideType] = {};
            }
        }
    }


    public removeRoom(roomId : number){
        if(!(roomId in this.roomIdRoomInitConfigStrMap)){
            return;
        }
        let roomInitConfigStr = this.roomIdRoomInitConfigStrMap[roomId];

        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            delete this.avaliableStructMap[roomInitConfigStr][sideType][roomId];
        }


        this.playerIdRoomIdRelations.removeSecondValue(roomId);
    }




    public getAvaliable(opts : {roomId ?: number, roomInitConfig ?: RoomInitConfig, sideType ?: SideType}):number|undefined{
        let roomId : number | undefined = opts.roomId;

        if(roomId != undefined){
            return roomId;
        }


        let _opts : {roomInitConfigStr ?: string, sideType ?: SideType} = {};
        if(opts.roomInitConfig != undefined){
            _opts.roomInitConfigStr = RoomInitConfig.getRoomInitConfigStr(opts.roomInitConfig);
        }
        _opts.sideType = opts.sideType;

        return this._getAvaliable(_opts);
    }

    public _getAvaliable(opts : {roomInitConfigStr ?: string, sideType ?: SideType}):number | undefined{
        let roomId : number | undefined = undefined;


        if(opts.roomInitConfigStr == undefined){
            for(let roomInitConfigStr in this.avaliableStructMap){
                opts.roomInitConfigStr = roomInitConfigStr;
                roomId = this.getAvaliable(opts);

                if(roomId != undefined){
                    break;
                }
            }
        }else {
            let sideTypeSet : SideType[];
            if(opts.sideType == undefined){
                sideTypeSet = [];
                for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                    sideTypeSet.push(sideType);
                }
            }else {
                sideTypeSet = [opts.sideType];
            }


            this.initAvaliableStructMapWithRoomInitConfigStr(opts.roomInitConfigStr);

            for(let i = 0; i < sideTypeSet.length && roomId == undefined; i++){
                let sideType = sideTypeSet[i];

                let avaliable : { [key : number] : boolean} = this.avaliableStructMap[opts.roomInitConfigStr][sideType];

                if(Object.keys(avaliable).length > 0){
                    roomId = parseInt(Object.keys(avaliable)[0]);
                }
            }

        }


        return roomId;
    }
}