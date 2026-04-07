import {AbstractCard} from "./AbstractCard.js";
import { GainData } from "../effectEntities/GainData.js";
import { IncreaseAlert } from "../effectEntities/IncreaseAlert.js";

//Class pour la carte Scan Basique
export class ScanBasique extends AbstractCard{
    constructor() {
        super("Scan Basique", "Matrice", 1,"Génère 2 Données. Si utilisé en Mode Fantôme : +8% Détection.",false);
        this.gainData = new GainData(2,2);
        this.increaseAlert = new IncreaseAlert(8,8)
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.gainData.effect(player, [player]);
        this.increaseAlert.effect(player, [player]);
    }
}