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
            return true;
        }
        //3. else return false
        return false;
    }

    //Method to check Alert
    _verifyAlert(){
        if (this.player.alert >= 100) {
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
    _updateStatus() {
        //if player has Status, decrease their duration and remove them if they are expired
        if(this.player.status.length > 0){
            for(const element of this.player.status){
                element.duration--;
            }

            //remove the expired status
            this.player.status = this.player.status.filter(status => {
                return status.duration > 0;
            })
        }

        //for each enemy, do the same
        for(const enemy of this.enemies){
            if(enemy.status.length > 0){
                for(const element of enemy.status){
                    element.duration--;
                }

                //remove the expired status
                enemy.status = enemy.status.filter(status => {
                    return status.duration > 0;
                })
            }
        }
        
    }

    //Method to show Enemy Intentions
    _showIntentions(){
        for(const enemy of this.enemies){
            console.log(`${enemy.name} intends to ${enemy.intention.description}`);
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
            }
            //shuffle deck to make sure the card can be drawn
            this._shuffleDeck();
            return enemy.vulnerability;
        };
    }

    //Method to make the enemy act
    _enemyAction(enemy){
        enemy.act();
    }

    //Method to generate an exploit card
    _generateExploitCard(enemy){
        switch(enemy.vulnerability){
            case "Financial":
                return new VirementAnonyme();
            default:
                return null;
        }
    }
}