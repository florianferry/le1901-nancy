---
title: Les articles portent des faits qui périment
type: concept
status: active
sources:
  - src/pages.js
  - src/index.src.html
  - llms.txt
created: 2026-11-17
updated: 2026-11-17
---

# Les articles portent des faits qui périment

Les dix pages de `src/pages.js` et le carnet d’adresses de l’accueil citent des horaires, des
prix, des adresses et des travaux en cours. Rien dans le build ne les contrôle : `npm run check`
vérifie la typographie, pas la vérité. Cette page liste les faits datés, ce qui les a établis, et
les arbitrages pris lors de la vérification en ligne du 17 novembre 2026.

## Les faits à date de fin

- Spectacle d’été de la place Stanislas : saison 2026 du 12 juin au 13 septembre, 22 h 45 jusqu’au
  31 juillet puis 22 h. Les pages l’écrivent au passé ; les dates de 2027 sont à poser au printemps.
- Grand Hôtel de la Reine : fermé pour travaux, réouverture attendue en 2027 (page `stanislas` et
  `llms.txt`).
- Villa Majorelle : étage fermé depuis septembre 2026, visite au rez-de-chaussée seul jusqu’à
  l’automne 2028 (page `artnouveau`, section du billet).
- Train : OUIGO absent de la ligne jusqu’au 13 décembre 2026, puis un aller-retour quotidien. Le
  texte dit « une douzaine d’allers-retours » : la SNCF en comptait treize, l’ancien « neuf » ne
  tenait plus.
- Saint-Nicolas : dates de l’édition 2026, et bandeau d’accueil retiré par le build après le
  3 janvier (voir [[chaine-de-generation-1901]]).

## Ce qui a été retiré faute de source

- Le tarif réduit à 6,50 € du billet commun musée et villa : aucune source ne le donne. Le texte
  dit seulement qu’un tarif réduit existe.
- « Depuis 1982 » pour La Bolée, dont l’adresse est le 41 rue des Ponts, pas le 43.
- « Mini-zoo » pour la Pépinière, remplacé par « parc animalier ».

## Arbitrages de cohérence interne

- Parkings Saint-Dizier et Dom Calmet : « moins de 5 minutes » partout. Les pages anglaises et
  espagnoles disaient 5, le français et l’allemand 3 ; la valeur prudente l’emporte, faute de
  mesure.
- Distances de référence : gare 13 min, place Stanislas 8 min, halle 4 min, Pépinière 12 min,
  Beaux-Arts 8 min. Une traduction qui s’en écarte est une erreur, pas une adaptation.

## Les traductions décrochent du français

Plusieurs sections anglaises, espagnoles et allemandes avaient été écrites avant leur version
française définitive : cellules de tableau vides et note interne visible (« The empty cells are
waiting to be paced out »). Le contrôle de parité compte les sections, pas leur contenu. Après
toute réécriture d’une section française, ses trois traductions se relisent dans la même passe.

> TODO-VERIFY: le tarif réduit réel du billet commun et l’année d’ouverture de La Bolée, à
> demander au musée et à la crêperie.

## Sources

- `src/pages.js`
- `src/index.src.html`
- `llms.txt`
