import { NODE_TYPE_LIST, NODE_VISIBILITY } from "../constants.js";
//Class to handle node visibility
//@range :int
export class FogOfWar{
    constructor(range = 2){
        this.range = range;
    }

    //Method to update visibility of node
    //@currentNode : MapNode
    //@mapNodes : MapNode[]
    updateVisibility(currentNode, mapNodes){
        //Update Current node Visibility to Revealed
        currentNode.visibility = NODE_VISIBILITY.REVEALED;

        //Update Node Visibility in range
        for(const node of mapNodes){
            if(node.visibility !== NODE_VISIBILITY.REVEALED){
                if(Math.abs(currentNode.floor - node.floor) <= this.range || node.type === NODE_TYPE_LIST.BOSS){
                    node.visibility = NODE_VISIBILITY.VISIBLE;
                }else{
                    node.visibility = NODE_VISIBILITY.HIDDEN;
                }
            }
        }
    }
}