import { BehaviorInterface } from "../../interfaces/BehaviorInterface.js";

//Class to Choose Action considering Conditions
//@conditionRules : Array of Object {condition(enemy, player, enemies),Action}
//@defaultAction : Action
export class ConditionalBehavior extends BehaviorInterface{
    constructor(conditionRules, defaultAction){
        super();
        this.conditionRules = conditionRules;
        this.defaultAction = defaultAction;
    }

    /*
    Method to Choose Action considering Conditions
    @enemy : Enemy
    @player : Player
    @enemies : AbstractCharacter[]
    */
    chooseAction(enemy, player, enemies){
        for(const condition of this.conditionRules){
            if(condition.condition(enemy, player, enemies)) return condition.action;
        }
        return this.defaultAction;
    }
}