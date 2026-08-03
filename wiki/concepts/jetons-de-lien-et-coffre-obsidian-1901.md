---
title: Les jetons de lien, et leur collision avec le coffre Obsidian
type: concept
status: active
sources:
  - scripts/build-i18n.js
  - src/pages.js
created: 2026-08-03
updated: 2026-08-03
---

# Les jetons de lien, et leur collision avec le coffre Obsidian

Le contenu éditorial ne contient pas de HTML. Les liens internes s’y écrivent en doubles crochets,
et `resolveLinks` les remplace au build par une ancre dont l’URL suit la langue de la page. Deux
formes existent, l’une vers une page du guide, l’autre vers une ancre de la page d’accueil.

Le mécanisme est commenté dans `scripts/build-i18n.js`. Ce qui suit n’y est pas, et ne peut pas y
être.

## La collision

Ce wiki vit dans un coffre Obsidian partagé, où les doubles crochets désignent un lien entre pages.
Les jetons du générateur ont exactement la même forme. Une page de wiki qui les cite en prose
fabrique donc des liens vers des pages qui n’existeront jamais : Obsidian les affiche comme
manquants, et le lint les compte comme cassés.

La règle : **un jeton de lien ne s’écrit jamais en prose dans ce wiki.** Il s’écrit entre accents
graves, ou dans un bloc de code. `lint.py` retire le code avant de chercher les wikilinks, cette
citation est donc sûre :

```
[[page:slug-de-la-page|libellé affiché]]
[[home:#ancre|libellé affiché]]
```

Sans cette précaution, documenter la syntaxe casserait le lint qui vérifie la documentation. C’est
le genre de boucle qu’on ne voit qu’une fois qu’on est dedans.

## Ce qui casse un jeton

Le libellé et la cible sont séparés par une barre verticale, et la cible est un slug de
`src/pages.js`, pas une URL. Un slug renommé dans `pages.js` sans mise à jour des traductions
produit un lien mort dans les quatre langues d’un coup, puisque le même jeton sert les quatre.

## Sources

- `scripts/build-i18n.js`, constante `LINK_TOKEN` et fonction `resolveLinks`
- `src/pages.js`, table des slugs par langue
