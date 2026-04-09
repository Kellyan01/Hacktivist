import { TargetFilterInterface } from "../../interfaces/TargetFilterInterface.js";
//Class for Target By Type Effect
/*
@type : string
@count : int | "all"
*/
export class TargetByType extends TargetFilterInterface{
    constructor(type, count){
        super();
        this.type = type;
        this.count = count;
    }

    /*
    Method to use an filter targets
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    */
    filter(user,targets){
        //filter targets by type
        targets = targets.filter(target => {
            return target.type === this.type;
        })
        //filter by count
        if(this.count !== "all"){
            targets = targets.slice(0,this.count);
        }
        //return targets array
        return targets;
    }
}