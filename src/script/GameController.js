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
@scale : int
@startNodeId : int
@energyPerTurn : int
@handSize : int
@currentScene : AbstractScene
*/
export class GameController{
    constructor(player, enemies, mapNodes, connections, svgEl, scale, startNodeId, energyPerTurn, handSize){
        this.player = player;
        this.enemies = enemies;
        this.mapNodes = mapNodes;
        this.connections = connections;
        this.svgEl = svgEl;
        this.scale = scale;
        this.startNodeId = startNodeId;
        this.energyPerTurn = energyPerTurn;
        this.handSize = handSize;
        this.currentScene = null;
    }

    //PUBLIC METHOD
    //MEthod to launch the map
    start(){
        this.currentScene = new MapScene(this,this.mapNodes,this.connections,this.svgEl,this.scale,this.startNodeId);

        this.currentScene.launch();
    }

    //Method to launch a node scene
    enterNode(node){
        if(node.type === NODE_TYPE_LIST.COMBAT){
            this.currentScene = new CombatScene(this,this.player, this.enemies, this.energyPerTurn, this.handSize);

            this.currentScene.launch();
        }
    }

    //Method to launche MapScene at the end of combat
    onCombatEnd(result){
        this.start();
    }
}