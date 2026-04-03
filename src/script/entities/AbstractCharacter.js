//Abstract Class for the Game Characters
/*
@name : string
@type : string
@health : int
*/
export class AbstractCharacter{
    constructor(name, type, health){
        if(new.target === AbstractCharacter){
             throw new Error("AbstractCharacter can't be instantiated");
        }
        this.name = name;
        this.type = type;
        this.health = health;
    }

    /*
    Abstract Method to act during a turn
    */
    act(){
        throw new Error("act() must be implemented");
    }
}