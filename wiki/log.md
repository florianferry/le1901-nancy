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

## 2026-08-04, lot 4, l’hôte relié à ses deux autres sites

Le site décrivait une rénovation de 2026 sans nommer qui l’avait menée, et le `sameAs` du nœud
`#hote` ne portait que deux comptes, dont un LinkedIn écrit autrement que sur les deux autres sites
du même éditeur. Une des deux écritures pointait vers une page absente : le mécanisme censé
recouper l’identité l’affaiblissait.

Le lot pose les quatre comptes dans une forme unique, la page de référence de la personne, et une
phrase dans la section Héritage qui nomme le propriétaire comme auteur de la rénovation. Il déplace
aussi `person.url` hors de la localisation par langue : quatre traductions d’un logement ne font
pas quatre personnes, et le pourquoi est écrit à côté du code dans `scripts/build-i18n.js`.

La décision est fichée dans [[identite-de-l-hote-partagee-1901]], parce qu’aucun fichier de ce
dépôt ne peut porter seul une contrainte qui vient de deux autres sites.

## 2026-11-17, nouvelle fiche Cocoonr et calendrier qui part directement

La fiche Cocoonr `le-1901-15241` répondait en 404 ; Florian a donné la nouvelle, `le-1901-20072`.
Toutes les URL du gabarit et de `llms.txt` la suivent. Le bouton final du calendrier ouvre
désormais Cocoonr avec les dates, au lieu de renvoyer vers le formulaire. Parcours fiché dans
[[reservation-vers-cocoonr-1901]], écart avec les témoins datés dans `contradictions.md`.

## 2026-11-17, page Saint-Nicolas réécrite et bandeau de saison

La page Saint-Nicolas disait qu’un séjour sur le week-end du défilé se réserve en septembre et que
les retardataires finissent en périphérie, au moment même où elle reçoit le plus de visites. Elle
est réécrite dans les quatre langues avec les dates publiées par la Ville le 13 novembre (villages
dès le 20, défilé à 17 h 45), et pousse vers les autres soirées des fêtes. Un bandeau de saison
sur l’accueil y renvoie ; son retrait automatique est fiché dans [[chaine-de-generation-1901]].

## 2026-11-17, relecture des articles et vérification en ligne

Les dix articles ont été relus dans les quatre langues et leurs faits vérifiés en ligne. Corrigés :
adresse de La Bolée, OUIGO absent jusqu’au 13 décembre, nombre de TGV, travaux de la villa
Majorelle, spectacle d’été au passé, parkings alignés sur moins de 5 minutes, tarif réduit retiré.
Le détail et les arbitrages sont dans [[faits-dates-des-articles-1901]].

## 2026-11-17, titres alignés sur la Search Console

Export Search Console reçu (données depuis le 2026-07-30). La page Saint-Nicolas reçoit 97 % des
clics, mais sa version française sortait 9e à 11e sur « marché de Noël Nancy 2026 » avec un titre
centré sur Saint-Nicolas. Titres et h1 mènent désormais par « marché de Noël », Saint-Nicolas en
second ; section ajoutée sur la légende et le Père Fouettard. Horaires des villages complétés,
tarifs du musée de l’École de Nancy précisés. Page mise à jour :
[[faits-dates-des-articles-1901]].
