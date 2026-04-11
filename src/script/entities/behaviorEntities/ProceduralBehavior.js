import { BehaviorInterface } from "../../interfaces/BehaviorInterface.js";

//Class for a Procedural Choice of Action (Linear Choice)
//@index : int;
export class ProceduralBehavior extends BehaviorInterface{
    constructor(){
        super();
        this.index = 0;
    }

    /*
    Method to proceduraly choose an Action
    @enemy : Enemy
    @player : Player
    @enemies : AbstractCharacter[]
    */
    chooseAction(enemy, player, enemies){
        const action =  enemy.actionsList[this.index];
        this.index = (this.index + 1) % enemy.actionsList.length;
        return action;
    }
}