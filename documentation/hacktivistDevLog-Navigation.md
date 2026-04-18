# Dev Log — Feature : map-navigation-core

> Journal de développement de la navigation sur la carte d'acte.
> Objectif : permettre au joueur de se déplacer de nœud en nœud sur la carte générée procéduralement.

---

## Décisions de conception — 2026-04-17

### Architecture scènes (GameController + AbstractScene)

Avant de coder la navigation, quatre questions de conception ont été tranchées :

| Question | Décision |
|---|---|
| Où vit l'état de run ? | Nouvelle classe `Navigator` — pas dans `Player` |
| Backtracking autorisé ? | Oui — connexions bidirectionnelles, coûte de la Clock plus tard |
| Nœuds non-combat ? | Ne font rien pour l'instant — scènes à implémenter plus tard |
| Orchestration des scènes ? | `GameController` — seul responsable des transitions |

### Séparation des responsabilités

```
Navigator      → logique pure (position, atteignables, déplacement)
MapUI          → rendu SVG interactif + clics
AbstractScene  → contrat commun à toutes les scènes
MapScene       → orchestre Navigator + MapUI
CombatScene    → encapsule CombatEngine + CombatUI
GameController → transitions entre scènes
```

`MapRenderer` est conservé tel quel pour les tests statiques. `MapUI` le remplace dans le contexte interactif.

---

## Session 1 — 2026-04-17

### Navigator.js

**Fichier :** `src/script/game/Navigator.js`

Classe de logique pure — zéro DOM, zéro dépendance.

| Propriété | Type | Description |
|---|---|---|
| `mapNodes` | `MapNode[]` | Référence à la liste plate des nœuds |
| `connections` | `Connection[]` | Référence à la liste des connexions |
| `currentNodeId` | `int` | Id du nœud courant |

| Méthode | Retour | Description |
|---|---|---|
| `getCurrentNode()` | `MapNode` | Nœud courant |
| `getReachableNodes()` | `MapNode[]` | Nœuds connectés au nœud courant (bidirectionnel) |
| `moveTo(nodeId)` | `boolean` | Déplace si atteignable, `false` sinon |

**Bidirectionnalité :** une `Connection { from, to }` autorise le déplacement dans les deux sens. `getReachableNodes()` cherche `connection.from === currentNodeId` OU `connection.to === currentNodeId`.

---

### MapUI.js

**Fichier :** `src/script/game/MapUI.js`

Classe de rendu et d'interaction — remplace `MapRenderer` dans le contexte interactif.

| Propriété | Type | Description |
|---|---|---|
| `svgEl` | `SVGElement` | Élément SVG du DOM |
| `mapNodes` | `MapNode[]` | Nœuds à afficher |
| `connections` | `Connection[]` | Connexions à afficher |
| `scale` | `int` | Facteur d'échelle |
| `navigator` | `Navigator` | Source de l'état de navigation |
| `stroke` | `string` | Couleur des connexions (`"gray"`) |
| `strokeWidth` | `int` | Épaisseur des connexions (`1`) |
| `fill` | `string` | Couleur fallback des nœuds (`"black"`) |

| Méthode | Description |
|---|---|
| `render()` | Efface (`replaceChildren()`), redessine connexions → nœuds → overlay navigation |
| `bindEvents(onNodeClick)` | Délégation sur `svgEl` — lit `data-node-id` sur l'élément cliqué, appelle `onNodeClick(mapNode)` |

**Ordre de rendu :**
1. Connexions (`<line>`)
2. Nœuds colorés par type (`<circle r=5>`, `fill = NODE_COLORS[node.type]`, `data-node-id`)
3. Overlay nœud courant (`<circle r=8>`, blanc, opacité 0.9)
4. Overlay nœuds atteignables (`<circle r=8>`, cyan, opacité 0.6)

**Couleurs de navigation** centralisées dans `constants.js` sous `NODE_COLORS["current"]` et `NODE_COLORS["reachable"]`.

---

### AbstractScene.js

**Fichier :** `src/script/scenes/AbstractScene.js`

Classe abstraite — contrat commun à toutes les scènes du jeu.

- Instanciation directe bloquée via `new.target`
- `this.gameController` stocké pour que les scènes enfants puissent déclencher des transitions
- Méthode abstraite `launch()` qui throw si non redéfinie

---

### MapScene.js

**Fichier :** `src/script/scenes/MapScene.js`

Orchestre `Navigator` + `MapUI`. Reçoit toutes les données de carte en paramètre du constructeur.

| Méthode | Description |
|---|---|
| `launch()` | Render + bind événements |
| `_onNodeClick(node)` | Tente `moveTo()` → si succès : re-render + `gameController.enterNode(node)` |

Les nœuds non atteignables sont silencieusement ignorés (`moveTo()` retourne `false`).

---

### CombatScene.js

**Fichier :** `src/script/scenes/CombatScene.js`

Encapsule ce que `script.js` faisait manuellement. Crée `CombatEngine` + `CombatUI` au constructeur.

`launch()` — séquence :
1. `combatEngine.launchFight()`
2. `combatUI.bindEmitter()`
3. `combatUI.bindEvents()`
4. `combatUI.render()`
5. Abonnement à `EVENT_LIST.COMBAT_END` → `gameController.onCombatEnd(result)`

---

### GameController.js

**Fichier :** `src/script/GameController.js`

Point d'entrée unique. Seul responsable des transitions de scène.

| Méthode | Description |
|---|---|
| `start()` | Instancie et lance `MapScene` |
| `enterNode(node)` | Si `node.type === NODE_TYPE_LIST.COMBAT` → lance `CombatScene`. Sinon : rien. |
| `onCombatEnd(result)` | Relance `start()` → retour à la carte |

**Paramètres :** `player`, `enemies`, `mapNodes`, `connections`, `scale`, `startNodeId`, `energyPerTurn`, `handSize`. `svgEl`, `mapContainerEl` et `combatContainerEl` sont récupérés directement via `getElementById` dans le constructeur.

**Note :** `enemies` est actuellement une liste fixe. À terme, chaque nœud combat portera ses propres ennemis.

---

### script.js — refactorisation

Le point d'entrée est simplifié : génère la carte, récupère `startNodeId` via `mapNodes.find(n => n.type === NODE_TYPE_LIST.START).id`, instancie `GameController`, appelle `start()`. Les imports `CombatEngine`, `CombatUI`, `MapRenderer` sont retirés — encapsulés dans les scènes. Les dimensions de carte passent par `DIMENSION_MAP`.

---

## Structure des fichiers (état après session 1)

```
src/script/
├── constants.js                ← NODE_COLORS["current"/"reachable"] + DIMENSION_MAP ajoutés
├── GameController.js           ← NOUVEAU
├── game/
│   ├── CombatEngine.js
│   ├── CombatUI.js
│   ├── Navigator.js            ← NOUVEAU
│   └── MapUI.js                ← NOUVEAU
├── scenes/
│   ├── AbstractScene.js        ← NOUVEAU
│   ├── MapScene.js             ← NOUVEAU
│   └── CombatScene.js          ← NOUVEAU
└── map/
    └── (inchangé)
```

---

## Résultat testé ✅ — session 1

- Navigation sur la carte fonctionnelle
- Clic sur nœud inaccessible sans effet
- Nœud `combat` → lancement du combat
- Fin de combat → retour à la carte

---

## Session 2 — 2026-04-18

### Transitions de scènes et corrections de boucle

#### index.html — restructuration sémantique

Les deux zones de jeu sont désormais des `<article>` dans `<main id="game">` :

```html
<article id="combat-container" class="hidden"> ... </article>
<article id="map-container"> ... </article>
```

`#combat-container` démarre caché via la classe `.hidden` (`display: none` dans `main.css`).

`#info` déplacé dans `#combat-container` — il appartient à la scène combat.

#### constants.js — DIMENSION_MAP

```js
export const DIMENSION_MAP = {
    WIDTH : 25,
    HEIGHT : 40,
    SCALE : 20
}
```

Centralise la configuration de la carte. Utilisé dans `script.js` (paramètres `LayeredMapGenerator`) et `MapUI.render()` (dimensions du SVG). Remplace les valeurs en dur dispersées dans le code.

#### GameController — gestion de la visibilité

Nouvelles méthodes privées `_showMap()` / `_showCombat()` — basculent la classe `hidden` sur les deux conteneurs.

`currentNodeId` ajouté — mémorise la position courante du joueur sur la carte entre les scènes. Mis à jour dans `enterNode(node)`, passé à `MapScene` dans `start()` pour restaurer la position après un combat.

`onCombatEnd(result)` — ajoute un listener `{ once: true }` sur `combatContainerEl` : au clic, appelle `_showMap()` puis `start()`. Le joueur clique pour fermer l'écran de combat.

#### CombatEngine.launchFight() — reset du deck

Ajout en tête de méthode :
```js
this.player.deck.discard.push(...this.player.deck.hand);
this.player.deck.hand = [];
```
Garantit que la main du combat précédent ne pollue pas le deck du nouveau combat.

#### MapUI.render() — dimensions du SVG

`render()` applique désormais `width` et `height` sur `svgEl` via `DIMENSION_MAP` avant de dessiner. `GameController` n'a plus à s'en occuper.

---

## Résultat testé ✅ — session 2

- Map visible au démarrage, combat caché
- Entrée nœud combat → carte masquée, combat affiché
- Fin de combat → clic pour fermer → retour carte à la bonne position
- Nouveau combat correctement réinitialisé (deck propre)

---

## Session 3 — 2026-04-18

### Feature : brouillard de guerre

#### MapNode.js — propriété `visibility`

`this.visibility = NODE_VISIBILITY.HIDDEN` ajouté dans le constructeur. Valeur initiale : tous les nœuds cachés.

Import de `NODE_VISIBILITY` depuis `constants.js`.

#### constants.js — NODE_VISIBILITY + NODE_COLORS.hidden

```js
export const NODE_VISIBILITY = {
    HIDDEN :   "hidden",
    VISIBLE :  "visible",
    REVEALED : "revealed"
}
```

`NODE_COLORS["hidden"] = "black"` ajouté pour le rendu des nœuds cachés.

#### FogOfWar.js

**Fichier :** `src/script/game/FogOfWar.js`

| Propriété | Type | Description |
|---|---|---|
| `range` | `int` | Fenêtre de visibilité en nombre de floors (défaut : 2) |

| Méthode | Description |
|---|---|
| `updateVisibility(currentNode, mapNodes)` | Marque `currentNode` comme `REVEALED`, met à jour tous les autres nœuds selon leur distance en floors |

**Algorithme :**
1. `currentNode.visibility = REVEALED`
2. Pour chaque nœud non-`REVEALED` : si `|node.floor - currentNode.floor| <= range` → `VISIBLE`, sinon → `HIDDEN`

Les nœuds déjà `REVEALED` ne sont jamais rétrogradés.

#### MapScene.js — intégration FogOfWar

`FogOfWar` instancié dans le constructeur (`this.fogOfWar = new FogOfWar()`).

`launch()` — appel de `fogOfWar.updateVisibility(currentNode, mapNodes)` avant le premier `render()`.

`_onNodeClick()` — ordre correct :
1. `navigator.moveTo()`
2. `fogOfWar.updateVisibility()` ← avant le render
3. `mapUI.render()`
4. `gameController.enterNode()`

#### MapUI.render() — rendu conditionnel par visibilité

Nœuds `HIDDEN` : cercle noir (`NODE_COLORS.hidden`), **sans** `data-node-id` → non cliquables.

Nœuds `VISIBLE` / `REVEALED` : comportement existant (couleur par type, `data-node-id`).

**Décision game design** : nœuds `boss` et `start` toujours affichés avec leur couleur, quelle que soit leur visibilité — le joueur voit toujours l'objectif et son point de départ.

---

## Résultat testé ✅ — session 3

- Nœuds cachés affichés en noir, non cliquables
- Fenêtre de visibilité ±2 floors se met à jour à chaque déplacement
- Nœuds visités restent révélés (jamais rétrogradés)
- Boss et start toujours visibles

---

## Prochaines étapes

1. `feature/clock` — compte à rebours, Pattern Observer, `AbstractThresholdStrategy`. Décision à prendre : que se passe-t-il quand la Clock atteint 0 ?
2. `feature/map-navigation-other-nodes` — rest (soin), merchant, event
3. Défaite en combat
4. Ennemis par nœud
5. Évolution dynamique des nœuds sur `CLOCK_THRESHOLD`

---

*Document vivant — à mettre à jour au fil de l'implémentation.*
