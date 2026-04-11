import { AbstractAction } from "./AbstractAction.js";
import { ApplyStatus } from "../effectEntities/ApplyStatus.js";
import { TYPE_ACTION, STATUS, TYPE_STATUS } from "../../constants.js";

//Class for Apply a Shield to an Enemy
export class Bouclier extends AbstractAction{
    constructor(){
        super("Bouclier", TYPE_ACTION.BUFF, "");
        this.shieldEffect = new ApplyStatus(STATUS.SHIELD, TYPE_STATUS.BUFF, 3, 3);
        this.description = `Un bouclier qui réduit les dégâts de ${this.shieldEffect.intensity} pendant ${this.shieldEffect.duration} tours.`
    }

    //Lance les effets de l'action
    effect(enemy, targets = []){
        //Apply a shield targets
        this.shieldEffect.effect(enemy,[enemy]);
    }
}