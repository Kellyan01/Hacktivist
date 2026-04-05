# Tech Stack & Décisions techniques — Hacktiviste

> Document de référence pour toutes les décisions technologiques du projet.
> À mettre à jour au fil des choix.

---

## Situation actuelle — Prototype JS

**Stack :** JavaScript Vanilla, HTML, CSS — rendu dans le navigateur.

**Pourquoi JS pour le prototype :**
- Langage maîtrisé, pas de compilation, testable immédiatement dans le navigateur
- Permet de valider rapidement la logique de jeu sans overhead technique
- Pas adapté à la commercialisation multiplateforme (consoles impossibles)

---

## Cible commerciale

| Plateforme | Priorité |
|---|---|
| PC (Steam, GOG, Epic) | 1 |
| Xbox / PlayStation / Switch | 2 |
| Mobile (iOS / Android) | 3 |

---

## Moteur de jeu — Godot 4 (C#)

**Décision :** migration vers Godot 4 avec le support .NET (C#).

### Pourquoi Godot

| Critère | Détail |
|---|---|
| **Multiplateforme** | PC natif, mobile natif, consoles via porteurs tiers (W4 Games) |
| **Langage** | C# — proche de JS en syntaxe OO, logique métier transposable quasi ligne par ligne |
| **Coût** | Entièrement gratuit, open source, aucune redevance |
| **Adapté au projet** | Excellent pour la 2D, communauté indé active, nombreux deckbuilders réalisés avec |
| **Indépendance** | Pas de dépendance à une société commerciale (contrairement à Unity post-2023) |

### Alternatives écartées

| Moteur | Raison du rejet |
|---|---|
| Unity | Licence controversée depuis 2023, frais par installation au-delà d'un seuil |
| Unreal (C++) | Surdimensionné pour un deckbuilder 2D, C++ trop complexe pour la timeline |
| Game Maker | Langage propriétaire (GML), export console payant (~800$/plateforme/an), abonnement |
| JS + Electron | Consoles impossibles, pas viable pour commercialisation multiplateforme |
| C# sans framework | Infrastructure à construire entièrement, années de travail avant le premier écran |

### Plan de migration — Option B (parallèle)

La migration se fait en deux phases parallèles :

1. **JS** — on continue les features gameplay (nouveaux ennemis, cartes, équilibrage)
2. **Godot** — prototype de combat en C# dans un projet séparé, en apprentissage progressif

Migration complète vers Godot quand le prototype Godot est fonctionnel.

**Ce que la migration implique :**

| JS | Godot C# |
|---|---|
| Classes entités (`Player`, `Enemy`, cartes...) | Classes C# — quasi copier/coller |
| `CombatEngine` | Classe C# + Node Godot pour le cycle de vie |
| `CombatUI` | Scène Godot (`Label`, `Button`, `VBoxContainer`...) |
| CSS d'ambiance | `Theme` Godot + `CanvasModulate` |
| Callback `onAction` | Signaux Godot |

### Installation requise

- **Godot 4 .NET** — `godotengine.org/download` (prendre "Godot Engine - .NET")
- **SDK .NET 8** — `dotnet.microsoft.com/download`

---

## Son & Musique

**Situation :** développeur solo, pas musicien ni ingénieur du son.

### Court terme (prototype)

| Besoin | Solution |
|---|---|
| SFX | **Bfxr / ChipTone** — génération de SFX rétro/chiptune en un clic, zéro compétence requise |
| SFX alternatif | **Freesound.org** — bibliothèque Creative Commons |
| Musique | **itch.io** — packs musicaux cyberpunk/synthwave sous licence "game use" |

### Moyen terme (version commerciale)

| Option | Détail |
|---|---|
| **Apprendre BeepBox ou LMMS** | Quelques semaines pour BeepBox (style chiptune/synthwave, cohérent avec l'univers cyberpunk). LMMS plus complet mais courbe plus longue. |
| **Commission ponctuelle** | Fiverr ou itch.io — 3 à 5 tracks originales. Poste le moins cher à externaliser. |
| **Abonnement** | Epidemic Sound / Artlist — bibliothèque pro, vérifier droits Steam et consoles. |

### Ce qui a été écarté

- Apprendre le solfège et le bruitage professionnel de zéro — rapport temps/résultat trop défavorable dans une timeline 1-2 ans.
- Monter un collectif — le projet reste solo.

---

## Animation

**Situation :** illustrateur mais pas animateur.

### Style cible

- **Court terme :** 2D — illustrations fixes pour les personnages, animations simples (idle, hit, mort)
- **Long terme :** potentiellement 2D isométrique stylisé (référence : Transistor, Hades) — à réévaluer selon les ressources disponibles

> Note : Hades et Transistor ont mobilisé des équipes d'animateurs professionnels plusieurs années. En solo sur 1-2 ans, le style illustré statique isométrique est plus réaliste que des animations fluides de personnages.

### Scope réel pour un deckbuilder

| Élément | Besoin animation | Solution |
|---|---|---|
| Cartes | Flip, hover, glissement | Godot / CSS |
| Personnages | 4-6 frames (idle, attaque, hit, mort) | Aseprite |
| Effets | Particules, flash | Système de particules Godot |
| UI | Transitions, feedback | Code |

### Outils

| Outil | Usage | Coût |
|---|---|---|
| **Aseprite** | Pixel art animé — standard indé, dans la zone de compétence illustrateur | ~20€ |
| **Krita** | Dessin numérique traditionnel, animation frame par frame | Gratuit |
| **Godot** | Rigging 2D, squelette, animations procédurales | Gratuit |
| **Spine** | Rigging 2D pro, exportable Godot | ~100€ |

### Approche recommandée

1. **Illustrations fixes** pour les personnages (dans ta zone de compétence)
2. **Aseprite** pour les animations simples — quelques semaines d'apprentissage
3. **Effets Godot** pour les attaques et transitions
4. Évaluer le rigging Godot ou une externalisation ponctuelle (Fiverr) pour les animations complexes si nécessaire

### Référence de style réaliste

**Slay the Spire** plutôt que Hades — personnages quasi-statiques, effets visuels générés, résultat pro et vendable sur Steam en solo.

---

*Document vivant — à mettre à jour au fil des décisions.*
