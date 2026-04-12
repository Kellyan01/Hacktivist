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

1. `LayeredMapGenerator` — `constructor(width, height, floors, minNodes, maxNodes)`
2. `generate()` — crée les nœuds par rangée, stocke dans `this.mapNodes` par floor
3. Stratégie de connexion — connecter vers la rangée suivante avec règles de croisement
4. Assignation des types (`combat`, `merchant`, `rest`, `event`, `boss`)
5. Rendu SVG adapté (nœuds alignés par rangée, connexions diagonales)

---

*Document vivant — à mettre à jour au fil de l'implémentation.*
