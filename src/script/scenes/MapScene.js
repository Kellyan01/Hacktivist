import { AbstractScene } from "./AbstractScene.js";
import { Navigator } from "../game/Navigator.js";
import { MapUI } from "../game/MapUI.js";
import { FogOfWar } from "../game/FogOfWar.js";

//Class to launch the Map
/*
@gameController : GameController
@mapNodes : MapNode[]
@connections : Connection[]
@svgEl : HTMLElement
@scale : int
@startNodeId : int
@navigator : Navigator
@mapUI : MapUI
@fogOfWar : FogOfWar
*/
export class MapScene extends AbstractScene{
    constructor(gameController, mapNodes, connections, svgEl, scale, startNodeId){
        super(gameController);
        this.mapNodes = mapNodes;
        this.connections = connections;
        this.svgEl = svgEl;
        this.scale = scale;
        this.startNodeId = startNodeId;
        this.navigator = new Navigator(this.mapNodes, this.connections, this.startNodeId);
        this.mapUI = new MapUI(this.svgEl,this.mapNodes,this.connections,this.scale,this.navigator);
        this.fogOfWar = new FogOfWar();
    }

    //PRIVATE METHOD
    //Method to handle the move
    //@node : MapNode
    _onNodeClick(node){
        if(this.navigator.moveTo(node.id)){
            //lauch the fog of war
            this.fogOfWar.updateVisibility(node, this.mapNodes);
            this.mapUI.render();
            this.gameController.enterNode(node);
        }
    }

    //PUBLIC METHOD
    //Method to launch the Map Scene
    launch(){
        //lauch the fog of war
        const currentNode = this.navigator.getCurrentNode();
        this.fogOfWar.updateVisibility(currentNode, this.mapNodes);

        //render the UI
        this.mapUI.render();

        //Biend Event on map
        this.mapUI.bindEvents(node => this._onNodeClick(node));
    }
}