import {SimpleGame} from "../SimpleGame";
import InteractionEvent = PIXI.interaction.InteractionEvent;
import {BoardView} from "./BoardView";
import {ControllerAbstract} from "../controller/ControllerAbstract";

export class TouchLayer{
    private uiBoardView : BoardView;
    private controllerAbstract : ControllerAbstract;

    private identifier : number | null = null;

    private isEnabled : boolean;

    constructor(uiBoardView : BoardView, controllerAbstract : ControllerAbstract){
        this.uiBoardView = uiBoardView;
        this.controllerAbstract = controllerAbstract;


        SimpleGame.getInstance().stage.interactive = true;
        SimpleGame.getInstance().stage.on("pointerdown", this.onTouchBegan.bind(this));
        SimpleGame.getInstance().stage.on("pointermove", this.onTouchMoved.bind(this));
        SimpleGame.getInstance().stage.on("pointerup", this.onTouchEnded.bind(this));
        SimpleGame.getInstance().stage.on("pointerupoutside", this.onTouchEnded.bind(this));
        SimpleGame.getInstance().stage.on("pointercancel", this.onTouchEnded.bind(this));

        this.isEnabled = true;
    }

    public getIsEnabled():boolean{
        return this.isEnabled;
    }
    public setIsEnabled(isEnabled : boolean){
        this.isEnabled = isEnabled;
    }




    public onTouchBegan(interactionEvent : InteractionEvent){
        //console.log("onTouchBegan");
        if(this.identifier != null ||!this.isEnabled){
            return;
        }
        this.identifier = interactionEvent.data.identifier;

        this.uiBoardView.onTouchBegan(interactionEvent.data.global, this.controllerAbstract.getChessEngine());
    }
    public onTouchMoved(interactionEvent : InteractionEvent){
        //console.log("onTouchMoved");
        if(this.identifier != interactionEvent.data.identifier){
            return;
        }

        this.uiBoardView.onTouchMoved(interactionEvent.data.global, this.controllerAbstract.getChessEngine());
    }
    public onTouchEnded(interactionEvent : InteractionEvent){
        //console.log("onTouchEnded");
        if(this.identifier != interactionEvent.data.identifier){
            return;
        }
        this.identifier = null;

        this.uiBoardView.onTouchEnded(interactionEvent.data.global, this.controllerAbstract.getChessEngine());
    }
}
