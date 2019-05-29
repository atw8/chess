"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../app");
var TouchLayer = /** @class */ (function () {
    function TouchLayer(uiBoardView, controllerAbstract) {
        this.identifier = null;
        this.uiBoardView = uiBoardView;
        this.controllerAbstract = controllerAbstract;
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
        this.uiBoardView.onTouchBegan(interactionEvent.data.global, this.controllerAbstract.getChessEngine());
    };
    TouchLayer.prototype.onTouchMoved = function (interactionEvent) {
        //console.log("onTouchMoved");
        if (this.identifier != interactionEvent.data.identifier) {
            return;
        }
        this.uiBoardView.onTouchMoved(interactionEvent.data.global, this.controllerAbstract.getChessEngine());
    };
    TouchLayer.prototype.onTouchEnded = function (interactionEvent) {
        //console.log("onTouchEnded");
        if (this.identifier != interactionEvent.data.identifier) {
            return;
        }
        this.identifier = null;
        this.uiBoardView.onTouchEnded(interactionEvent.data.global, this.controllerAbstract.getChessEngine());
    };
    return TouchLayer;
}());
exports.TouchLayer = TouchLayer;
//# sourceMappingURL=TouchLayer.js.map