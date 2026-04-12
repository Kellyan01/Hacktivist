import { BSPNode } from "./BSPNode.js";
import { MapNode } from "./MapNode.js";
import { Connection } from "./Connection.js";

//Class for Map Generating with BSP Algorithm
/*
@width : int
@height : int
@minNodeSize : int
@maxDepth : int
@leaves : BSPNode[]
@mapNodes : MapNode[]
@connections : Connection[]
*/
export class MapGenerator{
    constructor(width, height, minNodeSize, maxDepth){
        this.width = width;
        this.height = height;
        this.minNodeSize = minNodeSize;
        this.maxDepth = maxDepth;
        this.leaves = [];
        this.mapNodes = [];
        this.connections = [];
    }

    //PRIVATE METHOD
    //Method to find a leave in series of BSPNode children
    //@node : BSPNode
    _getFirstLeaf(node){
        //if node doesn't have children, it's a leave => return its room
        if(!node.left && !node.right) return node.room;

        //Recursion on left
        if(node.left) return this._getFirstLeaf(node.left);
    }

    //Method to recursively call split()
    /*
    @node : BSPNode
    @depth : int
    */
    _splitRecursive(node, depth){
        //Verify if the depth is valid
        if(depth >= this.maxDepth) return;
        //Verifiy if split method return false
        if(!node.split(this.minNodeSize)) return;

        //Call recursively split()
        this._splitRecursive(node.left, depth+1);
        this._splitRecursive(node.right, depth+1);
    }

    //PUBLIC METHOD
    //Method to connect room
    //@node : BSPNode
    connectRooms(node){
        //if node doesn't have children, it's a leave => return 
        if(!node.left && !node.right) return;

        //Find the first leave
        let leftRoom;
        let rightRoom;
        if(node.left) leftRoom = this._getFirstLeaf(node.left);
        if(node.right) rightRoom = this._getFirstLeaf(node.right);

        //Create a connexion between them
        const connection = new Connection(leftRoom.id, rightRoom.id);

        //Push the connection in this.connections
        this.connections.push(connection);

        //Recurison
        this.connectRooms(node.left);
        this.connectRooms(node.right);

    }

    //Method to generate the Map
    generate(){
        //0. Empty Leaves
        this.leaves = [];

        //1. Creation of the root BSPNode
        const root = new BSPNode(0,0,this.width,this.height);

        //2. Call the recursive split method
        this._splitRecursive(root,0);

        //3. Return the root Node
        return root;
    }

    //Method to get the generated nodes
    /*
    @node : BSPNode
    */
    getLeaves(node){
        //If node doesn't have children, push node in leaves then return
        if(!node.left && !node.right){
            this.leaves.push(node);
            return;
        }

        //Recursion        
        if(node.left) this.getLeaves(node.left);
        if(node.right) this.getLeaves(node.right);
    }

    //Method to generate the room from the BSPNode[]
    placeRoom(){
        this.mapNodes = [];
        this.leaves.forEach((leave,index)=>{
            const x = leave.x + Math.floor(leave.width / 2)
            const y = leave.y + Math.floor(leave.height / 2)

            const room = new MapNode(index,x,y);
            leave.room = room;
            this.mapNodes.push(room);
        })
    }

}