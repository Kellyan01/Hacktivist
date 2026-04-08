import { EffectInterface } from "../../interfaces/EffectInterface.js";
import { Status } from "../Status.js";
//Class for Add Status Effect
/*
@name : string
@type : string
@intensity : int
@duration: int
*/
export class ApplyStatus extends EffectInterface{
    constructor(name, type, intensity, minIntensity, duration, minDuration, typeTarget = null){
        super();
        this.name = name;
        this.type = type;
        this.intensity = intensity;
        this.minIntensity = minIntensity;
        this.duration = duration;
        this.minDuration = minDuration;
        this.typeTarget = typeTarget;
    }

    /*
    Add Status Effect
    @target : AbstractCharacter
    */
    //Génère 5 points de bouclier pour le joueur pendant 3 tours
    _generateStatus(target){
        //Verify if Target can be affect by Status
        if(this.typeTarget && target.type !== this.typeTarget ){
            throw new Error("Cette cible ne peut pas être affectée par ce Status.");
        
        }
        //Verify if the Status exist
        let status = target.status.find(status => status.name === this.name)
        if(status){
            //take the max intensity and the max duration
            status.intensity = Math.max(this.intensity, status.intensity);
            status.duration = Math.max(this.duration, status.duration);
            return status;
        }
        else{
            status = new Status(this.name, this.type, this.intensity,this.duration);
            target.status.push(status);
            return status;
        }
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
            const status = this. _generateStatus(target);
            console.log(user.name+" applique "+status.name+" à "+target.name);
        }
    }
}