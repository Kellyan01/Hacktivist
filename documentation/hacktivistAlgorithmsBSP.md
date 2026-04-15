# Algorithme BSP — Binary Space Partitioning

> Document de référence — historique, principe, variantes et applications.

---

## Historique

Inventé en **1969** par **Schumacker, Brand, Gilliland et Sharp** dans un rapport de recherche pour l'US Air Force. Objectif initial : résoudre le z-fighting en simulation de vol — déterminer l'ordre d'affichage correct de polygones 3D sans erreur de chevauchement visuel.

Formalisé théoriquement par **Henry Fuchs, Zvi Kedem et Bruce Naylor** en **1980** dans un article fondateur qui pose les bases mathématiques. Reste cantonné à la recherche académique pendant une décennie.

**John Carmack** le popularise massivement en l'intégrant dans **Doom (1993)** puis **Quake (1996)**. Pour la première fois, un jeu commercial grand public tourne entièrement sur un moteur BSP. "BSP tree" entre dans le vocabulaire courant des game developers des années 90-2000.

---

## Principe fondateur

> "Diviser récursivement un espace en deux demi-espaces jusqu'à ce que chaque région soit suffisamment simple à traiter."

La structure centrale est l'**arbre BSP** :
- Chaque **nœud interne** contient un hyperplan (en 2D : une droite, en 3D : un plan) qui divise l'espace en deux
- Chaque **feuille** représente une région convexe de l'espace
- L'arbre encode une hiérarchie spatiale complète

```
Espace initial [0,0 → 80,50]
        │
   découpe verticale x=42
        │
   ┌────┴────┐
[0,0→42,50] [42,0→80,50]
      │
 découpe horizontale y=28
      │
 ┌────┴────┐
[0,0→42,28] [0,28→42,50]
```

Chaque feuille est un rectangle garanti non-chevauchant, couvrant exactement l'espace parent.

### Deux propriétés fondamentales

**1. Tri automatique front-to-back**
En parcourant l'arbre depuis la racine, on détermine l'ordre de visibilité sans calcul de distance. C'est ce qui a révolutionné le rendu 3D — plus besoin de trier tous les polygones à chaque frame.

**2. Requêtes spatiales en O(log n)**
"Est-ce que ce point est dans cette région ?" — on descend dans l'arbre en choisissant à chaque nœud le bon sous-arbre. Logarithmique au lieu de linéaire.

---

## Variantes

| Variante | Description | Usage |
|---|---|---|
| **BSP axiale** | Plans de coupe parallèles aux axes uniquement | Génération procédurale, collision |
| **BSP arbitraire** | Plans de coupe à n'importe quelle orientation | Rendu 3D optimal |
| **kd-tree** | BSP axiale généralisée à k dimensions | Machine learning, nuages de points 3D |
| **Quadtree / Octree** | Chaque nœud se divise en 4 (2D) ou 8 (3D) | Collisions, culling dans les moteurs de jeu |
| **R-tree** | Régions pouvant se chevaucher | Bases de données spatiales |
| **BVH** (Bounding Volume Hierarchy) | Descendant moderne, enveloppes non-planes | Ray tracing (RTX, Cycles, Arnold) |

---

## Applications réelles

### Jeux vidéo — rendu et moteurs

- **Doom (1993)** — premier usage grand public, BSP précalculée à la compilation pour l'ordre de rendu des murs
- **Quake (1996)** — BSP 3D complète, calcule le PVS (Potentially Visible Set) : quelles salles sont visibles depuis chaque point
- **Half-Life (1998)** — moteur GoldSrc basé sur le BSP de Quake
- **Counter-Strike, Team Fortress** — héritent du même moteur, les maps `.bsp` sont nommées d'après l'algorithme
- **Unreal Tournament (1999)** — BSP hybride pour le rendu et les collisions
- **Source Engine / CS2 (Valve)** — format `.bsp` encore utilisé aujourd'hui

### Jeux vidéo — génération procédurale

- **Nethack (1987)** — l'un des premiers roguelikes à utiliser une partition spatiale pour placer les salles
- **Spelunky** — BSP pour des salles non-chevauchantes avec accès garanti
- **Dungeon Crawl Stone Soup** — génération de donjons par BSP
- **Enter the Gungeon** — salles placées dans des zones BSP puis connectées par couloirs
- **Unexplored** — BSP combiné à d'autres algorithmes pour des donjons à cycle unique
- **RimWorld** — génération des ruines et bâtiments abandonnés par partition spatiale

### Infographie et rendu 3D

- **Ray tracing moderne** — les BVH (descendants du BSP) sont utilisés dans tous les moteurs ray tracing (Cycles, Arnold, RTX)
- **Blender, Maya, 3ds Max** — accélérateurs de scène (kd-tree, BVH) pour le calcul des ombres et réflexions
- **Pixar RenderMan** — hiérarchies spatiales pour le rendu de production

### Robotique et IA

- **SLAM** (Simultaneous Localization and Mapping) — un robot construit une BSP de son environnement en temps réel pour naviguer
- **Planification de trajectoire** — découper l'espace en régions libres/obstacles pour trouver un chemin en O(log n)
- **Véhicules autonomes** — nuages de points lidar traités par kd-tree pour la détection d'obstacles

### Bases de données spatiales

- **PostGIS / PostgreSQL** — index R-tree pour les requêtes géographiques ("tous les restaurants dans un rayon de 2km")
- **Google Maps, OpenStreetMap** — tuiles organisées en quadtree (BSP à 4 enfants)
- **GPS et SIG** — découpage du globe en cellules hiérarchiques pour les recherches de proximité

### Compression

- **JPEG 2000** — décomposition en ondelettes s'appuyant sur une partition spatiale hiérarchique
- **Compression de textures** (ASTC, BC7) — partition de l'espace colorimétrique pour trouver les blocs optimaux

---

## Dans Hacktiviste

Usage : **BSP axiale en mode génération procédurale** — le détournement créatif, pas l'usage rendu.

| Fichier | Rôle |
|---|---|
| `BSPNode.js` | Nœud BSP — rectangle + méthode `split()` |
| `MapGenerator.js` | Orchestre la récursion, place un `MapNode` dans chaque feuille |

Ce module est conservé mais mis de côté au profit de la génération par couches (`LayeredMapGenerator`). Il pourra resservir pour générer des **salles de combat** avec une disposition spatiale cohérente à l'intérieur d'un niveau.

*Document de référence — ne pas modifier sauf ajout d'une nouvelle information.*
