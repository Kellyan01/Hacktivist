import { Enemy } from "./Enemy.js";
import { AttaqueBasique } from "../actionEntities/AttaqueBasique.js";
import { Soin } from "../actionEntities/Soin.js";
import { Bouclier } from "../actionEntities/Bouclier.js";
import { ChaoticBehavior } from "../behaviorEntities/ChaoticBehavior.js";
import { ProceduralBehavior } from "../behaviorEntities/ProceduralBehavior.js";
import { SemiRandomBehavior } from "../behaviorEntities/SemiRandomBehavior.js";
import { ConditionFactory } from "../behaviorEntities/ConditionFactory.js";
import { ConditionalBehavior } from "../behaviorEntities/ConditionalBehavior.js";
import { TYPE_CHARACTER, TYPE_VULNERABILITY, CONDITION_LIST } from "../../constants.js";

//Class for the Garde de Nuit enemy
export class GardeDeNuit extends Enemy{
    constructor(){
        super("Garde de Nuit", TYPE_CHARACTER.HUMAN, 12, 12, TYPE_VULNERABILITY.FINANCIAL, [
            new AttaqueBasique(),
            new Soin(),
            new Bouclier()
        ], new ConditionalBehavior([
            {
                condition : ConditionFactory.buildCondition(CONDITION_LIST.HALF_HP),
                action : new Soin()
            },
            {
                condition : ConditionFactory.buildCondition(CONDITION_LIST.SELF_NO_SHIELD),
                action : new Bouclier()
            }
        ],new AttaqueBasique()),3);
    }
}