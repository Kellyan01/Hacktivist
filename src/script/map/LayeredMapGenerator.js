import { MapNode } from "./MapNode.js";
import { Connection } from "./Connection.js";
import { MapLayer } from "./MapLayer.js";

//Class to Generete the Map using Node Layers
/*
@width : int
@height : int
@layers : MapLayer[]
@mapNodes : MapNode[]
@connections : Connection[]
@minNbrNode : int -> minimum number of node for each Layer
@maxNbrNode : int -> maximum number of node for each Layer
@nbrLayer : int -> quantity of Layer
@firstId : int -> index of the first MapNode
@lastId : int -> index of the last MapNode
*/
export class LayeredMapGenerator {
    constructor(width, height,minNbrNode,maxNbrNode,nbrLayer){
        this.width = width;
        this.height = height;
        this.minNbrNode = minNbrNode;
        this.maxNbrNode = maxNbrNode;
        this.nbrLayer = nbrLayer;
        this.layers = [];
        this.mapNodes= [];
        this.connections = [];
        this.firstId = 0;
        this.lastId = -1;
        this.floor = 0;
    }

    //PRIVATE METHOD
    //Method to Generate Layer
    _generateLayer(){
        //Creation of the layer
        //layer height
        const height = Math.floor(this.height / (this.nbrLayer + 1));
        const layer = new MapLayer(this.width,height,this.floor,this.minNbrNode,this.maxNbrNode,this.lastId + 1);
        //Generation of Layer's MapNodes
        this.lastId = layer.generate();
        //Save the last index in layer
        layer.lastId = this.lastId;
        //push the Layer in this.layers
        this.layers.push(layer)
    }

    //Method to push MapNodes of each Layer in this.nodes
    _pushNodes(){
        for(const layer of this.layers){
            for(const node of layer.nodesList){
                this.mapNodes.push(node);
            }
        }
    }

    //PUBLIC METHOD
    //Method to generate Map
    generateMap(){
        //Set this.floor to 0
        this.floor = 0;

        //Set first index to 0 and last index to -1
        this.firstId = 0;
        this.lastId = -1;

        //Generate this.nbrLayer Layer
        for(let i = this.nbrLayer; i > 0; i--){
            //Increase the floor
            this.floor += 1;
            //Creation of the layer
            this._generateLayer();
        }

        //Push node in this.nodes
        this._pushNodes();
    }
}