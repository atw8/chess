import {Schema, Validator, ValidatorResult} from "jsonschema";
import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {isUndefined} from "util";



export enum MessageType {
    OpLoginGuest = "OpLoginGuest",
    OnLoginGuest = "OnLoginGuest",

    OpGetRoomsList = "OpGetRoomsList",
    OnGetRoomsList = "OnGetRoomsList",

    OpJoinRoom = "OpJoinRoom",
    OnJoinRoom = "OnJoinRoom",

    OpGetRoomConfig = "OpGetRoomConfig",
    OnGetRoomConfig = "OnGetRoomConfig",
}

export enum ErrorCode {
    SUCCESS = 0,
}




let validator : Validator;
{
    let messageTypeSet : { [key : string] : boolean} = {};
    messageTypeSet[MessageType.OpLoginGuest] = true;
    messageTypeSet[MessageType.OnLoginGuest] = true;
    messageTypeSet[MessageType.OpGetRoomsList] = true;
    messageTypeSet[MessageType.OnGetRoomsList] = true;
    messageTypeSet[MessageType.OpJoinRoom] = true;
    messageTypeSet[MessageType.OnJoinRoom] = true;
    messageTypeSet[MessageType.OpGetRoomConfig] = true;
    messageTypeSet[MessageType.OnGetRoomConfig] = true;

    let errorCodeSet : { [key : number] : boolean} = {};
    errorCodeSet[ErrorCode.SUCCESS] = true;


    validator = new Validator();

    validator.customFormats.MessageType = function(input : string){
        //console.log("Validator.prototype.customFormats.MessageType");
        return input in messageTypeSet;
    };

    validator.customFormats.ErrorCode = function(input : number){
        //console.log("validator.customFormats.ErrorCode");
        return input in errorCodeSet;
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

    public voteConfig : { [key : string] : number};

    public currentFenStr : string;
    public sanMoves : string[];
    public timeStamps : number[];

    constructor(){
        this.players = 0;

        this.voteConfig = {};

        this.currentFenStr = "";
        this.sanMoves = [];
        this.timeStamps = [];

    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/RoomStateConfig",
            "type" : "object",
            "properties" : {
                "players" : {
                    "type" : "integer",
                },
                "voteConfig" : {
                    "type" : "object",
                    "patternProperties": {
                        ".+": {
                            "type": "string"
                        }
                    }
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
                }
            },
            "required" : ["players", "currentFenStr", "sanMoves", "timeStamps"]
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

        roomStateConfig.voteConfig = json.voteConfig;

        roomStateConfig.currentFenStr = json.currentFenStr;
        roomStateConfig.sanMoves = json.sanMoves;
        roomStateConfig.timeStamps = json.timeStamps;

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
export class OpGetRoomsListMessage extends ClientServerMessage {
    public constructor(){
        super(MessageType.OpGetRoomsList);
    }

    public static validateSchema(json : any) : boolean{
        return ClientServerMessage.validateSchema(json);
    }

    public static createFromString(str : string):OpGetRoomsListMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OpGetRoomsListMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let opGetRoomsListMessage : OpGetRoomsListMessage = new OpGetRoomsListMessage();
        opGetRoomsListMessage.superCreateFromJson(json);

        return opGetRoomsListMessage;
    }
}
export class OnGetRoomsListMessage extends ServerClientMessage {
    public roomIds : number[];

    public constructor(roomIds : number[]){
        super(MessageType.OnGetRoomsList);
        this.roomIds = roomIds;
    }


    public static validateSchema(json : any): boolean {
        if(!ServerClientMessage.validateSchema(json)){
            return false;
        }

        let schema : Schema = {
            "id" : "/OnGetRoomsListMessage",
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

    public static createFromString(str : string):OnGetRoomsListMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }

    public static createFromJson(json : any):OnGetRoomsListMessage | null{
        if(!this.validateSchema(json)){
            return null;
        }

        let onGetRoomsListMessage : OnGetRoomsListMessage = new OnGetRoomsListMessage(json.roomIds);
        onGetRoomsListMessage.superCreateFromJson(json);

        return onGetRoomsListMessage;
    }
}

//Related to joining a room
export class OpJoinRoomMessage extends ClientServerMessage {
    public roomId ?: number;

    public constructor(roomId ?: number){
        super(MessageType.OpJoinRoom);
        this.roomId = roomId;
    }

    public static validateSchema(json : any):boolean {
        if(!ClientServerMessage.validateSchema(json)){
            return false;
        }


        let schema : Schema = {
            "id" : "/OpJoinRoomMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
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

    public static createFromString(str : string):OpJoinRoomMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }

    public static createFromJson(json : any):OpJoinRoomMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let opJoinRoomMessage : OpJoinRoomMessage = new OpJoinRoomMessage(json.roomId);
        opJoinRoomMessage.superCreateFromJson(json);

        return opJoinRoomMessage;

    }
}
export class OnJoinRoomMessage extends ServerClientMessage {
    public roomId ?: number;
    public roomInitConfig ?: RoomInitConfig;
    public roomStateConfig ?: RoomStateConfig;


    public constructor(roomId ?: number){
        super(MessageType.OnJoinRoom);
        this.roomId = roomId;
    }

    public static validateSchema(json : any):boolean{
        if(!ServerClientMessage.validateSchema(json)){
            return false;
        }

        let schema : Schema = {
            "id" : "/OnJoinRoomMessage",
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

    public static createFromString(str : string):OnJoinRoomMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OnJoinRoomMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let onJoinRoomMessage : OnJoinRoomMessage = new OnJoinRoomMessage(json.roomId);
        onJoinRoomMessage.roomId = json.roomId;
        if(json.roomInitConfig != undefined){
            onJoinRoomMessage.roomInitConfig = <RoomInitConfig>RoomInitConfig.createFromJson(json.roomInitConfig);
        }
        if(json.roomStateConfig != undefined){
            onJoinRoomMessage.roomStateConfig = <RoomStateConfig>RoomStateConfig.createFromJson(json.roomStateConfig);
        }

        return onJoinRoomMessage;
    }
}


