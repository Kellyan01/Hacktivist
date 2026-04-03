//Class for the Player Character
import { AbstractCharacter } from "./AbstractCharacter.js";

/*
@name : string
@type : string
@health : int
@energy : int
@alert : int
@data : int
@deck : array of Card
@discard : array of Card
@hand : array of Card
*/
export class Player extends AbstractCharacter{
    constructor(name, type, health, energy, alert, data, deck){
        super(name, type, health);
        this.energy = energy;
        this.alert = alert;
        this.data = data;
        this.deck = deck;
        this.discard = [];
        this.hand = [];
    }

    /*
    Method to act during a turn
    */
    act(){
        //TODO : implement this method
        console.log("A mon tour d'agir !");
    }
}