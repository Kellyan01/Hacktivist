import { Enemy } from "./Enemy.js";
import { AttaqueBasique } from "../actionEntities/AttaqueBasique.js";

//Class for the Garde de Nuit enemy
export class GardeDeNuit extends Enemy{
    constructor(){
        super("Garde de Nuit", "Human", 12, "Financial", [new AttaqueBasique()], 3);
    }

    /*
    Method to act during a turn
    @player : Player
    @enemies : Enemy[]
    */
    act(player,enemies){
        console.log("A mon tour d'agir !");
        this.intention.effect(this,[player, ...enemies]);
    }
}