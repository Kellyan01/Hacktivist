import { TargetFilterInterface } from "../../interfaces/TargetFilterInterface.js";
//Class for Target By Status Effect
/*
@statusName : string
@hasStatus : boolean
@count : int | "all"
*/
export class TargetByStatus extends TargetFilterInterface{
    constructor(statusName, hasStatus, count){
        super();
        this.statusName = statusName;
        this.hasStatus = hasStatus;
        this.count = count;
    }

    /*
    Method to filter targets
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    */
    filter(user,targets){
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