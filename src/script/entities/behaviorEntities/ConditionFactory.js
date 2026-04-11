import { STATUS, CONDITION_LIST } from "../../constants.js";
//Class to make conditions for ConditionalBahavior
/*
@condition : function returning a boolean
@action : AbstractAction
*/
export class ConditionFactory{
    constructor(){
        if(new.target === ConditionFactory){
             throw new Error("ConditionFactory can't be instantiated");
        }
    }

    static buildCondition(condition){
        switch(condition){
            case CONDITION_LIST.HALF_HP :
                return (enemy,player,enemies) => {
                        return enemies.some(e => e.health < e.maxHealth * 0.5);
                    }
            case CONDITION_LIST.SELF_NO_SHIELD :
                return (enemy,player,enemies) => {
                        return !enemy.status.some(s => s.name === STATUS.SHIELD);
                    }
        }
    }
}