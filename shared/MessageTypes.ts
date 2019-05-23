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

    OnRoomVotingUpdateBroadcast = "OnRoomVotingUpdateBroadcast",
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
                "votingData" : {
                    "type": "object",
                    "additionalProperties": {"type" : "integer"},
                },
                "myVoting" : {
                    "type": "string"
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
            "required" : ["currentFenStr", "sanMoves", "timeStamps", "roomState", "chessGameState", "isResignMap", "askDrawMap", "isLoseByTimeMap"]
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

    public votingData : { [key : string] : number};
    public myVoting : string;

    public currentFenStr : string;

    public sanMoves : string[];
    public timeStamps : number[];

    public isResignMap : { [key in SideType] : boolean};
    public askDrawMap : { [key in SideType] : boolean};
    public isLoseByTimeMap : { [key in SideType] : boolean};


    public roomState : RoomStateEnum;
    public chessGameState : ChessGameStateEnum;





    constructor(){
        /*
        this.sideTypeMap = {};
        this.votingData = {};
        this.myVoting = "";
        */

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

        roomStateConfig.votingData = json.votingData;
        roomStateConfig.myVoting = json.myVoting;

        roomStateConfig.roomState = json.roomState;
        roomStateConfig.chessGameState = json.chessGameState;


        roomStateConfig.isLoseByTimeMap = json.isLoseByTimeMap;
        roomStateConfig.askDrawMap = json.askDrawMap;
        roomStateConfig.isResignMap = json.isResignMap;

        return roomStateConfig;
    }
}



export type ClientServerMessageType = {requestId ?: number};
export class ClientServerMessage {
    public messageType : MessageType;
    public requestId : number;


    protected constructor(messageType : MessageType, json : ClientServerMessageType){
        this.messageType = messageType;
        this.requestId = 0;
        if(json.requestId != undefined){
            this.requestId = json.requestId;
        }
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

    /*
    public superCreateFromJson(json : any){
        this.setRequestId(json.requestId);
    }
    */
}

export type ServerClientMessageType = {errorCode ?: ErrorCode, requestId ?: number, timeStamp ?: number};
export class ServerClientMessage {
    public messageType : MessageType;
    public errorCode : ErrorCode;
    public requestId : number;
    public timeStamp : number;

    protected constructor(messageType : MessageType, json : ServerClientMessageType){
        this.messageType = messageType;

        this.errorCode = ErrorCode.SUCCESS;
        this.requestId = 0;
        this.timeStamp = 0;
        if(json.errorCode != undefined){
            this.errorCode = json.errorCode;
        }
        if(json.requestId != undefined){
            this.requestId = json.requestId;
        }
        if(json.timeStamp != undefined){
            this.timeStamp = json.timeStamp;
        }
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
}


//RELATED TO LOGIN
export type OpUserLoginGuestMessageType = {guestToken ?: string} & ClientServerMessageType;
export class OpUserLoginGuestMessage extends ClientServerMessage {
    public guestToken ?: string;



    public constructor(json : OpUserLoginGuestMessageType){
        super(MessageType.OpLoginGuest, json);
        this.guestToken = json.guestToken;
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


        let opUserLoginGuestMsg = new OpUserLoginGuestMessage(json);


        return opUserLoginGuestMsg;
    }
}

export type OnUserLoginGuestMessageType = {guestToken : string, playerId : number, roomIds : number[]} & ServerClientMessageType;
export class OnUserLoginGuestMessage extends ServerClientMessage {
    public guestToken : string;
    public playerId : number;

    public roomIds : number[] = [];

    public constructor(json : OnUserLoginGuestMessageType){
        super(MessageType.OnLoginGuest, json);

        this.guestToken = json.guestToken;
        this.playerId = json.playerId;
        this.roomIds = json.roomIds;
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

        let onUserLoginGuestMsg : OnUserLoginGuestMessage = new OnUserLoginGuestMessage(json);

        return onUserLoginGuestMsg;
    }
}


//RELATED TO ROOM
//Related to joining a room
export type OpRoomJoinMessageType = {roomId ?: number, roomInitConfig ?: RoomInitConfig, sideType ?: SideType} & ClientServerMessageType;
export class OpRoomJoinMessage extends ClientServerMessage {
    public roomId ?: number;
    public roomInitConfig ?: RoomInitConfig;
    public sideType ?: SideType;

    public constructor(json : OpRoomJoinMessageType){
        super(MessageType.OpRoomJoin, json);

        this.roomId = json.roomId;
        this.roomInitConfig = json.roomInitConfig;
        this.sideType = json.sideType;
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

        let opJoinRoomMessage : OpRoomJoinMessage = new OpRoomJoinMessage(json);

        return opJoinRoomMessage;

    }
}

export type OnRoomJoinMessageType = {roomId ?: number, roomInitConfig ?: RoomInitConfig, roomStateConfig ?: RoomStateConfig} & ServerClientMessageType;
export class OnRoomJoinMessage extends ServerClientMessage {
    public roomId ?: number;

    public roomInitConfig ?: RoomInitConfig;
    public roomStateConfig ?: RoomStateConfig;


    public constructor(json : OnRoomJoinMessageType){
        super(MessageType.OnRoomJoin, json);

        this.roomId = json.roomId;
        this.roomInitConfig = json.roomInitConfig;
        this.roomStateConfig = json.roomStateConfig;
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

        let onJoinRoomMessage : OnRoomJoinMessage = new OnRoomJoinMessage(json);

        return onJoinRoomMessage;
    }
}

export type OnRoomJoinBroadcastMessageType = {roomId : number,
    sideTypeMap : { [key in SideType] ?: number},
    beginTimeStamp : number,
    chessGameState : ChessGameStateEnum,
    roomState : RoomStateEnum} & ServerClientMessageType

export class OnRoomJoinBroadcastMessage extends ServerClientMessage {
    public roomId : number;

    public sideTypeMap : { [key in SideType] ?: number};
    public beginTimeStamp : number;
    public chessGameState : ChessGameStateEnum;
    public roomState : RoomStateEnum;


    constructor(json : OnRoomJoinBroadcastMessageType){
        super(MessageType.OnRoomJoinBroadcast, json);
        this.roomId = json.roomId;
        this.sideTypeMap = json.sideTypeMap;
        this.beginTimeStamp = json.beginTimeStamp;
        this.chessGameState = json.chessGameState;
        this.roomState = json.roomState;
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

        let onRoomJoinBroadcastMsg : OnRoomJoinBroadcastMessage = new OnRoomJoinBroadcastMessage(json);

        return onRoomJoinBroadcastMsg;
    }
}

//The move message for this room
export type OpRoomMakeMoveMessageType = {roomId : number, sanMove : string} & ClientServerMessageType;
export class OpRoomMakeMoveMessage extends ClientServerMessage {
    public roomId : number;
    public sanMove : string;
    constructor(json : OpRoomMakeMoveMessageType) {
        super(MessageType.OpRoomMakeMove, json);
        this.roomId  = json.roomId;
        this.sanMove = json.sanMove;
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

        let opRoomMakeMoveMessage : OpRoomMakeMoveMessage = new OpRoomMakeMoveMessage(json);

        return opRoomMakeMoveMessage;
    }
}

export type OnRoomMakeMoveMessageType = {roomId : number,
    sanMove : string,
    moveTimeStamp ?: number,
    roomState ?: RoomStateEnum,
    chessGameState ?: ChessGameStateEnum} & ServerClientMessageType;

export class OnRoomMakeMoveMessage extends ServerClientMessage {
    public roomId : number;

    public sanMove : string;
    public moveTimeStamp ?: number;

    public roomState ?: RoomStateEnum;
    public chessGameState ?: ChessGameStateEnum;

    constructor(json : OnRoomMakeMoveMessageType){
        super(MessageType.OnRoomMakeMove, json);
        this.roomId = json.roomId;
        this.sanMove = json.sanMove;
        this.moveTimeStamp = json.moveTimeStamp;
        this.roomState = json.roomState;
        this.chessGameState = json.chessGameState;
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

        let onRoomMakeMoveMessage : OnRoomMakeMoveMessage = new OnRoomMakeMoveMessage(json);

        return onRoomMakeMoveMessage;
    }
}

export type OnRoomMakeMoveBroadcastMessageType = {roomId : number,
    sanMove : string,
    moveTimeStamp : number,
    roomState ?: RoomStateEnum,
    chessGameState ?: ChessGameStateEnum} & ServerClientMessageType;

export class OnRoomMakeMoveBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public sanMove : string;
    public moveTimeStamp : number;

    public roomState ?: RoomStateEnum;
    public chessGameState ?: ChessGameStateEnum;

    constructor(json : OnRoomMakeMoveBroadcastMessageType){
        super(MessageType.OnRoomMakeMoveBroadcast, json);

        this.roomId = json.roomId;
        this.sanMove = json.sanMove;
        this.moveTimeStamp = json.moveTimeStamp;
        this.roomState = json.roomState;
        this.chessGameState = json.chessGameState;
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

        let onRoomMakeMoveBroadcastMsg : OnRoomMakeMoveBroadcastMessage = new OnRoomMakeMoveBroadcastMessage(json);

        return onRoomMakeMoveBroadcastMsg;
    }
}

export type OnRoomTimeOutBroadcastMessageType = {roomId : number,
    roomState : RoomStateEnum,
    chessGameState : ChessGameStateEnum,
    endTimeStamp : number,
    isLoseByTimeMap : { [key in SideType] : boolean}} & ServerClientMessageType;
export class OnRoomTimeOutBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public roomState : RoomStateEnum;
    public chessGameState : ChessGameStateEnum;
    public endTimeStamp : number;
    public isLoseByTimeMap : { [key in SideType] : boolean};

    constructor(json : OnRoomTimeOutBroadcastMessageType){
        super(MessageType.OnRoomTimeOutBroadcast, json);

        this.roomId = json.roomId;
        this.roomState = json.roomState;
        this.chessGameState = json.chessGameState;
        this.endTimeStamp = json.endTimeStamp;
        this.isLoseByTimeMap = json.isLoseByTimeMap;
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

        let onRoomTimeOutBroacastMsg : OnRoomTimeOutBroadcastMessage = new OnRoomTimeOutBroadcastMessage(json);

        return onRoomTimeOutBroacastMsg;
    }
}


/*
export class OpRoomMakeVoteMessage extends ClientServerMessage {
    public roomId : number;
    public sanMove : string;
    constructor(roomId : number, sanMove : string) {
        super(MessageType.OpRoomMakeMove);
        this.roomId  = roomId;
        this.sanMove = sanMove;
    }

    public static validateSchema(json : any):boolean {
        let schema : Schema = {
            "id" : "/OpRoomMakeVoteMessage",
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

    public static createFromString(str : string):OpRoomMakeVoteMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OpRoomMakeVoteMessage | null {
        if(!this.validateSchema(json)){
            return null;
        }

        let opRoomMakeMoveMessage : OpRoomMakeMoveMessage = new OpRoomMakeMoveMessage(json.roomId, json.sanMove);
        opRoomMakeMoveMessage.superCreateFromJson(json);
        return opRoomMakeMoveMessage;
    }
}
*/

type OnRoomVotingUpdateBroadcastMessageType = {roomId : number, votingData : { [key : string] : number}} & ServerClientMessageType;
export class OnRoomVotingUpdateBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public votingData : { [key : string] : number};

    constructor(json : OnRoomVotingUpdateBroadcastMessageType){
        super(MessageType.OnRoomVotingUpdateBroadcast, json);
        this.roomId = json.roomId;
        this.votingData = json.votingData;
    }

    public static validateSchema(json : any):boolean{
        let schema : Schema = {
            "id" : "/OnRoomVotingUpdateBroadcastMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer"
                },
                "votingData" : {
                    "type": "object",
                    "additionalProperties": {"type" : "integer"},
                },
            },
            "required" : ["roomId", "votingData"],
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
    public static createFromString(str : string):OnRoomVotingUpdateBroadcastMessage | null {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }

        return this.createFromJson(json);
    }
    public static createFromJson(json : any):OnRoomVotingUpdateBroadcastMessage | null {
        if(!OnRoomVotingUpdateBroadcastMessage.validateSchema(json)){
            return null;
        }

        let onRoomVotingUpdateBroadcastMsg = new OnRoomVotingUpdateBroadcastMessage(json);

        return onRoomVotingUpdateBroadcastMsg;
    }
}




