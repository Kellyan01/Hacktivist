//Interface for Effects used by Card
export class EffectInterface{
    constructor(){
        if(new.target === EffectInterface){
             throw new Error("EffectInterface can't be instantiated");
        }
    }

    /*
    Abstract Method to use an effect
    @user : AbstractCard ||AbstractAction
    @targets : AbstractCharacter[]
    @return : mixed
    */
    effect(user,targets){
        throw new Error("effect() must be implemented");
    }
}