//Class to Handle the navigation on map
/*
@mapNodes : MapNode[]
@connections : Connection[]
@currentNodeId : int
*/
export class Navigator{
    constructor(mapNodes, connections, startNodeId){
        this.mapNodes = mapNodes;
        this.connections = connections;
        this.currentNodeId = startNodeId;
    }

    //PRIVATE METHOD

    //Method to get the current node
    getCurrentNode(){
        return this.mapNodes[this.currentNodeId];
    }

    //Method to get the nodes connected to current node
    getReachableNodes(){
        const reachableNodes = []
        for(const connection of this.connections){
            //Verify if a connection to the current node exist => push in reachableNodes
            if(connection.to === this.currentNodeId){
                reachableNodes.push(this.mapNodes[connection.from])
            }
            if(connection.from === this.currentNodeId){
                reachableNodes.push(this.mapNodes[connection.to])
            }
        }

        //Return the reachableNodes list
        return reachableNodes;
    }

    //Method to move to a connected node
    moveTo(nodeId){
        //Verify if noteId is reachable
        const reachableNodes = this.getReachableNodes();
        if(reachableNodes.some(node => {
            return nodeId === node.id;
        })){
            //Update currentNodeId
            this.currentNodeId = nodeId;

            //return true
            return true;
        }

        //Node Id is unreachable => return false
        return false;
    }
}