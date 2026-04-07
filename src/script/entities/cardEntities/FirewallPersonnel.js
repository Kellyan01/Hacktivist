import {AbstractCard} from "./AbstractCard.js";
import {ApplyStatus} from "../effectEntities/ApplyStatus.js";

//Class pour la carte Firewall Personnel
export class FirewallPersonnel extends AbstractCard{
    constructor() {
        super("Firewall Personnel", "Confrontation", 1,"Gagne 5 points de Bouclier pendant 3 tours.",false);
        this.statusEffect = new ApplyStatus("Shield", "Buff", 5, 5, 3, 3);
        this.description = `Gagne ${this.statusEffect.intensity} points de Bouclier pendant ${this.statusEffect.duration} tours.`
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.statusEffect.effect(player,[player]);
    }
}