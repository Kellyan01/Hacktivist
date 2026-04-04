//Abstract Class for the Enemy Action
/*
@name : string
@type : string
@description : string
*/
export class AbstractAction{
    constructor(name, type, description){
        if(new.target === AbstractAction){
             throw new Error("AbstractAction can't be instantiated");
        }
        this.name = name;
        this.type = type;
        this.description = description;
    }

    /*Abstract method
    Launch the effects of an action
    @enemy : Enemy
    @entargets : array of AbstractCharacter
    */
    effect(enemy, targets = []){
        throw new Error("effect() must be implemented");
    }
}