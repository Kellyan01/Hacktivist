import {AbstractCard} from "./AbstractCard.js";
import { Damage } from "../effectEntities/Damage.js";
import { TargetByType } from "../targetEntities/TargetByType.js";
import { TYPE_CARD, STATUS,TYPE_CHARACTER } from "../../constants.js";

//Class pour la carte Frappe Cybernétique
export class FrappeCybernetique extends AbstractCard{
    constructor() {
        super("Frappe Cybernétique", TYPE_CARD.ATTACK, 1,"",true,new TargetByType(TYPE_CHARACTER.HUMAN, "all"));
        this.damageEffect = new Damage(5, TYPE_CHARACTER.MATRIX, STATUS.SHIELD, 0, 0);
        this.description = `inflige ${this.damageEffect.damage} dégâts à une cible physique.`
    }

    //Lance les effets de la carte
    effect(player, targets = []){
         this.damageEffect.effect(player,targets);
    }
}