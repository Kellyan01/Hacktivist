import {AbstractCard} from "./AbstractCard.js";
import {Status} from "../Status.js";

//Class pour la carte Virement Anonyme
export class VirementAnonyme extends AbstractCard{
    constructor() {
        super("Virement Anonyme", "Social Engineering", 2,"Exploite la vulnérabilité humaine d'une cible révélée (type Financier). Neutralise sans combat.");
    }

    //Génère l'état Neutralisé sur la cible
    generateNeutralized(player, targets){
        //Vérifier que le tabeau de cibles n'est pas vide et qu'il s'agit d'un humain
        if(targets.length <= 0 || targets[0].type !== "Human"){
            throw new Error("Virement Anonyme doit cibler un humain.");
        }
        targets[0].status.push(new Status("Neutralized", "Debuff", 1,10000));
    }

    //Lance les effets de la carte
    effect(player, targets = []){
        this.generateNeutralized(player, targets);
    }
}