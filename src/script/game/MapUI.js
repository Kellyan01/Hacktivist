import {NODE_COLORS} from '../constants.js';

//Class to render the UI of navigation on map
/*
@svgEl : HTMLElement
@mapNodes : MapNode[]
@connections : Connection[]
@scale : int
@navigator : Navigtor
*/
export class MapUI {
    constructor(svgEl, mapNodes, connections, scale, navigator){
        this.svgEl = svgEl;
        this.mapNodes = mapNodes;
        this.connections = connections;
        this.scale = scale;
        this.navigator = navigator;
        this.stroke = "gray";
        this.strokeWidth = 1;
        this.fill = "black";

    }

    //METHOD PUBLIC
    //Method to listen a click on node
    //@onNodeClick : MapNode
    bindEvents(onNodeClick){
        this.svgEl.addEventListener("click", event => {
            if(event.target.hasAttribute("data-node-id")){
                const id = parseInt(event.target.getAttribute("data-node-id"));

                onNodeClick(this.mapNodes[id]);
            }
        })
    }

    //Methode to make the render
    render(){
        //empty the SVG element
        this.svgEl.replaceChildren();

        //1. RENDER Connexions
        for(const connection of this.connections){
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

        //2. RENDER node
        for(const node of this.mapNodes){
            //Create the SVG element circle
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")

            //Styling the circle
            circle.setAttribute("cx",node.x*this.scale);
            circle.setAttribute("cy",node.y*this.scale);
            circle.setAttribute("r",5);
            circle.setAttribute("data-node-id", node.id)
            //Affect Color
            circle.setAttribute("fill",NODE_COLORS[node.type] ?? this.fill);

            //append in svgEl
            this.svgEl.append(circle);
        }

        //3. RENDER navigation
        //Current Node
        const currentNode = this.navigator.getCurrentNode();
        //Create the SVG element circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")

        //Styling the circle
        circle.setAttribute("cx",currentNode.x*this.scale);
        circle.setAttribute("cy",currentNode.y*this.scale);
        circle.setAttribute("r",8);
        circle.setAttribute("data-node-id", currentNode.id)
        circle.style.opacity = 0.9;
        //Affect Color
        circle.setAttribute("fill",NODE_COLORS["current"]);

        //append in svgEl
        this.svgEl.append(circle);

        //Reachable Node
        const reachableNodes = this.navigator.getReachableNodes();
        for(const node of reachableNodes){
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")

            //Styling the circle
            circle.setAttribute("cx",node.x*this.scale);
            circle.setAttribute("cy",node.y*this.scale);
            circle.setAttribute("r",8);
            circle.setAttribute("data-node-id", node.id)
            circle.style.opacity = 0.6;
            //Affect Color
            circle.setAttribute("fill",NODE_COLORS["reachable"]);

            //append in svgEl
            this.svgEl.append(circle);
        }
    }
}