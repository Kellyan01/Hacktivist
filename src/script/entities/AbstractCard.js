//Abstract Class for the Game Cards
/*
@name : string
@type : string
@cost : int
@description : string
*/
export class AbstractCard{
    constructor(name, type, cost, description){
        if(new.target === AbstractCard){
             throw new Error("AbstractCard can't be instantiated");
        }
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.description = description;
    }

    /*Abstract method
    Launch the effects of a card
    */
    effect(){
        throw new Error("effect() must be implemented");
    }
}