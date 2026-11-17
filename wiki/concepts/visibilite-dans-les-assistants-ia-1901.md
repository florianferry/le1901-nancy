---
title: Être lu et cité par les assistants IA
type: concept
status: active
sources:
  - llms.txt
  - robots.txt
  - scripts/build-i18n.js
  - scripts/check-content.js
  - scripts/indexnow.js
  - .github/workflows/indexnow.yml
created: 2026-11-17
updated: 2026-11-17
---

# Être lu et cité par les assistants IA

Le site est ouvert à tous les robots IA depuis l’origine ; ce qui lui manquait le 2026-11-17
n’était pas l’accès mais la découverte, la fraîcheur et la cohérence. Cette page retient les trois
mécanismes posés ce jour-là et ce qui a été écarté.

## Le point faible était l’index de Bing, pas le balisage

Le 2026-11-17, une recherche web hors Google ne trouvait pas le domaine, alors que la fiche
apparaissait sur Expedia, Vrbo et Holidu par la diffusion de la conciergerie. ChatGPT et Copilot
cherchent dans l’index de Bing : un site absent de Bing n’y est pas cité, quelle que soit la
qualité de son `llms.txt`.

D’où `.github/workflows/indexnow.yml` : à chaque push sur `main` qui touche du HTML, il attend que
la première page changée soit servie à l’identique en ligne, puis soumet les pages changées par
`scripts/indexnow.js`. Deux limites à connaître. Les commits de la tâche de nuit du calendrier,
poussés avec `GITHUB_TOKEN`, ne déclenchent pas ce workflow, ce qui est voulu. Et IndexNow ne
remplace pas l’inscription du site dans Bing Webmaster Tools, qui reste une démarche manuelle de
Florian.

## La date d’un article ne bouge que si l’article bouge

Chaque page éditoriale porte une ligne visible « Mis à jour le … · Par Florian Ferry » et un nœud
`Article` avec `datePublished` et `dateModified`. Le piège est la stabilité : une date posée au
build changerait à chaque build, et une date lue dans git aurait un cycle de retard, comme pour le
sitemap ([[chaine-de-generation-1901]]).

`buildPage` rend donc la page une première fois avec la date déjà publiée, lue dans l’élément
`time[data-modified]` du fichier existant. Si le résultat est identique octet pour octet, la date
est gardée ; sinon la page est rendue avec la date du jour. Conséquence : toute retouche du gabarit
commun, même le pied de page, redate les quarante articles. C’est le prix d’une règle qui ne
demande rien à l’éditeur.

`datePublished` vient du commit qui a créé le fichier généré (`gitFirstAddMap`). Hors dépôt git,
il retombe sur la date de mise à jour.

L’auteur est répété dans le nœud `Article` avec son nom et son URL, pour la même raison que le
`@type` répété de `itemOffered` : le validateur ne résout pas une référence vers une autre page
([[json-ld-logement-contraintes-google-1901]]). Son lien visible pointe vers la page de référence
de l’hôte, comme `history.renovePar` ([[identite-de-l-hote-partagee-1901]]).

## `llms.txt` est écrit à la main, donc contrôlé

`llms.txt` n’est pas généré. Il disait encore « un seul avis » après l’arrivée des
avis Airbnb sur l’accueil, et un assistant IA aurait répété ce chiffre. `checkLlms` de
`scripts/check-content.js` exige désormais que la note et le nombre d’avis de l’`AggregateRating`
de `src/index.src.html` y figurent, en français et dans le résumé anglais. Les autres faits du
fichier ne sont pas contrôlés.

## Écarté

- **Airbnb dans un `sameAs`.** Le site ne pointe jamais vers Airbnb, balisage compris : réserver
  chez Cocoonr coûte moins cher au voyageur.
- **Fiche Google Business Profile.** Les règles de Google excluent les locations de vacances.
- **Un fichier `/pricing.md`.** Le prix dépend des dates et vit chez Cocoonr ; le prix plancher de
  `llms.txt` suffit.

## Sources

- `llms.txt`, `robots.txt`
- `scripts/build-i18n.js`, `buildPage`, `renderPage`, `pageBody`, `gitFirstAddMap`
- `scripts/check-content.js`, `checkLlms`
- `scripts/indexnow.js`, `.github/workflows/indexnow.yml`
