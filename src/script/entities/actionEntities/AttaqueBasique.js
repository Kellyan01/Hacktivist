import { AbstractAction } from "./AbstractAction.js";
import { TargetByType } from "../effectEntities/targetEffect/TargetByType.js";
import { Damage } from "../effectEntities/Damage.js";

//Class for the enemy basic attack
export class AttaqueBasique extends AbstractAction{
    constructor(){
        super("Attaque Basique", "Attack", "");
        this.targetEffect = new TargetByType("Hacktivist",1);
        this.damageEffect = new Damage(6, "Matrice", "Shield", 0, 0);
        this.description = `Une attaque basique qui inflige ${this.damageEffect.damage} dégâts.`
    }

    //Lance les effets de l'action'
    effect(enemy, targets = []){
        //Select target "Hacktivist"
        targets = this.targetEffect.effect(enemy,targets);
        //Deal the Damages
        this.damageEffect.effect(enemy,targets);
    }
}