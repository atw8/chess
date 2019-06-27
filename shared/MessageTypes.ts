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

    OpRoomGetRoomState = "OpRoomGetRoomState",
    OnRoomGetRoomState = "OnRoomGetRoomState",

    OpRoomMakeMove = "OpRoomMakeMove",
    OnRoomMakeMove = "OnRoomMakeMove",
    OnRoomMakeMoveBroadcast = "OnRoomMakeMoveBroadcast",

    OpRoomJoin = "OpRoomJoin",
    OnRoomJoin = "OnRoomJoin",
    OnRoomJoinBroadcast = "OnRoomJoinBroadcast",

    OnRoomTimeOutBroadcast = "OnRoomTimeOutBroadcast",

    OpRoomMakeVote = "OpRoomMakeVote",
    OnRoomMakeVote = "OnRoomMakeVote",

    OnRoomVotingUpdateBroadcast = "OnRoomVotingUpdateBroadcast",

    OnRoomMultiplayerStateBroadcast = "OnRoomMultiplayerStateBroadcast"
};



export enum ErrorCode {
    SUCCESS = 0,

    ROOM_DOES_NOT_EXIST = 1,

    ROOM_DOES_NOT_SUPPORT_MAKE_MOVE = 31,
    ROOM_DOES_NOT_SUPPORT_VOTE_MOVE = 32,


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
    validator.customFormats.SideType = function(input : number){
        for(let sideType = SideType.FIRST_SIDE; sideType <= SideType.LAST_SIDE; sideType++){
            if(input == sideType){
                return true;
            }
        }

        return false;
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
                },
                "isAskDraw" : {
                    "type" : "boolean"
                },
                "isSideTypeProperty" :{
                    "type" : "boolean"
                }

            },
            "required" : ["roomTypeEnum", "gameTimeStructs", "isAskDraw", "isSideTypeProperty"]
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
                "mySideType" : {
                    "type" : "number",
                    "format" : "SideType"
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

    public isSideTypeProperty ?: boolean;
    public isChess960 ?: boolean;
    public beginFenStr ?: string;
    public isAskDraw : boolean;


    constructor(roomTypeEnum : RoomTypeEnum, gameTimeStructs :GameTimeStructConfigs, isAskDraw : boolean, isSideTypeProperty : boolean){
        this.roomTypeEnum = roomTypeEnum;
        this.gameTimeStructs = gameTimeStructs;
        this.isAskDraw = isAskDraw;
        this.isSideTypeProperty = isSideTypeProperty;
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
        let isAskDraw : boolean = json.isAskDraw;
        let isSideTypeProperty : boolean = json.isSideTypeProperty;

        let roomInitConfig : RoomInitConfig = new RoomInitConfig(roomTypeEnum, gameTimeStructs, isAskDraw, isSideTypeProperty);

        roomInitConfig.beginFenStr = json.beginFenStr;
        roomInitConfig.isChess960 = json.isChess960;

        return roomInitConfig;
    }
}

export class RoomStateConfig {
    public votingData : { [key : string] : number};
    public myVoting ?: string;

    public mySideType : SideType | undefined;

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

        roomStateConfig.mySideType = json.mySideType;

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
export abstract class ClientServerMessage {
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

    public static getSchema():Schema {
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

        return schema;
    }
}

export type OnUserLoginGuestMessageType = {guestToken : string, playerId : number} & ServerClientMessageType;
export class OnUserLoginGuestMessage extends ServerClientMessage {
    public guestToken : string;
    public playerId : number;

    public constructor(json : OnUserLoginGuestMessageType){
        super(MessageType.OnLoginGuest, json);

        this.guestToken = json.guestToken;
        this.playerId = json.playerId;
    }

    public static getSchema():Schema{
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
            },
            "required" : ["guestToken", "playerId"],
            "$ref": "/ServerClientMessage"
        };

        return schema;
    }
}


//RELATED TO ROOM

//Related to getting the roomstate
export type OpRoomGetRoomStateMessageType = {} & ClientServerMessageType;
export class OpRoomGetRoomStateMessage extends ClientServerMessage {
    public constructor(json : OpRoomGetRoomStateMessageType){
        super(MessageType.OpRoomGetRoomState, json);
    }

    public static getSchema():Schema{
        let schema : Schema = {
            "id" : "/OpRoomGetRoomStateMessage",
            "type" : "object",
            "properties" : {
                "roomIds" : {
                    "type" : "array",
                    "items": {
                        "type": "number"
                    }
                }
            },
            "required" : [],
            "$ref": "/ClientServerMessage"
        };

        return schema;
    }
}

export type OnRoomGetRoomStateMessageType = {roomIds : number[]} & ServerClientMessageType;
export class OnRoomGetRoomStateMessage extends ServerClientMessage {
    public roomIds: number[];
    public constructor(json : OnRoomGetRoomStateMessageType){
        super(MessageType.OnRoomGetRoomState, json);

        this.roomIds = json.roomIds;
    }

    public static getSchema():Schema{
        let schema : Schema = {
            "id" : "/OnRoomGetRoomStateMessage",
            "type" : "object",
            "required" : ["roomIds"],
            "$ref": "/ServerClientMessage"
        }

        return schema;
    }


}

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


    public static getSchema():Schema{
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

        return schema;
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

    public static getSchema():Schema{
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

        return schema;
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

    public static getSchema():Schema{
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

        return schema;
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

    public static getSchema():Schema{
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

        return schema;
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

    public static getSchema(){
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

        return schema;
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

    public static getSchema(){
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

        return schema;
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

    public static getSchema():Schema {
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

        return schema;
    }
}


export type OpRoomMakeVoteMessageType = {roomId : number, myVoting : string} & ClientServerMessageType
export class OpRoomMakeVoteMessage extends ClientServerMessage {
    public roomId : number;
    public myVoting : string;
    constructor(json : OpRoomMakeVoteMessageType) {
        super(MessageType.OpRoomMakeVote, json);
        this.roomId  = json.roomId;
        this.myVoting = json.myVoting;
    }

    public static getSchema():Schema{
        let schema : Schema = {
            "id" : "/OpRoomMakeVoteMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "myVoting" : {
                    "type" : "string",
                }
            },
            "required" : ["roomId", "myVoting"],
            "$ref": "/ClientServerMessage"
        };

        return schema;
    }
}

export type OnRoomMakeVoteMessageType = {roomId : number, myVoting : string} & ServerClientMessageType;
export class OnRoomMakeVoteMessage extends ServerClientMessage {
    public roomId : number;
    public myVoting : string;
    constructor(json : OnRoomMakeVoteMessageType){
        super(MessageType.OnRoomMakeVote, json);
        this.roomId = json.roomId;
        this.myVoting = json.myVoting;
    }

    public static getSchema():Schema{
        let schema : Schema = {
            "id" : "/OnRoomMakeVoteMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer",
                },
                "myVoting" : {
                    "type" : "string",
                }
            },
            "required" : ["roomId", "myVoting"],
            "$ref": "/ServerClientMessage"
        };

        return schema;
    }
}

export type OnRoomVotingUpdateBroadcastMessageType = {roomId : number, votingData : { [key : string] : number}} & ServerClientMessageType;
export class OnRoomVotingUpdateBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public votingData : { [key : string] : number};

    constructor(json : OnRoomVotingUpdateBroadcastMessageType){
        super(MessageType.OnRoomVotingUpdateBroadcast, json);
        this.roomId = json.roomId;
        this.votingData = json.votingData;
    }


    public static getSchema():Schema {
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

        return schema;
    }
}

/*
                onRoomMultiplayerStateBroadcastMsgType.chessGameState = this.chessEngine.getGameState();
            }
            if(this.roomStateEnum != RoomStateEnum.NORMAL){
                onRoomMultiplayerStateBroadcastMsgType.roomState = this.roomStateEnum;
 */

export type OnRoomMultiplayerStateBroadcastMessageType = {roomId : number,
    sanMove : string,
    moveTimeStamp : number,
    chessGameState ?: ChessGameStateEnum,
    roomState ?: RoomStateEnum} & ServerClientMessageType;
export class OnRoomMultiplayerStateBroadcastMessage extends ServerClientMessage {
    public roomId : number;
    public sanMove : string;
    public moveTimeStamp : number;

    public chessGameState ?: ChessGameStateEnum;
    public roomState ?: RoomStateEnum;

    constructor(json : OnRoomMultiplayerStateBroadcastMessageType){
        super(MessageType.OnRoomMultiplayerStateBroadcast, json);

        this.roomId = json.roomId;
        this.sanMove = json.sanMove;
        this.moveTimeStamp = json.moveTimeStamp;

        this.chessGameState = json.chessGameState;
        this.roomState = json.roomState;
    }

    public static getSchema():Schema {
        let schema : Schema = {
            "id" : "/OnRoomMultiplayerStateBroadcastMessage",
            "type" : "object",
            "properties" : {
                "roomId" : {
                    "type" : "integer"
                },
                "sanMove" : {
                    "type": "string",
                },
                "moveTimeStamp" : {
                    "type" : "number"
                },
                "chessGameState" : {
                    "type" : "integer",
                    "format" : "ChessGameStateEnum"
                },
                "roomState" : {
                    "type" : "integer",
                    "format" : "RoomStateEnum"
                },
            },
            "required" : ["roomId", "sanMove", "moveTimeStamp"],
            "$ref": "/ServerClientMessage"
        };

        return schema;
    }
}




export function createMessageFromString<T>(str : string, classReference: { new (json : any): T, getSchema() : Schema }):T | null{
    let json;
    try {
        json = JSON.parse(str);
    }catch(e){
        return null;
    }

    return createMessageFromJson(json, classReference);
}


export function createMessageFromJson<T>(json : any, classReference : { new (json : any) : T, getSchema() : Schema}):T | null{
    let validatorResult : ValidatorResult = validator.validate(json, classReference.getSchema());
    if(!validatorResult.valid){
        console.log(validatorResult);
        console.log(validatorResult.valid);
    }

    if(!validatorResult.valid){
        return null;
    }

    let ret : T = new classReference(json);
    return ret;
}