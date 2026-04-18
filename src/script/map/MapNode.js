import {NODE_VISIBILITY} from "../constants.js"

//Class for the Node on the Map
/*
@id : int
@x : int
@y : int
@floor : int
@type : string
@visibility : string
*/
export class MapNode{
    constructor(id,x,y,floor = 0){
        this.id = id;
        this.x = x;
        this.y = y;
        this.floor = floor;
        this.type = null;
        this.visibility = NODE_VISIBILITY.HIDDEN;
    }
}