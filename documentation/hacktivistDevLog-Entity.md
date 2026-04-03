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

## Prochaine session

Implémenter les 5 cartes du prototype :

| Carte | Famille | Coût | Statut |
|---|---|---|---|
| Scan Basique | Matrice | 1 | À faire en premier |
| Firewall Personnel | Confrontation | 1 | À faire |
| Brouilleur | Terrain | 1 | À faire |
| Virement Anonyme | Social Engineering | 2 | À faire |
| Frappe Cybernétique | Confrontation | 1 | À faire |

**Point de départ :** `ScanBasique.js`
- `generateData(player)` — +2 Data
- `increaseDetection(player)` — +8% Alert
- `effect(player)` — appelle les deux (condition sur le mode de jeu à intégrer plus tard)
