import {Schema, Validator, ValidatorResult} from "jsonschema";
import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {SideType} from "./engine/SideType";
import {RoomState} from "../server/RoomState";
import {ChessGameStateEnum} from "./engine/ChessGameStateEnum";


export enum MessageType {
    OpLoginGuest = "OpLoginGuest",
    OnLoginGuest = "OnLoginGuest",

    OpRoomGetList = "OpRoomGetList",
    OnRoomGetList = "OnGetRoomsList",

    OpRoomMakeMove = "OpRoomMakeMove",
    OnRoomMakeMove = "OnRoomMakeMove",
    OnRoomMakeMoveBroadcast = "OnRoomMakeMoveBroadcast",

    OpRoomJoin = "OpRoomJoin",
    OnRoomJoin = "OnRoomJoin",
    OnRoomJoinBroadcast = "OnRoomJoinBroadcast",

    OnRoomTimeOutBroadcast = "OnRoomTimeOutBroadcast",
};

export enum ErrorCode {
    SUCCESS = 0,

    ROOM_DOES_NOT_EXIST = 1,

    JOIN_ROOM_ALREADY_HAS_SIDE_TYPE = 11,
    JOIN_ROOM_ALREADY_IN_ROOM = 12,

    DO_MOVE_NOT_IN_ROOM = 21,
    DO_MOVE_NOT_MOVE_TURN = 22,
    DO_MOVE_INVALID_SAN_MOVE = 23,
};







let validator : Validator;
{
    validator = new Validator();

    validator.customFormats.MessageType = function(input : string){
        //console.log("Validator.prototype.customFormats.MessageType");
        return input in MessageType;
    };

    validator.customFormats.ErrorCode = function(input : number){
        //console.log("validator.customFormats.ErrorCode");
        return input in ErrorCode;
    };


    {
        let clientServerSchema : Schema = {
            "id" : "/ClientServerMessage",
            "type" : "object",
            "properties" : {
                "messageType" : {
                    "type" : "string",
                    "format" : "MessageType",
                },
                "requestId" : {
                    "type" : "integer",
                }
            },
            "required" : ["messageType", "requestId"]
        };
        validator.addSchema(clientServerSchema, "/ClientServerMessage");

        let serverClientSchema : Schema = {
            "id" : "/ServerClientMessage",
            "type" : "object",
            "properties" : {
                "messageType" : {
                    "type" : "string",
                    "format" : "MessageType",
                },
                "errorCode" : {
                    "type" : "integer",
                    "format" : "ErrorCode",
                },
                "requestId" : {
                    "type" : "integer",
                },
                "timeStamp" : {
                    "type" : "integer",
                }
            },
            "required" : ["messageType", "errorCode", "requestId", "timeStamp"]
        };
        validator.addSchema(serverClientSchema, "/ServerClientMessage");

        let gameTimeStructSchema : Schema = {
            "id" : "/GameTimeStruct",
            "type" : "object",
            "properties" : {
                "timeType" : {
                    "type" : "integer"
                },
                "totalTime" : {
                    "type" : "number"
                },
                "incrTime" : {
                    "type" : "number"
                }
            },
            "required" : ["timeType"]
        };

        validator.addSchema(gameTimeStructSchema, "/GameTimeStruct");

        let roomInitConfig : Schema = {
            "id" : "/RoomInitConfig",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },

                "gameTimeStructs" : {
                    "type" : "object",
                    "additionalProperties": {"$ref": "/GameTimeStruct"},
                    "required" : ["1", "2"]
                },

                "isChess960" : {
                    "type" : "boolean",
                },
                "beginFenStr" : {
                    "type" : "string",
                }
            },
            "required" : ["roomId", "gameTimeStructs"]
        };
        validator.addSchema(roomInitConfig, "/RoomInitConfig");


        let roomStateConfig : Schema = {
            "id" : "/RoomStateConfig",
            "type" : "object",
            "properties" : {
                "currentFenStr" : {
                    "type" : "string",
                },
                "sanMoves" : {
                    "type" : "array",
                    "items" : {
                        "type" : "string"
                    },
                },
                "timeStamps" : {
                    "type" : "array",
                    "items" : {
                        "type" : "integer",
                    },
                },
                "sideTypeMap" : {
                    "type" : "object",
                },
                "roomState" : {
                    "type" : "number"
                },
                "chessGameState" : {
                    "type" : "number"
                }
            },
            "required" : ["currentFenStr", "sanMoves", "timeStamps", "sideTypeMap", "roomState", "chessGameState"]
        };
        validator.addSchema(roomStateConfig, "/RoomStateConfig");
    }
}


export class RoomInitConfig {
    public roomId : number;

    public gameTimeStructs : { [key : number] : {"timeType" : GameTimeType, "totalTime" ?: number, "incrTime" ?: number}};

    public isChess960 ?: boolean;
    public beginFenStr ?: string;

    public static validateSchema(json : any):boolean{
        let validatorResult : ValidatorResult = validator.validate(json, validator.schemas["/RoomInitConfig"]);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }

    public static createFromString(str : string): RoomInitConfig | null{
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any): RoomInitConfig | null{
        if(!this.validateSchema(json)){
            return null;
        }

        let roomInitConfig : RoomInitConfig = new RoomInitConfig();
        roomInitConfig.roomId = json.roomId;

        roomInitConfig.gameTimeStructs = json.gameTimeStructs;

        roomInitConfig.beginFenStr = json.beginFenStr;
        roomInitConfig.isChess960 = json.isChess960;

        return roomInitConfig;
    }
}

export class RoomStateConfig {
    public sideTypeMap : { [key : number] : number};


    public currentFenStr : string;

    public sanMoves : string[];
    public timeStamps : number[];


    public roomState : RoomState;
    public chessGameState : ChessGameStateEnum;

    //Helper functions to deal with sideTypes
    public getSideTypeForPlayerId(playerId : number):SideType|undefined{
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(this.sideTypeMap[sideType] == playerId){
                return sideType;
            }
        }

        return undefined;
    }
    public getPlayerIdForSideType(sideType : SideType):number{
        return this.sideTypeMap[sideType];
    }

    public isSideTypeFree(sideType : SideType):boolean{
        return !(sideType in this.sideTypeMap);
    }
    public getFreeSideTypes():SideType[]{
        let ret : SideType[] = [];
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(this.isSideTypeFree(sideType)){
                ret.push(sideType);
            }
        }

        return ret;
    }
    public getNotFreSideTypes():SideType[]{
        let ret : SideType[] = [];
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(!this.isSideTypeFree(sideType)){
                ret.push(sideType);
            }
        }

        return ret;
    }
    public hasFreeSideTypes():boolean{
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(this.isSideTypeFree(sideType)){
                return true;
            }
        }

        return false;
    }




    constructor(){
        this.sideTypeMap = {};

        this.currentFenStr = "";


        this.sanMoves = [];
        this.timeStamps = [];

        this.roomState = RoomState.START;
        this.chessGameState = ChessGameStateEnum.NORMAL;

    }

    public static validateSchema(json : any):boolean{
        let validatorResult : ValidatorResult = validator.validate(json, validator.schemas["/RoomStateConfig"]);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }

    public static createFromString(str : string):RoomStateConfig | null{
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):RoomStateConfig | null{
        if(!this.validateSchema(json)){
            return null;
        }

        let roomStateConfig : RoomStateConfig = new RoomStateConfig();
        roomStateConfig.currentFenStr = json.currentFenStr;
        roomStateConfig.sanMoves = json.sanMoves;
        roomStateConfig.timeStamps = json.timeStamps;

        roomStateConfig.sideTypeMap = json.sideTypeMap;

        roomStateConfig.roomState = json.roomState;
        roomStateConfig.chessGameState = json.chessGameState;

        return roomStateConfig;
    }
}




export class ClientServerMessage {
    public messageType : MessageType;
    public requestId : number;


    protected constructor(messageType : MessageType){
        this.messageType = messageType;
        this.requestId = 0;
    }

    public getMessageType():MessageType{
        return this.messageType;
    }


    public getRequestId():number{
        return this.requestId;
    }
    public setRequestId(requestId : number){
        this.requestId = requestId;
    }

    /*
    public static validateSchema(json : any):boolean {
        let schema : Schema = {
            "id" : "/ClientServerMessage",
            "type" : "object",
            "properties" : {
                "messageType" : {
                    "type" : "string",
                    "format" : "MessageType",
                },
                "requestId" : {
                    "type" : "integer",
                }
            },
            "required" : ["messageType", "requestId"]
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    */

    public superCreateFromJson(json : any){
        this.setRequestId(json.requestId);
    }
}


export class ServerClientMessage {
    public messageType : MessageType;
    public errorCode : ErrorCode;
    public requestId : number;
    public timeStamp : number;

    protected constructor(messageType : MessageType){
        this.messageType = messageType;

        this.errorCode = ErrorCode.SUCCESS;
        this.requestId = 0;
        this.timeStamp = 0;
    }

    public getMessageType():MessageType{
        return this.messageType;
    }


    public getErrorCode():ErrorCode {
        return this.errorCode;
    }
    public setErrorCode(errorCode : ErrorCode){
        this.errorCode = errorCode;
    }

    public getRequestId():number{
        return this.requestId;
    }
    public setRequestId(requestId : number){
        this.requestId = requestId;
    }

    public getTimeStamp():number{
        return this.timeStamp;
    }
    public setTimeStamp(timeStamp : number){
        this.timeStamp = timeStamp;
    }

    /*
    public static validateSchema(json : any):boolean {
        let schema :Schema = {
            "id" : "/ServerClientMessage",
            "type" : "object",
            "properties" : {
                "messageType" : {
                    "type" : "string",
                    "format" : "MessageType",
                },
                "errorCode" : {
                    "type" : "integer",
                    "format" : "ErrorCode",
                },
                "requestId" : {
                    "type" : "integer",
                },
                "timeStamp" : {
                    "type" : "integer",
                }
            },
            "required" : ["messageType", "errorCode", "requestId", "timeStamp"]
        };


        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }

        return validatorResult.valid;
    }
    */

    public superCreateFromJson(json : any){
        this.setErrorCode(json.errorCode);
        this.setRequestId(json.requestId);
        this.setTimeStamp(json.timeStamp);
    }
}


//RELATED TO LOGIN
export class OpUserLoginGuestMessage extends ClientServerMessage {
    public guestToken ?: string;


    public constructor(guestToken ?: string){
        super(MessageType.OpLoginGuest);
        this.guestToken = guestToken;
    }



    public static validateSchema(json : any): boolean{
        let schema : Schema = {
            "id" : "/OpUserLoginGuestMessage",
            "type" : "object",
            "properties" : {
                "guestToken" : {
                    "type" : "string",
                }
            },
            "$ref": "/ClientServerMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }

        return validatorResult.valid;
    }

    public static createFromString(str: string): OpUserLoginGuestMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        }catch(e){
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any): OpUserLoginGuestMessage | null{
        if(!this.validateSchema(json)){
            return null;
        }


        let opUserLoginGuestMsg = new OpUserLoginGuestMessage(json.guestToken);
        opUserLoginGuestMsg.superCreateFromJson(json);


        return opUserLoginGuestMsg;
    }



}
export class OnUserLoginGuestMessage extends ServerClientMessage {
    public guestToken : string;
    public playerId : number;

    public roomId ?: number;

    public constructor(){
        super(MessageType.OnLoginGuest);
    }




    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnUserLoginGuestMessage",
            "type" : "object",
            "properties" : {
                "guestToken" : {
                    "type" : "string",
                },
                "playerId" : {
                    "type" : "integer",
                },
                "roomId" : {
                    "type" : "integer",
                }
            },
            "required" : ["guestToken", "playerId"],
            "$ref": "/ServerClientMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }

        return validatorResult.valid;
    }

    public static createFromString(str : string):OnUserLoginGuestMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);

    }

    public static createFromJson(json : any):OnUserLoginGuestMessage | null{
        if(!this.validateSchema(json)){
            return null;
        }

        let onUserLoginGuestMsg : OnUserLoginGuestMessage = new OnUserLoginGuestMessage();
        onUserLoginGuestMsg.guestToken = json.guestToken;
        onUserLoginGuestMsg.playerId = json.playerId;
        onUserLoginGuestMsg.superCreateFromJson(json);

        return onUserLoginGuestMsg;
    }
}


//RELATED TO ROOM
//Getting the list of rooms
export class OpRoomGetListMessage extends ClientServerMessage {
    public constructor(){
        super(MessageType.OpRoomGetList);
    }

    public static validateSchema(json : any) : boolean{
        return validator.validate(json, validator.schemas["/ClientServerMessage"]).valid;
    }

    public static createFromString(str : string):OpRoomGetListMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OpRoomGetListMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let opGetRoomsListMessage : OpRoomGetListMessage = new OpRoomGetListMessage();
        opGetRoomsListMessage.superCreateFromJson(json);

        return opGetRoomsListMessage;
    }
}
export class OnRoomGetListMessage extends ServerClientMessage {
    public roomIds : number[];

    public constructor(roomIds : number[]){
        super(MessageType.OnRoomGetList);
        this.roomIds = roomIds;
    }


    public static validateSchema(json : any): boolean {
        let schema : Schema = {
            "id" : "/OnRoomGetListMessage",
            "type" : "object",
            "properties" : {
                "roomIds" : {
                    "type" : "array",
                    "items" : {
                        "type" : "integer"
                    }
                }
            },
            "required" : ["roomIds"],
            "$ref": "/ServerClientMessage"
        };


        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }

        return validatorResult.valid;
    }

    public static createFromString(str : string):OnRoomGetListMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }

    public static createFromJson(json : any):OnRoomGetListMessage | null{
        if(!this.validateSchema(json)){
            return null;
        }

        let onGetRoomsListMessage : OnRoomGetListMessage = new OnRoomGetListMessage(json.roomIds);
        onGetRoomsListMessage.superCreateFromJson(json);

        return onGetRoomsListMessage;
    }
}

//Related to joining a room
export class OpRoomJoinMessage extends ClientServerMessage {
    public roomId ?: number;
    public sideType ?: SideType;

    public constructor(roomId ?: number, sideType ?: SideType){
        super(MessageType.OpRoomJoin);
        this.roomId = roomId;
        this.sideType = sideType;
    }

    public static validateSchema(json : any):boolean {
        let schema : Schema = {
            "id" : "/OpRoomJoinMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "sideType" : {
                    "type" : "integer"
                }
            },
            "required" : [],
            "$ref": "/ClientServerMessage"
        };


        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }

        return validatorResult.valid;
    }

    public static createFromString(str : string):OpRoomJoinMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }

    public static createFromJson(json : any):OpRoomJoinMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let opJoinRoomMessage : OpRoomJoinMessage = new OpRoomJoinMessage(json.roomId, json.sideType);
        opJoinRoomMessage.superCreateFromJson(json);

        return opJoinRoomMessage;

    }
}
export class OnRoomJoinMessage extends ServerClientMessage {
    public roomId ?: number;

    public roomInitConfig ?: RoomInitConfig;
    public roomStateConfig ?: RoomStateConfig;


    public constructor(roomId ?: number, sideType ?: SideType){
        super(MessageType.OnRoomJoin);
        this.roomId = roomId;
    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnRoomJoinMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "roomInitConfig" : {
                    "type" : "object",
                    "$ref" : "/RoomInitConfig"
                },
                "roomStateConfig" : {
                    "type" : "object",
                    "$ref" : "/RoomStateConfig"
                }
            },
            "required" : [],
            "$ref": "/ServerClientMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        return true;
    }

    public static createFromString(str : string):OnRoomJoinMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OnRoomJoinMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let onJoinRoomMessage : OnRoomJoinMessage = new OnRoomJoinMessage(json.roomId, json.sideType);
        onJoinRoomMessage.superCreateFromJson(json);

        if(json.roomInitConfig != undefined){
            onJoinRoomMessage.roomInitConfig = <RoomInitConfig>RoomInitConfig.createFromJson(json.roomInitConfig);
        }
        if(json.roomStateConfig != undefined){
            onJoinRoomMessage.roomStateConfig = <RoomStateConfig>RoomStateConfig.createFromJson(json.roomStateConfig);
        }

        return onJoinRoomMessage;
    }
}
export class OnRoomJoinBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public roomInitConfig : RoomInitConfig;
    public roomStateConfig : RoomStateConfig;

    constructor(roomId : number){
        super(MessageType.OnRoomJoinBroadcast);
        this.roomId = roomId;
    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnRoomJoinBroadcastMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "roomInitConfig" : {
                    "type" : "object",
                    "$ref" : "/RoomInitConfig"
                },
                "roomStateConfig" : {
                    "type" : "object",
                    "$ref" : "/RoomStateConfig"
                },
            },
            "required" : ["roomId", "roomInitConfig", "roomStateConfig"],
            "$ref": "/ServerClientMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        return true;
    }


    public static createFromString(str : string):OnRoomJoinBroadcastMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OnRoomJoinBroadcastMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage = new OnRoomJoinBroadcastMessage(json.roomId);
        onRoomJoinBroadcastMsg.superCreateFromJson(json);
        onRoomJoinBroadcastMsg.roomInitConfig = <RoomInitConfig>RoomInitConfig.createFromJson(json.roomInitConfig);
        onRoomJoinBroadcastMsg.roomStateConfig = <RoomStateConfig>RoomStateConfig.createFromJson(json.roomStateConfig);

        return onRoomJoinBroadcastMsg;
    }
};

//The move message for this room
export class OpRoomMakeMoveMessage extends ClientServerMessage {
    public roomId : number;
    public sanMove : string;
    constructor(roomId : number, sanMove : string) {
        super(MessageType.OpRoomMakeMove);
        this.roomId  = roomId;
        this.sanMove = sanMove;
    }

    public static validateSchema(json : any):boolean {
        let schema : Schema = {
            "id" : "/OpRoomMakeMoveMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "sanMove" : {
                    "type" : "string",
                }
            },
            "required" : ["roomId", "sanMove"],
            "$ref": "/ClientServerMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        return true;
    }

    public static createFromString(str : string):OpRoomMakeMoveMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OpRoomMakeMoveMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let opRoomMakeMoveMessage : OpRoomMakeMoveMessage = new OpRoomMakeMoveMessage(json.roomId, json.sanMove);
        opRoomMakeMoveMessage.superCreateFromJson(json);
        return opRoomMakeMoveMessage;
    }
}
export class OnRoomMakeMoveMessage extends ServerClientMessage {
    public roomId : number;
    public sanMove : string;

    constructor(roomId : number, sanMove : string){
        super(MessageType.OnRoomMakeMove);
        this.roomId = roomId;
        this.sanMove = sanMove;
    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnRoomMakeMoveMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "sanMove" : {
                    "type" : "string",
                }
            },
            "required" : ["roomId", "sanMove"],
            "$ref": "/ServerClientMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        return true;
    }
    public static createFromString(str : string):OnRoomMakeMoveMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OnRoomMakeMoveMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let onRoomMakeMoveMessage : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(json.roomId, json.sanMove);
        onRoomMakeMoveMessage.superCreateFromJson(json);
        return onRoomMakeMoveMessage;
    }
}
export class OnRoomMakeMoveBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public sanMove : string;

    constructor(roomId : number, sanMove : string){
        super(MessageType.OnRoomMakeMoveBroadcast);
        this.roomId = roomId;
        this.sanMove = sanMove;
    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnRoomMakeMoveBroadcastMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "sanMove" : {
                    "type" : "string",
                }
            },
            "required" : ["roomId", "sanMove"],
            "$ref": "/ServerClientMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        return true;
    }
    public static createFromString(str : string):OnRoomMakeMoveBroadcastMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OnRoomMakeMoveBroadcastMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage = new OnRoomMakeMoveBroadcastMessage(json.roomId, json.sanMove);
        onRoomMakeMoveBroadcastMsg.superCreateFromJson(json);
        return onRoomMakeMoveBroadcastMsg;
    }
}
export class OnRoomTimeOutBroadcastMessage extends ServerClientMessage {
    private chessGameState : ChessGameStateEnum;
    private endTimeStamp : number;

    constructor(chessGameState : ChessGameStateEnum, endTimeStamp : number){
        super(MessageType.OnRoomTimeOutBroadcast)

        this.chessGameState = this.chessGameState;
        this.endTimeStamp = endTimeStamp;
    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnRoomTimeOutBroadcastMessage",
            "type" : "object",
            "properties" : {
                "chessGameState" : {
                    "type" : "integer",
                },
                "endTimeStamp" : {
                    "type" : "number",
                }
            },
            "required" : ["chessGameState", "endTimeStamp"],
            "$ref": "/ServerClientMessage"
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        return true;
    }

    public static createFromString(str : string):OnRoomTimeOutBroadcastMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OnRoomTimeOutBroadcastMessage | null {
        if(!OnRoomTimeOutBroadcastMessage.validateSchema(json)){
            return null;
        }

        let chessGameState = json.chessGameState;
        let endTimeStamp = json.endTimeStamp;
        let onRoomTimeOutBroacastMsg : OnRoomTimeOutBroadcastMessage = new OnRoomTimeOutBroadcastMessage(chessGameState, endTimeStamp);

        return onRoomTimeOutBroacastMsg;
    }
}




