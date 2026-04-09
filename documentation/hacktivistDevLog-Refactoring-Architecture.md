# Dev Log — Refactorisation : Architecture

> Journal de la refactorisation architecturale du projet.
> Objectif : mettre en place des bases saines, adaptables et maintenables avant d'ajouter du contenu.

---

## Motivation

Analyse structurelle réalisée le 2026-04-09. Le projet a de bonnes fondations (composition des effets, séparation Engine/UI, abstraction cohérente), mais plusieurs faiblesses structurelles doivent être corrigées avant que le volume de code rende la refactorisation coûteuse.

---

## Bons points identifiés

| Point | Détail |
|---|---|
| **Abstraction cohérente** | Pattern `new.target` appliqué uniformément sur les 4 classes abstraites |
| **Composition des effets** | Les cartes/actions composent des objets Effect réutilisables au lieu de coder leur logique en dur |
| **Séparation Engine/UI** | `CombatEngine` ne connaît pas le DOM, `CombatUI` ne connaît pas les règles |
| **Effets de ciblage** | Pattern filtre chaînable (TargetByType, TargetByStatus, TargetByHealth) |
| **Sécurité DOM** | Pas de `innerHTML`, `createElement` + `textContent`, `replaceChildren()`, délégation d'événements |
| **Encapsulation** | Méthodes privées `_prefix`, wrappers publics (ex: `launchDiscard`) |

---

## Points faibles identifiés

### PF1 — AbstractCard et AbstractAction sont des jumeaux sans lien

Mêmes propriétés (`name`, `type`, `description`), même méthode abstraite (`effect()`), aucun parent commun. Impossible de traiter uniformément "tout ce qui a un effet".

### PF2 — Contrat ambigu de `effect()` dans EffectInterface

Effets applicatifs (Damage, ApplyStatus) retournent `void`. Effets de ciblage (TargetByType...) retournent `AbstractCharacter[]`. Même signature, contrats opposés. L'appelant doit savoir quel type il manipule — casse le polymorphisme.

### PF3 — Mutation directe des propriétés

Les effets modifient directement `target.health`, `target.data`, `target.alert`. Pas de validation, pas de bornes, pas de notification. `GainData` fait `target.data += this.gain` mais `data` n'existe que sur `Enemy` — JS crée silencieusement la propriété sur un Player au lieu de crasher.

### PF4 — CombatEngine est un God Object

Gère : deck, tours, alerte, statuts, victoire, génération de cartes exploit, énergie. Trop de responsabilités dans une seule classe.

### PF5 — Magic strings

`"Ghost"`, `"RedAlert"`, `"playerTurn"`, `"Neutralized"`, `"Shield"`, `"Matrice"`, `"Human"`, `"Financial"`... Une typo échoue silencieusement.

### PF6 — Pas de système d'événements

Un seul hook (`onAction`). L'UI est appelée manuellement par `render()`. Ne scale pas pour les animations par carte, changements de mode, etc.

### PF7 — Paramètres inutilisés (dead code)

`minGain`, `minReduction`, `minIncrease`, `minIntensity`, `minDuration` — passés au constructeur mais jamais utilisés dans la logique.

### PF8 — endFight() détruit les références

`this.player = null` et `this.enemies = null` — crash si l'UI ou un log tente d'y accéder après la fin du combat.

---

## Recommandations

### URGENT — À faire avant tout ajout de contenu

#### R1. Séparer les deux contrats d'effet

**Problème :** PF2
**Action :** Créer deux interfaces distinctes :
- `EffectInterface` — effets applicatifs, `effect()` retourne `void`
- `TargetFilterInterface` — effets de ciblage, `effect()` retourne `AbstractCharacter[]`

**Fichiers impactés :**
- `src/script/interfaces/EffectInterface.js` — conserver pour les effets applicatifs
- `src/script/interfaces/TargetFilterInterface.js` — nouveau fichier
- `src/script/entities/effectEntities/targetEffect/*.js` — changer le parent

---

#### R2. Encapsuler les mutations avec des méthodes

**Problème :** PF3
**Action :** Ajouter des méthodes sur les personnages pour modifier leur état :
- `AbstractCharacter` : `takeDamage(amount)`, `heal(amount)`
- `Enemy` : `gainData(amount)`
- `Player` : `modifyAlert(amount)`, `modifyEnergy(amount)`

Les effets appellent ces méthodes au lieu de modifier les propriétés directement. Les règles métier (bornes, immunités) vivent dans le personnage.

**Fichiers impactés :**
- `src/script/entities/characterEntities/AbstractCharacter.js`
- `src/script/entities/characterEntities/Player.js`
- `src/script/entities/characterEntities/Enemy.js`
- `src/script/entities/effectEntities/Damage.js`
- `src/script/entities/effectEntities/GainData.js`
- `src/script/entities/effectEntities/IncreaseAlert.js`
- `src/script/entities/effectEntities/ReduceAlert.js`

---

#### R3. Extraire la gestion du deck

**Problème :** PF4 (partiel)
**Action :** Créer une classe `Deck` encapsulant `cards`, `discard`, `hand` avec les méthodes `shuffle()`, `draw(count)`, `discard(card)`, `recycleDiscard()`. `Player` possède un `Deck`, pas trois tableaux.

**Fichiers impactés :**
- `src/script/entities/Deck.js` — nouveau fichier
- `src/script/entities/characterEntities/Player.js` — remplacer `deck`, `hand`, `discard` par un objet `Deck`
- `src/script/game/CombatEngine.js` — déléguer les opérations de deck à `Deck`
- `src/script/game/CombatUI.js` — accéder à la main via `player.deck.hand`

---

#### R4. Supprimer le dead code

**Problème :** PF7
**Action :** Retirer les paramètres inutilisés :
- `GainData` : retirer `minGain`
- `ReduceAlert` : retirer `minReduction`
- `IncreaseAlert` : retirer `minIncrease`
- `ApplyStatus` : retirer `minIntensity`, `minDuration`

Mettre à jour toutes les instanciations dans les cartes et actions.

**Fichiers impactés :**
- `src/script/entities/effectEntities/GainData.js`
- `src/script/entities/effectEntities/ReduceAlert.js`
- `src/script/entities/effectEntities/IncreaseAlert.js`
- `src/script/entities/effectEntities/ApplyStatus.js`
- Toutes les cartes et actions qui instancient ces effets

---

#### R5. Ne pas nullifier dans endFight()

**Problème :** PF8
**Action :** Retirer `this.player = null` et `this.enemies = null` dans `endFight()`. Le flag `isOver` suffit.

**Fichier impacté :** `src/script/game/CombatEngine.js`

---

#### R6. Parent commun pour AbstractCard et AbstractAction

**Problème :** PF1
**Action :** Créer une classe ou interface commune (`AbstractPlayable` ou `PlayableInterface`) garantissant `{ name, type, description, effect() }`. `AbstractCard` et `AbstractAction` en héritent.

**Fichiers impactés :**
- `src/script/interfaces/PlayableInterface.js` — nouveau fichier (ou `src/script/entities/AbstractPlayable.js`)
- `src/script/entities/cardEntities/AbstractCard.js` — extends le parent commun
- `src/script/entities/actionEntities/AbstractAction.js` — extends le parent commun

---

### PRIORITAIRE — À faire avant l'ajout de contenu

#### R7. Constantes pour les magic strings ✅ 2026-04-09

**Problème :** PF5
**Action :** Fichier `src/script/constants.js` créé avec 8 objets : `MODE`, `PHASE`, `STATUS`, `TYPE_CARD`, `TYPE_CHARACTER`, `TYPE_VULNERABILITY`, `TYPE_STATUS`, `TYPE_ACTION`. Toutes les magic strings remplacées dans le code exécuté.

---

#### R8. Système d'événements

**Problème :** PF6
**Priorité :** PRIORITAIRE — à implémenter avant l'ajout de contenu (nouveaux ennemis, cartes, animations).
**Action :** Implémenter un EventEmitter simple sur `CombatEngine` — `emit("cardPlayed", card)`, `emit("modeChanged", mode)`. L'UI s'abonne au lieu d'être appelée manuellement. Se transpose en Signaux Godot.

---

## Ordre d'implémentation recommandé

| Étape | Recommandation | Raison de l'ordre | Statut |
|---|---|---|---|
| 1 | R4 — Dead code | Le plus simple, réduit le bruit immédiatement | ✅ 2026-04-09 |
| 2 | R5 — endFight() | Correction triviale, élimine un risque de crash | ✅ 2026-04-09 |
| 3 | R1 — Séparer les interfaces | Clarifie les contrats avant de toucher aux effets | ✅ 2026-04-09 |
| 4 | R6 — Parent commun Card/Action | Clarifie la hiérarchie avant de toucher aux mutations | ✅ 2026-04-09 |
| 5 | R2 — Encapsuler les mutations | Dépend de la hiérarchie clarifiée | ✅ 2026-04-09 |
| 6 | R3 — Extraire Deck | La plus grosse refacto, à faire en dernier pour limiter les conflits | ✅ 2026-04-09 |

---

## Session 1 — 2026-04-09

### R4 — Dead code supprimé

Paramètres inutilisés retirés des constructeurs et des instanciations :
- `GainData` : `minGain` retiré
- `ReduceAlert` : `minReduction` retiré
- `IncreaseAlert` : `minIncrease` retiré
- `ApplyStatus` : `minIntensity`, `minDuration` retirés

Instanciations mises à jour dans : `ScanBasique`, `Brouilleur`, `FirewallPersonnel`, `VirementAnonyme`.

---

### R5 — endFight() nettoyé

`this.player = null` et `this.enemies = null` retirés. Seul `this.isOver = true` reste. Le Garbage Collector JS libère la mémoire automatiquement quand l'objet `CombatEngine` n'est plus référencé.

---

### R1 — Interfaces séparées

**Nouveau fichier :** `src/script/interfaces/TargetFilterInterface.js`
- Classe abstraite avec méthode `filter(user, targets)` retournant `AbstractCharacter[]`
- Contrat distinct de `EffectInterface.effect()` qui retourne `void`

**Fichiers migrés :**
- `TargetByType`, `TargetByStatus`, `TargetByHealth` : extends `TargetFilterInterface`, méthode renommée `effect()` → `filter()`
- Déplacés de `effectEntities/targetEffect/` vers `entities/targetEntities/` (nouveau dossier)
- Imports mis à jour dans : `AttaqueBasique`, `ScanBasique`, `FrappeCybernetique`, `VirementAnonyme`, `CombatUI`

---

### R6 — Parent commun AbstractPlayable

**Nouveau fichier :** `src/script/entities/AbstractPlayable.js`
- Classe abstraite portant les propriétés communes : `name`, `type`, `description`
- Méthode abstraite `effect(user, targets)`
- Choix d'une classe abstraite (avec propriétés) plutôt qu'une interface (contrat seul)

**Fichiers migrés :**
- `AbstractCard extends AbstractPlayable` — appelle `super(name, type, description)`, garde ses propriétés spécifiques (`cost`, `targeted`, `targetValidation`, `exhaust`)
- `AbstractAction extends AbstractPlayable` — appelle `super(name, type, description)`
- Méthode abstraite `effect()` retirée des deux enfants (héritée du parent)

---

### R2 — Mutations encapsulées

**Nouvelles méthodes sur les personnages :**
- `AbstractCharacter.modifyHealth(amount)` — borné entre 0 et `maxHealth`
- `Player.modifyAlert(amount)` — borné entre 0 et 100
- `Enemy.modifyData(amount)` — borné à 0 minimum

**Effets migrés :**
- `Damage._dealDamage()` → `target.modifyHealth(-damageToDeal)`
- `GainData._gainData()` → `target.modifyData(this.gain)`
- `IncreaseAlert._increaseAlert()` → `target.modifyAlert(this.increase)`
- `ReduceAlert._reduceAlert()` → `target.modifyAlert(-this.reduction)`
- `CombatEngine._updateAlert()` → `this.player.modifyAlert(10)`

**Choix de nommage :** `modifyHealth` plutôt que `takeDamage` — gère dégâts ET soins avec un seul appel.

---

### R3 — Classe Deck extraite

**Nouveau fichier :** `src/script/entities/Deck.js`

| Propriété | Description |
|---|---|
| `cards` | La pioche |
| `hand` | La main |
| `discard` | La défausse |

| Méthode | Description |
|---|---|
| `shuffle()` | Fisher-Yates (distribution uniforme) |
| `draw(handSize)` | Pioche récursive, recycle la défausse si pioche vide |
| `discardCard(card)` | Défausse depuis la main, respecte `exhaust` |
| `recycleDiscard()` | Mélange la défausse dans la pioche |

**Fichiers migrés :**
- `Player` — `this.deck = new Deck(deck)` remplace les trois tableaux `deck`, `hand`, `discard`
- `CombatEngine` — 4 méthodes privées supprimées (`_discardCard`, `_drawCards`, `_shuffleDeck`, `_shuffleDiscardInDeck`), remplacées par délégation à `player.deck`
- `CombatUI` — `this.player.hand` → `this.player.deck.hand`

**Correction du shuffle :** l'ancien algorithme (index aléatoire sur toute la longueur) créait un biais statistique. Remplacé par Fisher-Yates (`Math.random() * (i + 1)`, boucle décroissante `i > 0`).

---

## Structure du projet après refactorisation

```
src/script/
├── entities/
│   ├── AbstractPlayable.js          ← NOUVEAU — parent commun cartes/actions
│   ├── Deck.js                      ← NOUVEAU — gestion pioche/main/défausse
│   ├── Status.js
│   ├── actionEntities/
│   │   ├── AbstractAction.js        ← extends AbstractPlayable
│   │   └── AttaqueBasique.js
│   ├── cardEntities/
│   │   ├── AbstractCard.js          ← extends AbstractPlayable
│   │   ├── Brouilleur.js
│   │   ├── FirewallPersonnel.js
│   │   ├── FrappeCybernetique.js
│   │   ├── ScanBasique.js
│   │   └── VirementAnonyme.js
│   ├── characterEntities/
│   │   ├── AbstractCharacter.js     ← modifyHealth()
│   │   ├── Enemy.js                 ← modifyData()
│   │   ├── GardeDeNuit.js
│   │   └── Player.js               ← modifyAlert(), possède un Deck
│   ├── effectEntities/
│   │   ├── ApplyStatus.js
│   │   ├── Damage.js
│   │   ├── GainData.js
│   │   ├── IncreaseAlert.js
│   │   └── ReduceAlert.js
│   └── targetEntities/              ← DÉPLACÉ depuis effectEntities/targetEffect/
│       ├── TargetByHealth.js        ← extends TargetFilterInterface
│       ├── TargetByStatus.js
│       └── TargetByType.js
├── game/
│   ├── CombatEngine.js              ← allégé, délègue au Deck
│   └── CombatUI.js
├── interfaces/
│   ├── EffectInterface.js           ← effets applicatifs (void)
│   └── TargetFilterInterface.js     ← NOUVEAU — filtres de ciblage (AbstractCharacter[])
└── script.js
```

---

*Document vivant — à mettre à jour au fil de l'implémentation.*