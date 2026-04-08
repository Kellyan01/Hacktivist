import { EffectInterface } from "../../../interfaces/EffectInterface.js";
//Class for Target By Status Effect
/*
@statusName : string
@hasStatus : boolean
@count : int | "all"
*/
export class TargetByStatus extends EffectInterface{
    constructor(statusName, hasStatus, count){
        super();
        this.statusName = statusName;
        this.hasStatus = hasStatus;
        this.count = count;
    }

    /*
    Method to use an effect
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    */
    effect(user,targets){
        //filter targets by type
        targets = targets.filter(target => {
            return target.status.some(status => status.name === this.statusName) === this.hasStatus;
        })
        //filter by count
        if(this.count !== "all"){
            targets = targets.slice(0,this.count);
        }
        //return targets array
        return targets;
    }
}