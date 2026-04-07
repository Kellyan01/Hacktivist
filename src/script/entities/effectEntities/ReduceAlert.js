import { EffectInterface } from "../../interfaces/EffectInterface.js";
//Class for Alert Reduction Effect
/*
@reduction : int
@minReduction : int
*/
export class ReduceAlert extends EffectInterface{
    constructor(reduction, minReduction){
        super();
        this.reduction = reduction;
        this.minReduction = minReduction;
    }

    /*
    Reduce Alert Score
    @damage : int
    @target : AbstractCharacter
    */
    _reduceAlert(target){
        target.alert -= this.reduction;
    }

    /*
    Method to use an effect
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    */
    effect(user,targets){
        //TODO implement this method
        //For each targets
        for(const target of targets){
            console.log(user.name+" réduit le niveau d'alerte de "+target.name);
            this._reduceAlert(target);
        }
    }
}