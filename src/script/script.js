    import {Player} from './entities/characterEntities/Player.js';
    import {Brouilleur} from './entities/cardEntities/Brouilleur.js';
    import {FirewallPersonnel} from './entities/cardEntities/FirewallPersonnel.js';
    import {FrappeCybernetique} from './entities/cardEntities/FrappeCybernetique.js';
    import {ScanBasique} from './entities/cardEntities/ScanBasique.js';
    import { VirementAnonyme } from './entities/cardEntities/VirementAnonyme.js';
    import {GardeDeNuit} from './entities/characterEntities/GardeDeNuit.js';
    import {CombatEngine} from './game/CombatEngine.js';
    import { CombatUI } from './game/CombatUI.js';
    import { TYPE_CHARACTER } from './constants.js';  

//Test Combat Script
//1. Create a player and his deck
const playerDeck = [
    new Brouilleur(),
    new FirewallPersonnel(),
    new FrappeCybernetique(),
    new ScanBasique()
    //new VirementAnonyme()
];

const player = new Player("John Doe",TYPE_CHARACTER.HACKTIVIST,50,50,3,0,playerDeck);

//2. Create an enemy
const gardeDeNuit = new GardeDeNuit();
const garde = new GardeDeNuit()

//3. Create a combat engine and start the combat
const combatEngine = new CombatEngine(player, [gardeDeNuit,garde], true, 3, 3);

//4. Create Combat UI
const ui = new CombatUI(combatEngine,player,[gardeDeNuit,garde]);

//5. Launch Combat, then UI
combatEngine.launchFight();
ui.bindEmitter();
ui.bindEvents();
ui.render();
    