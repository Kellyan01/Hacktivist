//Abstract Class for the Game Cards
/*
@name : string
@type : string
@cost : int
@description : string
@targeted : boolean
*/
export class AbstractCard{
    constructor(name, type, cost, description, targeted){
        if(new.target === AbstractCard){
             throw new Error("AbstractCard can't be instantiated");
        }
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.description = description;
        this.targeted = targeted;
    }

    /*Abstract method
    Launch the effects of a card
    @player : Player
    @targets : array of AbstractCharacter
    */
    effect(player, targets = []){
        throw new Error("effect() must be implemented");
    }
}