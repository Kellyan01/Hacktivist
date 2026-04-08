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
| `FirewallPersonnel.js` | ✅ migré | `new ApplyStatus("Shield", "Buff", 5, 5, 3, 3)` |
| `VirementAnonyme.js` | ✅ migré | `new ApplyStatus("Neutralized", "Debuff", 1, 1, 10000, 10000, "Human")` |
| `Brouilleur.js` | ✅ migré | `new ReduceAlert(15, 15)` |
| `ScanBasique.js` | ✅ migré | `new GainData(2, 2)` + `new IncreaseAlert(8, 8)` |

### Bugs corrigés

- `Damage._dealDamage()` — propriété `typesListNotAffected` renommée en `typeNotAffected`
- `ApplyStatus._generateStatus()` — condition `typeTarget` inversée (`!this.typeTarget` → `this.typeTarget`)
- `ApplyStatus._generateStatus()` — comparaison avec `minIntensity`/`minDuration` corrigée en `this.intensity`/`this.duration`
- `IncreaseAlert._reduceAlert()` — méthode renommée `_increaseAlert()`

---

## Refactorisation des effets applicatifs terminée — 2026-04-07

---

## Session 2 — 2026-04-08

### Effets de ciblage (targetEffect/)

**Nouveau sous-dossier :** `src/script/entities/effectEntities/targetEffect/`

Les effets de ciblage **filtrent** les cibles au lieu d'**appliquer** un effet. Ils retournent un tableau réduit de cibles, chaînable avec d'autres effets.

**Décision d'architecture :** `effect()` dans `EffectInterface` autorise désormais un retour mixte (`@return : mixed`). Les effets de ciblage retournent un `AbstractCharacter[]`, les effets applicatifs retournent `void`.

**Chaînage manuel :** pas d'automatisation pour l'instant. C'est l'action/carte qui appelle les filtres dans l'ordre, puis passe le résultat aux effets applicatifs.

---

### TargetByType.js

**Fichier :** `src/script/entities/effectEntities/targetEffect/TargetByType.js`

**Paramètres constructeur :**

| Paramètre | Type | Description |
|---|---|---|
| `type` | string | Type de personnage à cibler (ex: `"Hacktivist"`, `"Human"`) |
| `count` | int \| `"all"` | Nombre de cibles à retourner |

**Méthode `effect(user, targets)` :**
1. Filtre par `target.type === this.type`
2. Limite au `count` via `slice()` si ce n'est pas `"all"`
3. Retourne le tableau filtré

---

### Migration du ciblage

| Fichier | Statut | Notes |
|---|---|---|
| `AttaqueBasique.js` | ✅ migré | `new TargetByType("Hacktivist", 1)` — remplace le filtre inline |

**Testé et fonctionnel dans le navigateur.**

---

### Prochains effets de ciblage à créer

- `TargetByStatus` — filtre par présence/absence d'un status
- `TargetByHealth` — filtre par seuil de PV
