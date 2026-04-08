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
    │   │   ├── actionEntities/
    │   │   ├── cardEntities/
    │   │   ├── characterEntities/
    │   │   ├── effectEntities/     ← effets centralisés (Damage.js...)
    │   │   │   └── targetEffect/  ← effets de ciblage (TargetByType.js...)
    │   │   └── Status.js
    │   ├── interfaces/
    │   │   └── EffectInterface.js  ← classe abstraite pour tous les effets
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

Features `entities`, `combat` et `interface` terminées. Détail complet dans `documentation/hacktivistDevLog-Combat.md`.

**Refactorisation `effectEntities` terminée** — voir `documentation/hacktivistDevLog-Refactoring.md`.

**Décision game design — cumul des Status :** on garde les valeurs les plus grandes (`intensity` et `duration`). Pas de stacking. Révisable lors de l'équilibrage.

**Note :** `_verifyAlertAtRandom()` conservée inactive — détection probabiliste avant 100%, à activer lors de l'équilibrage.

**Feuille de route (détail dans GDD section 11) :**
- Court terme : **ciblage automatique** — `TargetByType` implémenté et branché sur `AttaqueBasique` ✅. Reste à créer `TargetByStatus` et `TargetByHealth`, puis migrer les cartes ciblées (`FrappeCybernetique`, `VirementAnonyme`)
- Moyen terme : nouveaux ennemis, nouvelles actions, nouvelles cartes, animations par carte
- Long terme : carte BSP, récompenses, nœuds, méta-progression
- Transversal : équilibrage jauge, dégâts, Status
