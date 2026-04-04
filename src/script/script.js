    import {Player} from './entities/characterEntities/Player.js';
    import {Brouilleur} from './entities/cardEntities/Brouilleur.js';
    import {FirewallPersonnel} from './entities/cardEntities/FirewallPersonnel.js';
    import {FrappeCybernetique} from './entities/cardEntities/FrappeCybernetique.js';
    import {ScanBasique} from './entities/cardEntities/ScanBasique.js';
    import { VirementAnonyme } from './entities/cardEntities/VirementAnonyme.js';
    import {GardeDeNuit} from './entities/characterEntities/GardeDeNuit.js';
    import {CombatEngine} from './game/CombatEngine.js';
    import { CombatUI } from './game/CombatUI.js';  

//Function Combat test End to End
function combatTestE2E(){
    //Function to show player data in the console
    function showPlayerData(player) {
        console.log("Player Name:", player.name);
        console.log("Player Type:", player.type);
        console.log("Player Health:", player.health);
        console.log("Player Energy:", player.energy);
        console.log("Player Alert:", player.alert);
        console.log("Player Data:", player.data);
        console.log("Player Deck:", player.deck);
        console.log("Player Discard:", player.discard);
        console.log("Player Hand:", player.hand);
        if(player.status.length > 0){
            console.log("Player Status:");
            for(const status of player.status){
                console.log(status.name+" - "+status.duration+" tours");
            }
            
        }
        console.log("------------------------------");
    }

    //Function to show enemy data in the console
    function showEnemyData(enemy) {
        console.log("Enemy Name:", enemy.name);
        console.log("Enemy Type:", enemy.type);
        console.log("Enemy Health:", enemy.health);
        console.log("Enemy Vulnerability:", enemy.vulnerability);
        console.log("Enemy Intention:", enemy.intention.name);
        console.log("Enemy Status:", enemy.status);
        console.log("------------------------------");
    }

    //Function to show combat data in the console
    function showCombatData(combatEngine, player, enemy) {
        console.log("Combat Data:");
        console.log("Turn:", combatEngine.turnCount + 1);
        console.log("Mode:", combatEngine.mode);
        console.log("------------------------------");
        showPlayerData(player);
        showEnemyData(enemy);
        console.log("------------------------------");
    }

    //Function pour afficher la victoire ou la défaite
    function displayVictory(victory){
        if(victory){
        if(victory.type === "Hacktivist"){
            console.log("/////////////////////////////")
            console.log("PLAYER WINS !")
            console.log("/////////////////////////////")
        }else{
            console.log("/////////////////////////////")
            console.log("ENEMY WIN !")
            console.log("/////////////////////////////")
        }
    }
    }

    //Test Combat Script
    //1. Create a player and his deck
    const playerDeck = [
        //new Brouilleur(),
        new FirewallPersonnel(),
        new FrappeCybernetique(),
        new FirewallPersonnel(),
        new FrappeCybernetique(),
        //new ScanBasique()
        //new VirementAnonyme()
    ];
    const player = new Player("John Doe","Hacktivist",50,3,0,0,playerDeck);

    //2. Create an enemy
    const gardeDeNuit = new GardeDeNuit();

    //3. Create a combat engine and start the combat
    const combatEngine = new CombatEngine(player, [gardeDeNuit], true, 3, 3);
    let victory = combatEngine.launchFight();
    displayVictory(victory);

    //Player can play cards, attack, defend, etc. using the combat engine methods.
    showCombatData(combatEngine, player, gardeDeNuit);

    //While player has more than 1 card in hand and more than 0 energy, play the first card in hand
    while(!combatEngine.isOver){
        while (player.energy > 0 && player.hand.length > 1 && !combatEngine.isOver) {
            //For testing, we will just play the first card in the player's hand
            const cardToPlay = player.hand[0];
            console.log("///////////////////////////////////");
            console.log("Player plays:", cardToPlay.name);
            console.log("///////////////////////////////////");
            victory = combatEngine.playCard(cardToPlay,[gardeDeNuit]);
            displayVictory(victory)
            showCombatData(combatEngine, player, gardeDeNuit);
        }
        //Enemy turn
        if(!combatEngine.isOver){
            if(combatEngine.mode === 'RedAlert'){
                console.log("///////////////////////////////////");
                console.log("Enemy's turn in Red Alert mode!");
                console.log("Enemy acts with :", gardeDeNuit.intention.name);
                console.log("///////////////////////////////////");
            }
            victory = combatEngine.switchTurn();
            displayVictory(victory)
            showCombatData(combatEngine, player, gardeDeNuit);
        }
    }
}

//Test Combat Script
//1. Create a player and his deck
const playerDeck = [
    new Brouilleur(),
    new FirewallPersonnel(),
    new FrappeCybernetique(),
    new ScanBasique()
    //new VirementAnonyme()
];
const player = new Player("John Doe","Hacktivist",50,3,0,0,playerDeck);

//2. Create an enemy
const gardeDeNuit = new GardeDeNuit();

//3. Create a combat engine and start the combat
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const combatEngine = new CombatEngine(player, [gardeDeNuit], true, 3, 3, async enemy => {
    const info = document.querySelector("#info");
    info.textContent = `${enemy.name} effectue : ${enemy.intention.name}`;
    await sleep(1500);
    //ou bien sleep();
    info.textContent = "";
});

//4. Create Combat UI
const ui = new CombatUI(combatEngine,player,[gardeDeNuit]);

//5. Launch Combat, then UI
combatEngine.launchFight();
ui.bindEvents();
ui.render();
    