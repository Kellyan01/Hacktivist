import {Player} from './entities/characterEntities/Player.js';
import {Brouilleur} from './entities/cardEntities/Brouilleur.js';
import {FirewallPersonnel} from './entities/cardEntities/FirewallPersonnel.js';
import {FrappeCybernetique} from './entities/cardEntities/FrappeCybernetique.js';
import {ScanBasique} from './entities/cardEntities/ScanBasique.js';
import {GardeDeNuit} from './entities/characterEntities/GardeDeNuit.js';
import { NODE_TYPE_LIST, TYPE_CHARACTER, DIMENSION_MAP } from './constants.js';
import { LayeredMapGenerator } from "./map/LayeredMapGenerator.js";
import { GradientStrategy } from "./map/strategies/GradientStrategy.js";
import { GameController } from './GameController.js';


function createPlayer(){
    //Create a player and his deck
    const playerDeck = [
        new Brouilleur(),
        new FirewallPersonnel(),
        new FrappeCybernetique(),
        new ScanBasique()
    ];

    return new Player("John Doe",TYPE_CHARACTER.HACKTIVIST,50,50,3,0,playerDeck);
}

function createEnemies(){
    //Create an enemy
    return [new GardeDeNuit(),new GardeDeNuit()];
}


function generateLayerMap(){
    //Generate Map
    const map = new LayeredMapGenerator(DIMENSION_MAP.WIDTH,DIMENSION_MAP.HEIGHT,2,6,8,new GradientStrategy());
    
    //Generate the Layer
    map.generateMap();

    //get mapNodes and connections
    const mapNodes = map.mapNodes;
    const connections = map.connections;

    //get startNodeId
    const startNodeId = mapNodes.find(node => node.type === NODE_TYPE_LIST.START).id;

    //Create Player
    const player = createPlayer();

    //Create enemies
    const enemies = createEnemies();

    //Instanciate GameController
    const gameController = new GameController(player,enemies,mapNodes,connections,DIMENSION_MAP.SCALE,startNodeId,3,3);

    gameController.start();
}

generateLayerMap();
    