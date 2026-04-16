# Algorithme WFC — Wave Function Collapse

> Document de référence — historique, principe, variantes et applications.

---

## Historique

Inventé par **Maxim Gumin** en **2016**, ingénieur russe travaillant chez Microsoft. Publié open source sur GitHub en juin 2016 avec une implémentation en C#. Réception immédiate et massive dans la communauté game dev — en quelques semaines, des portages apparaissent dans tous les langages majeurs.

Le nom est un emprunt délibéré à la **mécanique quantique** : en physique, une particule existe dans une superposition d'états jusqu'à observation — sa fonction d'onde *collapse* alors vers un état unique. Gumin utilise cette métaphore : chaque cellule de la grille existe d'abord dans une superposition de tous les états possibles, et l'algorithme *collapse* progressivement cette incertitude.

S'inspire de l'algorithme **Model Synthesis** de Paul Merrell (2007) et des travaux sur la **propagation de contraintes** des années 80. Gumin l'a rendu accessible, visuel et spectaculaire.

En **2017-2018**, conférences à la GDC — devient un outil standard dans la boîte à outils PCG des développeurs indépendants.

---

## Principe fondateur

> "Observer une cellule, propager les contraintes aux voisins, répéter jusqu'à ce que tout soit déterminé."

L'algorithme travaille sur une grille. Chaque cellule commence en **superposition** : elle peut contenir n'importe quelle tuile disponible. Trois étapes répétées :

**1. Observer (Choose)**
Choisir la cellule avec l'**entropie minimale** — celle qui a le moins de tuiles encore possibles. En cas d'égalité, choix aléatoire pondéré. Forcer cette cellule vers un état unique (tirage parmi ses possibilités).

**2. Propager (Propagate)**
Mettre à jour les voisins : certaines tuiles deviennent impossibles en raison de la nouvelle contrainte. Propager en cascade jusqu'à stabilisation.

**3. Vérifier**
Si une cellule n'a plus aucune tuile possible → **contradiction**. Backtracking ou recommencer depuis le début.

Répéter jusqu'à ce que toutes les cellules soient résolues.

---

## Les deux modes

**Mode Simple Tiled**
Ensemble de tuiles + règles explicites écrites à la main : "la tuile MUR peut être voisine de SOL à gauche, mais pas de VIDE". Plus contrôlable.

**Mode Overlapping**
On fournit un **exemple** — une image ou une carte existante. L'algorithme extrait automatiquement les règles en analysant quels motifs de N×N apparaissent ensemble, puis génère du contenu qui *ressemble* à l'exemple sans le reproduire. Mode le plus spectaculaire visuellement.

---

## Variantes

| Variante | Description |
|---|---|
| **WFC 1D** | Appliqué à des séquences (musique, texte, événements) |
| **WFC 3D** | Extension volumique — bâtiments, cavernes, voxels |
| **WFC hiérarchique** | Macro-structure globale d'abord, WFC local dans chaque zone ensuite |
| **WFC avec contraintes hard** | Forcer certaines cellules avant de lancer — entrée, sortie, coffre garantis |
| **Markov Junior (2022)** | Successeur par Gumin — combine WFC avec des règles de réécriture de graphes, capable de logique causale |

---

## Applications réelles

### Jeux vidéo

- **Bad North (2018)** — génération des îles de défense, chaque île unique mais jouable
- **Caves of Qud** — zones et villages avec cohérence locale garantie
- **Townscaper** — générateur de villes de Oskar Stålberg, connexions de bâtiments cohérentes par WFC
- **Tiny Glade (2024)** — structures médiévales cohérentes, même approche que Townscaper
- **Magica Voxel** — génération de structures voxel par WFC
- **Prototypes GDC** — outil standard des game jams et prototypes depuis 2017

### Architecture procédurale (films et AAA)

- **Houdini (SideFX)** — nœud WFC intégré nativement depuis la v19.5, utilisé pour générer des environnements urbains (bâtiments, rues, intérieurs)
- **The Matrix Resurrections** — certains environnements de la ville simulée générés avec des outils proches de WFC dans Houdini
- Pipelines de studios comme **ILM** et **Weta Digital** pour peupler des villes de fond

### Design de niveaux assisté

- Plugins **Unity et Unreal** — les designers peignent des exemples, WFC complète la carte
- **Tiled** avec extensions WFC pour la génération de donjons

### Génération de textures et d'images

- **Textures infinies** — donner un exemple (herbe, brique, eau) et générer une surface arbitrairement grande respectant les mêmes motifs locaux
- **Inpainting** — remplir une zone manquante d'une image en respectant les motifs voisins (proche du Generative Fill de Photoshop, mais déterministe)

### Musique générative

- **Génération de mélodies** — chaque note contraint ses voisines selon des règles harmoniques, aucune transition impossible ne peut apparaître

### Biologie computationnelle

- **Repliement de protéines simplifié** — modéliser quelles séquences d'acides aminés sont compatibles localement, en amont d'approches complexes comme AlphaFold

---

## Comparaison avec BSP

| Critère | BSP | WFC |
|---|---|---|
| Type de sortie | Partition spatiale de rectangles | Grille de tuiles cohérentes |
| Contrôle | Élevé — structure déterministe | Moyen — guidé par l'exemple |
| Cohérence locale | Non garantie | Garantie par construction |
| Risque d'échec | Nul | Possible (contradiction) |
| Expressivité visuelle | Faible (géométrique) | Forte (organique) |
| Coût calcul | Faible | Moyen à élevé |

---

## Dans Hacktiviste — usage potentiel

WFC n'est pas encore dans le projet. Candidats d'usage futur :

- **Salles de combat** — définir des tuiles (mur, sol, obstacle, spawn ennemi) et un exemple de salle bien conçue. WFC génère des variations cohérentes automatiquement
- **Environnement visuel en grille** — si le jeu adopte une représentation en grille, WFC garantit qu'aucune tuile incohérente n'apparaît (pas de mur flottant, pas de sol sans fond)

*Document de référence — ne pas modifier sauf ajout d'une nouvelle information.*
