import {SideType} from "../shared/engine/SideType";
import {ManyToManyMap} from "./Containers/ManyToManyMap";
import {OneToManyMap} from "./Containers/OneToManyMap";

export class RoomContainer {
    private roomIdSet : Set<number>;

    private roomMap : OneToManyMap<number>;
    private playerIdRoomIdMap : ManyToManyMap<number, number>;

    //private roomIdPlayerIdMap : {[key : number] : number[]};
    //private playerIdRoomIdMap : {[key : number] : number[]};

    constructor(){
        this.roomIdSet = new Set<number>();

        this.roomMap = new OneToManyMap();

        this.playerIdRoomIdMap = new ManyToManyMap<number, number>();
    }

    public addPlayerIdRoomId(playerId : number, roomId : number){
        this.playerIdRoomIdMap.set(playerId, roomId);
    }
    public getRoomIdsForPlayerId(playerId : number):number[]{
        return this.playerIdRoomIdMap.getForFirst(playerId);
    }
    public getPlayerIdsForRoomId(roomId : number):number[]{
        return this.playerIdRoomIdMap.getForSecond(roomId);
    }


    public addRoom(roomId : number, roomInitConfigStr : string, isDomainDependent : boolean){
        if(this.roomIdSet.has(roomId)){
            return;
        }
        this.roomIdSet.add(roomId);


        if(isDomainDependent){
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                this.roomMap.set(roomId, roomInitConfigStr, sideType);
            }
        }else {
            this.roomMap.set(roomId, roomInitConfigStr);
        }
    }

    public removeRoom(roomId : number){
        if(!this.roomIdSet.has(roomId)){
            return;
        }
        this.roomIdSet.delete(roomId);


        this.playerIdRoomIdMap.deleteSecond(roomId);
    }


    /*
    public getAvaliable(opts : {roomId ?: number, roomInitConfigStr ?: string, sideType ?: SideType}):number|undefined{
        let roomId : number | undefined = opts.roomId;

        if(roomId != undefined){
            return roomId;
        }

        if(opts.roomInitConfigStr == undefined){
            return undefined;
        }


        function getRoomId(...keys : any[]):number|undefined{
            let roomIds = this.roomMap.get(opts.roomInitConfigStr);
            while(roomIds.length != 0 && roomId == undefined){
                if(this.roomIdSet.has(roomIds[0])){
                    roomId = roomIds[0]
                }else {
                    this.roomMap.deleteKeyValue(roomIds[0], opts.roomInitConfigStr);
                }
            }

            return roomId;
        }

        //Try get without the sideType
        roomId = getRoomId(opts.roomInitConfigStr);
        if(roomId != undefined){
            return roomId
        }


        //Try get with the sideType
        if(opts.sideType == undefined){
            for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
                roomId = getRoomId(opts.roomInitConfigStr, sideType);
                if(roomId != undefined){
                    return roomId;
                }
            }
        }else {
            roomId = getRoomId(opts.roomInitConfigStr, opts.sideType);
            if(roomId != undefined){
                return roomId;
            }
        }


        return roomId;
    }


    public setAvaliable(opts : {roomId ?: number, roomInitConfigStr ?: string, sideType ?: SideType}, isAvaliable : boolean):void{

    }
    */
}


