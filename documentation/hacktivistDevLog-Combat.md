# Dev Log — Feature : combat

> Journal de développement de la feature moteur de combat.
> Objectif : implémenter la logique de combat tour par tour.

---

## Responsabilités du moteur

### Gestion du tour
- Gérer l'alternance des tours (joueur puis ennemis)
- Gérer l'initiative en début de combat (qui joue en premier)

### Tour du joueur
- Distribuer la main de départ et gérer la pioche chaque tour
- Gérer la défausse en fin de tour
- Permettre au joueur de jouer des cartes (coût en énergie)
- Afficher les intentions des ennemis

### Mode Fantôme / Alerte Rouge
- Incrémenter `player.alert` en fin de tour en Mode Fantôme
- Détecter le basculement vers Alerte Rouge (`alert >= 100`)
- Détecter le basculement immédiat si une carte hors "Matrice"/"Terrain" est jouée en Mode Fantôme
- Ordre : effet de la carte appliqué → basculement

### Tour des ennemis
- Exécuter l'action de chaque ennemi selon son `actionsList`
- Mettre à jour l'`intention` de chaque ennemi pour le tour suivant

### Statuts
- Décrémenter la `duration` de tous les statuts actifs en fin de tour
- Retirer les statuts expirés (`duration <= 0`)
- Tenir compte des statuts pertinents lors des actions (ex: Shield avant les dégâts)

### Conditions de fin de combat
- **Défaite** : `player.health <= 0`
- **Victoire** : tous les ennemis ont `health <= 0` OU possèdent le statut "Neutralized"

---

---

## Session 1 — 2026-04-04

### Conception de CombatEngine

**Fichier cible :** `src/script/game/CombatEngine.js`

---

### Constructeur

```js
constructor(player, enemies, initPlayer, energyPerTurn, handSize)
```

| Paramètre | Type | Description |
|---|---|---|
| `player` | Player | Le joueur |
| `enemies` | Enemy[] | Les ennemis du combat |
| `initPlayer` | boolean | true = joueur en premier, false = ennemis en premier |
| `energyPerTurn` | int | Énergie réinitialisée au début de chaque tour joueur |
| `handSize` | int | Nombre de cartes en main complète |

**Propriétés internes :**
- `turnCount` — compteur de tours écoulés (0 à l'init)
- `mode` — "Ghost" ou "RedAlert"
- `isOver` — boolean, combat terminé ou non

---

### Méthodes publiques

| Méthode | Description |
|---|---|
| `launchFight()` | Initialise le combat : mélange deck, définit mode, intentions, main de départ, compteur à 0, initiative |
| `switchTurn()` | Alterne les tours — gère défausse partielle, pioche, recyclage défausse, énergie, statuts, alerte |
| `playCard(card, targets)` | Joue une carte : vérifie énergie, applique effet, bascule si carte hors discrétion en Mode Fantôme |
| `switchGhostToRedAlert()` | Bascule le mode de Fantôme à Alerte Rouge |
| `verifyVictory()` | Retourne `null` / `Player` (victoire) / `Enemy[]` (défaite) |
| `endFight()` | Met fin à la confrontation |

---

### Méthodes privées

| Méthode | Description |
|---|---|
| `shuffleDeck()` | Mélange aléatoirement le deck |
| `shuffleDiscardInDeck()` | Mélange la défausse dans le deck |
| `drawCards()` | Complète la main jusqu'à `handSize` |
| `discardCard()` | Défausse une carte choisie |
| `initEnergy()` | Réinitialise `player.energy` à `energyPerTurn` |
| `updateTurn()` | Incrémente `turnCount` |
| `updateAlert()` | Incrémente `player.alert` |
| `verifyAlert()` | Teste si `player.alert >= 100` → appelle `switchGhostToRedAlert()` |
| `updateStatus()` | Décrémente `duration` de tous les statuts actifs, retire les expirés |
| `showIntentions()` | Dévoile les intentions des ennemis pour le prochain tour |
| `verifyData()` | Si `player.data >= enemy.dataThreshold` → ajoute la carte faille au deck |
| `enemyAction()` | Exécute les actions des ennemis selon leur `actionsList` |

---

### Modification de Enemy

Ajout de la propriété `dataThreshold` (int) — seuil de données nécessaire pour révéler la vulnérabilité de l'ennemi. Valeur variable selon la difficulté de scan de l'ennemi.

---

---

## Session 2 — 2026-04-04

### Implémentation des méthodes privées de CombatEngine

**Fichier :** `src/script/game/CombatEngine.js`

Toutes les méthodes privées sont implémentées :

| Méthode | Statut | Notes |
|---|---|---|
| `_initializeEnergy()` | ✅ | `player.energy = energyPerTurn` |
| `_updateTurn()` | ✅ | `turnCount++` |
| `_updateAlert()` | ✅ | `Math.min(100, player.alert + 10)` |
| `_verifyAlert()` | ✅ | `player.alert >= 100` |
| `_verifyAlertAtRandom()` | ✅ | Gardée pour l'équilibrage futur — détection probabiliste avant 100% |
| `_shuffleDeck()` | ✅ | Fisher-Yates |
| `_shuffleDiscardInDeck()` | ✅ | concat + vidage défausse + shuffle |
| `_drawCards()` | ✅ | Récursif — recycle défausse si deck vide, arrêt si deck toujours vide |
| `_discardCard(card)` | ✅ | indexOf + splice + push dans discard |
| `_updateStatus()` | ✅ | Décrémente duration, filtre les expirés — joueur et ennemis |
| `_showIntentions()` | ✅ | console.log des intentions ennemies |
| `_verifyData(enemy)` | ✅ | Appelle `_generateExploitCard()` si seuil atteint, shuffle le deck |
| `_generateExploitCard(enemy)` | ✅ | Switch sur `enemy.vulnerability` — "Financial" → `VirementAnonyme` |
| `_enemyAction(enemy)` | ✅ | Appelle `enemy.act()` |

**Décisions notables :**
- `_verifyAlertAtRandom()` conservée inactive — détection probabiliste à activer lors de l'équilibrage
- `_generateExploitCard()` extensible via switch — ajouter un case par type de vulnérabilité

---

---

## Session 3 — 2026-04-05

### Implémentation des méthodes publiques de CombatEngine

Ajouts et modifications par rapport à la conception initiale :

- `_updateStatus()` refactorisé — prend un `character` en paramètre plutôt que d'itérer en interne
- `_enemyAction()` — appelle désormais `_changeIntention()` après `enemy.act()`
- `_changeIntention(enemy)` — nouvelle méthode privée, pioche aléatoirement dans `enemy.actionsList`
- `_playerTurn()` et `_enemyTurn()` — nouvelles méthodes privées pour factoriser la logique de tour
- `_showIntentions()` — filtre les ennemis à `health <= 0` ou "Neutralized"

**Méthodes publiques :**

| Méthode | Notes |
|---|---|
| `launchFight()` | Shuffle, mode Ghost, intentions, main, énergie, turnCount à 0, gère initiative |
| `switchTurn()` | Modulo 2 + `initPlayer` pour déterminer le tour — ennemi enchaîne automatiquement sur joueur |
| `playCard(card, targets)` | Vérifie énergie, déduit coût, effet, bascule si hors discrétion en Ghost, défausse |
| `switchGhostToRedAlert()` | `this.mode = "RedAlert"` |
| `verifyVictory()` | `null` / `Player` (victoire) / `enemies[]` (défaite) |
| `endFight()` | `isOver = true`, nullifie `player` et `enemies` pour le GC |

**Décision notable :** en Mode Fantôme, les ennemis n'agissent pas — `_enemyTurn()` incrémente seulement `alert` et bascule si nécessaire.

---

---

## Session 4 — 2026-04-05

### Nouveaux fichiers

- `src/script/entities/actionEntities/AbstractAction.js` — classe abstraite pour les actions ennemies. Propriétés : `name`, `type`, `description`. Méthode abstraite `effect(enemy, targets = [])`.
- `src/script/entities/actionEntities/AttaqueBasique.js` — extends AbstractAction. Inflige 6 dégâts à `targets[0]` en tenant compte du Shield.
- `src/script/entities/characterEntities/GardeDeNuit.js` — extends Enemy. 12 PV, type "Human", vulnérabilité "Financial", dataThreshold 3, actionsList : [AttaqueBasique].

### Corrections et ajouts dans CombatEngine

- `_verifyData()` — `enemy.dataThreshold` mis à `undefined` après génération de la carte exploit, pour éviter les doublons
- `_enemyAction()` — passe `this.player` et `this.enemies` à `enemy.act()`
- `playCard()` — appelle `_verifyData()` pour chaque ennemi après l'effet de la carte
- `verifyVictory()` — appelée après chaque action ennemi et chaque carte jouée. Retourne le vainqueur et appelle `endFight()` si combat terminé
- `switchTurn()` — vérifie `isOver` en entrée pour stopper la récursion si combat terminé

### Décisions de game design

- **Cumul des Status de même type** — on garde les valeurs les plus grandes (`intensity` et `duration`). Pas de stacking infini, mais rejouer une carte rafraîchit les valeurs si elles sont supérieures. `FirewallPersonnel` implémente cette logique.
- **Bouclier persistant** — contrairement à Slay the Spire, le Shield dure plusieurs tours. Le stacking d'intensity aurait créé des murs infranchissables.

### Test

Script de test fonctionnel dans `src/script/script.js`.

---

## Session 5 — 2026-04-09

### Feature : défausse partielle en fin de tour

Le joueur peut choisir quelles cartes défausser de sa main avant de passer au tour ennemi. Les cartes non défaussées restent en main pour le tour suivant.

**Nouveau flux de tour :**
1. Tour joueur — jouer des cartes
2. Clic "Fin de Tour" → entre en phase de défausse
3. Phase de défausse — sélection multi-cartes (toggle)
4. Clic "Défausser les Cartes" → défausse les cartes sélectionnées, lance le tour ennemi

**Pas de limite de défausse pour l'instant** — à activer lors de l'équilibrage (`discardLimit`). Pas de défausse totale forcée.

---

### Gestion de phase dans CombatEngine

Ajout de la propriété `this.phase` — trois états possibles :

| Phase | Description |
|---|---|
| `"playerTurn"` | Tour du joueur — peut jouer des cartes |
| `"discardPhase"` | Phase de défausse — sélection des cartes à défausser |
| `"enemyTurn"` | Tour des ennemis |

**Mise à jour de `this.phase`** dans : `_playerTurn()`, `_enemyTurn()`, `launchFight()` (cas initiative ennemie), `discardPhase()`.

**Nouvelles méthodes publiques :**

| Méthode | Description |
|---|---|
| `discardPhase()` | Passe `this.phase` à `"discardPhase"` |
| `launchDiscard(cards)` | Défausse un tableau de cartes via `_discardCard()` |

---

### Modifications CombatUI

**Nouvelles propriétés :**
- `selectedToDiscard = []` — tableau de cartes sélectionnées pour la défausse
- `btnDiscard` — référence DOM vers `#btn-discard`

**Nouvelle méthode :**
- `_selectCardToDiscard(card)` — toggle une carte dans `selectedToDiscard` (ajout/retrait avec `splice`)

**Modifications existantes :**
- `bindEvents()` — listener `#hand-zone` dispatch selon la phase (`_selectCard` en playerTurn, `_selectCardToDiscard` en discardPhase). Bouton "Fin de Tour" appelle `discardPhase()` au lieu de `switchTurn()`. Nouveau listener `#btn-discard` : défausse + `switchTurn()` + `render()`
- `_renderHand()` — surligne les cartes dans `selectedToDiscard` en phase de défausse
- `_renderPlayer()` — gestion de la visibilité des boutons selon 4 cas : `isOver` (tout cacher), `discardPhase` (btnDiscard visible), `playerTurn` (btnEndTurn visible), `enemyTurn` (tout cacher)

**Fichiers HTML/CSS :**
- `index.html` — bouton `#btn-discard` ajouté dans `#controls-zone`
- `main.css` — `#btn-discard` caché par défaut (`#btn-play, #btn-discard { display: none; }`)

**script.js :**
- `let ui` déclaré avant CombatEngine pour référence dans le callback `onAction`
- `ui.render()` ajouté dans le callback `onAction` — masque les boutons pendant le tour ennemi

---

## Prochaine étape

Feature `combat` — défausse partielle terminée.

**Feuille de route (détail dans GDD section 11) :**
- Court terme : limite de défausse (`discardLimit`), limite de cartes en main (style Magic)
- Moyen terme : nouveaux ennemis, nouvelles actions, nouvelles cartes, animations par carte
- Long terme : carte BSP, récompenses, nœuds, méta-progression
- Transversal : équilibrage (jauge, dégâts, Status)

