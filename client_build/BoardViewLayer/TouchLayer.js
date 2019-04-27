"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../app");
var TouchLayer = /** @class */ (function () {
    function TouchLayer(controller) {
        this.identifier = null;
        this.controller = controller;
        app_1.SimpleGame.getInstance().stage.interactive = true;
        app_1.SimpleGame.getInstance().stage.on("pointerdown", this.onTouchBegan.bind(this));
        app_1.SimpleGame.getInstance().stage.on("pointermove", this.onTouchMoved.bind(this));
        app_1.SimpleGame.getInstance().stage.on("pointerup", this.onTouchEnded.bind(this));
        app_1.SimpleGame.getInstance().stage.on("pointerupoutside", this.onTouchEnded.bind(this));
        app_1.SimpleGame.getInstance().stage.on("pointercancel", this.onTouchEnded.bind(this));
        this.isEnabled = true;
    }
    TouchLayer.prototype.getIsEnabled = function () {
        return this.isEnabled;
    };
    TouchLayer.prototype.setIsEnabled = function (isEnabled) {
        this.isEnabled = isEnabled;
    };
    TouchLayer.prototype.onTouchBegan = function (interactionEvent) {
        //console.log("onTouchBegan");
        if (this.identifier != null || !this.isEnabled) {
            return;
        }
        this.identifier = interactionEvent.data.identifier;
        this.controller.onTouchBegan(interactionEvent.data.global);
        //console.log("onTouchBegan ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    };
    TouchLayer.prototype.onTouchMoved = function (interactionEvent) {
        //console.log("onTouchMoved");
        if (this.identifier != interactionEvent.data.identifier) {
            return;
        }
        this.controller.onTouchMoved(interactionEvent.data.global);
        //console.log("onTouchMoved ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    };
    TouchLayer.prototype.onTouchEnded = function (interactionEvent) {
        //console.log("onTouchEnded");
        if (this.identifier != interactionEvent.data.identifier) {
            return;
        }
        this.identifier = null;
        this.controller.onTouchEnded(interactionEvent.data.global);
        //console.log("onTouchEnded ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    };
    return TouchLayer;
}());
exports.TouchLayer = TouchLayer;
//# sourceMappingURL=TouchLayer.js.map