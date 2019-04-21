import {MoveClass} from "../../shared/engine/MoveClass";
import {ChessEngine} from "../../shared/engine/ChessEngine";
import {SideType} from "../../shared/engine/SideType";
import {PieceType} from "../../shared/engine/PieceType";
import {PieceView} from "./PieceView";
import InteractionData = PIXI.interaction.InteractionData;
import InteractionEvent = PIXI.interaction.InteractionEvent;

import {PieceModel} from "../../shared/engine/PieceModel";

export class PromotePieceLayer extends PIXI.Graphics{
    private moveClasses : MoveClass[];
    private m_height : number;
    private m_callback : (moveClass : MoveClass) => void;

    constructor(moveClasses : MoveClass[], m_height : number, m_callback : (moveClass : MoveClass) => void){
        super();
        this.moveClasses = moveClasses;
        this.m_height = m_height;
        this.m_callback = m_callback;


        let pieceSprites : PieceView[] = [];

        let m_width : number = 0;
        for(let i = 0; i < moveClasses.length; i++){
            let moveClass = moveClasses[i];
            let isPromotionMove = ChessEngine.isPromotionMove(moveClass);

            if(isPromotionMove.isPromotion) {
                let sideType = (<PieceModel.Interface>isPromotionMove.promotionPieceModel).sideType;
                let pieceType = (<PieceModel.Interface>isPromotionMove.promotionPieceModel).pieceType;


                let pieceSprite = new PieceView(sideType, pieceType, this.m_height, this.m_height);

                pieceSprite.interactive = true;
                pieceSprite.buttonMode = true;
                //pieceSprite.on('pointerdown', this.onClick.bind(this));
                pieceSprite.on('pointerdown', this.onButtonDown.bind(this, pieceSprite, moveClass));
                pieceSprite.on('pointerup', this.onButtonUp.bind(this, pieceSprite, moveClass));
                pieceSprite.on('pointerupoutside', this.onButtonUp.bind(this, pieceSprite, moveClass));


                pieceSprites.push(pieceSprite);
            }
        }

        //Adjust the position of this sprites
        let fromX = -this.m_height*pieceSprites.length/2;
        let toX = this.m_height*pieceSprites.length/2;

        let fromXMod= fromX + this.m_height/2;
        let toXMod = toX - this.m_height/2;
        for(let i = 0; i < pieceSprites.length; i++) {
            let pieceSprite = pieceSprites[i];
            pieceSprite.position.x = fromXMod + (toXMod - fromXMod)*(i/(pieceSprites.length - 1));
            this.addChild(pieceSprite);
            //pieceSprite.on('pointerover', this.onButtonOver.bind(this, pieceSprite));
            //pieceSprite.on('pointerout', this.onButtonOut.bind(this, pieceSprite));
        }

        this.beginFill(0xFFFFFF, 1.0);
        this.drawRoundedRect(fromX, -this.m_height/2, toX - fromX, this.m_height, 10);
    }

    public onButtonDown(pieceSprite : PieceView, moveClass : MoveClass, interactionEvent : InteractionEvent){
        console.log("onButtonDown");
        pieceSprite.scale.set(1.1, 1.1);
    }
    public onButtonUp(pieceSprite : PieceView, moveClass : MoveClass, interactionEvent : InteractionEvent){
        console.log("onButtonUp");
        pieceSprite.scale.set(1.0, 1.0);
        this.m_callback(moveClass);

        this.parent.removeChild(this);

    }
}