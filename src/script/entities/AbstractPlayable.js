//Abstract Class for the Playable Element (Cards, Actions, ...)
/*
@name : string
@type : string
@description : string
*/
export class AbstractPlayable{
    constructor(name, type, description){
        if(new.target === AbstractPlayable){
             throw new Error("AbstractPlayable can't be instantiated");
        }
        this.name = name;
        this.type = type;
        this.description = description;
    }

    /*Abstract method
    Launch the effects of a card
    @user : AbstractCharacter
    @targets : array of AbstractCharacter
    */
    effect(user, targets = []){
        throw new Error("effect() must be implemented");
    }
}