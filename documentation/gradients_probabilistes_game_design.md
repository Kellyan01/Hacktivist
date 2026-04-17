# Gradients probabilistes pour le game design procédural

## Contexte

Ce document résume les outils mathématiques explorés pour générer procéduralement des événements (combats, points de repos, etc.) sur une carte de jeu, en utilisant des fonctions de probabilité spatiales.

---

## 1. Gaussienne inversée — courbe en cloche inversée

### Cas d'usage
Probabilité élevée aux extrémités, faible au centre. Exemple : rencontres de combat sur une carte linéaire de 10 cases (60% aux extrémités, 30% au centre).

### Formule 1D
```
P(x) = 0.60 - 0.30 × exp(-(x - μ)² / (2σ²))
```
- `μ` = centre de la carte (ex: 5.5 pour une carte de 10 cases)
- `0.60` = probabilité plafond aux extrémités
- `0.30` = amplitude du creux (plafond - plancher)
- `σ` = largeur du creux (plus σ est grand, plus la transition est douce)

### Code
```js
function combatProbability(tile, sigma = 1.5) {
  const mu = 5.5;
  return 0.60 - 0.30 * Math.exp(-Math.pow(tile - mu, 2) / (2 * sigma * sigma));
}
```

---

## 2. Somme de deux gaussiennes — double pic

### Cas d'usage
Deux zones de haute probabilité séparées par un creux central. Exemple : points de repos concentrés vers les cases 3 et 8, quasi nuls au centre et aux extrémités.

### Formule 1D
```
P(x) = A × exp(-(x - μ₁)² / (2σ²)) + A × exp(-(x - μ₂)² / (2σ²))
```
- `μ₁`, `μ₂` = positions des deux pics (ex: 3 et 8)
- `A` = amplitude des pics (ex: 0.60)
- Le creux central émerge naturellement de l'éloignement des deux gaussiennes

### Code
```js
function restProbability(tile, sigma = 1.3) {
  const s2 = 2 * sigma * sigma;
  const g1 = 0.60 * Math.exp(-Math.pow(tile - 3, 2) / s2);
  const g2 = 0.60 * Math.exp(-Math.pow(tile - 8, 2) / s2);
  return Math.min(g1 + g2, 1.0);
}
```

---

## 3. Extension en 2D — opérateurs de combinaison

Lorsqu'on passe d'une carte 1D à une carte 2D, il faut combiner la probabilité calculée sur l'axe X et celle calculée sur l'axe Y. Le choix de l'opérateur de combinaison est un **paramètre de design** à part entière.

### Règle générale
Pour deux valeurs entre 0 et 1 :
```
min(x, y)  ≤  x × y  ≤  moyenne(x, y)  ≤  max(x, y)
```

### Tableau des opérateurs

| Opérateur | Formule | Effet | Usage typique |
|-----------|---------|-------|---------------|
| Minimum | `min(Px, Py)` | Très restrictif, écrase tout | Zones très précises |
| Multiplication | `Px × Py` | Renforce les hautes probas, écrase les coins | Pics gaussiens, zones de forte densité |
| Moyenne | `(Px + Py) / 2` | Équilibré, préserve les extrémités | Gaussienne inversée, creux centraux |
| Maximum | `max(Px, Py)` | Permissif, suffit qu'un axe soit fort | Couloirs, zones larges |

### En pratique
- **Gaussienne positive (pic)** → multiplication : la case doit être proche du centre *en X ET en Y*
- **Gaussienne inversée (creux)** → moyenne : la case est éloignée du centre *en X OU en Y*
- **Renforcer les faibles probas aux coins** d'une gaussienne positive → remplacer la multiplication par la moyenne

> Cette logique de combinaison correspond formellement aux **t-normes et t-conormes** de la logique floue.

---

## 4. Autres briques utiles pour modeler les probabilités

### Smoothstep
Transition douce de 0 à 1, sans cassure. Très utilisée en game dev pour les transitions de zone.
```
f(x) = 3x² - 2x³   sur [0, 1]
```

### Puissance / racine
- `xⁿ` avec n > 1 : monte lentement puis s'emballe (difficulté croissante)
- `x^(1/n)` (racine) : monte vite puis se stabilise (récompenses décroissantes)

### Sinus / Cosinus
Pour les patterns **périodiques** : événements qui reviennent à intervalles réguliers sur la carte.

### Bruit de Perlin / Simplex
Ajoute de l'**irrégularité organique** par-dessus les courbes propres. Casse le côté trop mathématique sans perdre la structure globale.

### Multiplication de deux courbes
**ET logique** entre deux critères. Le résultat n'est fort que là où les deux courbes sont simultanément fortes.

### Clamp + remap
Recadrer une valeur dans un intervalle voulu. Indispensable en pratique.
```js
function remap(value, inMin, inMax, outMin, outMax) {
  return outMin + (value - inMin) / (inMax - inMin) * (outMax - outMin);
}
```

---

## 5. Relation avec WFC (Wave Function Collapse)

WFC est un algorithme de **propagation de contraintes discrètes** : il raisonne sur des règles d'adjacence entre tiles, pas sur des fonctions continues. Les gaussiennes et smoothstep ne font pas partie de son cœur.

**Ils sont complémentaires, pas imbriqués :**

```
Gradients gaussiens   →  "quoi faire apparaître où"   (couche de bias spatiale)
WFC                   →  "comment assembler les tiles de façon cohérente"
```

Les gradients probabilistes peuvent servir à **pondérer les poids d'apparition des tiles** en entrée du WFC, selon leur position sur la carte.
