---
title: La licence des photos pointe vers une modale, pas vers une page
type: concept
status: active
sources:
  - src/index.src.html
  - scripts/build-i18n.js
created: 2026-08-04
updated: 2026-08-04
---

# La licence des photos pointe vers une modale, pas vers une page

Chaque `ImageObject` du site porte un `license` qui renvoie aux mentions légales. Or les mentions
légales n’ont pas d’URL à elles : elles vivent dans une modale présente sur les 49 pages générées.
Cette page retient le montage qui rend ce lien tenable, le couplage silencieux qu’il installe, et
ce qui a été laissé de côté volontairement.

## Le hash tient lieu de page

`license` vaut `<accueil de la langue> + #mentions-legales`, et non l’URL de la page courante :
une seule adresse de licence par langue, alors que la modale est partout. Le gabarit écoute ce
hash au chargement et sur `hashchange`, ouvre la modale, et pose ou retire le hash en
`replaceState` quand elle s’ouvre ou se ferme depuis le pied de page.

Sans cette écoute, le montage serait un lien menteur : le visiteur venu de Google Images
atterrirait en haut de l’accueil sans jamais voir la clause annoncée. C’est la raison d’être du
bloc, pas un confort de navigation.

## Le couplage que rien ne vérifie

La valeur `#mentions-legales` est déclarée deux fois, en `LEGAL_HASH` dans `src/index.src.html`
pour l’ouverture, et en `LEGAL_HASH` dans `scripts/build-i18n.js` pour le balisage. La renommer
d’un seul côté produit un build vert, des pages valides et un lien de licence mort.

C’est l’inverse du contrat habituel de ce dépôt, où `checkParity` casse le build plutôt que de
livrer une page trouée : [[chaine-de-generation-1901]]. Ici, aucune garde. Le symptôme
n’apparaîtrait ni au build ni à la relecture du diff, mais chez un visiteur, des semaines plus
tard. Les deux constantes portent donc un commentaire qui renvoie à l’autre fichier.

## `acquireLicensePage` est absent par décision

Search Console signale deux champs recommandés manquants sur les images, `license` et
`acquireLicensePage`. Seul le premier a été renseigné, le 2026-08-04. L’avertissement sur le
second reste donc ouvert, et c’est voulu : le renseigner ferait apparaître un lien « Obtenir cette
image » dans Google Images, c’est-à-dire une invitation à acquérir des droits que l’éditeur ne
détient pas, les photographies étant la propriété de Solène Mangin.

Corollaire pour une passe future : voir cet avertissement dans Search Console n’est pas voir un
oubli. La section 4 des mentions légales, dans les quatre dictionnaires `translations`, dit
maintenant en toutes lettres que les photos ne sont ni reproductibles ni téléchargeables sans
autorisation écrite. Le lien de licence mène à ce refus, ce qui est sa fonction.

## Vérifier

Le comportement du hash n’est pas lisible dans le seul balisage. Il a été vérifié le 2026-08-04
sur les pages générées, servies en local et pilotées par un navigateur sans interface : arrivée
directe sur le hash en français, en anglais et sur un hub, modale fermée sans hash, hash posé au
clic du pied de page et retiré à la fermeture, aucune erreur de console. Refaire cette vérification
est le seul moyen de constater une rupture du couplage décrit plus haut.

Les contraintes du validateur de Google sur le reste du document sont ailleurs :
[[json-ld-logement-contraintes-google-1901]].

## Sources

- `src/index.src.html`, `LEGAL_HASH`, ouverture de `legalModal`, clé `s4Body` des dictionnaires
- `scripts/build-i18n.js`, `LEGAL_HASH`, localisation de `lodging.image` et des
  `primaryImageOfPage`
