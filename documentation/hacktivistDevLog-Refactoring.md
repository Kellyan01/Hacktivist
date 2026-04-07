# Dev Log — Refactorisation : effectEntities

> Journal de la refactorisation des effets de cartes et d'actions.
> Objectif : centraliser les algos partagés (dégâts, soins, status...) dans des classes Effect dédiées, pour éviter la duplication lors de l'ajout de nouveaux contenus.

---

## Motivation

Sans refactorisation, 100 cartes et 30 actions infligeant des dégâts dupliqueraient chacune leur propre algo. Toute modification (équilibrage, nouveau paramètre) nécessiterait de toucher chaque fichier.

**Solution :** classes `Effect` centralisées, attachées aux cartes et actions via composition.

---

## Architecture

### EffectInterface

**Fichier :** `src/script/interfaces/EffectInterface.js`

Classe abstraite commune à tous les effets.

- Bloque l'instanciation directe (`new.target === EffectInterface`)
- Méthode abstraite `effect(user, targets)` — `user` est la carte ou l'action qui déclenche l'effet, `targets` est un tableau d'`AbstractCharacter`

---

### effectEntities/

Dossier : `src/script/entities/effectEntities/`

Classes concrètes implémentant `EffectInterface`. Chaque classe encapsule un algo réutilisable.

---

## Session 1 — 2026-04-07

### Damage.js

**Fichier :** `src/script/entities/effectEntities/Damage.js`

**Paramètres constructeur :**

| Paramètre | Type | Description |
|---|---|---|
| `damage` | int | Dégâts de base |
| `typeNotAffected` | string | Type de cible immunisée (ex: `"Matrice"`) |
| `typeArmor` | string | Nom du status d'armure pris en compte (ex: `"Shield"`) |
| `minDamage` | int | Dégâts minimums après réduction (défaut : 0) |
| `minHealth` | int | PV minimums après application (défaut : 0) |

**Méthodes :**
- `_dealDamage(target)` — vérifie l'immunité, calcule l'armure (intensity la plus haute du status `typeArmor`), applique les dégâts, retourne les dégâts infligés
- `effect(user, targets)` — itère sur `targets` et appelle `_dealDamage()` pour chacune

**Note :** `typeNotAffected` est une string simple pour l'instant. Extension en liste possible plus tard si le besoin se présente.

---

### Migration des cartes et actions

| Fichier | Statut | Notes |
|---|---|---|
| `AttaqueBasique.js` | ✅ migré | `new Damage(6, "Matrice", "Shield", 0, 0)` |
| `FrappeCybernetique.js` | ✅ migré | `new Damage(5, "Matrice", "Shield", 0, 0)` |
| `FirewallPersonnel.js` | ⏳ à migrer | Effect `ApplyStatus` à créer |
| `VirementAnonyme.js` | ⏳ à migrer | Effect `ApplyStatus` à créer |
| `Brouilleur.js` | ⏳ à migrer | Effect `ReduceAlert` à créer |
| `ScanBasique.js` | ⏳ à migrer | Effect `GainData` à créer |

---

## Prochaine étape

Créer les classes Effect manquantes et migrer les cartes restantes :
1. `ApplyStatus` — pour `FirewallPersonnel` et `VirementAnonyme`
2. `ReduceAlert` — pour `Brouilleur`
3. `GainData` — pour `ScanBasique`
