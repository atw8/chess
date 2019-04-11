import {Controller} from "./../controller/Controller";
import {SimpleGame} from "../app";
import InteractionData = PIXI.interaction.InteractionData;
import InteractionEvent = PIXI.interaction.InteractionEvent;

export class TouchLayer{
    private controller : Controller;

    private identifier : number | null = null;

    constructor(controller : Controller){
        this.controller = controller;


        SimpleGame.getInstance().stage.interactive = true;
        SimpleGame.getInstance().stage.on("pointerdown", this.onTouchBegan.bind(this));
        SimpleGame.getInstance().stage.on("pointermove", this.onTouchMoved.bind(this));
        SimpleGame.getInstance().stage.on("pointerup", this.onTouchEnded.bind(this));
        SimpleGame.getInstance().stage.on("pointerupoutside", this.onTouchEnded.bind(this));
        SimpleGame.getInstance().stage.on("pointercancel", this.onTouchEnded.bind(this));
    }


    /*
    public pointerDown(interactionEvent : InteractionEvent){
        console.log("pointerDown");
        this.pointerHelper(interactionEvent);
    }
    public pointerup(interactionEvent : InteractionEvent){
        console.log("pointerup");
        this.pointerHelper(interactionEvent)
    }
    public pointerupoutside(interactionEvent : InteractionEvent){
        console.log("pointerupoutside");
    }
    public pointerover(interactionEvent : InteractionEvent){
        console.log("pointerover");
    }
    public pointerout(interactionEvent : InteractionEvent){
        console.log("pointerout");
    }
    public pointerHelper(interactionEvent : InteractionEvent){

    }
    */



    public onTouchBegan(interactionEvent : InteractionEvent){
        if(this.identifier != null){
            return;
        }
        this.identifier = interactionEvent.data.identifier;

        this.controller.onTouchBegan(interactionEvent.data.global);

        //console.log("onTouchBegan ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    }
    public onTouchMoved(interactionEvent : InteractionEvent){
        if(this.identifier != interactionEvent.data.identifier){
            return;
        }

        this.controller.onTouchMoved(interactionEvent.data.global);

        //console.log("onTouchMoved ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    }
    public onTouchEnded(interactionEvent : InteractionEvent){
        if(this.identifier != interactionEvent.data.identifier){
            return;
        }
        this.identifier = null;

        this.controller.onTouchEnded(interactionEvent.data.global);

        //console.log("onTouchEnded ", interactionEvent.data.global.x,", ", interactionEvent.data.global.y);
    }
}
