import {AbstractCard} from "./AbstractCard.js";

//Class pour la carte Brouilleur
export class Brouilleur extends AbstractCard{
    constructor() {
        super("Brouilleur", "Terrain", 1,"Réduit la jauge de Détection de 15%. Ne peut pas être joué en Alerte Rouge.");
    }

    //Réduit la détection du joueur de 15%
    reduceDetection(player){
        player.alert -= 15;
    }

    //Lance les effets de la carte
    effect(player,targets = []){
        this.reduceDetection(player);
    }
}