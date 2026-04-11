import { BehaviorInterface } from "../../interfaces/BehaviorInterface.js";

//Class for a Semi Random Choice of Action
//@lastAction : Action
export class SemiRandomBehavior extends BehaviorInterface{
    constructor(){
        super();
        this.lastAction = null;
    }

    /*
    Method to semi randomly choose an Action
    @enemy : Enemy
    @player : Player
    @enemies : AbstractCharacter[]
    */
    chooseAction(enemy, player, enemies){
        //If lastAction is Null, or actionsList have one unique action -> return actionList, else return filtered actionList
        const actions = (!this.lastAction || enemy.actionsList.length === 1) ? enemy.actionsList : enemy.actionsList.filter(action => {
            return action !== this.lastAction;
        });
        
        //Choose Randomly Action
        const action = actions[Math.floor(Math.random()*actions.length)];
        //Replace LastAction
        this.lastAction = action;
        //return action
        return action;
    }
}