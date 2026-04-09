import {AbstractCard} from "./AbstractCard.js";
import {ReduceAlert} from "../effectEntities/ReduceAlert.js";
import { TYPE_CARD} from "../../constants.js";
//Class pour la carte Brouilleur
export class Brouilleur extends AbstractCard{
    constructor() {
        super("Brouilleur", TYPE_CARD.GROUND, 1,"",false);
        this.alertReductionEffect = new ReduceAlert(15);
        this.description = `Réduit la jauge de Détection de ${this.alertReductionEffect.reduction}%. Ne peut pas être joué en Alerte Rouge.`;
    }


    //Lance les effets de la carte
    effect(player,targets = []){
        this.alertReductionEffect.effect(player,[player]);
    }
}