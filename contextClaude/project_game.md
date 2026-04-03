---
name: Projet Jeu — Hacktiviste
description: Deckbuilding roguelite cyberpunk — état d'avancement, structure, entités
type: project
---

Jeu en développement : deckbuilder roguelite cyberpunk en JavaScript Vanilla.
Dossier : `d:\Projet_Dev_Yoann\Javascript\Hacktiviste\`
GDD disponible dans : `documentation/gameDesignDocument.md`

Projet séparé du projet Algo A Star. Les algos appris là-bas (BSP, Voronoi, A*...) seront réutilisés ici plus tard.

**Why:** l'utilisateur veut garder le projet Algo A Star comme espace d'exploration des algorithmes.
**How to apply:** ne pas mélanger les deux projets.

---

## Structure du projet

```
Hacktiviste/
├── index.html
├── README.md
├── assets/
├── contextClaude/
├── documentation/
└── src/
    ├── script/
    │   ├── entities/
    │   ├── game/
    │   └── script.js
    └── style/
        └── main.css
```

## Gitflow

- `main` — production
- `developpement` — branche de développement principale
- `feature/xxx` — une branche par feature
- `release` et `hotfix` — à prévoir plus tard

## État d'avancement

### feature/entities (en cours)

Entités créées dans `src/script/entities/` :

- `AbstractCard.js` — classe abstraite, propriétés : name, type, cost, description. Méthode abstraite `effect()`. Bloque l'instanciation directe via `new.target`.
- `AbstractCharacter.js` — classe abstraite, propriétés : name, type, health. Méthode abstraite `act()`. Même pattern que AbstractCard.
- `Enemy.js` — extends AbstractCharacter. Propriétés : vulnerability, intention (null), actionsList. `act()` en TODO.
- `Player.js` — extends AbstractCharacter. Propriétés : energy, alert, data, deck, discard ([]), hand ([]). `act()` en TODO.

### Cartes prévues pour le prototype (non encore implémentées)

| Carte | Famille | Coût | Rôle |
|---|---|---|---|
| Scan Basique | Matrice | 1 | Recherche matricielle — génère 2 Data, +8% Détection en Mode Fantôme |
| Firewall Personnel | Confrontation | 1 | Défense — gagne 5 Bouclier |
| Brouilleur | Terrain | 1 | Furtivité — réduit Détection de 15%, inutilisable en Alerte Rouge |
| Virement Anonyme | Social Engineering | 2 | Exploitation faille humaine — neutralise une cible révélée |
| Frappe Cybernétique | Confrontation | 1 | Attaque physique — inflige X dégâts à une cible physique |

## Prochaine étape

Implémenter `ScanBasique.js` — première carte concrète, extends AbstractCard.
- Méthode `generateData(player)` — ajoute 2 Data au joueur
- Méthode `increaseDetection(player)` — ajoute 8% à la jauge Alert
- `effect(player)` appelle les deux méthodes (condition sur le mode de jeu à intégrer plus tard)
