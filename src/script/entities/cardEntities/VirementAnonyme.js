import {AbstractCard} from "./AbstractCard.js";
import {ApplyStatus} from "../effectEntities/ApplyStatus.js";

//Class pour la carte Virement Anonyme
export class VirementAnonyme extends AbstractCard{
    constructor() {
        super("Virement Anonyme", "Social Engineering", 2,"Exploite la vulnérabilité humaine d'une cible révélée (type Financier). Neutralise sans combat.",true);
        this.statusEffect = new ApplyStatus("Neutralized", "Debuff", 1, 1, 10000, 10000, "Human");
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.statusEffect.effect(player,targets);
    }
}