import { NODE_COLORS, NODE_TYPE_LIST } from "../constants.js";

//Class to Render the Map UI
/*
@svgEl : NodeElement
@mapNodes : MapNode[]
@connections : Connection[]
@scale : int
@nodeRadius : int
@fill : string
@stroke : string
@strokeWidth : int
*/
export class MapRenderer{
    constructor(svgEl, mapNodes, connections, scale,nodeRadius = 5, fill = "black",  stroke = "black", strokeWidth = 1){
        this.svgEl = svgEl;
        this.mapNodes = mapNodes;
        this.connections = connections;
        this.scale = scale;
        this.fill = fill
        this.nodeRadius = nodeRadius;
        this.stroke = stroke;
        this.strokeWidth = strokeWidth;
    }

    //PRIVATE METHOD
    //Method to render Connection
    //@connection : Connection
    _renderConnections(connection){
        //Create the SVG element Line 
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")

        //Styling the line
        line.setAttribute("x1",this.mapNodes[connection.from].x*this.scale);
        line.setAttribute("y1",this.mapNodes[connection.from].y*this.scale);
        line.setAttribute("x2",this.mapNodes[connection.to].x*this.scale);
        line.setAttribute("y2",this.mapNodes[connection.to].y*this.scale);
        line.setAttribute("stroke-width",this.strokeWidth);
        line.setAttribute("stroke",this.stroke);

        //append in svgEl
        this.svgEl.append(line);
    }

    //Method to render Node
    //@mapNode : MapNode
    //@cr : int
    _renderNodes(mapNode){
        //Create the SVG element circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")

        //Styling the circle
        circle.setAttribute("cx",mapNode.x*this.scale);
        circle.setAttribute("cy",mapNode.y*this.scale);
        circle.setAttribute("r",this.nodeRadius);
        //Affect Color
        circle.setAttribute("fill",NODE_COLORS[mapNode.type] ?? this.fill);

        //append in svgEl
        this.svgEl.append(circle);
    }

    //PUBLIC METHOD
    //Method to Render the Map
    //@mapNode : MapNode
    render(){
        //Creation of the Line
        for(const connection of this.connections){
            this._renderConnections(connection);
        }

        //Creation of the Node
        for(const mapNode of this.mapNodes){
            this._renderNodes(mapNode);
        }
    }
}