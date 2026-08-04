---
title: Le JSON-LD du logement, et ce que Google refuse d’un vocabulaire pourtant valide
type: concept
status: active
sources:
  - src/index.src.html
  - scripts/build-i18n.js
created: 2026-08-04
updated: 2026-08-04
---

# Le JSON-LD du logement, et ce que Google refuse d’un vocabulaire pourtant valide

Le nœud `VacationRental` de `src/index.src.html` est plus pauvre que ce que schema.org autorise, et
c’est délibéré. Search Console a rejeté cinq champs le 2026-08-04, tous conformes au vocabulaire.
Cette page retient lesquels, pour qu’une passe d’enrichissement ne les réintroduise pas.

## Le vocabulaire autorise, le validateur du rich result refuse

Le rapport « Location de vacances » de Search Console n’applique pas schema.org mais son propre
sous-ensemble. Un champ que le vocabulaire accepte peut donc invalider l’élément entier, et un
élément invalide ne produit aucun résultat enrichi. Les quatre écarts constatés :

- **`identifier` veut une chaîne.** Un `PropertyValue` avec `propertyID` et `value` est refusé,
  alors que c’est la forme la plus expressive du vocabulaire. Vaut au niveau du `VacationRental`
  comme dans l’`Offer`.
- **`priceSpecification` refuse `UnitPriceSpecification`.** L’objet qui portait `price`,
  `priceCurrency` et `unitCode: DAY` est rejeté sur son type. Le prix vit maintenant à plat sur
  l’`Offer`, en `price` et `priceCurrency`, et l’unité « par nuit » n’est plus exprimée par une
  propriété : elle se lit dans `name`, localisé par la clé `ldOfferName` des quatre dictionnaires.
- **`checkinTime` et `checkoutTime` n’existent pas sur `Offer`.** Elles appartiennent au logement,
  pas à son offre. Elles restent sur le `VacationRental`, où le validateur les accepte au format
  `hh:mm:ss` sans décalage horaire.
- **Un nœud imbriqué doit porter son `@type`.** `itemOffered` ne contenait qu’un `@id` renvoyant au
  `VacationRental` parent. Le validateur ne résout pas la référence et signale un `itemtype`
  invalide. Le `@type` y est donc répété à côté du `@id`.

## Ce qu’il faut savoir avant d’y retoucher

Le gabarit porte les valeurs françaises, la section « données structurées » de `build()` dans
`scripts/build-i18n.js` les localise. Un champ textuel neuf dans le JSON-LD se câble donc à deux
endroits : une clé dans les quatre dictionnaires `translations`, sinon `checkParity` casse le
build, et une affectation dans `build()`. C’est le chemin qu’a suivi `ldOfferName`.

Le gabarit contient encore un bloc de bascule de langue côté client qui réécrirait le JSON-LD en
cherchant un nœud `LodgingBusiness`, type que le document n’utilise plus. Il n’atteint jamais le
navigateur : `replaceRuntime` remplace tout le script qui déclare `translations` par le runtime
livré, et échoue le build s’il n’en trouve pas exactement un.

Les pièges du build lui-même sont ailleurs : [[chaine-de-generation-1901]].

## Sources

- `src/index.src.html`, nœud `VacationRental` et dictionnaires `translations`
- `scripts/build-i18n.js`, localisation du bloc de données structurées
