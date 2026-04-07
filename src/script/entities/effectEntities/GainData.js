import { EffectInterface } from "../../interfaces/EffectInterface.js";
//Class for Gain Data Effect
/*
@gain : int
@minGain : int
*/
export class GainData extends EffectInterface{
    constructor(gain, minGain){
        super();
        this.gain = gain;
        this.minGain = minGain;
    }

    /*
    Gain Data Score
    @target : AbstractCharacter
    */
    _gainData(target){
        target.data += this.gain;
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
            console.log(target.name+" obtient "+data+" datas");
        }
    }
}