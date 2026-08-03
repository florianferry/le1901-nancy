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
