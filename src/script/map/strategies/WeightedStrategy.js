import { AbstractNodeTypeStrategy } from "./AbstractNodeTypeStrategy.js";
import { NODE_TYPE_LIST, NODE_TYPE_CHANCE } from "../../constants.js";

//Class to assign type considering the weight of each type
export class WeightedStrategy extends AbstractNodeTypeStrategy{
    constructor(){
        super();
    }

    //Method to assign type on each node of a nodes list
    //@mapNodes : MapNodes[]
    //@totalFloors : int
    assignAll(mapNodes, totalFloors){
        //For each node of mapNodes, assign a type
        for(const node of mapNodes){
            //Verify floor
            switch(node.floor){
                case 1 :
                    node.type = NODE_TYPE_LIST.BOSS;
                    break;
                case 2 :
                    node.type = NODE_TYPE_LIST.REST;
                    break;
                case totalFloors :
                    node.type = NODE_TYPE_LIST.START;
                    break;
                case totalFloors - 1 :
                    node.type = NODE_TYPE_LIST.COMBAT;
                    break;
                default :
                    const random = Math.random()*100;
                    let cumul = 0;
                    for (const [type, chance] of Object.entries(NODE_TYPE_CHANCE)) {
                        cumul += chance;
                        if (random <= cumul) { node.type = type; break; }
                    }
            }
        }
    }
}