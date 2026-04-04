import { AbstractAction } from "./AbstractAction.js";

//Class for the enemy basic attack
export class AttaqueBasique extends AbstractAction{
    constructor(){
        super("Attaque Basique", "Attack", "Une attaque basique qui inflige 6 dégâts.");
    }

     //Inflige 6 dégâts au joueur
    dealDamage(enemy, targets){
        //Vérifier que le tabeau de cibles n'est pas matriciel
        if(targets.length <= 0 || targets[0].type === "Matrice"){
            throw new Error("Attaque Basique doit cibler une cible physique.");
        }
        //Vérifier si la cible a un Bouclier
        let shield = 0;
        for(const status of targets[0].status){
            if(status.name === "Shield"){
                if(status.intensity > shield) shield = status.intensity;
            }
        }
        //Infliger les dégâts en prenant en compte le bouclier
        const damageToDeal = Math.max(0, 6 - shield);
        targets[0].health = Math.max(0, targets[0].health - damageToDeal);
    }

    //Lance les effets de l'action'
    effect(enemy, targets = []){
        this.dealDamage(enemy, targets);
    }
}