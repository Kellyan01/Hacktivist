    import {Player} from './entities/characterEntities/Player.js';
    import {Brouilleur} from './entities/cardEntities/Brouilleur.js';
    import {FirewallPersonnel} from './entities/cardEntities/FirewallPersonnel.js';
    import {FrappeCybernetique} from './entities/cardEntities/FrappeCybernetique.js';
    import {ScanBasique} from './entities/cardEntities/ScanBasique.js';
    import { VirementAnonyme } from './entities/cardEntities/VirementAnonyme.js';
    import {GardeDeNuit} from './entities/characterEntities/GardeDeNuit.js';
    import {CombatEngine} from './game/CombatEngine.js';
    import { CombatUI } from './game/CombatUI.js';  

//Test Combat Script
//1. Create a player and his deck
const playerDeck = [
    new Brouilleur(),
    new FirewallPersonnel(),
    new FrappeCybernetique(),
    new ScanBasique()
    //new VirementAnonyme()
];
const player = new Player("John Doe","Hacktivist",50,50,3,0,playerDeck);

//2. Create an enemy
const gardeDeNuit = new GardeDeNuit();
const garde = new GardeDeNuit()

//Declare ui for Combat UI
let ui;

//3. Create a combat engine and start the combat
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const combatEngine = new CombatEngine(player, [gardeDeNuit,garde], true, 3, 3, async enemy => {
    ui.render()
    const info = document.querySelector("#info");
    info.textContent = `${enemy.name} effectue : ${enemy.intention.name}`;
    await sleep(1500);
    //ou bien sleep();
    info.textContent = "";
});

//4. Create Combat UI
ui = new CombatUI(combatEngine,player,[gardeDeNuit,garde]);

//5. Launch Combat, then UI
combatEngine.launchFight();
ui.bindEvents();
ui.render();
    