//Abstract Class for the Game Characters
/*
@name : string
@type : string
@health : int
@maxHealth : int
@status : array of Status
*/
export class AbstractCharacter{
    constructor(name, type, health, maxHealth){
        if(new.target === AbstractCharacter){
             throw new Error("AbstractCharacter can't be instantiated");
        }
        this.name = name;
        this.type = type;
        this.health = health;
        this.maxHealth = maxHealth;
        this.status = [];
    }

    /*
    Abstract Method to act during a turn
    @player : Player
    @enemies : Enemy[]
    */
    act(player,enemies){
        throw new Error("act() must be implemented");
    }
}