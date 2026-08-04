# Journal du wiki le1901.fr (site statique)

Append-only. Jamais relu en entier, jamais réécrit. Une entrée par lot d’ingestion ou par passe de
lint. Le plus récent en bas.

## 2026-08-03, amorçage

Wiki créé par `wiki-kit.py init 1901`. Arborescence, conventions, lint et commandes en place.
Aucune page de contenu.

## 2026-08-03, lot 1, la chaîne de génération

Trois pages, deux concepts et une décision. Lot volontairement court : `build-i18n.js`, `ical.js`
et `_config.yml` portent déjà leur pourquoi en commentaires, et le recopier fabriquerait le doublon
que les conventions interdisent. Les pages retiennent donc ce qu’aucun fichier ne porte seul, les
quatre points de rupture de la chaîne et la règle d’exposition de la racine.

Une découverte a modifié le kit : les jetons `[[page:...]]` du générateur ont la même forme qu’un
wikilink. `lint.py` retire désormais le code inline et les blocs de code avant de chercher les
liens, sans quoi documenter cette syntaxe cassait le lint. La correction vaut pour les six wikis.

## 2026-08-04, lot 2, le JSON-LD contre le validateur de Google

Une page, écrite à l’occasion d’un correctif : Search Console rejetait cinq champs du nœud
`VacationRental`, tous conformes à schema.org. La page ne décrit pas le balisage, `grep` le fait
mieux, elle retient les quatre formes refusées et pourquoi le document est volontairement moins
expressif que le vocabulaire ne l’autorise.

## 2026-08-04, lot 3, la licence des photos

Une page, écrite à l’occasion d’un second correctif de Search Console, qui signalait `license` et
`acquireLicensePage` manquants sur les images. Seul `license` a été renseigné, et la page existe
surtout pour ça : dire pourquoi l’autre avertissement reste ouvert, sans quoi une passe future le
corrigerait en croyant réparer un oubli.

Elle retient aussi un couplage que le dépôt n’a pas l’habitude de tolérer. La valeur
`#mentions-legales` vit dans deux fichiers sans contrôle croisé, là où `checkParity` casse le
build sur la moindre divergence de dictionnaire. La page dit où sont les deux déclarations et à
quoi ressemblerait la panne, silencieuse au build.
