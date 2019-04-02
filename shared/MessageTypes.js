"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonschema_1 = require("jsonschema");
var MessageType;
(function (MessageType) {
    MessageType["OpLoginGuest"] = "OpLoginGuest";
    MessageType["OnLoginGuest"] = "OnLoginGuest";
    MessageType["OpGetRoomsList"] = "OpGetRoomsList";
    MessageType["OnGetRoomsList"] = "OnGetRoomsList";
    MessageType["OpJoinRoom"] = "OpJoinRoom";
    MessageType["OnJoinRoom"] = "OnJoinRoom";
    MessageType["OpGetRoomConfig"] = "OpGetRoomConfig";
    MessageType["OnGetRoomConfig"] = "OnGetRoomConfig";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
let validator;
{
    let messageTypeSet = {};
    messageTypeSet[MessageType.OpLoginGuest] = true;
    messageTypeSet[MessageType.OnLoginGuest] = true;
    messageTypeSet[MessageType.OpGetRoomsList] = true;
    messageTypeSet[MessageType.OnGetRoomsList] = true;
    messageTypeSet[MessageType.OpJoinRoom] = true;
    messageTypeSet[MessageType.OnJoinRoom] = true;
    messageTypeSet[MessageType.OpGetRoomConfig] = true;
    messageTypeSet[MessageType.OnGetRoomConfig] = true;
    let errorCodeSet = {};
    errorCodeSet[ErrorCode.SUCCESS] = true;
    validator = new jsonschema_1.Validator();
    validator.customFormats.MessageType = function (input) {
        //console.log("Validator.prototype.customFormats.MessageType");
        return input in messageTypeSet;
    };
    validator.customFormats.ErrorCode = function (input) {
        //console.log("validator.customFormats.ErrorCode");
        return input in errorCodeSet;
    };
}
class RoomInitConfig {
    static validateSchema(json) {
        let schema = {
            "id": "/RoomInitConfig",
            "type": "object",
            "properties": {
                "roomId": {
                    "type": "integer",
                    "required": true,
                },
                "gameTimeTypeWhite": {
                    "type": "integer",
                    "required": true,
                },
                "gameTimeTotalTimeWhite": {
                    "type": "number",
                    "required": false,
                },
                "gameTimeIncrTimeWhite": {
                    "type": "number",
                    "required": false,
                },
                "gameTimeTypeBlack": {
                    "type": "integer",
                    "required": true,
                },
                "gameTimeTotalTimeBlack": {
                    "type": "number",
                    "required": false,
                },
                "gameTimeIncrTimeBlack": {
                    "type": "number",
                    "required": false,
                },
                "isChess960": {
                    "type": "boolean",
                    "required": false,
                },
                "beginFenStr": {
                    "type": "string",
                    "required": false,
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let roomInitConfig = new RoomInitConfig();
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
exports.RoomInitConfig = RoomInitConfig;
class RoomStateConfig {
    constructor() {
        this.players = 0;
        this.voteConfig = {};
        this.currentFenStr = "";
        this.sanMoves = [];
        this.timeStamps = [];
    }
    static validateSchema(json) {
        let schema = {
            "id": "/RoomStateConfig",
            "type": "object",
            "properties": {
                "players": {
                    "type": "integer",
                    "required": true,
                },
                "voteConfig": {
                    "type": "object",
                    "patternProperties": {
                        ".+": {
                            "type": "string"
                        }
                    }
                },
                "currentFenStr": {
                    "type": "string",
                    "required": true,
                },
                "sanMoves": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "required": true
                },
                "timeStamps": {
                    "type": "array",
                    "items": {
                        "type": "integer",
                    },
                    "required": true
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let roomStateConfig = new RoomStateConfig();
        roomStateConfig.players = json.players;
        roomStateConfig.voteConfig = json.voteConfig;
        roomStateConfig.currentFenStr = json.currentFenStr;
        roomStateConfig.sanMoves = json.sanMoves;
        roomStateConfig.timeStamps = json.timeStamps;
        return roomStateConfig;
    }
}
exports.RoomStateConfig = RoomStateConfig;
class ClientServerMessage {
    constructor(messageType) {
        this.messageType = messageType;
        this.requestId = 0;
    }
    getMessageType() {
        return this.messageType;
    }
    getRequestId() {
        return this.requestId;
    }
    setRequestId(requestId) {
        this.requestId = requestId;
    }
    static validateSchema(json) {
        let schema = {
            "id": "/ClientServerMessage",
            "type": "object",
            "properties": {
                "messageType": {
                    "type": "string",
                    "format": "MessageType",
                    "required": true,
                },
                "requestId": {
                    "type": "integer",
                    "required": true,
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    superCreateFromJson(json) {
        this.setRequestId(json.requestId);
    }
}
exports.ClientServerMessage = ClientServerMessage;
class ServerClientMessage {
    constructor(messageType) {
        this.messageType = messageType;
        this.errorCode = ErrorCode.SUCCESS;
        this.requestId = 0;
        this.timeStamp = 0;
    }
    getMessageType() {
        return this.messageType;
    }
    getErrorCode() {
        return this.errorCode;
    }
    setErrorCode(errorCode) {
        this.errorCode = errorCode;
    }
    getRequestId() {
        return this.requestId;
    }
    setRequestId(requestId) {
        this.requestId = requestId;
    }
    getTimeStamp() {
        return this.timeStamp;
    }
    setTimeStamp(timeStamp) {
        this.timeStamp = timeStamp;
    }
    static validateSchema(json) {
        let schema = {
            "id": "/ServerClientMessage",
            "type": "object",
            "properties": {
                "messageType": {
                    "type": "string",
                    "format": "MessageType",
                    "required": true
                },
                "errorCode": {
                    "type": "integer",
                    "format": "ErrorCode",
                    "required": true
                },
                "requestId": {
                    "type": "integer",
                    "required": true
                },
                "timeStamp": {
                    "type": "integer",
                    "required": true
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    superCreateFromJson(json) {
        this.setErrorCode(json.errorCode);
        this.setRequestId(json.requestId);
        this.setTimeStamp(json.timeStamp);
    }
}
exports.ServerClientMessage = ServerClientMessage;
//RELATED TO LOGIN
class OpLoginGuestMessage extends ClientServerMessage {
    constructor(token) {
        super(MessageType.OpLoginGuest);
        this.token = token;
    }
    getToken() {
        return this.token;
    }
    static validateSchema(json) {
        if (!ClientServerMessage.validateSchema(json)) {
            return false;
        }
        let schema = {
            "id": "/OpLoginGuestMessage",
            "type": "object",
            "properties": {
                "token": {
                    "type": "string",
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let opLoginGuestMessage = new OpLoginGuestMessage(json.token);
        opLoginGuestMessage.superCreateFromJson(json);
        return opLoginGuestMessage;
    }
}
exports.OpLoginGuestMessage = OpLoginGuestMessage;
class OnLoginGuestMessage extends ServerClientMessage {
    constructor(token) {
        super(MessageType.OnLoginGuest);
        this.token = token;
    }
    getToken() {
        return this.token;
    }
    static validateSchema(json) {
        if (!ServerClientMessage.validateSchema(json)) {
            return false;
        }
        let schema = {
            "id": "/OnLoginGuestMessage",
            "type": "object",
            "properties": {
                "token": {
                    "type": "string",
                    "required": true,
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let onLoginGuestMessage = new OnLoginGuestMessage(json.token);
        onLoginGuestMessage.superCreateFromJson(json);
        return onLoginGuestMessage;
    }
}
exports.OnLoginGuestMessage = OnLoginGuestMessage;
//RELATED TO ROOM
//Getting the list of rooms
class OpGetRoomsListMessage extends ClientServerMessage {
    constructor() {
        super(MessageType.OpGetRoomsList);
    }
    static validateSchema(json) {
        return ClientServerMessage.validateSchema(json);
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let opGetRoomsListMessage = new OpGetRoomsListMessage();
        opGetRoomsListMessage.superCreateFromJson(json);
        return opGetRoomsListMessage;
    }
}
exports.OpGetRoomsListMessage = OpGetRoomsListMessage;
class OnGetRoomsListMessage extends ServerClientMessage {
    constructor(roomIds) {
        super(MessageType.OnGetRoomsList);
        this.roomIds = roomIds;
    }
    static validateSchema(json) {
        if (!ServerClientMessage.validateSchema(json)) {
            return false;
        }
        let schema = {
            "id": "/OnGetRoomsListMessage",
            "type": "object",
            "properties": {
                "roomIds": {
                    "type": "array",
                    "items": {
                        "type": "integer"
                    },
                    "required": true
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let onGetRoomsListMessage = new OnGetRoomsListMessage(json.roomIds);
        onGetRoomsListMessage.superCreateFromJson(json);
        return onGetRoomsListMessage;
    }
}
exports.OnGetRoomsListMessage = OnGetRoomsListMessage;
//Related to joining a room
class OpJoinRoomMessage extends ClientServerMessage {
    constructor(roomId) {
        super(MessageType.OpJoinRoom);
        this.roomId = roomId;
    }
    static validateSchema(json) {
        if (!ClientServerMessage.validateSchema(json)) {
            return false;
        }
        let schema = {
            "id": "/OpJoinRoomMessage",
            "type": "object",
            "properties": {
                "roomId": {
                    "type": "integer",
                    "required": false
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
        }
        return validatorResult.valid;
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let opJoinRoomMessage = new OpJoinRoomMessage(json.roomId);
        opJoinRoomMessage.superCreateFromJson(json);
        return opJoinRoomMessage;
    }
}
exports.OpJoinRoomMessage = OpJoinRoomMessage;
class OnJoinRoomMessage extends ServerClientMessage {
    constructor(roomId) {
        super(MessageType.OnJoinRoom);
        this.roomId = roomId;
    }
    static validateSchema(json) {
        if (!ServerClientMessage.validateSchema(json)) {
            return false;
        }
        let schema = {
            "id": "/OpJoinRoomMessage",
            "type": "object",
            "properties": {
                "isSuccess": {
                    "type": "boolean",
                    "required": true,
                },
                "roomId": {
                    "type": "integer",
                    "required": false
                },
                "roomInitConfig": {
                    "type": "object",
                    "required": false
                },
                "roomStateConfig": {
                    "type": "object",
                    "required": false
                }
            }
        };
        let validatorResult = validator.validate(json, schema);
        if (!validatorResult.valid) {
            console.log(validatorResult);
            console.log(validatorResult.valid);
            return false;
        }
        if (json.roomInitConfig != undefined) {
            if (!RoomInitConfig.validateSchema(json)) {
                return false;
            }
        }
        if (json.roomStateConfig != undefined) {
            if (!RoomStateConfig.validateSchema(json)) {
                return false;
            }
        }
        return true;
    }
    static createFromString(str) {
        let json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            return null;
        }
        return this.createFromJson(json);
    }
    static createFromJson(json) {
        if (!this.validateSchema(json)) {
            return null;
        }
        let onJoinRoomMessage = new OnJoinRoomMessage(json.roomId);
        onJoinRoomMessage.roomId = json.roomId;
        if (json.roomInitConfig != undefined) {
            onJoinRoomMessage.roomInitConfig = RoomInitConfig.createFromJson(json.roomInitConfig);
        }
        if (json.roomStateConfig != undefined) {
            onJoinRoomMessage.roomStateConfig = RoomStateConfig.createFromJson(json.roomStateConfig);
        }
        return onJoinRoomMessage;
    }
}
exports.OnJoinRoomMessage = OnJoinRoomMessage;
//# sourceMappingURL=MessageTypes.js.map