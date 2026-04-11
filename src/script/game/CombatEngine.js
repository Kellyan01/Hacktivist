import {Player} from "../entities/characterEntities/Player.js";
import {Enemy} from "../entities/characterEntities/Enemy.js";
import { VirementAnonyme } from "../entities/cardEntities/VirementAnonyme.js";
import {MODE, PHASE, STATUS, TYPE_CARD, TYPE_VULNERABILITY, EVENT_LIST} from "../constants.js";
import { EventEmitter } from "../EventEmitter.js";


//Class that handles combat between the player and the enemy
/*
@player : Player
@enemies : Enemy[]
@initPlayer : boolean
@energyPerTurn : number
@handSize : number
@turnCount : int
@mode : string "Ghost" | "RedAlert"
@isOver : boolean
@phase : string "playerTurn" | "discardPhase" | "enemyTurn"
@emitter : EventEmitter
*/
export class CombatEngine {
    constructor(player, enemies, initPlayer, energyPerTurn, handSize) {
        this.player = player;
        this.enemies = enemies;
        this.initPlayer = initPlayer;
        this.energyPerTurn = energyPerTurn;
        this.handSize = handSize;
        this.turnCount = 0;
        this.mode = MODE.GHOST;
        this.isOver = false;
        this.phase = PHASE.PLAYER_TURN;
        this.emitter = new EventEmitter();
    }

    //PRIVATE METHODS
    //Method to change Enemy Intention
    //@enemy : Enemy
    _changeIntention(enemy){
        enemy.intention = enemy.behavior.chooseAction(enemy,this.player, this.enemies);
    }

    //Method to make the enemy act then change intention
    //@enemy : Enemy
    async _enemyAction(enemy){
        enemy.act(this.player, this.enemies);
        await this.emitter.emit(EVENT_LIST.ENEMY_ACTION,enemy);
        this._changeIntention(enemy);
    }   

    //Method to handle enemy turn
    async _enemyTurn(){
        //change combat phase for enemyTurn
        this.phase = PHASE.ENEMY_TURN;
        await this.emitter.emit(EVENT_LIST.PHASE_CHANGED, PHASE.ENEMY_TURN);
        //if ghost mode, verify alert
        if(this.mode === MODE.GHOST){
            //a update alert
            this._updateAlert();
            //b. verify alert
            this._verifyAlert();
        }

        //if RedAlert mode -> enemy actions
        if(this.mode === MODE.RED_ALERT){
            //a. update satus
            for(const enemy of this.enemies){
                this._updateStatus(enemy);
            }
            //b. enemy actions if not 0 health or neutralized 
            for(const enemy of this.enemies){
                //verify neutralized status
                const isNeutralized = enemy.status.some(status => status.name === STATUS.NEUTRALIZED);
                if(enemy.health > 0 && !isNeutralized){
                    await this._enemyAction(enemy);
                    //Verify victory condition
                    const winner = this.verifyVictory();
                    if(winner){
                        this.endFight();
                        await this.emitter.emit(EVENT_LIST.COMBAT_END,winner);
                        return winner;
                    }
                }
            }
        }
    }

    //Method to generate an exploit card
    //@enemy : Enemy
    async _generateExploitCard(enemy){
        switch(enemy.vulnerability){
            case TYPE_VULNERABILITY.FINANCIAL:
                const card = new VirementAnonyme();
                await this.emitter.emit(EVENT_LIST.EXPLOIT_GENERATED, card);
                return card;
            default:
                return null;
        }
    } 

    //Method to initalize energy
    _initializeEnergy() {
        this.player.energy = this.energyPerTurn;
    }

    //Method to handle player turn
    async _playerTurn(){
        ////Change combat phase for playerTurn
        this.phase = PHASE.PLAYER_TURN;
        //Enemy datas
        //a. show intentions
        this._showIntentions();
        //Player datas
        //a. Update Status
        this._updateStatus(this.player);
        //b. reinitialize energy
        this._initializeEnergy();
        //c. draw cards
        this.player.deck.draw(this.handSize);
        await this.emitter.emit(EVENT_LIST.PHASE_CHANGED, PHASE.PLAYER_TURN);
    }

    //Method to show Enemy Intentions
    _showIntentions(){
        for(const enemy of this.enemies){
            //show intention if not 0 health or neutralized
            const isNeutralized = enemy.status.some(status => status.name === STATUS.NEUTRALIZED);
            if(enemy.health > 0 && !isNeutralized){
                console.log(`${enemy.name} intends to ${enemy.intention.description}`);
            }
        }
    }


    //Method to inceade alert
    _updateAlert() {
        this.player.modifyAlert(10);
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

    //Methode to increase turn count
    _updateTurn(){
        this.turnCount++;
    }

    //Method to check Alert
    _verifyAlert(){
        if (this.player.alert >= 100) {
            this.switchGhostToRedAlert();
            return true;
        }
        return false;
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

    //Method to verify Data Threshold
    //@enemy : Enemy
    async _verifyData(enemy){
        if(enemy.dataThreshold !== undefined && enemy.data >= enemy.dataThreshold){
            //Add exploit card to player deck
            const exploitCard = await this._generateExploitCard(enemy);
            if(exploitCard !== null){
                this.player.deck.cards.push(exploitCard);
                console.log(`Data threshold reached for ${enemy.name}. ${exploitCard.name} added to deck.`);
                //All data was found for this enemy -> Change enemy.dataThreshold
                enemy.dataThreshold = undefined;
            }
            //shuffle deck to make sure the card can be drawn
            this.player.deck.shuffle();
            return enemy.vulnerability;
        };
    }


    //PRUBLIC METHODS
    //Method to Handle Discard Phase
    async discardPhase(){
        //change combat phase for discardPhase
        this.phase = PHASE.DISCARD;
        await this.emitter.emit(EVENT_LIST.PHASE_CHANGED, PHASE.DISCARD);

    }

    //Method to end combat
    endFight(){
        this.isOver = true;
    }

    //Method to Launch Discard during Discard Phase
    //@cards : array[AbstractCard]
    launchDiscard(cards){
        for(const card of cards){
                this.player.deck.discardCard(card);
        }
    }

    //Method to lauch the combat
    async launchFight(){
        //initialize combat phase for playerTurn
        this.phase = PHASE.PLAYER_TURN; 
        await this.emitter.emit(EVENT_LIST.PHASE_CHANGED, PHASE.PLAYER_TURN);
        //1. shuffle the player deck
        this.player.deck.shuffle();
        //2. Ghost Mode
        this.mode = MODE.GHOST;
        await this.emitter.emit(EVENT_LIST.MODE_CHANGED, MODE.GHOST);
        //3. Initialize enemy Inentions
        for(const enemy of this.enemies){
            this._changeIntention(enemy);
        }
        //4. Player Started Hand
        this.player.deck.draw(this.handSize);
        //5. Initialize Energy
        this._initializeEnergy();
        //6. Initialize Turn Count
        this.turnCount = 0;
        //7. Handle initial player turn if needed
        if(!this.initPlayer){
            //Change combat phase for enemyTurn
            this.phase = PHASE.ENEMY_TURN;
            await this.emitter.emit(EVENT_LIST.PHASE_CHANGED,PHASE.ENEMY_TURN);
            //Enemy turn
            //a. Enemy Act
            for(const enemy of this.enemies){
                await this._enemyAction(enemy);
                //Verify victory condition
                const winner = this.verifyVictory();
                if(winner){
                    this.endFight();
                    await this.emitter.emit(EVENT_LIST.COMBAT_END,winner);
                    return winner;
                }
            }
            //b. then change turn
            this.switchTurn();
        }
        await this.emitter.emit(EVENT_LIST.COMBAT_START,null)
    }

    //Method to play card
    /*
    @card : AbstractCard
    @targets : AbstractCharacter[]
    */
    async playCard(card, targets = []){
        //1. Verify that player has enough energy to play the card
        if(this.player.energy < card.cost){
            throw new Error("Not enough energy to play this card.");
        }
        //2. Deduct the energy cost of the card
        this.player.energy -= card.cost;
        //3. Play the card effect
        card.effect(this.player, targets);
        //4. Discard the card
        this.player.deck.discardCard(card);
        //5. Verify victory condition
        const winner = this.verifyVictory();
        if(winner){
            this.endFight();
            await this.emitter.emit(EVENT_LIST.COMBAT_END, winner);
            return winner;
        }
        //7. Verif Data
        for(const enemy of this.enemies){
            await this._verifyData(enemy);
        }
        //6. Verify Ghost Mode
        if(this.mode === MODE.GHOST && card.type !== TYPE_CARD.MATRIX && card.type !==TYPE_CARD.GROUND){
            this.switchGhostToRedAlert();
        }
        await this.emitter.emit(EVENT_LIST.CARD_PLAYED, card);
    }

    //Method to switch from Ghost to Red Alert mode
    async switchGhostToRedAlert(){
        this.mode = MODE.RED_ALERT;
        await this.emitter.emit(EVENT_LIST.MODE_CHANGED,MODE.RED_ALERT);
        console.log("You have been detected! Switching to Red Alert mode.");
    }

    //Method to change turn
    /*
    If initPlayer is true, the player starts first and acts on odd turns, else the enemies start first and act on even turns.
    */
    async switchTurn(){
        //Verify isOver
        if(this.isOver){
            return;
        }
        //1. Update Turn Count
        this._updateTurn();
        //2. Verify initPlayer and Modulo 2
        //player turn
        if((this.initPlayer && this.turnCount % 2 === 0) || (!this.initPlayer && this.turnCount % 2!== 0) ){
            await this._playerTurn();
        }
        //enemy turn
        else{
            const isVictory = await this._enemyTurn();
            //Verify victory condition
            if(isVictory){
                return isVictory;
            }
            await this.switchTurn();
        }
    }

    //Method to verify combat winner
    verifyVictory(){
        //1. if player health is less than or equal to 0, enemies win
        if(this.player.health <= 0){
            return this.enemies;
        }
        //2. if all enemies have 0 health or are neutralized, player wins
        if(this.enemies.every(enemy => enemy.health <= 0 || enemy.status.some(status => status.name === STATUS.NEUTRALIZED))){
            return this.player;
        }
        //3. else, combat is not over
        return null;
    }
}