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
    constructor(name, type, intensity, minIntensity, duration, minDuration){
        super();
        this.name = name;
        this.type = type;
        this.intensity = intensity;
        this.minIntensity = minIntensity;
        this.duration = duration;
        this.minDuration = minDuration;
    }

    /*
    Add Status Effect
    @target : AbstractCharacter
    */
    //Génère 5 points de bouclier pour le joueur pendant 3 tours
    _generateStatus(target){
        //Verify if the Status exist
        let status = target.status.find(status => status.name === this.name)
        if(status){
            //take the max intensity and the max duration
            status.intensity = Math.max(this.minIntensity, status.intensity);
            status.duration = Math.max(this.minDuration, status.duration);
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