import { BehaviorInterface } from "../../interfaces/BehaviorInterface.js";

//Class for a Chaotic Choice of Action
export class ChaoticBehavior extends BehaviorInterface{
    constructor(){
        super();
    }

    /*
    Method to randomly choose an Action
    @enemy : Enemy
    @player : Player
    @enemies : AbstractCharacter[]
    */
    chooseAction(enemy, player, enemies){
        return enemy.actionsList[Math.floor(Math.random()*enemy.actionsList.length)];
    }
}