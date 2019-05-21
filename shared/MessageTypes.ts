import {Schema, Validator, ValidatorResult} from "jsonschema";
import {GameTimeType} from "../shared/gameTime/GameTimeType";
import {SideType} from "./engine/SideType";
import {RoomStateEnum} from "../shared/RoomStateEnum";
import {ChessGameStateEnum} from "./engine/ChessGameStateEnum";
import {RoomTypeEnum} from "./RoomTypeEnum";
import {GameTimeStructConfigs} from "./gameTime/GameTimeManager";


export enum MessageType {
    OpLoginGuest = "OpLoginGuest",
    OnLoginGuest = "OnLoginGuest",

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
    DO_MOVE_NOT_ACTIVE_GAME = 24,
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

    validator.customFormats.GameTimeType = function(input : number){
        return input >= GameTimeType.FIRST_TIME_TYPE && input <= GameTimeType.LAST_TIME_TYPE;
    };

    validator.customFormats.ChessGameStateEnum = function(input : number){
        return input in ChessGameStateEnum;
    };

    validator.customFormats.RoomStateEnum = function(input : number){
        return input >= RoomStateEnum.FIRST_ROOM_STATE && input <= RoomTypeEnum.LAST_ROOM_TYPE;
    };
    validator.customFormats.SideTypeMap = function(input : any){
        let ret : boolean = true;
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE && ret; sideType++){
            if(!(sideType in input)){
                ret = false;
            }
        }

        return ret;
    };
    validator.customFormats.RoomTypeEnum = function(input : number){
        return input >= RoomTypeEnum.FIRST_ROOM_TYPE && input <= RoomTypeEnum.LAST_ROOM_TYPE;
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
                    "type" : "integer",
                    "format" : "GameTimeType",
                },
                "totalTime" : {
                    "type" : "integer"
                },
                "incrTime" : {
                    "type" : "integer"
                }
            },
            "required" : ["timeType"]
        };

        validator.addSchema(gameTimeStructSchema, "/GameTimeStruct");

        let roomInitConfig : Schema = {
            "id" : "/RoomInitConfig",
            "type" : "object",
            "properties" : {
                "roomTypeEnum" : {
                    "type" : "integer",
                    "format" : "RoomTypeEnum"
                },
                "gameTimeStructs" : {
                    "type" : "object",
                    "additionalProperties": {"$ref": "/GameTimeStruct"},
                    "format" : "SideTypeMap"
                },

                "isChess960" : {
                    "type" : "boolean",
                },
                "beginFenStr" : {
                    "type" : "string",
                }
            },
            "required" : ["roomTypeEnum", "gameTimeStructs"]
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
                    "additionalProperties": {"type" : "integer"},
                },
                "roomState" : {
                    "type" : "integer",
                    "format" : "RoomStateEnum"
                },
                "chessGameState" : {
                    "type" : "integer",
                    "format" : "ChessGameStateEnum"
                },
                "isResignMap" : {
                    "type" : "object",
                    "additionalProperties": {"type" : "boolean"},
                    "format" : "SideTypeMap",
                },
                "askDrawMap" : {
                    "type" : "object",
                    "additionalProperties": {"type" : "boolean"},
                    "format" : "SideTypeMap"
                },
                "isLoseByTimeMap" : {
                    "type" : "object",
                    "additionalProperties": {"type" : "boolean"},
                    "format" : "SideTypeMap"
                }
            },
            "required" : ["currentFenStr", "sanMoves", "timeStamps", "sideTypeMap", "roomState", "chessGameState", "isResignMap", "askDrawMap", "isLoseByTimeMap"]
        };
        validator.addSchema(roomStateConfig, "/RoomStateConfig");
    }
}


export class RoomInitConfig {
    public roomTypeEnum : RoomTypeEnum;
    public gameTimeStructs : GameTimeStructConfigs;

    public isChess960 ?: boolean;
    public beginFenStr ?: string;


    constructor(roomTypeEnum : RoomTypeEnum, gameTimeStructs : { [key in SideType] : {"timeType" : GameTimeType, "totalTime" ?: number, "incrTime" ?: number}}){
        this.roomTypeEnum = roomTypeEnum;
        this.gameTimeStructs = gameTimeStructs;
    }

    public static getRoomInitConfigStr(roomInitConfig : RoomInitConfig):string{
        return JSON.stringify(roomInitConfig);
    }

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


        let roomTypeEnum : RoomTypeEnum = json.roomTypeEnum;
        let gameTimeStructs : GameTimeStructConfigs = json.gameTimeStructs;

        let roomInitConfig : RoomInitConfig = new RoomInitConfig(roomTypeEnum, gameTimeStructs);

        roomInitConfig.beginFenStr = json.beginFenStr;
        roomInitConfig.isChess960 = json.isChess960;

        return roomInitConfig;
    }
}

export class RoomStateConfig {
    public sideTypeMap : { [key in SideType] ?: number};


    public currentFenStr : string;

    public sanMoves : string[];
    public timeStamps : number[];

    public isResignMap : { [key in SideType] : boolean};
    public askDrawMap : { [key in SideType] : boolean};
    public isLoseByTimeMap : { [key in SideType] : boolean};


    public roomState : RoomStateEnum;
    public chessGameState : ChessGameStateEnum;





    constructor(){
        this.sideTypeMap = {};

        this.currentFenStr = "";


        this.sanMoves = [];
        this.timeStamps = [];

        this.roomState = RoomStateEnum.START;
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


        roomStateConfig.isLoseByTimeMap = json.isLoseByTimeMap;
        roomStateConfig.askDrawMap = json.askDrawMap;
        roomStateConfig.isResignMap = json.isResignMap;

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

    public roomIds : number[] = [];

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
                "roomIds" : {
                    "type" : "array",
                    "items": {
                        "type": "number"
                    }
                }
            },
            "required" : ["guestToken", "playerId", "roomIds"],
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
        onUserLoginGuestMsg.roomIds = json.roomIds;
        onUserLoginGuestMsg.superCreateFromJson(json);

        return onUserLoginGuestMsg;
    }
}


//RELATED TO ROOM
//Related to joining a room
export class OpRoomJoinMessage extends ClientServerMessage {
    public roomId ?: number;
    public roomInitConfig ?: RoomInitConfig;
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
                },
                "roomInitConfig" : {
                    "type" : "object",
                    "$ref" : "/RoomInitConfig"
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
        if(json.roomInitConfig != undefined){
            opJoinRoomMessage.roomInitConfig = <RoomInitConfig>RoomInitConfig.createFromJson(json.roomInitConfig);
        }

        return opJoinRoomMessage;

    }
}
export class OnRoomJoinMessage extends ServerClientMessage {
    public roomId ?: number;

    public roomInitConfig ?: RoomInitConfig;
    public roomStateConfig ?: RoomStateConfig;


    public constructor(opRoomJoinMessage ?: OpRoomJoinMessage){
        super(MessageType.OnRoomJoin);

        if(opRoomJoinMessage != undefined){
            this.roomId = opRoomJoinMessage.roomId;
            this.roomInitConfig = opRoomJoinMessage.roomInitConfig;
        }
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

        let onJoinRoomMessage : OnRoomJoinMessage = new OnRoomJoinMessage();
        onJoinRoomMessage.superCreateFromJson(json);

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
export class OnRoomJoinBroadcastMessage extends ServerClientMessage {
    public roomId : number;

    public sideTypeMap : { [key in SideType] ?: number};
    public beginTimeStamp : number;
    public chessGameState : ChessGameStateEnum;
    public roomState : RoomStateEnum;


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
                "sideTypeMap" : {
                    "type" : "object",
                    "additionalProperties" : {"type" : "integer"}
                },
                "beginTimeStamp" : {
                    "type" : "integer"
                },
                "roomState" : {
                    "type" : "object",
                    "format" : "RoomStateEnum"
                },
                "chessGameState" : {
                    "type" : "integer",
                    "format" : "ChessGameStateEnum"
                },
            },
            "required" : ["roomId", "sideTypeMap", "beginTimeStamp", "chessGameState", "roomState"],
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
        onRoomJoinBroadcastMsg.sideTypeMap = json.sideTypeMap;
        onRoomJoinBroadcastMsg.beginTimeStamp = json.beginTimeStamp;
        onRoomJoinBroadcastMsg.chessGameState = json.chessGameState;
        onRoomJoinBroadcastMsg.roomState = json.roomState;

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
    public moveTimeStamp : number;

    public roomState ?: RoomStateEnum;
    public chessGameState ?: ChessGameStateEnum;

    constructor(roomId : number, sanMove : string, moveTimeStamp : number){
        super(MessageType.OnRoomMakeMove);
        this.roomId = roomId;
        this.sanMove = sanMove;
        this.moveTimeStamp = moveTimeStamp;
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
                },
                "moveTimeStamp" : {
                    "type" : "number"
                },
                "roomState" : {
                    "type" : "number",
                    "format" : "RoomStateEnum"
                },
                "chessGameState" : {
                    "type" : "number",
                    "format" : "ChessGameStateEnum"
                }
            },
            "required" : ["roomId", "sanMove", "timeStamp"],
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

        let onRoomMakeMoveMessage : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(json.roomId, json.sanMove, json.moveTimeStamp);
        onRoomMakeMoveMessage.superCreateFromJson(json);
        onRoomMakeMoveMessage.roomState = json.roomState;
        onRoomMakeMoveMessage.chessGameState = json.chessGameState;

        return onRoomMakeMoveMessage;
    }
}
export class OnRoomMakeMoveBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public sanMove : string;
    public moveTimeStamp : number;

    public roomState ?: RoomStateEnum;
    public chessGameState ?: ChessGameStateEnum;

    constructor(roomId : number, sanMove : string, moveTimeStamp : number){
        super(MessageType.OnRoomMakeMoveBroadcast);
        this.roomId = roomId;
        this.sanMove = sanMove;
        this.moveTimeStamp = moveTimeStamp;
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
                },
                "moveTimeStamp" : {
                    "type" : "number"
                },
                "roomState" : {
                    "type" : "number",
                    "format" : "RoomStateEnum"
                },
                "chessGameState" : {
                    "type" : "number",
                    "format" : "ChessGameStateEnum"
                }
            },
            "required" : ["roomId", "sanMove", "timeStamp"],
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

        let onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage = new OnRoomMakeMoveBroadcastMessage(json.roomId, json.sanMove, json.moveTimeStamp);
        onRoomMakeMoveBroadcastMsg.superCreateFromJson(json);
        onRoomMakeMoveBroadcastMsg.roomState = json.roomState;
        onRoomMakeMoveBroadcastMsg.chessGameState = json.chessGameState;


        return onRoomMakeMoveBroadcastMsg;
    }
}
export class OnRoomTimeOutBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public roomState : RoomStateEnum;
    public chessGameState : ChessGameStateEnum;
    public endTimeStamp : number;
    public isLoseByTimeMap : { [key in SideType] : boolean};

    constructor(roomId : number, roomState : RoomStateEnum, chessGameState : ChessGameStateEnum, endTimeStamp : number, isLoseByTimeMap : { [key in SideType] : boolean}){
        super(MessageType.OnRoomTimeOutBroadcast);

        this.roomId = roomId;
        this.roomState = roomState;
        this.chessGameState = chessGameState;
        this.endTimeStamp = endTimeStamp;
        this.isLoseByTimeMap = isLoseByTimeMap;
    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnRoomTimeOutBroadcastMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer"
                },
                "roomState" : {
                    "type": "integer",
                    "format" : "RoomStateEnum"
                },
                "chessGameState" : {
                    "type" : "integer",
                    "format" : "ChessGameStateEnum"
                },
                "endTimeStamp" : {
                    "type" : "number",
                },
                "isLoseByTimeMap" : {
                    "type" : "object",
                    "additionalProperties": {"type" : "boolean"},
                    "format" : "SideTypeMap"
                }
            },
            "required" : ["roomId", "roomState", "chessGameState", "endTimeStamp", "isLoseByTimeMap"],
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

        let roomId = json.roomId;
        let roomState = json.roomState;
        let chessGameState = json.chessGameState;
        let endTimeStamp = json.endTimeStamp;
        let isLoseByTimeMap = json.isLoseByTimeMap;
        let onRoomTimeOutBroacastMsg : OnRoomTimeOutBroadcastMessage = new OnRoomTimeOutBroadcastMessage(roomId, roomState, chessGameState, endTimeStamp, isLoseByTimeMap);

        return onRoomTimeOutBroacastMsg;
    }
}




