# Dev Log — Feature : map (génération procédurale BSP)

> Journal de développement de la génération procédurale de la carte d'acte.
> Objectif : générer la structure de noeuds connectés d'un acte à partir d'un algorithme BSP (Binary Space Partitioning).

---

## Décisions de conception

### Option B — BSP abstraite (choisie)

La BSP est utilisée pour **positionner des noeuds dans un plan**, pas pour générer un dungeon en grille de cases avec salles et couloirs dessinés. Les "salles" deviennent des points (noeuds de la carte), les "connexions" deviennent des liens entre noeuds — style Slay the Spire.

**Avantages :**
- Plus simple à implémenter pour un prototype
- Évolution possible vers l'Option A (grille réelle) plus tard si enrichissement visuel souhaité
- Cohérent avec un deckbuilder au tour par tour sans déplacement physique

### Structure du résultat final (cible)

```js
{
    nodes: [
        { id: 0, x: 12, y: 8, type: "combat" },
        { id: 1, x: 34, y: 15, type: "merchant" },
        ...
    ],
    connections: [
        { from: 0, to: 1 },
        ...
    ]
}
```

### Paramètres de l'algo

| Paramètre | Rôle | Valeur indicative |
|---|---|---|
| `mapWidth`, `mapHeight` | Taille de la carte | 80 × 50 |
| `minNodeSize` | Seuil d'arrêt de la découpe | 10 |
| `maxDepth` | Profondeur max de récursion | 4 (→ max 16 feuilles) |

### Structure des fichiers

```
src/script/map/
├── BSPNode.js          ← un noeud de l'arbre BSP (rectangle + enfants) ✅
├── MapGenerator.js     ← la classe principale, orchestre tout (TODO)
└── MapNode.js          ← un noeud de la carte finale (ce que le joueur verra) (TODO)
```

---

## Session 1 — 2026-04-12

### BSPNode.js — structure + méthode split()

**Fichier :** `src/script/map/BSPNode.js`

**Propriétés :**

| Propriété | Type | Description |
|---|---|---|
| `x, y` | int | Coordonnées du coin haut-gauche du rectangle |
| `width, height` | int | Dimensions du rectangle |
| `left` | BSPNode \| null | Sous-arbre gauche (ou null si feuille) |
| `right` | BSPNode \| null | Sous-arbre droit (ou null si feuille) |
| `room` | MapNode \| null | Salle placée dans la feuille (null tant qu'elle n'est pas générée) |

**Méthode `split(minNodeSize)` — Algorithme :**

1. **Vérifier les orientations possibles** :
   - `canSplitHorizontal = height >= 2 * minNodeSize`
   - `canSplitVertical = width >= 2 * minNodeSize`
   - Si aucune des deux n'est possible → `return false`

2. **Choisir l'orientation préférée** selon le ratio `height/width` :
   - `ratio >= 1.25` → horizontal (plus haut que large)
   - `ratio <= 0.8` → vertical (plus large que haut)
   - Entre les deux → aléatoire 50/50

3. **Fallback** : si l'orientation préférée n'est pas possible, forcer l'autre.

4. **Calculer la position de coupe** :
   ```js
   splice = minNodeSize + Math.floor(Math.random() * (dimension - 2 * minNodeSize + 1))
   ```
   Cette formule garantit que les deux enfants ont au moins `minNodeSize` dans la dimension coupée.

5. **Créer les enfants** en respectant les coordonnées absolues (`this.y + splice` pour horizontal, `this.x + splice` pour vertical).

6. `return true`.

**Bugs rencontrés pendant l'implémentation (et corrigés) :**

- Tentative initiale avec `splitRatio` aléatoire entre 0.3 et 0.7 — ne garantissait pas la contrainte `minNodeSize`. Remplacé par une formule bornant directement le splice.
- Condition de refus avec `&&` au lieu de `||` — refusait seulement si les deux dimensions étaient trop petites. Corrigé en vérifiant par orientation.
- Conditions inversées `height < 2*minNodeSize` au lieu de `height >= 2*minNodeSize` dans le choix d'orientation.
- Coordonnées relatives au lieu d'absolues pour les enfants droite/bas (`splice` au lieu de `this.y + splice`).
- Paramètres `minRatio`/`maxRatio` stockés dans le noeud puis abandonnés — lignes résiduelles dans le constructeur référençant des variables inexistantes.
- Cas pathologique : `width=22, height=18, minNodeSize=10` — zone aléatoire du ratio, peut choisir horizontal alors que `canSplitHorizontal = false`. Corrigé avec le fallback explicite.

**Testé :** non, pas encore de code d'appel. Test viendra avec `MapGenerator`.

---

## Prochaine étape

### MapGenerator.js (TODO)

**Structure à créer :**

```js
export class MapGenerator {
    constructor(width, height, minNodeSize, maxDepth) {
        // stocke les paramètres
    }

    generate() {
        // 1. Crée le BSPNode racine (0, 0, width, height)
        // 2. Lance _splitRecursive(racine, 0)
        // 3. Retourne l'arbre (BSPNode racine)
    }

    _splitRecursive(node, depth) {
        // Condition d'arrêt : depth >= maxDepth OU node.split() retourne false
        // Sinon : récursion sur node.left et node.right avec depth + 1
    }
}
```

**Points clés à expliquer à l'utilisateur :**

- La récursion : `_splitRecursive` appelle `node.split(minNodeSize)`. Si `true`, on récurse sur `node.left` et `node.right`. Si `false`, c'est une feuille, on s'arrête.
- Deux conditions d'arrêt : profondeur max atteinte OU split impossible (rectangle trop petit).
- Pour l'instant, retourner simplement l'arbre (la racine). Méthode d'extraction des feuilles viendra ensuite.

**Étapes suivantes après MapGenerator :**

1. Méthode pour **collecter les feuilles** de l'arbre (parcours récursif)
2. **Placer une salle** (point/MapNode) dans chaque feuille — coordonnées dans le rectangle
3. **Connecter les salles** en remontant l'arbre BSP — à chaque noeud interne, connecter une salle du sous-arbre gauche à une salle du sous-arbre droit
4. **Assigner des types** aux noeuds (combat, marchand, repos, événement, boss)
5. **Affichage** (plus tard — canvas, SVG ou DOM)

---

---

## Session 2 — 2026-04-12

### MapGenerator.js — génération complète

**Fichier :** `src/script/map/MapGenerator.js`

**Propriétés :**

| Propriété | Type | Description |
|---|---|---|
| `width, height` | int | Dimensions de la carte |
| `minNodeSize` | int | Taille minimale d'un nœud BSP |
| `maxDepth` | int | Profondeur maximale de récursion |
| `leaves` | BSPNode[] | Feuilles de l'arbre BSP |
| `mapNodes` | MapNode[] | Liste plate des salles générées |
| `connections` | Connection[] | Connexions entre salles |

**Méthodes :**

| Méthode | Description |
|---|---|
| `generate()` | Crée la racine BSPNode, lance `_splitRecursive`, retourne la racine. Reset `this.leaves` en entrée. |
| `_splitRecursive(node, depth)` | Récursion BSP — arrêt si `depth >= maxDepth` ou `split()` retourne `false` |
| `getLeaves(node)` | Parcours récursif — pousse les feuilles dans `this.leaves` |
| `placeRoom()` | Crée un `MapNode` au centre de chaque feuille, alimente `this.mapNodes` et `leave.room` |
| `_getFirstLeaf(node)` | Descend à gauche récursivement jusqu'à une feuille, retourne son `room` |
| `connectRooms(node)` | À chaque nœud interne, connecte la première feuille gauche à la première feuille droite via `Connection` |

**Testé :** 16 feuilles → 15 connexions ✅

---

### MapNode.js

**Fichier :** `src/script/map/MapNode.js`

Classe concrète représentant un nœud de la carte finale (ce que le joueur verra).

| Propriété | Type | Description |
|---|---|---|
| `id` | int | Identifiant unique (index dans `mapNodes`) |
| `x, y` | int | Coordonnées du centre du rectangle BSP |

Le `type` (combat, marchand, repos...) sera ajouté lors de l'étape d'assignation.

---

### Connection.js

**Fichier :** `src/script/map/Connection.js`

Classe concrète représentant une connexion entre deux `MapNode`.

| Propriété | Type | Description |
|---|---|---|
| `from` | int | Id du MapNode source |
| `to` | int | Id du MapNode destination |

Choix d'une classe plutôt qu'un objet littéral — extensible pour différentes stratégies de connexion plus tard.

---

### MapRenderer.js — rendu SVG

**Fichier :** `src/script/map/MapRenderer.js`

Classe responsable du rendu visuel de la carte en SVG. Séparée de `MapGenerator` (pattern Engine/UI).

| Propriété | Type | Description |
|---|---|---|
| `svgEl` | SVGElement | Référence à l'élément `<svg>` du DOM |
| `mapNodes` | MapNode[] | Nœuds à afficher |
| `connections` | Connection[] | Connexions à afficher |
| `scale` | int | Facteur d'échelle (unités BSP → pixels) |
| `nodeRadius` | int | Rayon des cercles SVG |

| Méthode | Description |
|---|---|
| `render()` | Appelle `_renderConnections` puis `_renderNodes` (ordre important : lignes sous cercles) |
| `_renderConnections(connection)` | Crée une `<line>` SVG entre les deux MapNodes via leurs ids |
| `_renderNodes(mapNode)` | Crée un `<circle>` SVG positionné aux coordonnées scalées |

**Note technique :** les éléments SVG se créent avec `document.createElementNS("http://www.w3.org/2000/svg", "tagName")`, pas `createElement`.

**Résultat visuel :** nœuds bien répartis sur la carte, connexions majoritairement locales, quelques longues diagonales dues à la stratégie `_getFirstLeaf` (première feuille gauche). Comportement attendu pour un prototype.

**Testé et fonctionnel dans le navigateur ✅**

---

## Structure des fichiers (état actuel)

```
src/script/map/
├── BSPNode.js       ← nœud BSP (rectangle + split) ✅
├── MapGenerator.js  ← génération complète (BSP + salles + connexions) ✅
├── MapNode.js       ← nœud de la carte finale ✅
├── Connection.js    ← connexion entre deux MapNodes ✅
└── MapRenderer.js   ← rendu SVG ✅
```

---

## Décision d'architecture — 2026-04-12

### Pivot vers une génération par couches (style Slay the Spire)

**Contexte :** après visualisation du résultat BSP et analyse de la référence Slay the Spire, le BSP seul ne produit pas naturellement la structure souhaitée.

**Problème du BSP pur :**
- Structure hiérarchique (arbre), pas directionnelle
- Les connexions relient des voisins BSP, pas des voisins géographiques par couche
- Pas de croisements naturels entre chemins parallèles

**Objectif visuel :**
- Nœuds organisés en rangées (du bas vers le haut, comme Slay the Spire)
- Connexions allant toujours vers la rangée suivante
- Croisements géométriques entre chemins parallèles
- Feeling "grille de ville ou de bâtiment" — régulier avec de la variance

**Décision : approche par couches (Option B)**

Le BSP existant (`BSPNode`, `MapGenerator` actuel) est conservé tel quel — il pourra servir pour la génération de donjons en grille plus tard. La génération de la carte d'acte (style Slay the Spire) passe à une nouvelle classe dédiée.

---

## Prochaine étape — Génération par couches

### Principe

```
1. Diviser la carte en N rangées (floors)
2. Placer M nœuds par rangée (avec variance aléatoire sur x)
3. Connecter chaque nœud vers 1 à 3 nœuds de la rangée suivante
4. Règles de croisement : autoriser les connexions qui se croisent géométriquement
5. Nœud de départ (bas) → nœuds boss (haut)
```

### Paramètres envisagés

| Paramètre | Rôle | Valeur indicative |
|---|---|---|
| `floors` | Nombre de rangées | 8-10 |
| `nodesPerFloor` | Nœuds par rangée (min/max) | 3-5 |
| `connectionsPerNode` | Connexions sortantes par nœud | 1-3 |

### Structure des fichiers cible

```
src/script/map/
├── BSPNode.js           ← conservé (génération de donjons future)
├── MapGenerator.js      ← conservé (BSP)
├── LayeredMapGenerator.js  ← NOUVEAU — génération par couches
├── MapNode.js           ← réutilisé (ajouter propriété `floor`)
├── Connection.js        ← réutilisé
└── MapRenderer.js       ← à adapter pour le rendu par couches
```

### Étapes d'implémentation

1. `LayeredMapGenerator` — `constructor(width, height, floors, minNodes, maxNodes)` ✅
2. `MapLayer` — génération d'une couche avec déviation aléatoire X et Y ✅
3. Stratégie de connexion `_connectLayer()` — N plus proches + gestion orphelins + anti-croisement ✅
4. **Assignation des types** (`combat`, `merchant`, `rest`, `event`, `boss`) ← prochaine étape
5. Rendu SVG enrichi (couleurs par type)

---

## Session 3 — 2026-04-13

### LayeredMapGenerator.js + MapLayer.js

**Fichiers :** `src/script/map/LayeredMapGenerator.js`, `src/script/map/MapLayer.js`

#### MapLayer

| Propriété | Type | Description |
|---|---|---|
| `width, height` | int | Dimensions de la couche |
| `floor` | int | Numéro d'étage |
| `minNbrNodes, maxNbrNodes` | int | Fourchette de nœuds par couche |
| `firstId, lastId` | int | Plage d'ids des nœuds générés |
| `nodesList` | MapNode[] | Nœuds de la couche |

`generate()` — place M nœuds espacés uniformément sur X avec déviation aléatoire (±30% de l'espacement en X, ±35% de la hauteur en Y). Retourne `lastId` pour chaîner les ids avec la couche suivante.

#### LayeredMapGenerator

| Propriété | Type | Description |
|---|---|---|
| `width, height` | int | Dimensions de la carte |
| `minNbrNode, maxNbrNode` | int | Fourchette de nœuds par couche |
| `nbrLayer` | int | Nombre de couches |
| `layers` | MapLayer[] | Couches générées |
| `mapNodes` | MapNode[] | Liste plate de tous les nœuds |
| `connections` | Connection[] | Connexions entre nœuds |
| `floor` | int | Dernier étage (= nbrLayer après génération) |

**Méthodes de connexion disponibles :**

| Méthode | Description |
|---|---|
| `_connectAllNodes()` | Chaque nœud → tous les nœuds de la couche suivante |
| `_connectNearNodes()` | Chaque nœud → le plus proche de la couche suivante |
| `_connectNNearNodes()` | Chaque nœud → N plus proches (N aléatoire 1-3) |
| `_connectLayer()` | **Méthode principale** — N plus proches + orphelins garantis + anti-croisement |

**`_connectLayer()` — algorithme :**
1. Pour chaque paire de couches (N, N+1)
2. Étape 1 — pour chaque nœud de N : trouver les N plus proches sur N+1, vérifier anti-croisement, créer connexion, marquer dans `connectedIds`
3. Étape 2 — pour chaque nœud de N+1 absent de `connectedIds` (orphelin) : connecter au plus proche sur N avec anti-croisement

**Anti-croisement :** `_segmentsIntersect(a, b, c, d)` via `_orientation(p, q, r)` (produit vectoriel). Une connexion est rejetée si elle croise une connexion existante.

**Post-processing anti-orphelin (ajouté 2026-04-14) :**
Après `_connectLayer()`, parcours de tous les nœuds pour détecter ceux sans connexion vers floor-1 ou floor+1. Pour chaque nœud orphelin :
1. Tentative de connexion avec anti-croisement (itère sur les nœuds de la couche cible)
2. Si aucun chemin sans croisement trouvé → connexion forcée sur un nœud aléatoire de la couche

Garantit zéro orphelin ✅

**Résultat visuel :** structure en chemins multiples, croisements visuels éliminés, zéro orphelin, feeling organique. Nœud hub encore possible (à limiter avec `maxConnections` plus tard).

**Testé et fonctionnel dans le navigateur ✅**

---

## Session 4 — 2026-04-14

### Typage des nœuds + rendu coloré

#### MapNode.js — propriété `type`

Ajout de `this.type = null` dans le constructeur. Valeur par défaut `null`, assignée par `LayeredMapGenerator.assignTypes()`.

---

#### LayeredMapGenerator.js — `assignTypes()`

Méthode publique ajoutée, appelée en fin de `generateMap()`.

Utilise un `switch` sur `node.floor` :

| Condition | Type assigné |
|---|---|
| `floor === 1` | `"boss"` |
| `floor === 2` | `"rest"` (safe place avant boss — 4 nœuds fixes) |
| `floor === this.floor` | `"start"` |
| `floor === this.floor - 1` | `"combat"` (premier combat forcé) |
| Autres | Tirage aléatoire (voir ci-dessous) |

**Probabilités du tirage aléatoire (`Math.random()*100`) :**

| Seuil | Type |
|---|---|
| ≤ 40 | `"combat"` |
| ≤ 60 | `"event"` |
| ≤ 75 | `"rest"` |
| ≤ 90 | `"merchant"` |
| > 90 | `"mystery"` |

---

#### constants.js — `NODE_COLORS`

Objet de correspondance `type → couleur` ajouté :

```js
export const NODE_COLORS = {
    "combat":   "orange",
    "event":    "purple",
    "rest":     "green",
    "merchant": "yellow",
    "boss":     "red",
    "start":    "white",
    "mystery":  "gray"
}
```

---

#### MapRenderer.js — rendu coloré

`_renderNodes` simplifié :

```js
circle.setAttribute("fill", NODE_COLORS[mapNode.type] ?? this.fill);
```

Fallback sur `this.fill` si le type est `null` ou inconnu.

**Testé et fonctionnel dans le navigateur ✅**

---

### Refactor — probabilités dans les constantes

**Fichiers :** `src/script/constants.js`, `src/script/map/LayeredMapGenerator.js`

Ajout de `NODE_TYPE_CHANCE` dans `constants.js` — les probabilités sont centralisées, séparées des couleurs :

```js
export const NODE_TYPE_CHANCE = {
    "combat":   45,
    "event":    20,
    "rest":     10,
    "merchant": 10,
    "mystery":  15
}
```

`assignTypes()` remplacé par un tirage cumulatif générique (boucle sur `Object.entries`) :

```js
let cumul = 0;
for (const [type, chance] of Object.entries(NODE_TYPE_CHANCE)) {
    cumul += chance;
    if (random <= cumul) { node.type = type; break; }
}
```

Avantage : ajouter ou modifier un type ne nécessite que de toucher `constants.js`.

---

## Décision d'architecture — Pattern Strategy (2026-04-14)

L'assignation des types de nœuds passe au **Pattern Strategy** — chaque algorithme (table pondérée, gradient, Markov, budget...) devient une stratégie interchangeable. `LayeredMapGenerator` ne dépend que de l'abstraction parente.

### Arborescence cible

```
src/script/map/strategies/
├── AbstractNodeTypeStrategy.js   ← classe abstraite, définit la signature
├── WeightedStrategy.js           ← table pondérée (algorithme actuel)
└── GradientStrategy.js           ← gradient spatial (prochain objectif)
```

### Signature commune

```js
assignAll(mapNodes, totalFloors)
```

Option B (tous les nœuds d'un coup) choisie — seule option compatible avec toutes les stratégies futures (budget par acte nécessite une vision globale avant le premier assignement, Markov a besoin des voisins de chemin).

### Intégration dans LayeredMapGenerator

```js
constructor(..., strategy) {
    ...
    this.strategy = strategy; // instance d'AbstractNodeTypeStrategy
}

// dans generateMap() :
this.strategy.assignAll(this.mapNodes, this.floor);
```

---

## Prochaine étape — Implémentation du Pattern Strategy

### Étape 1 — AbstractNodeTypeStrategy.js

Classe abstraite avec :
- Blocage de l'instanciation directe (`new.target`)
- Méthode abstraite `assignAll(mapNodes, totalFloors)` qui lève une erreur si appelée directement

### Étape 2 — WeightedStrategy.js

Migrer la logique actuelle de `assignTypes()` dans `LayeredMapGenerator` vers cette classe.

### Étape 3 — GradientStrategy.js

Implémenter le gradient spatial :

```js
assignAll(mapNodes, totalFloors) {
    for (const node of mapNodes) {
        // types fixes (boss, start, combat forcé, rest)
        // ...
        // types aléatoires : poids dynamiques selon node.floor
        const t = node.floor / totalFloors;
        const weights = {
            combat:   60 - t * 30,
            event:    10 + t * 20,
            rest:      5 + t * 15,
            merchant: 15 - t * 10,
            mystery:  10 + t *  5
        };
        // tirage cumulatif sur weights
    }
}
```

### Étape 4 — LayeredMapGenerator.js

Remplacer `assignTypes()` par `this.strategy.assignAll(this.mapNodes, this.floor)`.

**Référence algorithmes :** `documentation/hacktivistAlgorithmsNodeType.md`

---

## Session 5 — 2026-04-16

### Generate and Test dans `generateMap()` — correction de formule

**Fichier :** `src/script/map/LayeredMapGenerator.js`

La formule d'estimation du nombre de nœuds attendus était incorrecte (`3*nbrLayer+9`). Avec `minNbrNode=2` et `maxNbrNode=6`, la moyenne réelle est 4 nœuds par couche.

**Formule corrigée :**
```js
(4 * this.nbrLayer + 9) * 0.80  // borne basse  (±20%)
(4 * this.nbrLayer + 9) * 1.20  // borne haute  (±20%)
```

Tolérance passée à ±20% — calibrage provisoire, à affiner après playtest. Utiliser `((min+max)/2)*nbrLayer+9` pour rendre la formule indépendante des paramètres à terme.

---

### `_connectNodesOnLayer()` — connexions intra-couche (raccourcis)

**Fichier :** `src/script/map/LayeredMapGenerator.js`

Nouvelle méthode privée. Génère aléatoirement des connexions entre nœuds voisins d'une même couche — des "raccourcis" horizontaux pour enrichir les stratégies de déplacement et s'articuler avec la Clock et le brouillard de guerre.

**Algorithme :**

1. Generate and Test — boucle jusqu'à obtenir entre `floor * 0.33` et `floor * 0.67` connexions intra-couche
2. Couches exclues : floors 1, 2, `floor-1`, `floor` (boss, safe place, premier combat, start)
3. Pour chaque nœud de chaque couche éligible :
   - Voisin gauche (prevIndex) : 10% de chance de connexion
   - Voisin droit (nextIndex) : probabilité recalibrée (à affiner)
4. Filtre anti-doublon avant chaque push :

```js
if (!connectionsList.some(c =>
    (c.from === node.id && c.to === neighbor.id) ||
    (c.to === node.id && c.from === neighbor.id)
)) connectionsList.push(connection);
```

**Probabilités asymétriques (intentionnel) :**
Un nœud A vérifie son voisin droit B, puis B vérifie son voisin gauche A. Sans asymétrie, les chances de créer A↔B seraient doublées. Le 10% sur le retour compense.

**Résultat :** connexions intra-couche rares, feeling de raccourcis organiques.

---

### Nouveaux documents de référence

| Fichier | Contenu |
|---|---|
| `documentation/hacktivistAlgorithmsBSP.md` | BSP — historique, principe, variantes, applications |
| `documentation/hacktivistAlgorithmsWFC.md` | WFC — historique, principe, variantes, applications |
| `documentation/hacktivistGameDesign-Clock-FogOfWar-MapEvolution.md` | Conception des 3 mécaniques de jeu |

---

### Conception validée — Clock, Brouillard de guerre, Évolution dynamique

Trois mécaniques interdépendantes conçues mais non implémentées. Voir `hacktivistGameDesign-Clock-FogOfWar-MapEvolution.md` pour le détail complet.

Points clés :
- Clock visible dès le départ, 1 unité par déplacement, Pattern Strategy pour les seuils narratifs
- `MapNode.visibility` : `hidden` / `visible` / `revealed`, fenêtre ±2 floors
- Tous les nœuds (cachés, visibles, visités) peuvent changer de type — contenu change avec le type
- Backtracking possible et consomme la Clock
- Architecture Pattern Observer : Clock émet, les autres systèmes réagissent

---

## Session 6 — 2026-04-17

### Pattern Strategy appliqué au typage des nœuds

Le typage des nœuds, auparavant codé en dur dans `LayeredMapGenerator.assignTypes()`, est extrait dans une hiérarchie de stratégies. `LayeredMapGenerator` ne dépend plus que de l'abstraction — les algorithmes de typage deviennent interchangeables et testables séparément.

#### Structure créée

```
src/script/map/strategies/
├── AbstractNodeTypeStrategy.js   ← contrat commun
├── WeightedStrategy.js           ← table pondérée (algo historique)
└── GradientStrategy.js           ← gradient spatial (nouveau)
```

#### AbstractNodeTypeStrategy.js

Classe abstraite, même pattern que `BehaviorInterface` / `EffectInterface` :
- Instanciation directe bloquée via `new.target`
- Méthode abstraite `assignAll(mapNodes, totalFloors)` qui throw si non redéfinie

Pas de propriétés — la classe ne porte pas d'état, c'est un pur contrat.

#### WeightedStrategy.js

Migration de la logique existante de `assignTypes()`. `this.floor` remplacé par le paramètre `totalFloors` pour rendre la stratégie autonome du générateur. Switch identique (BOSS, REST, START, COMBAT forcés) + tirage cumulatif sur `NODE_TYPE_CHANCE`.

#### GradientStrategy.js

Nouvelle stratégie — les poids varient selon la position du nœud sur l'axe vertical :

```js
const t = 1 - (node.floor / totalFloors);
```

Inversion `1 - ...` appliquée car convention interne : `floor 1 = boss` (fin de run) et `floor max = start` (début). Donc `t=0` = début, `t=1` = fin.

**Choix d'architecture** : les poids dynamiques sont externalisés dans `constants.js` sous forme de **fonctions** plutôt qu'en dur dans la stratégie.

```js
export const NODE_TYPE_WEIGHTS = {
    "combat" :  (t) => 60 - t * 30,
    "event" :   (t) => 10 + t * 20,
    "rest" :    (t) => 5  + t * 15,
    "merchant": (t) => 15 - t * 10,
    "mystery":  (t) => 10 + t *  5
};
```

Avantages :
- Ajouter un type = toucher un seul fichier
- Tuning game design centralisé
- Signature `(t) => number` → peut accueillir gaussiennes, puissances, sinus sans refacto

Somme à `t=0` et `t=1` = 100 — le tirage cumulatif `Math.random()*100` reste valide quel que soit `t`.

#### Intégration dans LayeredMapGenerator

- Constructeur accepte un paramètre `strategy` stocké dans `this.strategy`
- Appel dans `generateMap()` : `this.strategy.assignAll(this.mapNodes, this.floor)`
- Méthode `assignTypes()` supprimée
- Imports `NODE_TYPE_LIST` et `NODE_TYPE_CHANCE` retirés du générateur

#### Point d'injection

`testMap.js` : bascule entre stratégies en une ligne, sans rien toucher au générateur.

```js
const map = new LayeredMapGenerator(20,45,2,6,20, new GradientStrategy());
// const map = new LayeredMapGenerator(20,45,2,6,20, new WeightedStrategy());
```

Testé — la différence entre les deux stratégies est visible en poussant les paramètres aux extrêmes.

---

### Document de référence — gradients probabilistes

**Fichier :** `documentation/gradients_probabilistes_game_design.md`

Synthèse d'une exploration mathématique sur les courbes de probabilité utilisables pour le game design procédural :
- Gaussienne inversée (creux central), somme de deux gaussiennes (double pic)
- Extension 2D avec opérateurs de combinaison (t-normes / t-conormes de la logique floue)
- Autres briques : smoothstep, puissance / racine, sinus / cosinus, bruit de Perlin, clamp + remap
- Relation avec WFC (gradients = couche de bias ; WFC = cohérence d'assemblage)

Ce document ouvre la voie à un travail de game design : quelle courbe pour quel type de nœud narrativement ? La signature `(t) => poids` de `NODE_TYPE_WEIGHTS` permet d'appliquer ces courbes directement sans refacto.

---

## Prochaines étapes

1. Expérimenter les courbes dans `NODE_TYPE_WEIGHTS` — gaussienne centrée sur `rest` / `merchant`, puissance sur `event`
2. Affinage visuel — `maxConnections` par nœud, limiter les hubs
3. Implémentation Clock / brouillard de guerre / évolution dynamique (voir `hacktivistGameDesign-Clock-FogOfWar-MapEvolution.md`)

---

*Document vivant — à mettre à jour au fil de l'implémentation.*
