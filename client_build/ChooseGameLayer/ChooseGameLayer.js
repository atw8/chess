"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var MessageTypes_1 = require("../shared/MessageTypes");
var SideType_1 = require("../shared/engine/SideType");
var GameTimeType_1 = require("../shared/gameTime/GameTimeType");
var MainLayer = /** @class */ (function (_super) {
    __extends(MainLayer, _super);
    function MainLayer() {
        var _this = _super.call(this) || this;
        var roomInitConfigs = [];
        {
            var roomInitConfig = new MessageTypes_1.RoomInitConfig();
            roomInitConfig.isChess960 = true;
            // @ts-ignore
            roomInitConfig.gameTimeStructs = {};
            roomInitConfig.gameTimeStructs[SideType_1.SideType.WHITE] = { timeType: GameTimeType_1.GameTimeType.INFINITE };
            roomInitConfig.gameTimeStructs[SideType_1.SideType.BLACK] = { timeType: GameTimeType_1.GameTimeType.INFINITE };
            roomInitConfigs.push(roomInitConfig);
        }
        {
            var roomInitConfig = new MessageTypes_1.RoomInitConfig();
            roomInitConfig.isChess960 = true;
            // @ts-ignore
            roomInitConfig.gameTimeStructs = {};
            roomInitConfig.gameTimeStructs[SideType_1.SideType.WHITE] = { timeType: GameTimeType_1.GameTimeType.MOVE, totalTime: 1 * 60 * 1000, incrTime: 0 };
            roomInitConfig.gameTimeStructs[SideType_1.SideType.BLACK] = { timeType: GameTimeType_1.GameTimeType.MOVE, totalTime: 1 * 60 * 1000, incrTime: 0 };
            roomInitConfigs.push(roomInitConfig);
        }
        {
            var roomInitConfig = new MessageTypes_1.RoomInitConfig();
            roomInitConfig.isChess960 = false;
            // @ts-ignore
            roomInitConfig.gameTimeStructs = {};
            roomInitConfig.gameTimeStructs[SideType_1.SideType.WHITE] = { timeType: GameTimeType_1.GameTimeType.NORMAL, totalTime: 1 * 60 * 1000, incrTime: 5 };
            roomInitConfig.gameTimeStructs[SideType_1.SideType.BLACK] = { timeType: GameTimeType_1.GameTimeType.NORMAL, totalTime: 1 * 60 * 1000, incrTime: 5 };
            roomInitConfigs.push(roomInitConfig);
        }
        return _this;
    }
    return MainLayer;
}(PIXI.Container));
exports.MainLayer = MainLayer;
//# sourceMappingURL=MainLayer.js.map