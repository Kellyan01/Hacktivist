//Class for the Game Enemies
import { AbstractCharacter } from "./AbstractCharacter.js";

/*
@name : string
@type : string
@health : int
@vulnerability : string
@actionList : array of Action
@intention : Action
*/
export class Enemy extends AbstractCharacter{
    constructor(name, type, health, vulnerability, actionsList){
        super(name, type, health);
        this.vulnerability = vulnerability;
        this.intention = null;
        this.actionsList = actionsList;
    }

    /*
    Method to act during a turn
    */
    act(){
        //TODO : implement this method
        console.log("A mon tour d'agir !");
    }
}