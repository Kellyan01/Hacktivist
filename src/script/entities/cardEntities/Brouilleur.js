import {AbstractCard} from "./AbstractCard.js";
import {ReduceAlert} from "../effectEntities/ReduceAlert.js";
//Class pour la carte Brouilleur
export class Brouilleur extends AbstractCard{
    constructor() {
        super("Brouilleur", "Terrain", 1,"",false);
        this.alertReductionEffect = new ReduceAlert(15,15);
        this.description = `Réduit la jauge de Détection de ${this.alertReductionEffect.reduction}%. Ne peut pas être joué en Alerte Rouge.`;
    }


    //Lance les effets de la carte
    effect(player,targets = []){
        this.alertReductionEffect.effect(player,[player]);
    }
}