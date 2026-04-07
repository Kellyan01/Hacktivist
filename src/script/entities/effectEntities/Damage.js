import { EffectInterface } from "../../interfaces/EffectInterface.js";
//Class for Damage Effect
/*
@damage : int
@typeNotAffected : string
@typeArmor : string
@minDamage : int
@minHealth : int
*/
export class Damage extends EffectInterface{
    constructor(damage, typeNotAffected, typeArmor, minDamage = 0, minHealth = 0){
        super();
        this.damage = damage;
        this.typeNotAffected = typeNotAffected;
        this.typeArmor = typeArmor;
        this.minDamage = minDamage;
        this.minHealth = minHealth;
    }

    /*
    Calculate Damage
    @damage : int
    @target : AbstractCharacter
    */
    _dealDamage(target){
        //TODO implement this methode
        //Verify if target type can be damaged
        if(target.type === this.typeNotAffected ){
            throw new Error("Cette cible ne peut pas être affectée par cette attaque.");
        }
        //Verify if target is protected
        let armor = 0;
        for(const status of target.status){
            if(status.name === this.typeArmor){
                if(status.intensity > armor) armor = status.intensity;
            }
        }
        //Calculate damage
        const damageToDeal = Math.max(this.minDamage, this.damage - armor);
        //Apply damage
        target.health = Math.max(this.minHealth, target.health - damageToDeal);
        //Return damage
        return damageToDeal;
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
            console.log(user.name+" attaque "+target.name);
            const damage = this._dealDamage(target);
        }
    }
}