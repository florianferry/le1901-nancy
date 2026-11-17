---
title: L’ordre des sections de l’accueil
type: decision
status: active
sources:
  - src/index.src.html
  - scripts/build-i18n.js
created: 2026-11-17
updated: 2026-11-17
---

# L’ordre des sections de l’accueil

Depuis le 2026-11-17, l’accueil montre d’abord ce qui décide un voyageur (photos, avis, quartier,
équipements, questions) et garde l’histoire et le carnet d’adresses après la réservation.

## La décision

Ordre retenu, issu de l’audit UX et UI du 2026-11-17 et validé par Florian le même jour : héros,
chiffres clés, galerie, avis, visite 3D, emplacement, équipements, questions fréquentes,
réservation, histoire du lieu, carnet d’adresses, articles.

Avant, l’histoire et le carnet d’adresses passaient avant la réservation, et les avis venaient
tard : sur mobile, un visiteur devait faire défiler environ 18 000 px pour tout voir, et les avis,
premier argument d’un logement récent, arrivaient après des sections de lecture.

## Les arbitrages

- La visite 3D suit les avis au lieu des équipements, comme le proposait l’audit : placée après les
  équipements, elle aurait collé deux sections sombres. Écart assumé par rapport au document.
- Les questions fréquentes n’en montrent que six sur quatorze, choisies pour lever les freins à la
  réservation ; un bouton déplie les huit autres. Toutes restent dans le HTML, donc lisibles par
  les moteurs et par le balisage `FAQPage`.
- L’accueil ne met plus en avant que quatre articles (`HOME_FEATURED` dans
  `scripts/build-i18n.js`) au lieu de dix. Les dix restent liés depuis le pied de page et la page
  guide, si bien qu’aucun article ne perd de lien entrant ; `linkReport` compte l’accueil comme
  lien entrant des quatre retenus seulement.
- Un lien « Avis » s’ajoute à la navigation et aux points de défilement.

## Ce qu’il ne faut pas défaire sans raison

Remonter le carnet d’adresses ou l’histoire avant la réservation rallonge le chemin vers le
calendrier sur mobile. La barre collante mobile, qui se cache sur le héros et la section
réservation, suppose aussi que ces deux sections restent les seuls points d’entrée du calendrier
dans la page ([[reservation-vers-cocoonr-1901]]).

## Sources

- `src/index.src.html`, ordre des `section` et script `data-home-only` des questions
- `scripts/build-i18n.js`, `HOME_FEATURED`, `pagesStrip`, `linkReport`
