import {AbstractCard} from "./AbstractCard.js";

//Class pour la carte Scan Basique
export class ScanBasique extends AbstractCard{
    constructor() {
        super("Scan Basique", "Matrice", 1,"Génère 2 Données. Si utilisé en Mode Fantôme : +8% Détection.");
    }

    //Génère 2 données pour le joueur
    generateData(player){
        player.data += 2;
    }

    //Augmente la détection du joueur de 8%
    increaseDetection(player){
        player.alert += 8;
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.generateData(player);
        this.increaseDetection(player);
    }
}