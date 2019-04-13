import {Schema, Validator, ValidatorResult} from "jsonschema";
import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {SideType} from "./engine/SideType";



export enum MessageType {
    OpLoginGuest = "OpLoginGuest",
    OnLoginGuest = "OnLoginGuest",

    OpRoomGetList = "OpRoomGetList",
    OnRoomGetList = "OnGetRoomsList",

    OpRoomMakeMove = "OpRoomMakeMove",
    OnRoomMakeMove = "OnRoomMakeMove",

    OpRoomJoin = "OpRoomJoin",
    OnRoomJoin = "OnRoomJoin",
    OnRoomJoinBroadcast = "OnRoomJoinBroadcast",
}

export enum ErrorCode {
    SUCCESS = 0,

    ROOM_DOES_NOT_EXIST = 1,

    JOIN_ROOM_ALREADY_HAS_SIDE_TYPE = 11,
    JOIN_ROOM_ALREADY_IN_ROOM = 12,

    DO_MOVE_NOT_IN_ROOM = 21,
    DO_MOVE_NOT_MOVE_TURN = 22,
    DO_MOVE_INVALID_SAN_MOVE = 23,
}




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
}




export class RoomInitConfig {
    public roomId : number;

    public gameTimeTypeWhite : GameTimeType;
    public gameTimeTotalTimeWhite ?: number;
    public gameTimeIncrTimeWhite ?: number;

    public gameTimeTypeBlack : GameTimeType;
    public gameTimeTotalTimeBlack ?: number;
    public gameTimeIncrTimeBlack ?: number;

    public isChess960 ?: boolean;
    public beginFenStr ?: string;

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/RoomInitConfig",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },

                "gameTimeTypeWhite" : {
                    "type" : "integer",
                },
                "gameTimeTotalTimeWhite" : {
                    "type" : "number",
                },
                "gameTimeIncrTimeWhite" : {
                    "type" : "number",
                },

                "gameTimeTypeBlack" : {
                    "type" : "integer",
                },
                "gameTimeTotalTimeBlack" : {
                    "type" : "number",
                },
                "gameTimeIncrTimeBlack" : {
                    "type" : "number",
                },

                "isChess960" : {
                    "type" : "boolean",
                },
                "beginFenStr" : {
                    "type" : "string",
                }
            },
            "required" : ["roomId", "gameTimeTypeWhite", "gameTimeTypeBlack"]
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
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

        roomInitConfig.gameTimeTypeWhite = json.gameTimeTypeWhite;
        roomInitConfig.gameTimeTotalTimeWhite = json.gameTimeTotalTimeWhite;
        roomInitConfig.gameTimeIncrTimeWhite = json.gameTimeIncrTimeWhite;

        roomInitConfig.gameTimeTypeBlack = json.gameTimeTypeBlack;
        roomInitConfig.gameTimeTotalTimeBlack = json.gameTimeTotalTimeBlack;
        roomInitConfig.gameTimeIncrTimeBlack = json.gameTimeIncrTimeBlack;

        roomInitConfig.beginFenStr = json.beginFenStr;
        roomInitConfig.isChess960 = json.isChess960;

        return roomInitConfig;
    }
}

export class RoomStateConfig {
    public players : number;

    public currentFenStr : string;
    public sanMoves : string[];
    public timeStamps : number[];

    public isWaiting : boolean;

    constructor(){
        this.players = 0;


        this.currentFenStr = "";
        this.sanMoves = [];
        this.timeStamps = [];

        this.isWaiting = true;

    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/RoomStateConfig",
            "type" : "object",
            "properties" : {
                "players" : {
                    "type" : "integer",
                },
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
                "isWaiting" : {
                    "type" : "boolean"
                }
            },
            "required" : ["players", "currentFenStr", "sanMoves", "timeStamps", "isWaiting"]
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
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
        roomStateConfig.players = json.players;

        roomStateConfig.currentFenStr = json.currentFenStr;
        roomStateConfig.sanMoves = json.sanMoves;
        roomStateConfig.timeStamps = json.timeStamps;

        roomStateConfig.isWaiting = json.isWaiting;

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

    public superCreateFromJson(json : any){
        this.setErrorCode(json.errorCode);
        this.setRequestId(json.requestId);
        this.setTimeStamp(json.timeStamp);
    }
}


//RELATED TO LOGIN
export class OpLoginGuestMessage extends ClientServerMessage {
    public token ?: string;

    public constructor(token ?: string){
        super(MessageType.OpLoginGuest);
        this.token = token;
    }

    public getToken():string | undefined {
        return this.token;
    }


    public static validateSchema(json : any): boolean{
        if(!ClientServerMessage.validateSchema(json)){
            return false;
        }

        let schema : Schema = {
            "id" : "/OpLoginGuestMessage",
            "type" : "object",
            "properties" : {
                "token" : {
                    "type" : "string",
                }
            }
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }

        return validatorResult.valid;
    }

    public static createFromString(str: string): OpLoginGuestMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        }catch(e){
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any): OpLoginGuestMessage | null{
        if(!this.validateSchema(json)){
            return null;
        }


        let opLoginGuestMessage = new OpLoginGuestMessage(json.token);
        opLoginGuestMessage.superCreateFromJson(json);


        return opLoginGuestMessage;
    }



}
export class OnLoginGuestMessage extends ServerClientMessage {
    public token : string;
    public roomId ?: number;

    public constructor(token : string){
        super(MessageType.OnLoginGuest);
        this.token = token;
    }

    public getToken():string{
        return this.token;
    }



    public static validateSchema(json : any):boolean{
        if(!ServerClientMessage.validateSchema(json)){
            return false;
        }

        let schema : Schema = {
            "id" : "/OnLoginGuestMessage",
            "type" : "object",
            "properties" : {
                "token" : {
                    "type" : "string",
                },
                "roomId" : {
                    "type" : "integer",
                }
            },
            "required" : ["token"]
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }

        return validatorResult.valid;
    }

    public static createFromString(str : string):OnLoginGuestMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);

    }

    public static createFromJson(json : any):OnLoginGuestMessage | null{
        if(!this.validateSchema(json)){
            return null;
        }

        let onLoginGuestMessage : OnLoginGuestMessage = new OnLoginGuestMessage(json.token);
        onLoginGuestMessage.superCreateFromJson(json);

        return onLoginGuestMessage;
    }
}


//RELATED TO ROOM
//Getting the list of rooms
export class OpRoomGetListMessage extends ClientServerMessage {
    public constructor(){
        super(MessageType.OpRoomGetList);
    }

    public static validateSchema(json : any) : boolean{
        return ClientServerMessage.validateSchema(json);
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
        if(!ServerClientMessage.validateSchema(json)){
            return false;
        }

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
            "required" : ["roomIds"]
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
        if(!ClientServerMessage.validateSchema(json)){
            return false;
        }


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
            "required" : []
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
    public sideType ?: SideType;

    public roomInitConfig ?: RoomInitConfig;
    public roomStateConfig ?: RoomStateConfig;


    public constructor(roomId ?: number, sideType ?: SideType){
        super(MessageType.OnRoomJoin);
        this.roomId = roomId;
        this.sideType = sideType;
    }

    public static validateSchema(json : any):boolean{
        if(!ServerClientMessage.validateSchema(json)){
            return false;
        }

        let schema : Schema = {
            "id" : "/OnRoomJoinMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "sideType" : {
                    "type" : "integer",
                },
                "roomInitConfig" : {
                    "type" : "object",
                },
                "roomStateConfig" : {
                    "type" : "object",
                }
            },
            "required" : []
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        if(json.roomInitConfig != undefined){
            if(!RoomInitConfig.validateSchema(json.roomInitConfig)){
                return false;
            }
        }
        if(json.roomStateConfig != undefined){
            if(!RoomStateConfig.validateSchema(json.roomStateConfig)){
                return false;
            }
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
        if(!ServerClientMessage.validateSchema(json)){
            return false;
        }

        let schema : Schema = {
            "id" : "/OnRoomJoinBroadcastMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "roomInitConfig" : {
                    "type" : "object",
                },
                "roomStateConfig" : {
                    "type" : "object",
                },
            },
            "required" : ["roomId", "roomInitConfig", "roomStateConfig"]
        };

        let validatorResult : ValidatorResult = validator.validate(json, schema);
        if(!validatorResult.valid){
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }

        if(!RoomInitConfig.validateSchema(json.roomInitConfig)){
            return false;
        }

        if(!RoomStateConfig.validateSchema(json.roomStateConfig)){
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
        if(!ClientServerMessage.validateSchema(json)){
            return false;
        }

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
            "required" : ["roomId", "sanMove"]
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
        return ServerClientMessage.validateSchema(json);
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

        return onRoomMakeMoveMessage;
    }
}



