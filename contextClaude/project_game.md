---
name: Projet Jeu — Hacktiviste
description: Deckbuilding roguelite cyberpunk — état d'avancement, structure, entités
type: project
---

Jeu en développement : deckbuilder roguelite cyberpunk en JavaScript Vanilla.
Dossier : `d:\Projet_Dev_Yoann\Javascript\Hacktiviste\`
GDD disponible dans : `documentation/gameDesignDocument.md`

Projet séparé du projet Algo A Star. Les algos appris là-bas (BSP, Voronoi, A*...) seront réutilisés ici plus tard.

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

### feature/combat (à démarrer)

Implémenter `CombatEngine.js` dans `src/script/game/`.

**Avant de coder :** ajouter `dataThreshold` (int) dans `Enemy.js` — seuil de données pour révéler la vulnérabilité.

**Constructeur :** `(player, enemies, initPlayer, energyPerTurn, handSize)`

**Propriétés internes :** `turnCount`, `mode` ("Ghost"/"RedAlert"), `isOver`

**Méthodes publiques :** `launchFight()`, `switchTurn()`, `playCard(card, targets)`, `switchGhostToRedAlert()`, `verifyVictory()`, `endFight()`

**Méthodes privées :** `shuffleDeck()`, `shuffleDiscardInDeck()`, `drawCards()`, `discardCard()`, `initEnergy()`, `updateTurn()`, `updateAlert()`, `verifyAlert()`, `updateStatus()`, `showIntentions()`, `verifyData()`, `enemyAction()`

Détail complet dans `documentation/hacktivistDevLog-Combat.md`.
