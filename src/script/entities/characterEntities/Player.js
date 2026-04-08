//Class for the Player Character
import { AbstractCharacter } from "./AbstractCharacter.js";

/*
@name : string
@type : string
@health : int
@maxHealth : int
@energy : int
@alert : int
@deck : array of Card
@discard : array of Card
@hand : array of Card
*/
export class Player extends AbstractCharacter{
    constructor(name, type, health, maxHealth, energy, alert, deck){
        super(name, type, health, maxHealth);
        this.energy = energy;
        this.alert = alert;
        this.deck = deck;
        this.discard = [];
        this.hand = [];
    }

    /*
    Method to act during a turn
    @player : Player
    @enemies : Enemy[]
    */
    act(player,enemies){
        //TODO : implement this method
        console.log("A mon tour d'agir !");
    }
}