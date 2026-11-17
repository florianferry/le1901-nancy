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

Les quinze pages de `src/pages.js` et le carnet d’adresses de l’accueil citent des horaires, des
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
  3 janvier (voir [[chaine-de-generation-1901]]). Horaires des villages et hameaux 2026 relevés
  le 2026-11-17 dans le programme PDF officiel (`saint-nicolas.nancy.fr`, fichier
  `programme-fsn-web.pdf`) ; l’autre PDF du même site, `programme-saint-nicolas.pdf`, est
  l’édition 2024 et ne doit pas servir.
- Musée de l’École de Nancy : billet couplé 9 €, réduit 6,50 €, musée seul 7,50 €, gratuit le
  premier dimanche du mois (page tarifs du musée, lue le 2026-11-17). La page de la villa annonce
  le rez-de-chaussée seul « à partir du 28 octobre 2026 » et de nouvelles salles à l’automne 2027,
  tout en citant une phase 2026-2028 : le texte garde « depuis septembre 2026, jusqu’à
  l’automne 2028 », à revoir quand le musée tranchera.

- Pages `agenda` et `amoureux`, ajoutées le 2026-11-17 : dates 2026 des événements (La Belle
  Saison, Nancyphonies, Livre sur la Place, Jardin éphémère, NJP), NJP 2027 annoncé du 2 au
  16 octobre sur le site du festival, tarifs et horaires 2026 de Nancy Thermal (avenue
  Hippolyte-Maringer, pas rue du Sergent-Blandan), Saint-Valentin 2027 un dimanche. Toute la
  page agenda est à redater au printemps 2027, quand les éditions 2027 seront annoncées.
- Pages `hiver`, `autour` et `metzstrasbourg`, ajoutées le 2026-11-17. À revoir après le
  28 février 2027 : fin des deux expositions Gallé (« L’étrange cas de monsieur Gallé » au musée
  des Beaux-Arts, « Gallé, portraits d’une vie » au musée de l’École de Nancy), tarif 10 € du musée
  des Beaux-Arts propre à la période d’exposition. Château de Lunéville fermé du 9 novembre au
  8 décembre 2026, tarif 9 € « garanti jusqu’au 8 novembre 2026 » : à relire en 2027. Palais
  ducal (Musée lorrain) fermé sans date de réouverture. Marché de Noël de Metz 2026 du
  20 novembre au 30 décembre. Trains relevés sur les pages trajet de SNCF Connect le 2026-11-17 :
  Metz 37 min et 51 trains par jour, Strasbourg 1 h 03 et 18 trains, Toul 19 min et 27 trains,
  Baccarat 37 à 45 min et 17 trains, Varangéville - Saint-Nicolas 8 à 9 min.
- Non vérifiés en ligne, donc absents des pages : horaires du musée Baccarat (site fermé aux
  robots), horaires et dates de la cathédrale de Toul, horaires d’ouverture de la basilique de
  Saint-Nicolas-de-Port (seuls ceux de la boutique sont publiés), dates 2026 et chiffres du marché
  de Strasbourg (site officiel fermé aux robots ; « XVIe siècle » vient de SNCF Connect),
  hauteur de la flèche de Strasbourg, vitraux de Chagall à Metz. Le comparatif écrit que Metz n’a
  aucun site au patrimoine mondial : la liste complète de l’UNESCO n’a pas été relue ligne à ligne.

## Ce qui a été retiré faute de source

- Le tarif réduit à 6,50 € du billet commun musée et villa : retiré le 2026-11-17 faute de
  source, puis rétabli le même jour d’après la page tarifs du musée.
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

> TODO-VERIFY: l’année d’ouverture de La Bolée, à demander à la crêperie.

## Sources

- `src/pages.js`
- `src/index.src.html`
- `llms.txt`
