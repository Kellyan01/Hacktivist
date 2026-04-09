import { EffectInterface } from "../../interfaces/EffectInterface.js";
//Class for Gain Data Effect
/*
@gain : int
*/
export class GainData extends EffectInterface{
    constructor(gain){
        super();
        this.gain = gain;
    }

    /*
    Gain Data Score
    @target : AbstractCharacter
    */
    _gainData(target){
        target.modifyData(this.gain);
        return this.gain;
    }

    /*
    Method to use an effect
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    */
    effect(user,targets){
        //For each targets
        for(const target of targets){
            const data = this._gainData(target);
            console.log(user.name+" obtient "+data+" datas sur "+target.name);
        }
    }
}