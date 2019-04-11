/*

import {SideType} from "../../../shared/engine/SideType";
import {PieceType} from "../../../shared/engine/PieceType";
import {PieceView} from "../PieceView";
import {FileRank} from "../../../shared/engine/FileRank";
import {MoveClass} from "../../../shared/engine/MoveClass";


export enum AbstractViewInterfaceType {
    PIECE_VIEW = 1,
    PREDICT_VIEW = 2,
}

export abstract class AbstractViewInterface {
    public abstract createPieceView(sideType : SideType, pieceType : PieceType):PieceView;
    public abstract removePieceView(pieceView : PieceView):void;

    public abstract setPieceSpriteForFileRank(fileRank: FileRank, pieceSprite: PieceView | null):void;

    public abstract getPieceSpriteForFileRank(fileRank: FileRank): PieceView | null;

    public abstract startAnimation(moveClass : MoveClass, isUndoMove :boolean):void;
    public abstract endAnimation(moveClass : MoveClass, isUndoMove : boolean):void;

    public abstract getViewInterfaceType():AbstractViewInterfaceType;

}
*/