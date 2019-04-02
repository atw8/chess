"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChessGameStateEnum;
(function (ChessGameStateEnum) {
    ChessGameStateEnum[ChessGameStateEnum["WHITE_WIN_TIME"] = 0] = "WHITE_WIN_TIME";
    ChessGameStateEnum[ChessGameStateEnum["WHITE_WIN_CHECKMATE"] = 1] = "WHITE_WIN_CHECKMATE";
    ChessGameStateEnum[ChessGameStateEnum["WHITE_WIN_RESIGN"] = 2] = "WHITE_WIN_RESIGN";
    ChessGameStateEnum[ChessGameStateEnum["WHITE_WIN_FORFEIT"] = 3] = "WHITE_WIN_FORFEIT";
    ChessGameStateEnum[ChessGameStateEnum["BLACK_WIN_TIME"] = 10] = "BLACK_WIN_TIME";
    ChessGameStateEnum[ChessGameStateEnum["BLACK_WIN_CHECKMATE"] = 11] = "BLACK_WIN_CHECKMATE";
    ChessGameStateEnum[ChessGameStateEnum["BLACK_WIN_RESIGN"] = 12] = "BLACK_WIN_RESIGN";
    ChessGameStateEnum[ChessGameStateEnum["BLACK_WIN_FORFEIT"] = 13] = "BLACK_WIN_FORFEIT";
    ChessGameStateEnum[ChessGameStateEnum["DRAW_STALEMATE"] = 20] = "DRAW_STALEMATE";
    ChessGameStateEnum[ChessGameStateEnum["DRAW_INSUFFICIENT_MATERIAL"] = 21] = "DRAW_INSUFFICIENT_MATERIAL";
    ChessGameStateEnum[ChessGameStateEnum["DRAW_50MOVES"] = 22] = "DRAW_50MOVES";
    ChessGameStateEnum[ChessGameStateEnum["DRAW_REPETITION"] = 23] = "DRAW_REPETITION";
    ChessGameStateEnum[ChessGameStateEnum["DRAW_AGREEMENT"] = 24] = "DRAW_AGREEMENT";
    ChessGameStateEnum[ChessGameStateEnum["NORMAL"] = 30] = "NORMAL";
})(ChessGameStateEnum = exports.ChessGameStateEnum || (exports.ChessGameStateEnum = {}));
;
//# sourceMappingURL=ChessGameStateEnum.js.map