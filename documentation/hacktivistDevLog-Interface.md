# Dev Log — Feature : interface

> Journal de développement de la feature interface navigateur.
> Objectif : rendre le combat jouable dans le navigateur (DOM, interactions, animations).

---

## Responsabilités de l'interface

- Afficher l'état du combat dans le DOM (joueur, ennemis, main, mode)
- Permettre au joueur de sélectionner une carte, l'annuler, la jouer
- Gérer le ciblage d'un ennemi pour les cartes ciblées
- Basculer l'ambiance visuelle selon le mode (Fantôme / Alerte Rouge)
- Afficher la fin du combat (victoire / défaite)
- Animer le tour ennemi (callback `onAction`)

---

## Session 1 — 2026-04-05

### Structure HTML

**Fichier :** `index.html`

```
#game  (.ghost-mode / .red-alert-mode)
  ├── #combat-zone
  │     ├── #enemy-zone         ← articles .enemy-card générés dynamiquement
  │     └── #player-zone
  │           ├── .player-stats
  │           └── .player-status
  ├── #hand-zone                ← articles .card générés dynamiquement
  └── #controls-zone
        ├── #btn-end-turn
        ├── #btn-play           ← display:none par défaut
        ├── #combat-result
        └── #info
```

---

### CSS d'ambiance

**Fichier :** `src/style/main.css`

| Sélecteur | Rôle |
|---|---|
| `#game` | Fond sombre neutre (`#545454`) |
| `#game.ghost-mode` | Fond cyan (`#73e6d7`) — Mode Fantôme |
| `#game.red-alert-mode` | Fond rouge (`#e84242`) — Alerte Rouge |
| `#btn-play` | `display: none` par défaut |

---

### CombatUI

**Fichier :** `src/script/game/CombatUI.js`

#### Constructeur

```js
constructor(combatEngine, player, enemies)
```

Récupère toutes les références DOM au lancement. Initialise `this.selectedCard = null`.

| Propriété | Élément DOM |
|---|---|
| `gameEl` | `#game` |
| `enemyZoneEl` | `#enemy-zone` |
| `playerStatsEl` | `.player-stats` |
| `playerStatusEl` | `.player-status` |
| `handZoneEl` | `#hand-zone` |
| `btnEndTurn` | `#btn-end-turn` |
| `btnPlay` | `#btn-play` |
| `combatResultEl` | `#combat-result` |

#### Méthodes privées

| Méthode | Description |
|---|---|
| `_renderMode()` | Bascule `ghost-mode` / `red-alert-mode` sur `#game` |
| `_renderPlayer()` | Recrée les stats et status joueur (`replaceChildren()`) |
| `_renderEnemies()` | Recrée les articles ennemis avec `dataset.index` pour le ciblage |
| `_renderHand()` | Recrée les articles cartes avec `dataset.index`, classe `selected` si sélectionnée |
| `_selectCard(card)` | Sélection/désélection — affiche `btnPlay` si `!card.targeted` |
| `async _targetEnemy(enemy)` | Joue `selectedCard` sur l'ennemi, reset sélection, `render()` |
| `_handleCombatResult(result)` | Victoire (`result === player`) / Défaite (`Array`) — affiche message, désactive boutons |

#### Méthodes publiques

| Méthode | Description |
|---|---|
| `bindEvents()` | Attache tous les listeners (délégation sur zones, boutons) — une seule fois au lancement |
| `render()` | Appelle les 4 sous-méthodes de rendu dans l'ordre |

#### Patterns notables

**Délégation d'événements** — les listeners sont sur les conteneurs (`#hand-zone`, `#enemy-zone`), pas sur chaque carte. `event.target.closest(".card")` remonte au bon élément. Garde `if (!el) return` si le clic tombe sur le fond.

**Pas de `innerHTML`** — tout le DOM est construit avec `createElement` + `textContent` + `append` pour éviter les injections XSS.

**`replaceChildren()`** — vide proprement un conteneur avant de le reconstruire (pas de `innerHTML = ""`).

**`dataset.index`** — chaque article DOM stocke l'index de son objet JS (`player.hand.indexOf(card)`, `enemies.indexOf(enemy)`). Permet de retrouver l'objet depuis l'événement clic.

---

### Propriété `targeted` sur AbstractCard

Ajout de `targeted` (boolean) au constructeur d'`AbstractCard`.

- `true` : la carte nécessite de cliquer un ennemi pour être jouée (`FrappeCybernetique`, `VirementAnonyme`)
- `false` : la carte est jouée via le bouton "Jouer" (`FirewallPersonnel`, `Brouilleur`, `ScanBasique`)

---

### Bug corrigé — `_verifyData()` ne se déclenchait pas après ScanBasique

**Fichier :** `src/script/game/CombatEngine.js` — méthode `playCard()`

**Cause :** `_verifyData()` itérait sur `targets` (les ennemis ciblés par la carte). `ScanBasique` ne cible personne → `targets = []` → boucle vide → seuil jamais vérifié.

**Correction :** itérer sur `this.enemies` à la place, pour vérifier le seuil de tous les ennemis après chaque carte.

```js
// Avant
for(const enemy of targets){ this._verifyData(enemy); }

// Après
for(const enemy of this.enemies){ this._verifyData(enemy); }
```

---

### Callback `onAction` — animations tour ennemi

**Objectif :** permettre d'injecter des animations sans coupler `CombatEngine` à l'UI.

`CombatEngine` accepte un paramètre optionnel `onAction = null`. Il est appelé après chaque `enemy.act()`, avant `_changeIntention()` :

```js
async _enemyAction(enemy){
    enemy.act(this.player, this.enemies);
    await this.onAction?.(enemy);   // ← hook animation
    this._changeIntention(enemy);
}
```

**Méthodes rendues `async` dans CombatEngine :** `_enemyAction`, `_enemyTurn`, `switchTurn`.

**Implémentation dans `script.js` :**

```js
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const combatEngine = new CombatEngine(player, enemies, true, 3, 3, async enemy => {
    info.textContent = `${enemy.name} effectue : ${enemy.intention.name}`;
    await sleep(1500);
    info.textContent = "";
});
```

Le `render()` du listener `btnEndTurn` s'exécute après le `await switchTurn()` — le DOM ne se met à jour qu'une fois toutes les animations terminées.

---

## Prochaine étape

Feature `interface` terminée et fonctionnelle.

**Feuille de route (détail dans GDD section 11) :**
- Court terme : ciblage automatique dans `enemy.act()` (priorité 1)
- Moyen terme : animations par carte, nouveaux ennemis, nouvelles cartes
- Long terme : carte BSP, récompenses, nœuds, méta-progression
