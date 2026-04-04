//Class for the Game Enemies
import { AbstractCharacter } from "./AbstractCharacter.js";

/*
@name : string
@type : string
@health : int
@vulnerability : string
@actionList : array of Action
@intention : Action
@dataThreshold : int
*/
export class Enemy extends AbstractCharacter{
    constructor(name, type, health, vulnerability, actionsList, dataThreshold){
        super(name, type, health);
        this.vulnerability = vulnerability;
        this.intention = null;
        this.actionsList = actionsList;
        this.dataThreshold = dataThreshold;
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