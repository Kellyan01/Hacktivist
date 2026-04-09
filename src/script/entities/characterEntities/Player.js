//Class for the Player Character
import { AbstractCharacter } from "./AbstractCharacter.js";
import { Deck } from "../Deck.js";

/*
@name : string
@type : string
@health : int
@maxHealth : int
@energy : int
@alert : int
@deck : Deck
*/
export class Player extends AbstractCharacter{
    constructor(name, type, health, maxHealth, energy, alert, deck){
        super(name, type, health, maxHealth);
        this.energy = energy;
        this.alert = alert;
        this.deck = new Deck(deck);
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

    /*
    Method to modify Character Alert
    @amount : int
    */
   modifyAlert(amount){
    this.alert = Math.max(0, Math.min(100, this.alert + amount));
   }
}