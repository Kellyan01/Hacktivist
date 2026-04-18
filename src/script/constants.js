//Mode Constant
export const MODE = {
    GHOST : "Ghost",
    RED_ALERT : "RedAlert"
};

//Phase Constant
export const PHASE = {
    PLAYER_TURN : "playerTurn",
    ENEMY_TURN : "enemyTurn",
    DISCARD : "discardPhase"
};

//Status Name Constant
export const STATUS = {
    NEUTRALIZED : "Neutralized",
    SHIELD : "Shield"
}

//Card Type Constant
export const TYPE_CARD = {
    MATRIX : "Matrice",
    GROUND : "Terrain",
    COMBAT : "Confrontation",
    ATTACK : "Attaque",
    SOCIAL : "Social Engineering"
}

//Character Type Constant
export const TYPE_CHARACTER = {
    HUMAN : "Human",
    HACKTIVIST : "Hacktivist",
    MATRIX : "Matrice"
}

//Vulnerabilty Type Constant
export const TYPE_VULNERABILITY = {
    FINANCIAL : 'Financial'
}

//Status Type Constant
export const TYPE_STATUS = {
    BUFF : "Buff",
    DEBUFF : "Debuff"
}

//Action Type Constant
export const TYPE_ACTION = {
    ATTACK : "Attack",
    HEAL : "Heal",
    BUFF :"Buff"
}

//Event List Constant
export const EVENT_LIST = {
    COMBAT_START : "combatStart",
    CARD_PLAYED : "cardPlayed",
    PHASE_CHANGED : "phaseChanged",
    MODE_CHANGED : "modeChanged",
    ENEMY_ACTION : "enemyAction",
    EXPLOIT_GENERATED : 'exploitGenerated',
    COMBAT_END : "combatEnd"
}

//Action List Constant
export const ACTION_LIST = {
    ATTAQUE_BASIQUE : "attaqueBasique",
    BOUCLIER : "bouclier",
    SOIN : "soin"
}

//Condition List Constant
export const CONDITION_LIST = {
    SELF_NO_SHIELD : "noShield",
    HALF_HP : "halfHP"
}

//Node Type List Constant
export const NODE_TYPE_LIST = {
    COMBAT : "combat",
    EVENT : "event",
    REST : "rest",
    MERCHANT : "merchant",
    BOSS : "boss",
    START : "start",
    END : "end",
    MYSTERY : "mystery",
    STORY : "story",
    TREASURE : "treasure"
}

//Chance Node List CONSTANT
export const NODE_TYPE_CHANCE = {
    "combat" :  45,
    "event" : 20,
    "rest" : 10,
    "merchant" : 10,
    "mystery" : 15
}

//Color Node List CONSTANT
export const NODE_COLORS = {
    "combat" :  "orange",
    "event" : "purple",
    "rest" : "green",
    "merchant" : "yellow",
    "boss" : "red",
    "start" : "blue",
    "mystery" : "gray",
    "current" : "white",
    "reachable" : "cyan"
}

//Weight of each type for Spatial Gradient
export const NODE_TYPE_WEIGHTS = {
    "combat" : (t) => 60 - t * 50,   // beaucoup en début de run, moins vers la fin
    "event" : (t) => 10 + t * 30,   // rare au début, fréquent vers la fin
    "rest" : (t) => 5 + t * 20,   // pareil, on en a besoin plus vers la fin
    "merchant" : (t) => 15 - t * 10,
    "mystery" : (t) => 10 + t *  10
};

//Dimension of Map
export const DIMENSION_MAP = {
    WIDTH : 25,
    HEIGHT : 40,
    SCALE : 20
}