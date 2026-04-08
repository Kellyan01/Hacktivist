import { EffectInterface } from "../../interfaces/EffectInterface.js";
//Class for Alert Increase Effect
/*
@increase : int
@minIncrease : int
*/
export class IncreaseAlert extends EffectInterface{
    constructor(increase, minIncrease){
        super();
        this.increase = increase;
        this.minIncrease = minIncrease;
    }

    /*
    Increase Alert Score
    @target : AbstractCharacter
    */
    _increaseAlert(target){
        target.alert += this.increase;
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
            console.log(user.name+" augmente le niveau d'alerte de "+target.name);
            this._increaseAlert(target);
        }
    }
}