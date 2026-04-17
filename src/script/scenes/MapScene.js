import { AbstractScene } from "./AbstractScene.js";
import { Navigator } from "../game/Navigator.js";
import { MapUI } from "../game/MapUI.js";

//Class to launch the Map
/*
@gameController : GameController
@mapNodes : MapNode[]
@connections : Connection[]
@svgEl : HTMLElement
@scale : int
@startNodeId : int
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
    }

    //PRIVATE METHOD
    //Method to handle the move
    //@node : MapNode
    _onNodeClick(node){
        if(this.navigator.moveTo(node.id)){
            this.mapUI.render();
            this.gameController.enterNode(node);
        }
    }

    //PUBLIC METHOD
    //Method to launch the Map Scene
    launch(){
        //render the UI
        this.mapUI.render();

        //Biend Event on map
        this.mapUI.bindEvents(node => this._onNodeClick(node));
    }
}