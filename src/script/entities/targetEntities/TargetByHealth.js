import { TargetFilterInterface } from "../../interfaces/TargetFilterInterface.js";
//Class for Target By Health Effect
/*
@mode : string
@threshold : int | null
@count : int | "all"
*/
export class TargetByHealth extends TargetFilterInterface{
    constructor(mode, threshold, count){
        super();
        this.mode = mode;
        this.threshold = threshold;
        this.count = count;
    }

    /*
    Method to filter target
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    */
    filter(user,targets){
        //Verify mode filter
        switch(this.mode){
            case "above" :
                 //filter targets by health > threshold
                targets = targets.filter(target => {
                    return target.health > this.threshold;
                });
                break;
            case "below" :
                //filter targets by health < threshold
                targets = targets.filter(target => {
                    return target.health < this.threshold;
                });
                break;
            case "max" :
                //filter targets by health max of targets health
                const maxHealth = targets.reduce((max,target)=>{
                    if(max < target.health) max = target.health;
                    return max;
                },targets[0].health)
                targets = targets.filter(target => {
            return target.health === maxHealth;
                });
                break;
            case "min" :
                //filter targets by health min of targets health
                //1. Take target whom health > 0
                targets = targets.filter(target => {
                    return target.health !== 0;
                });
                //2. Take min Health
                const minHealth = targets.reduce((min,target)=>{
                    if(min > target.health) min = target.health;
                    return min;
                },targets[0].health);
                targets = targets.filter(target => {
                    return target.health === minHealth;
                });
                break;
            case "full" :
                //filter targets by health === target maxHealth 
                targets = targets.filter(target => {
                    return target.health === target.maxHealth;
                });
                break;
            default :
                throw new Error("Unknown Filter Mode for Target By Health !")
        }
        
        //filter by count
        if(this.count !== "all"){
            targets = targets.slice(0,this.count);
        }
        //return targets array
        return targets;
    }
}