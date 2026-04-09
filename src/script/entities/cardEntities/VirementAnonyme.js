import {AbstractCard} from "./AbstractCard.js";
import {ApplyStatus} from "../effectEntities/ApplyStatus.js";
import { TargetByType } from "../targetEntities/TargetByType.js";
import { TYPE_CARD, STATUS, TYPE_STATUS, TYPE_CHARACTER } from "../../constants.js";
//Class pour la carte Virement Anonyme
export class VirementAnonyme extends AbstractCard{
    constructor() {
        super("Virement Anonyme", TYPE_CARD.SOCIAL, 2,"Exploite la vulnérabilité humaine d'une cible révélée (type Financier). Neutralise sans combat.",true,new TargetByType(TYPE_CHARACTER.HUMAN, "all"), true);
        this.statusEffect = new ApplyStatus(STATUS.NEUTRALIZED, TYPE_STATUS.DEBUFF, 1, 10000, TYPE_CHARACTER.HUMAN);
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.statusEffect.effect(player,targets);
    }
}