//Interface for Behavior Strategy of Enemy
export class BehaviorInterface{
    constructor(){
        if(new.target === BehaviorInterface){
             throw new Error("BehaviorInterface can't be instantiated");
        }
    }

    /*
    Abstract Method to choose an Action
    @enemy : Enemy
    @player : Player
    @enemies : AbstractCharacter[]
    */
    chooseAction(enemy, player, enemies){
        throw new Error("chooseAction() must be implemented");
    }
}