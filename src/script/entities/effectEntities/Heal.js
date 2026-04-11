import { EffectInterface } from "../../interfaces/EffectInterface.js";
//Class for Heal Effect
/*
@heal: int
@typeNotAffected : string
*/
export class Heal extends EffectInterface{
    constructor(heal, typeNotAffected){
        super();
        this.heal = heal;
        this.typeNotAffected = typeNotAffected;
    }

    /*
    Apply Heal
    @target : AbstractCharacter
    */
    _heal(target){
        //Verify if target type can be damaged
        if(target.type === this.typeNotAffected ){
            throw new Error("Cette cible ne peut pas être affectée par ce soins.");
        }

        //Apply heal
        target.modifyHealth(this.heal);
        //Return heal
        return this.heal;
    }

    /*
    Method to use an effect
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    */
    effect(user,targets){
        //For each targets
        for(const target of targets){
            console.log(user.name+" soigne "+target.name);
            const heal = this._heal(target);
        }
    }
}