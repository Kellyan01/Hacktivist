import {AbstractCard} from "./AbstractCard.js";
import { Damage } from "../effectEntities/Damage.js";
import { TargetByType } from "../effectEntities/targetEffect/TargetByType.js";

//Class pour la carte Frappe Cybernétique
export class FrappeCybernetique extends AbstractCard{
    constructor() {
        super("Frappe Cybernétique", "Attaque", 1,"",true,new TargetByType("Human", "all"));
        this.damageEffect = new Damage(5, "Matrice", "Shield", 0, 0);
        this.description = `inflige ${this.damageEffect.damage} dégâts à une cible physique.`
    }

    //Lance les effets de la carte
    effect(player, targets = []){
         this.damageEffect.effect(player,targets);
    }
}