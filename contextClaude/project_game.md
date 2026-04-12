---
name: Projet Jeu — Hacktiviste
description: Deckbuilding roguelite cyberpunk — état d'avancement, structure, entités
type: project
---

Jeu en développement : deckbuilder roguelite cyberpunk en JavaScript Vanilla.
Dossier : `d:\Projet_Dev_Yoann\Javascript\Hacktiviste\`
GDD disponible dans : `documentation/gameDesignDocument.md`

Projet séparé du projet Algo A Star. Les algos appris là-bas (BSP, Voronoi, A*...) seront réutilisés ici plus tard.

**Stack cible : Godot 4 (C#)** — migration en cours en Option B (prototype parallèle). Détail dans `documentation/techStack.md`.
**Son/Musique :** Bfxr (SFX court terme), BeepBox ou commission (moyen terme).
**Animation :** illustrations fixes + Aseprite, style Slay the Spire plutôt que Hades. Utilisateur est illustrateur.

**Why:** l'utilisateur veut garder le projet Algo A Star comme espace d'exploration des algorithmes.
**How to apply:** ne pas mélanger les deux projets.

---

## Structure du projet

```
Hacktiviste/
├── index.html
├── README.md
├── assets/
├── contextClaude/
├── documentation/
└── src/
    ├── script/
    │   ├── entities/
    │   │   ├── AbstractPlayable.js     ← parent commun cartes/actions
    │   │   ├── Deck.js                 ← gestion pioche/main/défausse
    │   │   ├── Status.js
    │   │   ├── actionEntities/
    │   │   ├── cardEntities/
    │   │   ├── characterEntities/
    │   │   ├── behaviorEntities/        ← stratégies d'intention (ChaoticBehavior.js...)
    │   │   ├── effectEntities/         ← effets applicatifs (Damage.js...)
    │   │   └── targetEntities/         ← filtres de ciblage (TargetByType.js...)
    │   ├── interfaces/
    │   │   ├── BehaviorInterface.js    ← stratégies d'intention (Action)
    │   │   ├── EffectInterface.js      ← effets applicatifs (void)
    │   │   └── TargetFilterInterface.js ← filtres de ciblage (AbstractCharacter[])
    │   ├── map/                         ← génération procédurale BSP (en cours)
    │   │   └── BSPNode.js               ← noeud de l'arbre BSP + méthode split() ✅
    │   ├── game/
    │   └── script.js
    └── style/
        └── main.css
```

## Gitflow

- `main` — production
- `developpement` — branche de développement principale
- `feature/xxx` — une branche par feature
- `release` et `hotfix` — à prévoir plus tard

## État d'avancement

### feature/interface (terminée)

Fichiers modifiés/créés :
- `index.html` — structure DOM : `#game`, `#combat-zone`, `#enemy-zone`, `#player-zone`, `#hand-zone`, `#controls-zone`, `#combat-result`, `#info`
- `src/style/main.css` — ambiance visuelle : fond sombre neutre, cyan (`ghost-mode`), rouge (`red-alert-mode`), `#btn-play` caché par défaut
- `src/script/game/CombatUI.js` — classe responsable du rendu DOM et des interactions
- `src/script/script.js` — point d'entrée, câblage CombatEngine + CombatUI + callback `onAction`

**CombatUI — méthodes :**
- `render()` — point d'entrée rendu, appelle les 4 sous-méthodes
- `_renderMode()` — bascule les classes CSS selon `combatEngine.mode`
- `_renderPlayer()` — stats et status joueur
- `_renderEnemies()` — stats, intention et status ennemis, `dataset.index` pour ciblage
- `_renderHand()` — cartes en main, `dataset.index`, classe `selected`
- `_selectCard(card)` — sélection/désélection, affiche `btnPlay` si `!card.targeted`
- `_targetEnemy(enemy)` — joue `selectedCard` sur l'ennemi ciblé (async)
- `_handleCombatResult(result)` — affiche victoire/défaite, désactive les boutons
- `bindEvents()` — délégation d'événements sur `#hand-zone`, `#enemy-zone`, `#btn-play`, `#btn-end-turn`

**Propriété `targeted` ajoutée sur `AbstractCard`** — `true` sur `FrappeCybernetique` et `VirementAnonyme`.

**Bug corrigé dans `CombatEngine.playCard()`** — `_verifyData()` itérait sur `targets` au lieu de `this.enemies`, empêchant la génération de la carte exploit après `ScanBasique`.

**Callback `onAction`** — paramètre optionnel de `CombatEngine`. Appelé après chaque `enemy.act()` (avant `_changeIntention`). Permet d'injecter des animations sans coupler l'engine à l'UI. `switchTurn()`, `_enemyTurn()`, `_enemyAction()` sont désormais `async`.

**Pattern sleep :** `const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));` défini dans `script.js`.

---

### feature/entities (terminée)

Structure réorganisée : `entities/cardEntities/` et `entities/characterEntities/`, `Status.js` à la racine d'`entities/`.

**Personnages** (`characterEntities/`) :
- `AbstractCard.js` — abstraite, `effect(player, targets = [])`. `targets` est un tableau d'`AbstractCharacter`.
- `AbstractCharacter.js` — abstraite, propriétés : name, type, health, status ([]). Méthode abstraite `act()`.
- `Enemy.js` — extends AbstractCharacter. Propriétés : vulnerability, intention (null), actionsList. `act()` en TODO.
- `Player.js` — extends AbstractCharacter. Propriétés : energy, alert, data, deck, discard ([]), hand ([]). `act()` en TODO.
- `Status.js` — classe concrète. Propriétés : name, type, intensity (int), duration (int).

**Cartes** (`cardEntities/`) :
- `ScanBasique.js` — +2 data, +8 alert. Condition Mode Fantôme en TODO.
- `FirewallPersonnel.js` — pousse Status "Shield" (intensity 5, duration 3) dans `player.status`.
- `Brouilleur.js` — alert -= 15. Condition Alerte Rouge en TODO.
- `VirementAnonyme.js` — cible `targets[0]` de type "Human", pousse Status "Neutralized" (intensity 1, duration 10000).
- `FrappeCybernetique.js` — 5 dégâts sur `targets[0]`, réduits par le Shield le plus élevé dans `targets[0].status`. Min 0.

## Prochaine étape

Features `entities`, `combat`, `interface` et `refactorisation effectEntities` terminées. Détail complet dans les devlogs de `documentation/`.

**Décision game design — cumul des Status :** on garde les valeurs les plus grandes (`intensity` et `duration`). Pas de stacking. Révisable lors de l'équilibrage.

**Décision game design — données par ennemi :** la jauge `data` est sur chaque ennemi, pas sur le joueur. Le scan cible un ennemi spécifique. Ouvre la porte à des cartes de scan de zone (peu de data sur tous) vs scan ciblé (beaucoup sur un).

**Décision game design — exhaust :** propriété `exhaust` sur `AbstractCard`. Les cartes exploit (générées par scan) sont à usage unique.

**Décision game design — défausse partielle :** en fin de tour, le joueur choisit quelles cartes défausser. Pas de défausse totale forcée. Pas de limite pour l'instant — à activer lors de l'équilibrage. Variante "max cartes en main" (style Magic) envisagée.

**Note :** `_verifyAlertAtRandom()` conservée inactive — détection probabiliste avant 100%, à activer lors de l'équilibrage.

---

### Refactorisation architecturale — terminée 2026-04-09

Analyse structurelle réalisée. 8 points faibles identifiés, 8 recommandations produites. Détail complet dans `documentation/hacktivistDevLog-Refactoring-Architecture.md`.

**Recommandations urgentes — toutes terminées ✅ :**
1. R4 — Dead code supprimé (paramètres `min*`) ✅
2. R5 — `endFight()` nettoyé ✅
3. R1 — Interfaces séparées (`EffectInterface` / `TargetFilterInterface`) ✅
4. R6 — Parent commun `AbstractPlayable` ✅
5. R2 — Mutations encapsulées (`modifyHealth`, `modifyAlert`, `modifyData`) ✅
6. R3 — Classe `Deck` extraite (Fisher-Yates, `draw`, `discardCard`, `recycleDiscard`) ✅

**Changements structurels notables :**
- `targetEntities/` — nouveau dossier, séparé de `effectEntities/`
- `AbstractPlayable.js` — parent commun `AbstractCard` / `AbstractAction`
- `Deck.js` — `Player` possède un `Deck` au lieu de 3 tableaux
- `TargetFilterInterface.js` — interface dédiée, méthode `filter()` distincte de `effect()`
- `EventEmitter.js` — pattern Observer, composition dans CombatEngine
- `utils.js` — utilitaire `sleep`
- `constants.js` — `EVENT_LIST` ajouté (9 objets au total)
- `CombatUI.bindEmitter()` — s'abonne aux événements au lieu d'appeler `render()` manuellement

7. R7 — Constantes (`constants.js`, 8 objets) ✅

7. R7 — Constantes (`constants.js`, 9 objets dont `EVENT_LIST`) ✅
8. R8 — Système d'événements (EventEmitter, pattern Observer, composition) ✅

**Toutes les recommandations architecturales sont terminées.**

---

### IA ennemie — terminée 2026-04-11

Pattern Strategy appliqué au choix d'intention des ennemis. Interface `BehaviorInterface` + 4 classes concrètes injectées dans `Enemy` via composition. `CombatEngine._changeIntention()` délègue à `enemy.behavior.chooseAction()`.

4 comportements implémentés :
1. **ChaoticBehavior** — aléatoire pur ✅
2. **ProceduralBehavior** — cycle fixe (index + modulo) ✅
3. **SemiRandomBehavior** — aléatoire sans répétition consécutive ✅
4. **ConditionalBehavior** — règles prioritaires `{condition, action}` + fallback ✅

`ConditionFactory` — méthode statique `buildCondition()`, retourne une fonction booléenne. Conditions dans `CONDITION_LIST` (constants.js). La factory ne couple pas condition et action — l'association se fait par ennemi.

Changements structurels :
- `behaviorEntities/` — nouveau dossier (4 behaviors + ConditionFactory)
- `BehaviorInterface.js` — nouvelle interface
- `Enemy.js` — propriété `behavior` ajoutée au constructeur
- `constants.js` — `CONDITION_LIST` ajouté (2 conditions)

---

**Feuille de route (détail dans GDD section 11) :**
- Court terme : **ciblage** ✅, **données par ennemi** ✅, **exhaust** ✅, **défausse partielle** ✅, **IA ennemie** ✅. Reste : limite de défausse, limite de cartes en main
- Moyen terme : nouveaux ennemis (Drone, Firewall Corp, Vigile Corrompu), nouvelles actions, nouvelles cartes (Exploit Zero-Day, Malware Ciblé), animations par carte
- Long terme : **carte BSP (en cours — rendu SVG fonctionnel)**, récompenses, nœuds, méta-progression
- Transversal : équilibrage jauge, dégâts, Status

---

### Feature map — en cours 2026-04-12

Génération procédurale de la carte d'acte via BSP. **Option B choisie** : BSP abstraite (points + connexions), pas de grille dessinée. Détail complet dans `documentation/hacktivistDevLog-Map.md`.

**État :**
- `BSPNode.js` — structure + méthode `split(minNodeSize)` ✅
- `MapGenerator.js` — `generate()`, `_splitRecursive()`, `getLeaves()`, `placeRoom()`, `connectRooms()`, `_getFirstLeaf()` ✅
- `MapNode.js` — `id`, `x`, `y` ✅
- `Connection.js` — `from`, `to` ✅
- `MapRenderer.js` — rendu SVG avec scale, cercles + lignes ✅
- Testé et affiché dans le navigateur ✅

**Décision 2026-04-12 — pivot vers génération par couches :**
Le BSP seul ne produit pas de croisements ni de structure directionnelle. Nouvelle classe `LayeredMapGenerator` pour la carte d'acte style Slay the Spire. BSP conservé pour usage futur (donjons en grille).

**Prochaines étapes (prioritaires) :**
1. `LayeredMapGenerator.js` — génération par rangées (floors), nœuds par rangée, connexions vers rangée suivante
2. Stratégie de connexion avec croisements géométriques
3. Assignation des types de nœuds (`combat`, `merchant`, `rest`, `event`, `boss`)
4. Rendu SVG adapté (nœuds alignés par rangée)
