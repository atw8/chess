"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageManager = /** @class */ (function () {
    function LocalStorageManager() {
    }
    LocalStorageManager.getItemHelper = function (key) {
        var ret = localStorage.getItem(key);
        if (ret == null) {
            return undefined;
        }
        return ret;
    };
    LocalStorageManager.getGuestTokenStr = function () {
        return "guestTokenStr";
    };
    LocalStorageManager.getGuestToken = function () {
        return LocalStorageManager.getItemHelper(LocalStorageManager.getGuestTokenStr());
    };
    LocalStorageManager.setGuestToken = function (guestToken) {
        localStorage.setItem(LocalStorageManager.getGuestTokenStr(), guestToken);
    };
    return LocalStorageManager;
}());
exports.LocalStorageManager = LocalStorageManager;
/*
export enum LocalStorageManager {
    TOKEN = "TOKEN",
}
*/ 
//# sourceMappingURL=LocalStorageManager.js.map