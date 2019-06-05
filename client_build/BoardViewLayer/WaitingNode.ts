import {SimpleGame} from "../app";
import * as TWEEN from '@tweenjs/tween.js'
import {LanguageHelper, LanguageKey} from "../LanguageHelper";

import * as PIXI from 'pixi.js';

export class WaitingNode extends PIXI.Container{
    private uiText : PIXI.Text;


    private uiBallsNode : PIXI.Container;
    //private uiBalls : PIXI.Graphics[];

    private m_size : number;

    constructor(m_size : number) {
        super();
        this.m_size = m_size;


        this.uiBallsNode = new PIXI.Container();
        this.addChild(this.uiBallsNode);

        let uiNumOfBalls : number = 3;
        let sizeRadiusConstant = 1/6;


        for(let i = 0; i < uiNumOfBalls; i++){
            let uiBall = new PIXI.Graphics();

            uiBall.beginFill(0xFFFFFF, 1);
            uiBall.drawCircle(0, 0, this.m_size * sizeRadiusConstant);

            let angle : number = 2.0 * Math.PI * (i/uiNumOfBalls);

            uiBall.position.set(this.m_size*0.5*Math.cos(angle), this.m_size*0.5*Math.sin(angle));

            this.uiBallsNode.addChild(uiBall);
        }




        //rotation tween
        let tween = new TWEEN.Tween({rotation : this.uiBallsNode.rotation});
        tween.to({rotation : 2*Math.PI}, 1000);
        tween.onUpdate((o : any) => {
            this.uiBallsNode.rotation = o.rotation;
        });
        tween.repeat(Infinity);
        tween.start();


        this.uiText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(LanguageKey.Waiting), SimpleGame.getDefaultTextStyleOptions(this.m_size));
        this.uiText.anchor.set(0.5, 0.5);
        this.addChild(this.uiText);



        //Align all the graphics
        SimpleGame.arrangeHorizontally([this.uiBallsNode, this.m_size/2, this.uiText]);



    }




}