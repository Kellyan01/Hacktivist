import { AbstractAction } from "./AbstractAction.js";
import { TargetByType } from "../targetEntities/TargetByType.js";
import { Damage } from "../effectEntities/Damage.js";
import { TYPE_ACTION, TYPE_CHARACTER,STATUS } from "../../constants.js";

//Class for the enemy basic attack
export class AttaqueBasique extends AbstractAction{
    constructor(){
        super("Attaque Basique", TYPE_ACTION.ATTACK, "");
        this.targetEffect = new TargetByType(TYPE_CHARACTER.HACKTIVIST,1);
        this.damageEffect = new Damage(6, TYPE_CHARACTER.MATRIX, STATUS.SHIELD, 0, 0);
        this.description = `Une attaque basique qui inflige ${this.damageEffect.damage} dégâts.`
    }

    //Lance les effets de l'action'
    effect(enemy, targets = []){
        //Select target "Hacktivist"
        targets = this.targetEffect.filter(enemy,targets);
        //Deal the Damages
        this.damageEffect.effect(enemy,targets);
    }
}