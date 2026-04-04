import {Player} from "../entities/characterEntities/Player.js";
import {Enemy} from "../entities/characterEntities/Enemy.js";
import { VirementAnonyme } from "../entities/cardEntities/VirementAnonyme.js";


//Class that handles combat between the player and the enemy
/*
@player : Player
@enemies : Enemy[]
@initPlayer : boolean
@energyPerTurn : number
@handSize : number
*/
export class CombatEngine {
    constructor(player, enemies, initPlayer, energyPerTurn, handSize) {
        this.player = player;
        this.enemies = enemies;
        this.initPlayer = initPlayer;
        this.energyPerTurn = energyPerTurn;
        this.handSize = handSize;
        this.turnCount = 0;
        this.mode = "Ghost";
        this.isOver = false;
    }

    //PRIVATE METHODS
    //Method to initalize energy
    _initializeEnergy() {
        this.player.energy = this.energyPerTurn;
    }

    //Methode to increase turn count
    _updateTurn(){
        this.turnCount++;
    }

    //Method to inceade alert
    _updateAlert() {
        this.player.alert = Math.min(100, this.player.alert + 10);
    }

    //Method to check Alert, random dectection
    _verifyAlertAtRandom(){
        //1. random number between 0 and 100
        const randomNum = Math.random() * 100;
        //2. if the number is less than the player's alert, the player is detected and return true
        if (randomNum <= this.player.alert) {
            this.switchGhostToRedAlert();
            return true;
        }
        //3. else return false
        return false;
    }

    //Method to check Alert
    _verifyAlert(){
        if (this.player.alert >= 100) {
            this.switchGhostToRedAlert();
            return true;
        }
        return false;
    }

    //Method pour shuffle the player deck
    _shuffleDeck() {
        //for each card in the deck, swap it with a random card int the deck
        for(let i = 0; i < this.player.deck.length; i++){
            const randomIndex = Math.floor(Math.random()*this.player.deck.length);
            [this.player.deck[i], this.player.deck[randomIndex]] = [this.player.deck[randomIndex], this.player.deck[i]];
        }
    }

    //Method to shuffle Discard into Deck
    _shuffleDiscardInDeck() {
        //add discard to deck
        this.player.deck = this.player.deck.concat(this.player.discard);
        //empty discard
        this.player.discard = [];
        //shuffle deck
        this._shuffleDeck();
    }

    //Method to draw cards
    _drawCards() {
        //if the deck is empty, shuffle discard into deck
        if (this.player.deck.length === 0) {
            this._shuffleDiscardInDeck();
        }

        //if hand size is reached or deck is empty, stop drawing
        if(this.player.hand.length === this.handSize || this.player.deck.length === 0) return;

        //draw a card
        this.player.hand.push(this.player.deck.pop());
        
        //call the method recursively until hand size is reached
        this._drawCards();
    }

    //Method to discard a Card
    //@card : AbstractCard
    _discardCard(card) {
        //remove the card from the hand
        const index = this.player.hand.indexOf(card);
        if (index > -1) {
            this.player.hand.splice(index, 1);
            //add the card to the discard
            this.player.discard.push(card);
        }
    }

    //Method to update Status
    //@character : AbstractCharacter
    _updateStatus(character) {
        //if character has Status, decrease their duration and remove them if they are expired
        if(character.status.length > 0){
            for(const status of character.status){
                status.duration--;
            }

            //remove the expired status
            character.status = character.status.filter(status => {
                return status.duration > 0;
            })
        }
    }

    //Method to show Enemy Intentions
    _showIntentions(){
        for(const enemy of this.enemies){
            //show intention if not 0 health or neutralized
            const isNeutralized = enemy.status.some(status => status.name === "Neutralized");
            if(enemy.health > 0 && !isNeutralized){
                console.log(`${enemy.name} intends to ${enemy.intention.description}`);
            }
        }
    }

    //Method to verify Data Threshold
    //@enemy : Enemy
    _verifyData(enemy){
        if(enemy.dataThreshold !== undefined && this.player.data >= enemy.dataThreshold){
            //Add exploit card to player deck
            const exploitCard = this._generateExploitCard(enemy);
            if(exploitCard !== null){
                this.player.deck.push(exploitCard);
                console.log(`Data threshold reached for ${enemy.name}. ${exploitCard.name} added to deck.`);
                //All data was found for this enemy -> Change enemy.dataThreshold
                enemy.dataThreshold = undefined;
            }
            //shuffle deck to make sure the card can be drawn
            this._shuffleDeck();
            return enemy.vulnerability;
        };
    }

    //Method to make the enemy act then change intention
    //@enemy : Enemy
    _enemyAction(enemy){
        enemy.act(this.player, this.enemies);
        this._changeIntention(enemy);
    }

    //Method to generate an exploit card
    //@enemy : Enemy
    _generateExploitCard(enemy){
        switch(enemy.vulnerability){
            case "Financial":
                return new VirementAnonyme();
            default:
                return null;
        }
    }

    //Method to change Enemy Intention
    //@enemy : Enemy
    _changeIntention(enemy){
        enemy.intention = enemy.actionsList[Math.floor(Math.random()*enemy.actionsList.length)];
    }

    //Method to handle player turn
    _playerTurn(){
        //Enemy datas
        //a. show intentions
        this._showIntentions();
        //Player datas
        //a. Update Status
        this._updateStatus(this.player);
        //b. reinitialize energy
        this._initializeEnergy();
        //c. draw cards
        this._drawCards();
    }

    //Method to handle enemy turn
    _enemyTurn(){
        //if ghost mode, verify alert
        if(this.mode === "Ghost"){
            //a update alert
            this._updateAlert();
            //b. verify alert
            this._verifyAlert() ? this.mode = "RedAlert" : null;
        }

        //if RedAlert mode -> enemy actions
        if(this.mode === "RedAlert"){
            //a. update satus
            for(const enemy of this.enemies){
                this._updateStatus(enemy);
            }
            //b. enemy actions if not 0 health or neutralized 
            for(const enemy of this.enemies){
                //verify neutralized status
                const isNeutralized = enemy.status.some(status => status.name === "Neutralized");
                if(enemy.health > 0 && !isNeutralized){
                    this._enemyAction(enemy);
                    //Verify victory condition
                    const winner = this.verifyVictory();
                    if(winner){
                        this.endFight();
                        return winner;
                    }
                }
            }
        }
    }

    //PRUBLIC METHODS
    //Method to lauch the combat
    launchFight(){
        //1. shuffle the player deck
        this._shuffleDeck();
        //2. Ghost Mode
        this.mode = "Ghost";
        //3. Initialize enemy Inentions
        for(const enemy of this.enemies){
            this._changeIntention(enemy);
        }
        //4. Player Started Hand
        this._drawCards();
        //5. Initialize Energy
        this._initializeEnergy();
        //6. Initialize Turn Count
        this.turnCount = 0;
        //7. Handle initial player turn if needed
        if(!this.initPlayer){
            //Enemy turn
            //a. Enemy Act
            for(const enemy of this.enemies){
                this._enemyAction(enemy);
                //Verify victory condition
                const winner = this.verifyVictory();
                if(winner){
                    this.endFight();
                    return winner;
                }
            }
            //b. then change turn
            this.switchTurn();
        }
    }

    //Method to change turn
    /*
    If initPlayer is true, the player starts first and acts on odd turns, else the enemies start first and act on even turns.
    */
    switchTurn(){
        //Verify isOver
        if(this.isOver){
            return;
        }
        //1. Update Turn Count
        this._updateTurn();
        //2. Verify initPlayer and Modulo 2
        //player turn
        if((this.initPlayer && this.turnCount % 2 === 0) || (!this.initPlayer && this.turnCount % 2!== 0) ){
            this._playerTurn();
        }
        //enemy turn
        else{
            const isVictory = this._enemyTurn();
            //Verify victory condition
            if(isVictory){
                return isVictory;
            }
            this.switchTurn();
        }
    }

    //Method to switch from Ghost to Red Alert mode
    switchGhostToRedAlert(){
        this.mode = "RedAlert";
        console.log("You have been detected! Switching to Red Alert mode.");
    }

    //Method to verify combat winner
    verifyVictory(){
        //1. if player health is less than or equal to 0, enemies win
        if(this.player.health <= 0){
            return this.enemies;
        }
        //2. if all enemies have 0 health or are neutralized, player wins
        if(this.enemies.every(enemy => enemy.health <= 0 || enemy.status.some(status => status.name === "Neutralized"))){
            return this.player;
        }
        //3. else, combat is not over
        return null;
    }

    //Method to end combat
    endFight(){
        this.isOver = true;
        this.player = null;
        this.enemies = null;
    }

    //Method to play card
    /*
    @card : AbstractCard
    @targets : AbstractCharacter[]
    */
    playCard(card, targets = []){
        //1. Verify that player has enough energy to play the card
        if(this.player.energy < card.cost){
            throw new Error("Not enough energy to play this card.");
        }
        //2. Deduct the energy cost of the card
        this.player.energy -= card.cost;
        //3. Play the card effect
        card.effect(this.player, targets);
        //4. Discard the card
        this._discardCard(card);
        //5. Verify victory condition
        const winner = this.verifyVictory();
        if(winner){
            this.endFight();
            return winner;
        }
        //7. Verif Data
        for(const enemy of targets){
            this._verifyData(enemy);
        }
        //6. Verify Ghost Mode
        if(this.mode === "Ghost" && card.type !== "Matrice" && card.type !=="Terrain"){
            this.switchGhostToRedAlert();
        }
    }
}