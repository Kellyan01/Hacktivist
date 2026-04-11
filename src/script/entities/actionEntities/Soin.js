import { AbstractAction } from "./AbstractAction.js";
import { Heal } from "../effectEntities/Heal.js";
import { TYPE_ACTION, TYPE_CHARACTER } from "../../constants.js";

//Class for the enemy heal action
export class Soin extends AbstractAction{
    constructor(){
        super("Soin", TYPE_ACTION.HEAL, "");
        this.healEffect = new Heal(3, TYPE_CHARACTER.MATRIX);
        this.description = `Un soin qui restaure ${this.healEffect.heal} points de vie.`
    }

    //Lance les effets de l'action
    effect(enemy, targets = []){
        //Heal targets
        this.healEffect.effect(enemy,[enemy]);
    }
}