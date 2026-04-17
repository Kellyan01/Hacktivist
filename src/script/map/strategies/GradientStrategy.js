import { AbstractNodeTypeStrategy } from "./AbstractNodeTypeStrategy.js";
import { NODE_TYPE_LIST, NODE_TYPE_WEIGHTS } from "../../constants.js";

//Class to assign type considering a spatial gradient for each type
export class GradientStrategy extends AbstractNodeTypeStrategy{
    constructor(){
        super();
    }

    //Method to assign type to each node of a nodes list
    //@mapNodes : MapNodes[]
    //@totalFloors : int
    assignAll(mapNodes, totalFloors){
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
                    const t = 1 - (node.floor / totalFloors);
                    let cumul = 0;
                    for (const [type, chance] of Object.entries(NODE_TYPE_WEIGHTS)) {
                        cumul += chance(t);
                        if (random <= cumul) { node.type = type; break; }
                    }
            }
        }
    }
}