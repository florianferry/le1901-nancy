---
title: La chaîne de génération, et ses quatre points de rupture
type: concept
status: active
sources:
  - src/index.src.html
  - src/pages.js
  - scripts/build-i18n.js
  - package.json
created: 2026-08-03
updated: 2026-11-17
---

# La chaîne de génération, et ses quatre points de rupture

Un gabarit unique et un dictionnaire de traductions produisent quinze pages : quatre pages
d’accueil, quatre hubs de guide et les pages éditoriales. Le détail de chaque étape est commenté
dans `scripts/build-i18n.js`, et cette page ne le répète pas. Elle retient ce qu’aucun fichier ne
porte à lui seul : par où la chaîne casse.

## Ce que le dépôt sert n’est pas ce qu’on édite

`npm run build` enchaîne trois étapes, icônes, pages, CSS. Les pages produites sont versionnées et
servies telles quelles. Éditer `index.html`, `en/`, `es/` ou `de/` est donc sans effet durable :
la prochaine génération écrase. La source est `src/index.src.html` pour la structure,
`src/pages.js` pour le contenu éditorial, et le dictionnaire `translations` embarqué dans le
gabarit pour les libellés.

## Premier point de rupture : la parité des sections

`checkParity` compare les clés terminales des quatre dictionnaires. Une clé ajoutée en français et
oubliée en allemand casse le build plutôt que de produire une page trouée. C’est voulu : une page
qui se génère à moitié se remarque des semaines plus tard, un build qui échoue se remarque tout de
suite.

## Deuxième point de rupture : les jetons de lien

Le contenu des traductions ne porte pas de HTML mais des jetons résolus au build. Ils ont leur
propre page, parce qu’ils entrent en collision avec la syntaxe de ce wiki :
[[jetons-de-lien-et-coffre-obsidian-1901]].

## Troisième point de rupture : le réseau

Le build appelle le flux iCal de Cocoonr pour connaître les nuits occupées. En cas d’échec, le
mode dégradé renvoie une liste vide et le build réussit quand même, sans calendrier. Un build hors
ligne produit donc des pages valides mais muettes sur les disponibilités, et rien ne le signale
dans le résultat.

L’URL du flux porte un jeton qui vaut identifiant. Elle vit dans `COCOONR_ICS_URL`, jamais dans le
dépôt, ce qui explique le `--env-file-if-exists` de `build:pages`.

## Quatrième point de rupture : l’historique git

Les dates `lastmod` du sitemap ne viennent pas du système de fichiers mais de `git log`. Hors dépôt
git, ou dans un clone superficiel sans historique, la table est vide et toutes les pages sont
datées du jour.

Conséquence peu intuitive : réécrire l’historique change les dates annoncées aux moteurs. Ce n’est
pas un défaut, c’est le prix d’une date qui reflète le contenu plutôt que la dernière copie de
fichier.

## Une cinquième entrée : la date du jour

Depuis le 2026-11-17, un élément marqué `data-season-until="AAAA-MM-JJ"` reste dans la page
d’accueil jusqu’à cette date incluse, puis `applySeason` le retire au build suivant. C’est ainsi
que le bandeau Saint-Nicolas, posé sous le héros pour la saison 2026, tombe seul le 4 janvier : la
régénération de nuit du calendrier reconstruit le site et pousse la différence. Choix délibéré
plutôt qu’un masquage en JavaScript, qui aurait laissé le bandeau dans le HTML lu par les moteurs.

Un bandeau de saison périmé est donc le signe que la tâche de nuit ne tourne plus.

## Deux pièges de copie entre le gabarit et le générateur

Le script d’internationalisation du gabarit n’est pas celui que reçoit le visiteur :
`replaceRuntime` le remplace au build par la constante `RUNTIME` de `scripts/build-i18n.js`. Tout
comportement de ce script (changement de langue, onglets du carnet d’adresses et leur navigation
au clavier) s’écrit donc deux fois. Modifier seulement le gabarit donne une page qui marche quand
on ouvre `src/index.src.html` et pas une fois générée. Piège rencontré le 2026-11-17 avec les
flèches du clavier sur les onglets du guide.

Les clés `altN` de la galerie ne suivent pas les numéros des fichiers `solene-mangin-N`. Pour
illustrer un article avec une photo de la galerie et son texte alternatif, `PAGE_PHOTO` désigne la
clé `altN`, et `GALLERY_FILE` relit au build, dans le gabarit, quel fichier porte cette clé. Écrire
le numéro de fichier à la main associerait une photo à la description d’une autre.

## Ce qui en découle

Un build n’est reproductible ni dans le temps ni hors ligne : trois de ses entrées, le flux de
réservation, l’historique git et la date du jour, vivent en dehors du gabarit. Comparer deux sorties générées à
deux moments différents produit donc toujours du bruit sur le calendrier et sur les dates.

## Sources

- `src/index.src.html`, gabarit et dictionnaire `translations`
- `src/pages.js`, contenu éditorial et slugs par langue
- `scripts/build-i18n.js`, `checkParity`, `gitLastmodMap`, `applyBookedCalendar`, `applySeason`,
  `replaceRuntime`, `RUNTIME`, `PAGE_PHOTO`, `GALLERY_FILE`
- `package.json`, enchaînement de `npm run build`
