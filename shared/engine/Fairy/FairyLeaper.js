"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Fairy_1 = require("./Fairy");
var FairyType_1 = require("./FairyType");
var FairyLeaper = /** @class */ (function (_super) {
    __extends(FairyLeaper, _super);
    function FairyLeaper() {
        var _this = _super.call(this, FairyType_1.FairyType.LEAPER) || this;
        _this.vectors = [];
        return _this;
    }
    FairyLeaper.prototype.addVector = function (vector) {
        this.vectors.push(vector);
    };
    FairyLeaper.prototype.getVectors = function () {
        return this.vectors;
    };
    return FairyLeaper;
}(Fairy_1.Fairy));
exports.FairyLeaper = FairyLeaper;
//# sourceMappingURL=FairyLeaper.js.map