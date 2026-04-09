
//Class for Combat User Interface
/*
@combatEngine : CombatEngine
@player : Player
@enemies : Enemy[]
@gameEl = NodeElement
@enemyZoneEl = NodeElement
@playerStatsEl : NodeElement
@playerStatusEl = NodeElement
@handZoneEl : NodeElement
@btnEndTurn : NodeElement
@btnPlay : NodeElement
@selectedCard : AbstractCard | null
@combatResultEl : NodeElement
@selectedToDiscard : Array[AbstractCard]
*/
export class CombatUI{
    constructor(combatEngine, player, enemies){
        this.combatEngine = combatEngine;
        this.player = player;
        this.enemies = enemies;
        this.gameEl = document.querySelector("#game");
        this.enemyZoneEl = document.querySelector("#enemy-zone");
        this.playerStatsEl = document.querySelector(".player-stats");
        this.playerStatusEl = document.querySelector(".player-status");
        this.handZoneEl = document.querySelector("#hand-zone");
        this.btnEndTurn = document.querySelector("#btn-end-turn");
        this.btnPlay = document.querySelector("#btn-play");
        this.selectedCard = null;
        this.combatResultEl = document.querySelector("#combat-result");
        this.btnDiscard = document.querySelector("#btn-discard");
        this.selectedToDiscard = [];
    }

    //PRIVATE METHODS
    //Method to Handle Combat Result
    //@result : Player || Enemy[] || null
    _handleCombatResult(result){
        if(result){
            this.btnEndTurn.style.display = "none";
            this.btnPlay.style.display = "none";
            this.btnDiscard.style.display = "none";
            if(result === this.player){
                this.combatResultEl.textContent = "Victoire !";
            }else{
                this.combatResultEl.textContent = "Défaite !";
            }
        }
    }

    //Method for render the Combat Mode
    _renderMode(){
        if(this.combatEngine.mode === "Ghost"){
            this.gameEl.classList.add("ghost-mode");
            this.gameEl.classList.remove("red-alert-mode");
        }else{
            this.gameEl.classList.remove("ghost-mode");
            this.gameEl.classList.add("red-alert-mode");
        }
    }

    //Method for render the Enemies Stats : name, health, intention, status
    _renderEnemies(){
        //Empty the Enemies Zone
        this.enemyZoneEl.replaceChildren();

        //Regenerate the Enemies Stats
        for(const enemy of this.enemies){
            //Create <article> for the enemy
            const enemyCard = document.createElement("article");
            enemyCard.classList.add("enemy-card");

            //Regenerate Enemy Stat
            const name = document.createElement("p");
            name.textContent = `${enemy.name}`;
            name.classList.add("enemy-name");
            const health = document.createElement("p");
            health.textContent = `PV : ${enemy.health}`;
            health.classList.add("enemy-hp");    
            const data = document.createElement("p");
            data.textContent = `Datas : ${enemy.data}`;

            //Regenerate Intention
            const intention = document.createElement("p");
            intention.classList.add("enemy-intention");
            if(enemy.intention){
                intention.textContent = `Intention : ${enemy.intention.name}`;
            }else{
                intention.textContent = "Aucune Intention";
            }

            //Regenerate Enemy Status
            const statusZone = document.createElement("section");
            statusZone.classList.add("enemy-status");
            if(enemy.status.length <= 0){
                const status = document.createElement("p");
                status.textContent = "Aucun Status";
                statusZone.append(status);
            }else{
                for(const status of enemy.status){
                    const statusEl = document.createElement("p");
                    statusEl.textContent = `${status.name} - ${status.duration} tours`;
                    statusZone.append(statusEl);
                }
            }

            //Add Stat and Status to Enemy Article
            enemyCard.append(name, health, data, intention, statusZone);
            enemyCard.dataset.index = this.enemies.indexOf(enemy);

            //Add Enemy Article to Enemies Zone
            this.enemyZoneEl.append(enemyCard);
        }
    }

    //Method for render the Player Hand
    _renderHand(){
        //Empty the Hand Zone
        this.handZoneEl.replaceChildren();

        //Regenerate the Hand Card
        for(const card of this.player.hand){
            //Create <article> for the card
            const handCard = document.createElement("article");
            handCard.classList.add("card");

            //Regenerate Card Stat
            const name = document.createElement("p");
            name.textContent = `${card.name}`;
            const type = document.createElement("p");
            type.textContent = `Type : ${card.type}`;
            const cost = document.createElement("p");
            cost.textContent = `Coût : ${card.cost}`;
            const description = document.createElement("p");
            description.textContent = `${card.description}`;

            //Verify if card is selected
            if(card === this.selectedCard){
                handCard.classList.add("selected");
            }

            //Verify if it's Discard Phase
            if(this.combatEngine.phase === "discardPhase"){
                //Add class .selected to .card if card is in selectedToDiscard
                if(this.selectedToDiscard.includes(card)){
                    handCard.classList.add("selected");
                }
            }

            //Add Stat to Hand Card Article
            handCard.append(name, type, cost, description);
            handCard.dataset.index = this.player.hand.indexOf(card);

            //Add Hand Card Article to Player Hand Zone
            this.handZoneEl.append(handCard);
        }
    }

    //Method for render the Player Datas : name, health, energy,data, alert, status
    _renderPlayer(){
        //Empty the Player Zone
        this.playerStatsEl.replaceChildren();
        this.playerStatusEl.replaceChildren();

        //Regenerate the Player Stats
        const name = document.createElement("p");
        name.textContent = `${this.player.name}`;
        const health = document.createElement("p");
        health.textContent = `PV : ${this.player.health}`;
        const energy = document.createElement("p");
        energy.textContent = `Energie : ${this.player.energy}`;
        const alert = document.createElement("p");
        alert.textContent = `Niveau d'Alerte : ${this.player.alert}`;

        //Add Player Stats to Player Zone
        this.playerStatsEl.append(name,health,energy,alert);

        //Regenerate Player Status
        if(this.player.status.length <= 0){
            const status = document.createElement("p");
            status.textContent = "Aucun Status";
            this.playerStatusEl.append(status);
        }else{
            for(const status of this.player.status){
                const statusEl = document.createElement("p");
                statusEl.textContent = `${status.name} - ${status.duration} tours`;
                this.playerStatusEl.append(statusEl);
            }
        }

        //Display or Hidde Discard Button and End Turn Button
        if(this.combatEngine.isOver){
            this.btnDiscard.style.display = "none";
            this.btnEndTurn.style.display = "none";
        }else{
            if(this.combatEngine.phase === "discardPhase"){
                this.btnDiscard.style.display = "inline";
                this.btnEndTurn.style.display = "none";
            }else if(this.combatEngine.phase === "playerTurn"){
                this.btnDiscard.style.display = "none";
                this.btnEndTurn.style.display = "inline";
            }else{
                this.btnDiscard.style.display = "none";
                this.btnEndTurn.style.display = "none";
            }
        }
    }

    //Method to select a card
    //@card : AbstractCard
    _selectCard(card){
        if (this.combatEngine.isOver) return;
        if(this.selectedCard === card){
            this.selectedCard = null;
            this.btnPlay.style.display = "none";
        }else{
            this.selectedCard = card;
            card.targeted ? this.btnPlay.style.display = "none" : this.btnPlay.style.display = "block";
        }
        this.render();
    }

    //Method to select cards during Discard Phase
    //@cards : Array[AbstractCard]
    _selectCardToDiscard(card){
        //Verify if combat is over -> return
        if (this.combatEngine.isOver) return;
        //Take index of selected card
        const index = this.selectedToDiscard.indexOf(card)
        //Verify if card is in this.selectedToDiscard
        if(this.selectedToDiscard.includes(card)){
            this.selectedToDiscard.splice(index,1);
        }else{
            this.selectedToDiscard.push(card);
        }
        this.render();
    }

    //Method to select an enemmy
    //@enemy : Enemy
    async _targetEnemy(enemy){
        if (this.combatEngine.isOver) return;
        if(this.selectedCard){
            //Verify Enemy Targeting Validation
            if(this.selectedCard.targetValidation){
                const validTargets = this.selectedCard.targetValidation.effect(this.selectedCard, [enemy]);
                if(validTargets.length === 0) {
                    const info = document.querySelector('#info');
                    info.textContent = "Cible non valide";
                    return;
                }
            }   
            //Play Card
            const result = await this.combatEngine.playCard(this.selectedCard, [enemy]);
            this._handleCombatResult(result)
            this.selectedCard = null;
            this.render();
        }
    }


    //PUBLIC METHODS
    //Method to add EventListener
    bindEvents(){
        //Click on a Card
        this.handZoneEl.addEventListener("click", event => {
            //Verify if click on a card
            const cardEl = event.target.closest(".card");
            if (!cardEl) return;
            const index = cardEl.dataset.index;
            const card = this.player.hand[index];
            if(this.combatEngine.phase === "playerTurn"){
                this._selectCard(card);
            }
            else if(this.combatEngine.phase === "discardPhase"){
                this._selectCardToDiscard(card);
            }
        })

        //Click on an Enemy
        this.enemyZoneEl.addEventListener("click",event => {
            //Verify if click on a Enemy
            const enemyEl = event.target.closest(".enemy-card");
            if (!enemyEl) return;
            const index = enemyEl.dataset.index;
            const enemy = this.enemies[index];
            this._targetEnemy(enemy);
        })

        //Click on button Play Card
        this.btnPlay.addEventListener("click", async event => {
            const result = await this.combatEngine.playCard(this.selectedCard);
            this._handleCombatResult(result);
            this.selectedCard = null;
            this.btnPlay.style.display = "none";
            this.render();
        })

        //Click on button to End Turn
        this.btnEndTurn.addEventListener("click", async event => {
            //const result = await this.combatEngine.switchTurn();
            //this._handleCombatResult(result)

            //Enter in Discard Phase
            this.combatEngine.discardPhase();
            this.render();
        })

        //Click on button to Discard Cards during Discard Phase
        this.btnDiscard.addEventListener("click", async event => {
            //Discard cards in this.selecedToDiscard
            //Discard each card
            this.combatEngine.launchDiscard(this.selectedToDiscard);
            //Empty this.selectedToDiscard
            this.selectedToDiscard = [];
            //Switch Turn
            this.btnDiscard.style.display = "none";
            this.render();
            const result = await this.combatEngine.switchTurn();
            this._handleCombatResult(result);
            this.render();
        })
    }

    //Method for rendering the scene
    render(){
        this._renderMode();
        this._renderPlayer();
        this._renderEnemies();
        this._renderHand();
    }
}