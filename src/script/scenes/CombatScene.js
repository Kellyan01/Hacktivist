import { AbstractScene } from "./AbstractScene.js";
import {CombatEngine} from "../game/CombatEngine.js";
import {CombatUI} from "../game/CombatUI.js";
import { EVENT_LIST } from "../constants.js";

//Class to launch Combat Scenes
/*
@gameController : GameController
@player : Player
@enemies : Enemy[]
@energyPerTurn : int
@handSize : int
*/
export class CombatScene extends AbstractScene{
    constructor(gameController, player, enemies, energyPerTurn, handSize){
        super(gameController);
        this.player = player;
        this.enemies = enemies;
        this.energyPerTurn = energyPerTurn;
        this.handSize = handSize;
        this.combatEngine = new CombatEngine(this.player, this.enemies,true,this.energyPerTurn,this.handSize);
        this.combatUI = new CombatUI(this.combatEngine,this.player,this.enemies);
    }

    //PUBLIC METHOD
    //Method to launch combat scene
    launch(){
        //launch fight
        this.combatEngine.launchFight();
        //bind emitter on UI
        this.combatUI.bindEmitter();
        //bind events on ui
        this.combatUI.bindEvents();
        //reset combat result message
        this.combatUI.combatResultEl.replaceChildren();
        //render the ui
        this.combatUI.render();
        //subscribe ton end of fight
        this.combatEngine.emitter.on(EVENT_LIST.COMBAT_END, result => {
                    this.gameController.onCombatEnd(result);
        });
    }
}