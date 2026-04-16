# Game Design — Clock, Brouillard de guerre, Évolution dynamique

> Document de conception — trois mécaniques interdépendantes.
> Statut : conception validée, implémentation à venir.

---

## Vue d'ensemble

Trois mécaniques qui forment un système unifié :

| Mécanique | Rôle |
|---|---|
| **Clock** | Pression temporelle + déclencheur narratif |
| **Brouillard de guerre** | Incertitude + prise de risque à chaque déplacement |
| **Évolution dynamique** | Surprise + récompense de l'attention locale |

```
Clock          → "tu as un budget limité"
Brouillard     → "tu ne sais pas tout"
Évolution      → "ce que tu savais peut changer"
```

Chacune seule est simple. Les trois ensemble créent un espace de décision riche : le joueur gère simultanément le temps, l'information et l'incertitude.

---

## 1. La Clock

### Principe

Chaque niveau possède un compte à rebours visible dès le départ — le joueur joue en posture de stratège, pas dans le flou. Chaque déplacement d'un nœud vers un autre consomme 1 unité. Quand la Clock atteint 0 et que le boss n'est pas vaincu → game over, recommencer depuis le début.

### Valeur initiale

```
Clock = nbrFloors + floor((totalNodes - nbrFloors) * t)
```

- `nbrFloors` = chemin minimum (droit au boss)
- `totalNodes` = exploration totale
- `t` = facteur d'exploration (0.5 pour les premiers tests)

Tous les déplacements consomment la Clock, y compris les nœuds à types fixes (start, safe place, premier combat forcé).

### Backtracking

Le joueur peut revenir sur un nœud déjà visité. Ce déplacement consomme de la Clock comme n'importe quel autre. Si le nœud a changé de type entre-temps, son contenu change aussi.

### Interaction avec le combat

Non prévue pour l'instant. La Clock ne réagit qu'aux déplacements. À réévaluer après validation du cœur du système.

### Événements modificateurs

Les événements peuvent modifier la Clock en bonus ou en malus. Les nœuds `rest` et `merchant` — interaction à définir.

### Responsabilités de la classe Clock

```
Clock
├── valeur courante
├── valeur initiale (calculée à la génération)
├── consume(n)          → diminue la valeur, vérifie les seuils
├── modify(n)           → bonus/malus événements
└── émet (Pattern Observer) :
    ├── CLOCK_TICK        → à chaque déplacement
    ├── CLOCK_THRESHOLD   → à chaque seuil narratif
    └── CLOCK_EMPTY       → quand elle atteint 0
```

La Clock n'a aucune dépendance vers la carte ou le joueur — elle émet, les autres systèmes écoutent.

### Seuils narratifs — Pattern Strategy

Deux stratégies interchangeables pour décider quand déclencher `CLOCK_THRESHOLD` :

```
AbstractThresholdStrategy
├── FixedThresholdStrategy(step)
│     → seuil tous les `step` segments (ex: toutes les 4 unités)
└── RelativeThresholdStrategy(percent)
      → seuil tous les `percent`% de la Clock initiale
```

La Clock reçoit la stratégie à l'instanciation et ne sait pas laquelle est utilisée.

### Références
- *Darkest Dungeon* — système de torches (ressource qui diminue et change les conditions)
- *Slay the Spire* — carte à nœuds, mais avec contrainte de temps
- *Pandemic* — doom clock (horloge de fin de partie)

---

## 2. Brouillard de guerre

### Principe

Le joueur ne voit pas le type de tous les nœuds. La visibilité dépend de sa position sur la carte.

### États de visibilité d'un nœud

```
MapNode.visibility : "hidden" | "visible" | "revealed"
```

| État | Condition | Ce que le joueur voit |
|---|---|---|
| `hidden` | Hors de la fenêtre, jamais visité | Nœud présent, type inconnu |
| `visible` | Dans la fenêtre ±2 floors autour du joueur | Type visible en temps réel |
| `revealed` | Visité OU dévoilé par événement/objectif | Type toujours visible |

### Fenêtre de visibilité

Par défaut : floors courant -2 à +2. Paramétrable.

### Dévoilement étendu

Certains événements ou objectifs accomplis peuvent révéler des nœuds plus éloignés — l'information devient une récompense à part entière, cohérente avec le thème hacking.

---

## 3. Évolution dynamique de la carte

### Principe

Sous certaines conditions, le type d'un, plusieurs ou tous les nœuds change. Le contenu associé au nœud change avec son type.

### Déclencheurs

- Événement aléatoire sur un nœud `event`
- Seuil de la Clock (`CLOCK_THRESHOLD`) → Flash Infos narratif
- Autres conditions à définir

### Comportement selon l'état du nœud

| État du nœud | Comportement lors d'un changement |
|---|---|
| `hidden` | Change silencieusement, le joueur l'ignore |
| `visible` | Change en temps réel — le joueur voit la bascule immédiatement |
| `revealed` / visité | Change visuellement — le monde est vivant |

**Aucune restriction sur quels nœuds peuvent évoluer.** Nœuds cachés, visibles et visités sont tous candidats.

### Backtracking et évolution

Si un nœud change de type après que le joueur l'a visité, le joueur peut y retourner et en profiter avec son nouveau contenu. Ce retour consomme de la Clock — le backtracking est un pari, pas une option gratuite.

Exemples de situations générées :
- Un repos déjà utilisé devient un combat → le backtracking peut se retourner contre toi
- Un marchand inabordable devient un repos → revenir peut valoir le coût
- Un combat vidé devient un repos → récompense le joueur qui surveille la carte

### Signal visuel

Quand un nœud change de type dans la fenêtre visible, un indicateur visuel signale la bascule — même principe que la métaphore du promeneur : on voit la foule se transformer en émeute au bout de la rue.

### Architecture — Pattern Observer

```
Clock émet CLOCK_THRESHOLD
    └── MapEvolutionHandler écoute
            └── modifie les types des nœuds concernés
                    └── MapRenderer re-render les nœuds dans la fenêtre visible
```

La carte ne se modifie pas elle-même — elle réagit à un signal externe.

---

## Interaction avec la génération procédurale

**Règle de validation post-génération (Generate and Test) :**

```
distance minimale au boss (= nbrFloors) < Clock initiale
```

Cette règle est déjà implicitement garantie par la formule de Clock (`Clock > nbrFloors`), mais peut être vérifiée explicitement dans `generateMap()` si l'algorithme de génération évolue.

---

## Roadmap d'implémentation (ordre suggéré)

1. Classe `Clock` + `AbstractThresholdStrategy` + ses deux implémentations
2. Propriété `visibility` sur `MapNode`
3. Logique de mise à jour de la fenêtre de visibilité dans le système de déplacement
4. `MapEvolutionHandler` — écoute `CLOCK_THRESHOLD`, modifie les nœuds
5. Mise à jour de `MapRenderer` pour refléter visibilité et évolutions en temps réel

*Document vivant — à mettre à jour au fil de l'implémentation.*
