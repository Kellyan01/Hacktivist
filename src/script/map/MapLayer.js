import { MapNode } from "./MapNode.js";
//Class to Generate one Layer fo the Map
/*
@width : int -> the width of the map
@floor : int -> Layer floor
@minNbrNodes : int -> minimum number of node to generate
@maxNbrNodes: int  -> maximum number of node to generate
@nodesList : MapNode[] -> the node list of the Layer
@firstId : int -> the first MapNode id
@lastId : int -> the last MapNode id
*/
export class MapLayer{
    constructor(width, height, floor, minNbrNodes, maxNbrNodes, firstId){
        this.width = width;
        this.height = height;
        this.floor = floor;
        this.minNbrNodes = minNbrNodes;
        this.maxNbrNodes = maxNbrNodes;
        this.firstId = firstId;
        this.lastId = null;
        this.nodesList = [];
    }

    //PUBLIC METHOD
    //Method to randomly generate MapNode list
    generate(){
        //Random node number
        const number = Math.floor(Math.random()*(this.maxNbrNodes - this.minNbrNodes) + this.minNbrNodes);

        //first id of the MapNode
        let id = this.firstId;

        //X position of the first MapNode
        const dist = this.width / (number + 1);
        let x = dist;

        //generate number MapNode
        for(let i = number; i > 0; i--){
            //RANDOMISE X POSTION
            // % of dist
            let deviationX = Math.random()*0.25*dist;
            // increase or deacrease ?
            if(Math.random()<0.5) deviationX = -deviationX;

            //RANDOMISE Y POSTION
            // % of dist
            let deviationY = Math.random()*0.3*this.height;
            // increase or deacrease ?
            if(Math.random()<0.5) deviationY = -deviationY;
            //Create the MapNode
            const node = new MapNode(id,x + deviationX,this.height*this.floor + deviationY, this.floor);
            //Push the node in the Layer node list
            this.nodesList.push(node);
            //increment id and x position for the following node
            id++;
            x += dist;
        }

        //define the last node id of the layer
        this.lastId = id - 1;
        return this.lastId;
    }
}