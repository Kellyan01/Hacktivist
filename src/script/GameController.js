import { MapScene } from "./scenes/MapScene.js";
import { CombatScene } from "./scenes/CombatScene.js";
import { NODE_TYPE_LIST } from "./constants.js";

//Controller Class of the Game
/*
@player : Player
@enemies : Enemy[]
@mapNodes : MapNode[]
@connections : Connection[]
@svgEl : HTMLElement
@mapContainerEl : HTMLElement
@combatContainerEl : HTMLElement
@scale : int
@startNodeId : int
@energyPerTurn : int
@handSize : int
@currentScene : AbstractScene
*/
export class GameController{
    constructor(player, enemies, mapNodes, connections, scale, startNodeId, energyPerTurn, handSize){
        this.player = player;
        this.enemies = enemies;
        this.mapNodes = mapNodes;
        this.connections = connections;
        this.svgEl = document.getElementById("map");
        this.mapContainerEl = document.getElementById("map-container");
        this.combatContainerEl = document.getElementById("combat-container");
        this.scale = scale;
        this.startNodeId = startNodeId;
        this.currentNodeId = startNodeId;
        this.energyPerTurn = energyPerTurn;
        this.handSize = handSize;
        this.currentScene = null;
    }

    //PRIVATE METHOD
    //Method to show combat
    _showCombat(){
        this.mapContainerEl.classList.add("hidden");
        this.combatContainerEl.classList.remove("hidden");
    }

    //Method to show map
    _showMap(){
        this.mapContainerEl.classList.remove("hidden");
        this.combatContainerEl.classList.add("hidden");
    }

    //PUBLIC METHOD
    //MEthod to launch the map
    start(){
        this.currentScene = new MapScene(this,this.mapNodes,this.connections,this.svgEl,this.scale,this.currentNodeId);

        this._showMap();

        this.currentScene.launch();
    }

    //Method to launch a node scene
    enterNode(node){
        this.currentNodeId = node.id;
        if(node.type === NODE_TYPE_LIST.COMBAT){
            this.currentScene = new CombatScene(this,this.player, this.enemies, this.energyPerTurn, this.handSize);

            this._showCombat();

            this.currentScene.launch();
        }
    }

    //Method to launche MapScene at the end of combat
    onCombatEnd(result){
        this.combatContainerEl.addEventListener("click", event => {
            this._showMap();
            this.start();
        },{once : true})
    }
}