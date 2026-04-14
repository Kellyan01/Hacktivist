# Algorithmes de distribution des types de nœuds

> Document de référence — comparatif des approches pour la génération procédurale des types de nœuds de la carte d'acte.

---

## Vue d'ensemble

| Approche | Ce qu'elle contrôle | Force | Limite |
|---|---|---|---|
| Table pondérée | Fréquence globale | Simple | Pas de contexte |
| Chaîne de Markov | Enchaînements locaux | Rythme naturel | Pas de vision globale |
| Budget + contraintes | Composition garantie | Équilibre exact | Placement parfois artificiel |
| Gradient spatial | Évolution par position | Progression narrative | Nécessite un calibrage |

Les jeux les plus sophistiqués (Hades, Dead Cells, FTL) combinent les quatre.

---

## 1. Table pondérée (implémentée ✅)

Chaque type a un poids fixe. Tirage cumulatif générique sur `NODE_TYPE_CHANCE`.

```js
let cumul = 0;
for (const [type, chance] of Object.entries(NODE_TYPE_CHANCE)) {
    cumul += chance;
    if (random <= cumul) { node.type = type; break; }
}
```

**Limite :** pas de contexte — un `rest` peut apparaître juste après un autre `rest`.

---

## 2. Chaîne de Markov

### Historique
Inventée par **Andreï Markov** en 1906 pour modéliser des séquences de lettres dans la littérature russe.

### Principe
> "L'état futur ne dépend que de l'état présent, pas du passé."

Matrice de transition : pour chaque état, probabilités de passer à chaque autre état.

```js
const MARKOV = {
    "combat":   { combat: 30, event: 25, rest: 20, merchant: 15, mystery: 10 },
    "rest":     { combat: 60, event: 20, rest:  5, merchant: 10, mystery:  5 },
    "merchant": { combat: 70, event: 15, rest: 10, merchant:  0, mystery:  5 },
    "event":    { combat: 40, event: 20, rest: 15, merchant: 10, mystery: 15 },
    "mystery":  { combat: 45, event: 20, rest: 10, merchant: 10, mystery: 15 },
}
```

Après un `rest`, le combat devient très probable → rythme tension/relâchement naturel, sans le coder explicitement.

### Variantes
- **Ordre 1** (classique) — dépend de l'état actuel uniquement
- **Ordre N** — dépend des N derniers états (matrice plus grande)
- **HMM (Hidden Markov Model)** — états non observables, on infère depuis des indices
- **MCMC** — échantillonnage de distributions complexes (statistique bayésienne)

### Applications
- **Left 4 Dead** — Director AI ajuste l'intensité des vagues selon l'état de stress des joueurs
- **Hades** — dialogues varient selon les interactions précédentes
- **No Man's Sky** — génération de noms de planètes par chaînes sur des syllabes
- **T9 / correcteurs orthographiques** — prédiction de texte
- **PageRank (Google)** — rang d'une page = probabilité d'y atterrir à l'équilibre de la chaîne
- **Marchés financiers** — états haussier/baissier/stable avec probabilités de transition
- **Génétique** — modélisation des mutations ADN

---

## 3. Budget par acte + Contraintes d'exclusion

### Budget par acte

#### Historique
Issu du game design de table (D&D, 1974) — assignation manuelle de contenu avant placement. La version procédurale automatise ce raisonnement. Formalisé en informatique via le **bin packing** et l'**allocation de ressources**.

#### Principe
> "Décider de la composition avant de décider du placement."

1. Calculer combien de chaque type (le budget)
2. Construire le pool
3. Mélanger (Fisher-Yates)
4. Assigner

```js
const pool = [];
for (const [type, chance] of Object.entries(NODE_TYPE_CHANCE)) {
    const count = Math.round(N * chance / 100);
    for (let i = 0; i < count; i++) pool.push(type);
}
while (pool.length < N) pool.push("combat"); // bourrage arrondi
while (pool.length > N) pool.pop();
```

**Méthode des plus grands restes** pour les arrondis : attribuer les places restantes aux types avec les plus grands restes décimaux. Utilisée dans les systèmes électoraux proportionnels.

#### Applications
- **Dead Cells** — budget précis d'ennemis et d'objets par biome
- **Hades** — pool de chambres prédéfini par acte
- **FTL** — quota de balises ennemies, neutres, magasins par secteur
- **Darkest Dungeon** — budget de monstres et curios selon la longueur du donjon
- **Systèmes électoraux** (Belgique, Pays-Bas) — allocation proportionnelle des sièges

---

### Contraintes d'exclusion

#### Historique
Issu de la **théorie des contraintes** (Eliyahu Goldratt, 1984) et de la **programmation par contraintes** (IA, années 70-80).

#### Principe
> "Générer librement, puis rejeter ce qui viole les règles."

**Contraintes locales** — portent sur un nœud et ses voisins :
- Pas deux `rest` adjacents
- Pas de `merchant` après un `merchant`

**Contraintes globales** — portent sur l'acte entier :
- Maximum 2 `merchant` par acte
- Au moins 1 `rest` avant le boss

**Hard constraints** → rejet total si violation.
**Soft constraints** → pénalité sur la probabilité, pas d'interdit absolu.

#### Applications
- **Slay the Spire** — repos garanti dans les 5 nœuds avant le boss, deux premiers nœuds toujours combat
- **Into the Breach** — pas deux missions "protéger" consécutives
- **Minecraft** — contraintes de voisinage entre biomes (désert ≠ toundra)
- **Spelunky 2** — sorties de salle accessibles vérifiées par flood-fill
- **Sudoku** — solveur par propagation de contraintes (algorithme AC-3)
- **Planification industrielle** — ordonnancement de tâches (IBM ILOG CPLEX)

---

### Combinaison budget + contraintes

Le budget répond à *combien*, les contraintes à *dans quel ordre*.

```
1. Calculer le budget → pool [combat, combat, rest, merchant, ...]
2. Mélanger le pool (Fisher-Yates)
3. Assigner aux nœuds
4. Vérifier les contraintes locales
   → Violation : échanger avec un nœud compatible dans le pool
   → Répéter jusqu'à satisfaction
```

L'échange (pas le rejet) préserve la composition globale tout en respectant les contraintes locales.

---

## 4. Gradient spatial

### Historique
Deux sources convergentes :
- **Gradient mathématique** — Cauchy et Gauss, XIXe siècle. Décrit comment une valeur varie dans l'espace.
- **Bruit de Perlin** — inventé par **Ken Perlin** en 1983 pour le film *Tron*. Génère des textures naturelles sans aspect mécanique. Oscar technique en 1997.

### Principe
> "La probabilité d'un état dépend de sa position dans l'espace."

Les poids fixes sont remplacés par des fonctions dépendant du `floor`.

```js
function getWeights(floor, totalFloors) {
    const t = floor / totalFloors; // 0 (début) → 1 (boss)
    return {
        combat:   60 - t * 30,   // 60% → 30%
        event:    10 + t * 20,   // 10% → 30%
        rest:      5 + t * 15,   //  5% → 20%
        merchant: 15 - t * 10,   // 15% →  5%
        mystery:  10 + t *  5    // 10% → 15%
    };
}
```

Début d'acte brutal (combats), milieu respiratoire (repos, marchands), montée vers le boss étrange (events, mysteries).

### Types de fonctions de transition
| Fonction | Description |
|---|---|
| Linéaire | Taux de changement constant |
| Escalier | Paliers discrets (début/milieu/fin) |
| Gaussienne | Concentration autour d'un floor central |
| Bruit de Perlin | Tendance de fond + irrégularités organiques |
| Sigmoïde | Transition douce entre deux zones |

### Variantes
- **Gradient 1D** — sur le floor uniquement (le plus simple)
- **Gradient 2D** — varie aussi horizontalement (cartes monde ouvert)
- **Gradient directionnel** — basé sur la distance parcourue par le chemin
- **Gradient multivariable** — floor + distance au boss + combats déjà rencontrés...

### Applications
- **Dark Souls / Elden Ring** — difficulté croît avec la distance au point de départ, décroît autour des feux de camp
- **Spelunky** — densité de pièges et d'ennemis rares augmente avec la profondeur
- **Minecraft** — biomes générés par bruit de Perlin 2D sur température et humidité
- **Civilization VI** — ressources stratégiques distribuées par gradient d'altitude et latitude
- **No Man's Sky** — systèmes proches du centre galactique = plus riches mais plus dangereux
- **Diablo III** — probabilités d'affixes selon le niveau de Torment (gradient discret sur 16 paliers)
- **Cyberpunk 2077 / Blade Runner 2049** — générateurs de villes par gradient de densité urbaine
- **Cartographie** — heatmaps de densité de population, criminalité, pollution
- **Écologie** — gradient altitudinal (biodiversité varie avec l'altitude)
- **Machine learning** — descente de gradient : algorithme d'entraînement des réseaux de neurones

---

## Recommandation d'implémentation progressive

1. **Maintenant** → Gradient spatial (fort impact, faible complexité)
2. **Après playtest** → Contraintes d'exclusion si des absurdités locales apparaissent
3. **Après stabilisation** → Budget par acte si la distribution globale semble déséquilibrée
4. **Version avancée** → Markov si le rythme des enchaînements semble mécanique

*Document de référence — ne pas modifier sauf ajout d'une nouvelle approche.*
