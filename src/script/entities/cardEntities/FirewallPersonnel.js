import {AbstractCard} from "./AbstractCard.js";
import {ApplyStatus} from "../effectEntities/ApplyStatus.js";
import { TYPE_CARD, STATUS, TYPE_STATUS } from "../../constants.js";

//Class pour la carte Firewall Personnel
export class FirewallPersonnel extends AbstractCard{
    constructor() {
        super("Firewall Personnel", TYPE_CARD.COMBAT, 1,"Gagne 5 points de Bouclier pendant 3 tours.",false);
        this.statusEffect = new ApplyStatus(STATUS.SHIELD, TYPE_STATUS.BUFF, 5, 3);
        this.description = `Gagne ${this.statusEffect.intensity} points de Bouclier pendant ${this.statusEffect.duration} tours.`
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.statusEffect.effect(player,[player]);
    }
}