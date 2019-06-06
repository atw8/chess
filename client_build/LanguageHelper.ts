
export enum LanguageKey {
    Waiting,

    Error,

    WhiteVictorious,
    BlackVictorious,

    Checkmate,

    WhiteForfeits,
    BlackForfeits,

    WhiteResigns,
    BlackResigns,

    TimeOut,

    Draw,
    Move50Rule,
    Move75Rule,
    DrawAgreement,
    InsufficientMaerial,
    ThreefoldRepetition,
    FivefoldRepetition,
    Stalemate,

    OneZero,
    ZeroOne,
    HalfHalf,

    Ok,

    MyMove,
    VotedMoves,

    FlipBoard,
}

export namespace LanguageHelper {
    export function getTextForLanguageKey(languageKey : LanguageKey):string {
        let ret : string = "";
        switch (languageKey) {
            case LanguageKey.Error:
                ret = "ERROR";
                break;
            case LanguageKey.Checkmate:
                ret = "Checkmate.";
                break;
            case LanguageKey.WhiteForfeits:
                ret = "White forfeits.";
                break;
            case LanguageKey.BlackForfeits:
                ret = "Black forfeits.";
                break;
            case LanguageKey.WhiteResigns:
                ret = "White resigns.";
                break;
            case LanguageKey.BlackResigns:
                ret = "Black resigns.";
                break;
            case LanguageKey.WhiteVictorious:
                ret = "White is victorious";
                break;
            case LanguageKey.BlackVictorious:
                ret = "Black is victorious";
                break;
            case LanguageKey.TimeOut:
                ret = "Time out.";
                break;
            case LanguageKey.Draw:
                ret = "Draw";
                break;
            case LanguageKey.Move50Rule:
                ret = "50-move rule";
                break;
            case LanguageKey.Move75Rule:
                ret = "75-move rule";
                break;
            case LanguageKey.DrawAgreement:
                ret = "Draw by agreement";
                break;
            case LanguageKey.InsufficientMaerial:
                ret = "Insufficient material";
                break;
            case LanguageKey.ThreefoldRepetition:
                ret = "Threefold repetition";
                break;
            case LanguageKey.FivefoldRepetition:
                ret = "Fivefold repetition";
                break;
            case LanguageKey.Stalemate:
                ret = "Stalemate";
                break;
            case LanguageKey.OneZero:
                ret = "1-0";
                break;
            case LanguageKey.ZeroOne:
                ret = "0-1";
                break;
            case LanguageKey.HalfHalf:
                ret = "\u00BD-\u00BD";
                break;
            case LanguageKey.Waiting:
                ret = "Waiting";
                break;
            case LanguageKey.Ok:
                ret = "Ok";
                break;
            case LanguageKey.MyMove:
                ret = "My Move";
                break;
            case LanguageKey.VotedMoves:
                ret = "Voted Moves";
                break;
            case LanguageKey.FlipBoard:
                ret = "Flip Board";
                break;
        }


        return ret;
    }
}

