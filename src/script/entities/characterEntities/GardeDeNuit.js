import { Enemy } from "./Enemy.js";
import { AttaqueBasique } from "../actionEntities/AttaqueBasique.js";
import { TYPE_CHARACTER, TYPE_VULNERABILITY } from "../../constants.js";

//Class for the Garde de Nuit enemy
export class GardeDeNuit extends Enemy{
    constructor(){
        super("Garde de Nuit", TYPE_CHARACTER.HUMAN, 12, 12, TYPE_VULNERABILITY.FINANCIAL, [new AttaqueBasique()], 3);
    }
}