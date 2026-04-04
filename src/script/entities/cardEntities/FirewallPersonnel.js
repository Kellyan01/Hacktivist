import {AbstractCard} from "./AbstractCard.js";
import {Status} from "../Status.js";

//Class pour la carte Firewall Personnel
export class FirewallPersonnel extends AbstractCard{
    constructor() {
        super("Firewall Personnel", "Confrontation", 1,"Gagne 5 points de Bouclier pendant 3 tours.",false);
    }

    //Génère 5 points de bouclier pour le joueur pendant 3 tours
    generateShield(player){
        //Verify if a Shield exist
        const shield = player.status.find(status => status.name === "Shield")
        if(shield){
            //take the max intensity and the max duration
            shield.intensity = Math.max(5, shield.intensity);
            shield.duration = Math.max(3, shield.duration);
        }
        else{
            player.status.push(new Status("Shield", "Buff", 5,3));
        }
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.generateShield(player);
    }
}