//Interface for Filter the Targets
export class TargetFilterInterface{
    constructor(){
        if(new.target === TargetFilterInterface){
             throw new Error("TargetFilterInterface can't be instantiated");
        }
    }

    /*
    Abstract Method to filter
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    @return : AbstractCharacter[]
    */
    filter(user,targets){
        throw new Error("filter() must be implemented");
    }
}