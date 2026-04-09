import {AbstractPlayable} from '../AbstractPlayable.js';
//Abstract Class for the Game Cards
/*
@name : string
@type : string
@cost : int
@description : string
@targeted : boolean
@targetValidation : TargetFilterInterface
@exhaust : Boolean
*/
export class AbstractCard extends AbstractPlayable{
    constructor(name, type, cost, description, targeted, targetValidation = null, exhaust = false){
        if(new.target === AbstractCard){
             throw new Error("AbstractCard can't be instantiated");
        }
        super(name, type, description);
        this.cost = cost;
        this.targeted = targeted;
        this.targetValidation = targetValidation;
        this.exhaust = exhaust;
    }
}