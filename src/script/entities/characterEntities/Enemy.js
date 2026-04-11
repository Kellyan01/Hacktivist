//Class for the Game Enemies
import { AbstractCharacter } from "./AbstractCharacter.js";

/*
@name : string
@type : string
@health : int
@maxHealth : int
@vulnerability : string
@actionList : array of Action
@behavior : BehaviorInterface
@intention : Action
@dataThreshold : int
@data : int
*/
export class Enemy extends AbstractCharacter{
    constructor(name, type, health, maxHealth, vulnerability, actionsList, behavior, dataThreshold, data = 0){
        super(name, type, health, maxHealth);
        this.vulnerability = vulnerability;
        this.intention = null;
        this.actionsList = actionsList;
        this.behavior = behavior;
        this.dataThreshold = dataThreshold;
        this.data = data;
    }

    /*
    Method to act during a turn
    @player : Player
    @enemies : Enemy[]
    */
    act(player,enemies){
        console.log("A mon tour d'agir !");
        this.intention.effect(this, [player, ...enemies]);
    }

    /*
    Method to modify Enemy Datas
    @amout : int
    */
   modifyData(amount){
    this.data = Math.max(0, this.data + amount);
   }
}