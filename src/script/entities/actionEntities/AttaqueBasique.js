import { AbstractAction } from "./AbstractAction.js";
import { Damage } from "../effectEntities/Damage.js";

//Class for the enemy basic attack
export class AttaqueBasique extends AbstractAction{
    constructor(){
        super("Attaque Basique", "Attack", "");
        this.damageEffect = new Damage(6, "Matrice", "Shield", 0, 0);
        this.description = `Une attaque basique qui inflige ${this.damageEffect.damage} dégâts.`
    }

    //Lance les effets de l'action'
    effect(enemy, targets = []){
        //Select target "Hacktivist"
        targets = targets.filter(target => target.type === "Hacktivist");
        //Deal the Damages
        this.damageEffect.effect(enemy,targets);
    }
}