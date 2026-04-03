import {AbstractCard} from "./AbstractCard.js";
import {Status} from "../Status.js";

//Class pour la carte Firewall Personnel
export class FirewallPersonnel extends AbstractCard{
    constructor() {
        super("Firewall Personnel", "Confrontation", 1,"Gagne 5 points de Bouclier pendant 3 tours.");
    }

    //Génère 5 points de bouclier pour le joueur pendant 3 tours
    generateShield(player){
        player.status.push(new Status("Shield", "Buff", 5,3));
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.generateShield(player);
    }
}