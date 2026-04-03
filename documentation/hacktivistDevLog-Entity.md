# Dev Log — Feature : entities

> Journal de développement de la branche `feature/entities`.
> Objectif : implémenter les entités de base du jeu (cartes, personnages).

---

## Session 1 — 2026-04-03

### Structure du projet

Mise en place de l'arborescence complète :

```
src/script/entities/   ← entités du jeu
src/script/game/       ← logique de jeu (à venir)
src/script/script.js   ← point d'entrée
src/style/main.css
contextClaude/         ← mémoire Claude
documentation/         ← fichiers de documentation
```

Gitflow initialisé : `main`, `developpement`, branche `feature/entities` créée.

---

### AbstractCard

**Fichier :** `src/script/entities/AbstractCard.js`

Classe abstraite commune à toutes les cartes du jeu.

**Propriétés :** `name`, `type`, `cost`, `description`

**Méthode abstraite :** `effect()` — doit être implémentée par chaque carte enfant. Lève une `Error` si appelée directement.

**Pattern d'abstraction JS :**
- Blocage de l'instanciation directe via `new.target === AbstractCard`
- `effect()` lève `"effect() must be implemented"` pour forcer la surcharge

**Décisions :**
- `effect` est une méthode, pas une propriété du constructeur — chaque carte enfant l'implémente à sa façon
- Chaque carte enfant aura ses propres méthodes spécifiques, `effect()` les orchestrera

---

### AbstractCharacter

**Fichier :** `src/script/entities/AbstractCharacter.js`

Classe abstraite commune à tous les personnages (joueur et ennemis).

**Propriétés :** `name`, `type`, `health`

**Méthode abstraite :** `act()` — représente l'action d'un personnage lors de son tour.

**Même pattern d'abstraction que AbstractCard.**

---

### Enemy

**Fichier :** `src/script/entities/Enemy.js`

**Extends :** `AbstractCharacter`

**Propriétés spécifiques :**
- `vulnerability` — faille cachée, révélée par scan Matrice
- `intention = null` — action prévue au prochain tour (affiché au joueur)
- `actionsList` — liste d'actions prédéfinies passée au constructeur

**`act()` :** TODO — sera implémentée lors du développement du moteur de combat.

---

### Player

**Fichier :** `src/script/entities/Player.js`

**Extends :** `AbstractCharacter`

**Propriétés spécifiques :**
- `energy` — ressource par tour pour jouer des cartes
- `alert` — jauge de détection (Mode Fantôme → Alerte Rouge)
- `data` — ressource Matrice accumulée en scannant
- `deck` — pioche (passée au constructeur)
- `discard = []` — défausse, vide à l'initialisation
- `hand = []` — main, vide à l'initialisation

**`act()` :** TODO — sera implémentée lors du développement du moteur de combat.

**Décision :** `deck`, `hand` et `discard` sont trois zones distinctes — nécessaire pour modéliser le cycle pioche → main → défausse d'un deckbuilder.

---

### Status

**Fichier :** `src/script/entities/Status.js`

Classe concrète représentant un état actif sur un personnage (buff ou debuff).

**Propriétés :** `name`, `type`, `intensity` (int), `duration` (int)

**Décision :** tableau d'objets `Status` plutôt qu'un objet `{}` — permet de conserver la temporalité (durée) et l'intensité de chaque état de façon autonome.

`AbstractCharacter` expose `this.status = []` pour stocker ces états.

---

### Cartes du prototype

Toutes les cartes se trouvent dans `src/script/entities/cardEntities/`.

Signature commune : `effect(player, targets = [])` — `targets` est un tableau d'`AbstractCharacter`.

| Carte | Famille | Coût | Fichier |
|---|---|---|---|
| Scan Basique | Matrice | 1 | `ScanBasique.js` |
| Firewall Personnel | Confrontation | 1 | `FirewallPersonnel.js` |
| Brouilleur | Terrain | 1 | `Brouilleur.js` |
| Virement Anonyme | Social Engineering | 2 | `VirementAnonyme.js` |
| Frappe Cybernétique | Attaque | 1 | `FrappeCybernetique.js` |

**Décisions notables :**
- `ScanBasique` et `Brouilleur` — la condition sur le mode de jeu (Fantôme / Alerte Rouge) est en TODO
- `FirewallPersonnel` — crée un `Status` "Shield" (intensity 5, duration 3) dans `player.status`
- `VirementAnonyme` — cible `targets[0]` uniquement, vérifie `type === "Human"`, applique "Neutralized" (duration 10000 pour simuler permanent)
- `FrappeCybernetique` — prend en compte le bouclier le plus élevé dans `targets[0].status`, dégâts minimum 0

---

## Prochaine session

Feature `entities` terminée. Prochaine étape à définir (moteur de combat, carte BSP, etc.).
