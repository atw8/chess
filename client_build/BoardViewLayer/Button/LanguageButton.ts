import {DefaultButton} from "./DefaultButton";
import {LanguageHelper, LanguageKey} from "../../LanguageHelper";
import {SimpleGame} from "../../app";

export class LanguageButton extends DefaultButton {
    private uiText : PIXI.Text;

    private m_languageKey : LanguageKey;

    constructor(width : number, height : number, cb : (d : DefaultButton) => void, languageKey : LanguageKey){
        super(width, height, cb);

        this.m_languageKey = languageKey;

        this.uiText = new PIXI.Text(LanguageHelper.getTextForLanguageKey(this.m_languageKey), SimpleGame.getDefaultTextStyleOptions(this.m_height));
        this.uiText.anchor.set(0.5);
        this.addChild(this.uiText);
    }
}