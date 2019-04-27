import {SimpleGame} from "../app";
import InteractionData = PIXI.interaction.InteractionData;
import InteractionEvent = PIXI.interaction.InteractionEvent;
import {ControllerAbstract} from "../controller/ControllerAbstract";

export class TouchLayer{
    private controller : ControllerAbstract;

    private identifier : number | null = null;

    private isEnabled : boolean;

    constructor(controller : ControllerAbstract){
        this.controller = controller;


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

        this.controller.onTouchBegan(interactionEvent.data.global);

        //console.log("onTouchBegan ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    }
    public onTouchMoved(interactionEvent : InteractionEvent){
        //console.log("onTouchMoved");
        if(this.identifier != interactionEvent.data.identifier){
            return;
        }

        this.controller.onTouchMoved(interactionEvent.data.global);

        //console.log("onTouchMoved ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    }
    public onTouchEnded(interactionEvent : InteractionEvent){
        //console.log("onTouchEnded");
        if(this.identifier != interactionEvent.data.identifier){
            return;
        }
        this.identifier = null;

        this.controller.onTouchEnded(interactionEvent.data.global);

        //console.log("onTouchEnded ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    }
}
