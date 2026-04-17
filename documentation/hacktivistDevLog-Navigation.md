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

**Paramètres :** `player`, `enemies`, `mapNodes`, `connections`, `svgEl`, `scale`, `startNodeId`, `energyPerTurn`, `handSize`.

**Note :** `enemies` est actuellement une liste fixe. À terme, chaque nœud combat portera ses propres ennemis.

---

### script.js — refactorisation

Le point d'entrée est simplifié : génère la carte, récupère `startNodeId` via `mapNodes.find(n => n.type === NODE_TYPE_LIST.START).id`, instancie `GameController`, appelle `start()`. Les imports `CombatEngine`, `CombatUI`, `MapRenderer` sont retirés — encapsulés dans les scènes.

---

## Structure des fichiers (état après cette session)

```
src/script/
├── constants.js                ← NODE_COLORS["current"] et ["reachable"] ajoutés
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

## Résultat testé ✅

- Navigation sur la carte fonctionnelle
- Clic sur nœud inaccessible sans effet
- Nœud `combat` → lancement du combat
- Fin de combat → retour à la carte

---

## Prochaines étapes

1. `feature/map-navigation-other-nodes` — rest (soin), merchant, event (scènes minimales)
2. Gérer la défaite en combat (actuellement toujours retour à la carte)
3. Ennemis par nœud (actuellement liste fixe dans `GameController`)
4. `feature/clock` — compte à rebours, Pattern Observer, `AbstractThresholdStrategy`
5. `feature/fog-of-war` — `MapNode.visibility`, fenêtre ±2 floors

---

*Document vivant — à mettre à jour au fil de l'implémentation.*
