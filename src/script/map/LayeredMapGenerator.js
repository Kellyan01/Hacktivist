import { Connection } from "./Connection.js";
import { MapLayer } from "./MapLayer.js";
import { NODE_TYPE_LIST, NODE_TYPE_CHANCE } from "../constants.js";

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
    //Method to connect MapNode with All Next Floor MapNode
    _connectAllNodes(){
        //Begining with floor = 1, for each Node of a Floor, connect it with the nodes of Floor + 1
        //Limit case : If the node is on the last floor => return
        for(const node of this.mapNodes){
            //Limit case
            if(node.floor === this.floor) continue;

            //filter node to get those on floor + 1
            const filteredMapNodes = this.mapNodes.filter(mapNode => {
                return mapNode.floor === node.floor + 1;
            })

            //Create New Connection between node and mapNodes of the filtered tab
            for(const mapNode of filteredMapNodes){
                const connection = new Connection(node.id, mapNode.id);

                //push connection in this.connections
                this.connections.push(connection);
            }
        }
    }

    //Method to connect MapNode with Nearest Next Floor MapNode
    _connectNearNodes(){
        //For each Node of a Floor, connect it with the nearest node of Floor + 1
        //Limit case : If the node is on the last floor => return
        for(const node of this.mapNodes){
            //Limit case
            if(node.floor === this.floor) continue;

            //filter node to get those on floor + 1
            const filteredMapNodes = this.mapNodes.filter(mapNode => {
                return mapNode.floor === node.floor + 1;
            })

            //find the nearest node (distance = sqrt((node.x - mapNode.x)^2 + (node.y - mapNode.y)^2)
            let nearNode = filteredMapNodes[0];
            for(const mapNode of filteredMapNodes){
                const distanceNearNode = Math.sqrt((node.x - nearNode.x)*(node.x - nearNode.x) + (node.y - nearNode.y)*(node.y - nearNode.y));
                const distanceMapNode = Math.sqrt((node.x - mapNode.x)*(node.x - mapNode.x) + (node.y - mapNode.y)*(node.y - mapNode.y));
                if(distanceNearNode > distanceMapNode) nearNode = mapNode;
            }

            //Create New Connection between node and nearNode
            const connection = new Connection(node.id, nearNode.id);

            //push connection in this.connections
            this.connections.push(connection);
            
        }


    }

    //Method to connect MapNode with N Nearest Next Floor MapNode
    _connectNNearNodes(){
        //For each Node of a Floor, connect it with the nearest node of Floor + 1
        //Limit case : If the node is on the last floor => return
        for(const node of this.mapNodes){
            //Limit case
            if(node.floor === this.floor) continue;

            //filter node to get those on floor + 1
            const filteredMapNodes = this.mapNodes.filter(mapNode => {
                return mapNode.floor === node.floor + 1;
            })

            //copy of filteredMapNodes
            const copyFilteredNodes = [...filteredMapNodes];

            //random number of connection between 1 and 3
            const n = Math.floor(Math.random()*3 + 1);

            //max number of turn (n or filteredMapNodes.length)
            const max = Math.min(n, filteredMapNodes.length);

            //Loop FOR to find the N nearest Node
            for(let i = max; i > 0; i--){
                //find the nearest node (distance = sqrt((node.x - mapNode.x)^2 + (node.y - mapNode.y)^2)
                let nearNode = copyFilteredNodes[0];
                for(const mapNode of copyFilteredNodes){
                    const distanceNearNode = Math.sqrt((node.x - nearNode.x)*(node.x - nearNode.x) + (node.y - nearNode.y)*(node.y - nearNode.y));
                    const distanceMapNode = Math.sqrt((node.x - mapNode.x)*(node.x - mapNode.x) + (node.y - mapNode.y)*(node.y - mapNode.y));
                    if(distanceNearNode > distanceMapNode) nearNode = mapNode;
                }

                //Create New Connection between node and nearNode
                const connection = new Connection(node.id, nearNode.id);

                //push connection in this.connections
                this.connections.push(connection);

                //delete nearNode from copyFilteredNodes
                copyFilteredNodes.splice(copyFilteredNodes.indexOf(nearNode),1);
            }
            
        }
    }

    //Method to connect Nodes of a Layer with Nodes of Next Layer
    _connectLayer(){
        //For each Layer
        //Limit case : If the Layer have last floor => return
        for(const layer of this.layers){
            //Limit case
            if(layer.floor === this.floor) continue;

            //Set of connected id
            const connectedIds = new Set();

            //STEP 1 : NEAREST NODE
            //get nodesList of next Layer
            const mapNodes = this.layers[(this.layers.indexOf(layer)+1)].nodesList;

            //For each Node of Layer
            for(const node of layer.nodesList){
                //copy of mapNodes
                let copyMapNodes = [...mapNodes];

                //random number of connection between 1 and 2
                //const n = Math.floor(Math.random()*1+1);
                const n = 1;

                //max number of turn (n or mapNodes.length)
                const max = Math.min(n, mapNodes.length);

                //Loop FOR to find the N nearest Node
                for(let i = max; i > 0; i--){
                    //find the nearest node (distance = sqrt((node.x - mapNode.x)^2 + (node.y - mapNode.y)^2)
                    let nearNode = copyMapNodes[0];
                    for(const mapNode of copyMapNodes){
                        const distanceNearNode = Math.sqrt((node.x - nearNode.x)*(node.x - nearNode.x) + (node.y - nearNode.y)*(node.y - nearNode.y));
                        const distanceMapNode = Math.sqrt((node.x - mapNode.x)*(node.x - mapNode.x) + (node.y - mapNode.y)*(node.y - mapNode.y));
                        if(distanceNearNode > distanceMapNode) nearNode = mapNode;
                    }

                    //Create New Connection between node and nearNode
                    const connection = new Connection(node.id, nearNode.id);

                    //Verify cross line with _segmentsIntersect()
                    //Verify if their are connections
                    if(this.connections.length >= 1){
                        //For each connection verify the cross line
                        let isCross = false;
                        for(const existingConnection of this.connections){
                            if(this._segmentsIntersect(node, nearNode, this.mapNodes[existingConnection.from], this.mapNodes[existingConnection.to])){
                                isCross = true;
                            }
                        }

                        //if isCross is false => no cross line => push connection
                        if(!isCross){
                            //push connection in this.connections
                            this.connections.push(connection);

                            //Add connected node id to Set
                            connectedIds.add(node.id);
                            connectedIds.add(nearNode.id);
                        }
                    }else{
                        //push connection in this.connections
                        this.connections.push(connection);

                        //Add connected node id to Set
                        connectedIds.add(node.id);
                        connectedIds.add(nearNode.id);
                    }

                    //delete nearNode from copyMapNodes
                    copyMapNodes.splice(copyMapNodes.indexOf(nearNode),1);
                }
            }
            
            //STEP 2 : THE ORPHAN
            //filter the orphan
            const orphansList = mapNodes.filter(node => {
                return !connectedIds.has(node.id);
            })

            //Find the nearest node on layer
            //For each orphan
            for(const orphan of orphansList){
                //Copy of layer.nodesList
                let copyMapNodes = [...layer.nodesList];

                //random number of connection between 1 and 3
                //const n = Math.floor(Math.random()*1 + 1);
                const n = 1;

                //max number of turn (n or layer.nodesList.length)
                const max = Math.min(n, layer.nodesList.length);

                //Loop FOR to find the N nearest Node
                for(let i = max; i > 0; i--){
                    //find the nearest node (distance = sqrt((node.x - mapNode.x)^2 + (node.y - mapNode.y)^2)
                    let nearNode = copyMapNodes[0];
                    for(const mapNode of copyMapNodes){
                        const distanceNearNode = Math.sqrt((orphan.x - nearNode.x)*(orphan.x - nearNode.x) + (orphan.y - nearNode.y)*(orphan.y - nearNode.y));
                        const distanceMapNode = Math.sqrt((orphan.x - mapNode.x)*(orphan.x - mapNode.x) + (orphan.y - mapNode.y)*(orphan.y - mapNode.y));
                        if(distanceNearNode > distanceMapNode) nearNode = mapNode;
                    }

                    //Create New Connection between node and nearNode
                    const connection = new Connection(orphan.id, nearNode.id);

                    //Verify cross line with _segmentsIntersect()
                    //Verify if their are connections
                    if(this.connections.length >= 1){
                        //For each connection verify the cross line
                        let isCross = false;
                        for(const existingConnection of this.connections){
                            if(this._segmentsIntersect(orphan, nearNode, this.mapNodes[existingConnection.from], this.mapNodes[existingConnection.to])){
                                isCross = true;
                            }
                        }

                        //if isCross is false => no cross line => push connection
                        if(!isCross){
                            //push connection in this.connections
                            this.connections.push(connection);

                            //Add connected node id to Set
                            connectedIds.add(orphan.id);
                            connectedIds.add(nearNode.id);
                        }
                    }else{
                        //push connection in this.connections
                        this.connections.push(connection);

                        //Add connected node id to Set
                        connectedIds.add(orphan.id);
                        connectedIds.add(nearNode.id);
                    }

                    //delete nearNode from copyMapNodes
                    copyMapNodes.splice(copyMapNodes.indexOf(nearNode),1);
                }
            }
        }

        /* // 1. Verify node having zero on floor +1 or on floor -1 => compare this.mapNodes and this.connections
           // 2. if zero connection on floor -1 (limit case : node on first layer / floor), create one connection with the first floor -1 node avoiding cross line
           // 3. if zero connection on floor +1 (limit case : node on last layer / floor), create one connection with the first floor +1 node avoiding cross line
        */

        //Step 1
        for(const node of this.mapNodes){
            let nextFloor = false; //Floor +1 connected ?
            let previousFloor = false; //Floor -1 connected
            for(const connection of this.connections){
                //verify connected node floor
                if(node.id === connection.from){
                    const connectedNode = this.mapNodes[connection.to];
                    if(node.floor > connectedNode.floor){// connected to floor - 1
                        previousFloor = true;
                    }
                    if(node.floor < connectedNode.floor){// connected to floor +1
                        nextFloor = true;
                    }
                }
                if(node.id === connection.to){
                    const connectedNode = this.mapNodes[connection.from];
                    if(node.floor > connectedNode.floor){// connected to floor - 1
                        previousFloor = true;
                    }
                    if(node.floor < connectedNode.floor){// connected to floor +1
                        nextFloor = true;
                    }
                }
            }

            //Step 2 : connected to first node of floor - 1 avoiding cross line
            if(!previousFloor && node.floor !== 1){//Verify node isn't on first layer

                let isConnected = false;
                for(const previousNode of this.layers[node.floor-2].nodesList){ // layer of floor - 1
                    if(!isConnected){
                        //Create New Connection between node and nearNode
                        const connection = new Connection(node.id, previousNode.id);

                        //Verify cross line with _segmentsIntersect()
                        //Verify if their are connections
                        if(this.connections.length >= 1){
                            //For each connection verify the cross line
                            let isCross = false;
                            for(const existingConnection of this.connections){
                                if(this._segmentsIntersect(node, previousNode, this.mapNodes[existingConnection.from], this.mapNodes[existingConnection.to])){
                                    isCross = true;
                                }
                            }

                            //if isCross is false => no cross line => push connection
                            if(!isCross && !isConnected){
                                //push connection in this.connections
                                this.connections.push(connection);

                                //stop the loop
                                isConnected = true;
                            }
                        }
                    }
                }

                //If isConnected is still false -> no connection => Force one connection
                if(!isConnected){
                    //random node
                    const random = Math.floor(Math.random()*this.layers[node.floor-2].nodesList.length);
                    const crossNode = this.layers[node.floor-2].nodesList[random];

                    //Create New Connection between node and nearNode
                    const connection = new Connection(node.id, crossNode.id);
                    this.connections.push(connection);
                }
            }

            //Step 3 : connected to first node of floor + 1 avoiding cross line
            if(!nextFloor && node.floor !== this.floor){//Verify node isn't on last layer
                let isConnected = false;
                for(const nextNode of this.layers[node.floor].nodesList){ // layer of floor + 1
                    if(!isConnected){
                        //Create New Connection between node and nearNode
                        const connection = new Connection(node.id, nextNode.id);

                        //Verify cross line with _segmentsIntersect()
                        //Verify if their are connections
                        if(this.connections.length >= 1){
                            //For each connection verify the cross line
                            let isCross = false;
                            for(const existingConnection of this.connections){
                                if(this._segmentsIntersect(node, nextNode, this.mapNodes[existingConnection.from], this.mapNodes[existingConnection.to])){
                                    isCross = true;
                                }
                            }

                            //if isCross is false => no cross line => push connection
                            if(!isCross && !isConnected){
                                //push connection in this.connections
                                this.connections.push(connection);

                                //stop the loop
                                isConnected = true;
                            }
                        }
                    }
                }

                //If isConnected is still false -> no connection => Force one connection
                if(!isConnected){
                    //random node
                    const random = Math.floor(Math.random()*this.layers[node.floor].nodesList.length);
                    const crossNode = this.layers[node.floor].nodesList[random];

                    //Create New Connection between node and nearNode
                    const connection = new Connection(node.id, crossNode.id);
                    this.connections.push(connection);
                }
            }
        }
    }

    //Method to Generate Layer
    _generateLayer(){
        //Creation of the layer
        //layer height
        const height = this.height / (this.nbrLayer + 5);
        const layer = new MapLayer(this.width,height,this.floor,this.minNbrNode,this.maxNbrNode,this.lastId + 1);
        //Generation of Layer's MapNodes
        this.lastId = layer.generate();
        //Save the last index in layer
        layer.lastId = this.lastId;
        //push the Layer in this.layers
        this.layers.push(layer)
    }

    //Method to Generate a Layer with n Node
    //@nbrNode : int -> number of Node
    _generateNNodeLayer(nbrNode){
        //Creation of the layer
        //layer height
        const height = this.height / (this.nbrLayer + 5);
        const layer = new MapLayer(this.width,height,this.floor,nbrNode,nbrNode,this.lastId + 1);
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

    //Method to calculate orientation of A -> B -> C
    /*
    @mapNodeA : MapNode
    @mapNodeB : MapNode
    @mapNodeC : MapNode
    */
    _orientation(mapNodeA, mapNodeB, mapNodeC){
         return (mapNodeB.x - mapNodeA.x) * (mapNodeC.y - mapNodeA.y) - (mapNodeB.y - mapNodeA.y) * (mapNodeC.x - mapNodeA.x);
    }

    //Method to verify cross lines
    /*
    @mapNodeA : MapNode
    @mapNodeB : MapNode
    @mapNodeC : MapNode
    @mapNodeD : MapNode
    */
    _segmentsIntersect(mapNodeA, mapNodeB, mapNodeC, mapNodeD){
        //Verify if A->B cross C->D
        const bool = (this._orientation(mapNodeC, mapNodeD, mapNodeA) * this._orientation(mapNodeC, mapNodeD, mapNodeB) < 0) && (this._orientation(mapNodeA, mapNodeB, mapNodeC) * this._orientation(mapNodeA, mapNodeB, mapNodeD) < 0);
        return bool;

    }

    //PUBLIC METHOD
    //Method to assign type to each node
    assignTypes(){
        //For each node of yhis.mapNodes, assign a type
        for(const node of this.mapNodes){
            //Verify floor
            switch(node.floor){
                case 1 :
                    node.type = NODE_TYPE_LIST.BOSS;
                    break;
                case 2 :
                    node.type = NODE_TYPE_LIST.REST;
                    break;
                case this.floor :
                    node.type = NODE_TYPE_LIST.START;
                    break;
                case this.floor - 1 :
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

    //Method to generate Map
    generateMap(){
    let count = 0;
    while(this.mapNodes.length < (3*this.nbrLayer+9)*0.9 || this.mapNodes.length > (3*this.nbrLayer+9)*1.10){
        //Reset of the generator
        this.layers = [];
        this.mapNodes= [];
        this.connections = [];
        this.firstId = 0;
        this.lastId = -1;
        this.floor = 0;

        //Generate the Top Layer
        //Increase the floor
        this.floor += 1;
        //Creation of the layer
        this._generateNNodeLayer(1);

        //Generate the Safe Place Layer before Boss
        //Increase the floor
        this.floor += 1;
        //Creation of the layer
        this._generateNNodeLayer(4);

        //Generate this.nbrLayer Layer
        for(let i = this.nbrLayer; i > 0; i--){
            //Increase the floor
            this.floor += 1;
            //Creation of the layer
            this._generateLayer();
        }

        //Generate the First Combat Layer
        //Increase the floor
        this.floor += 1;
        //Creation of the layer
        this._generateNNodeLayer(3);

        //Generate the End Layer
        //Increase the floor
        this.floor += 1;
        //Creation of the layer
        this._generateNNodeLayer(1);

        //Push node in this.nodes
        this._pushNodes();

        //Connect Node
        this._connectLayer();

        //Assign type to Node
        this.assignTypes();
        
        count++;
    }
        console.log("Generate with "+count+" turns");
    }
}