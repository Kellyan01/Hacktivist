import {AbstractCard} from "./AbstractCard.js";

//Class pour la carte Frappe Cybernétique
export class FrappeCybernetique extends AbstractCard{
    constructor() {
        super("Frappe Cybernétique", "Attaque", 1," inflige 5 dégâts à une cible physique.");
    }

    //Inflige 5 dégâts sur la cible
    dealDamage(player, targets){
        //Vérifier que le tabeau de cibles n'est pas matriciel
        if(targets.length <= 0 || targets[0].type === "Matrice"){
            throw new Error("Frappe Cybernétique doit cibler une cible physique.");
        }
        //Vérifier si la cible a un Bouclier
        let shield = 0;
        for(const status of targets[0].status){
            if(status.name === "Shield"){
                if(status.intensity > shield) shield = status.intensity;
            }
        }
        //Infliger les dégâts en prenant en compte le bouclier
        const damageToDeal = Math.max(0, 5 - shield);
        targets[0].health = Math.max(0, targets[0].health - damageToDeal);
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.dealDamage(player, targets);
    }
}