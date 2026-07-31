# Plan d'exécution

**le1901-nancy.fr — août 2026**

Document de référence unique. Il consolide `IMPLEMENTATION-2026-07.md` (lots L1 à L13) et
`PLAN-SEO-2026-08.md` (lots A à H), après vérification de chaque critère d'acceptation dans le
dépôt réel.

Les deux documents précédents passent en archive. Ils restent utiles pour le raisonnement et les
sources ; ils ne sont plus la liste de ce qu'il reste à faire. C'est ce fichier qui l'est.

Suivi vivant : l'artefact **Le 1901 — suivi des lots**, mis à jour après chaque lot livré.

---

## 0. Ce qui est réellement fait

Vérifié fichier par fichier le 31 juillet 2026, pas d'après les cases cochées.

| Lot | Intitulé | État | Ce qui reste |
| --- | --- | --- | --- |
| L1 | Données du logement et faits clés | **fait** | — |
| L2 | Sélecteur de dates et lien Cocoonr | **fait** | contrôle semestriel du format d'URL |
| L3 | Prix et conditions | **fait** | révision semestrielle du prix plancher |
| L4 | Preuve sociale et 3 étoiles | **fait** | la collecte d'avis n'est pas lancée, voir G |
| L5 | Navigation mobile | **fait** | — |
| L6 | Interface et accessibilité | **fait** | `text-gold` sur fond clair à repasser en `text-gold-text` |
| L7 | Sémantique, structure, sitemap | **fait** | — |
| L8 | Conformité et mentions légales | **partiel** | adresse et SIRET à publier, voir L8b |
| L9 | Performance et dépendances tierces | **fait en code** | mesures LCP et poids non relevées |
| L10 | SEO et données structurées | **partiel** | recadré, réparti entre C et E |
| L11 | Contenu éditorial, trois blocs | **partiel** | nettoyage du vocabulaire, voir L11b |
| L12 | Calendrier de disponibilité | **partiel** | code écrit et câblé, bloqué sur l'URL `.ics` et la CI |
| L13 | Identité visuelle Art Nouveau | **partiel** | typographie et ornements livrés, palette et icônes non |
| A | Maillage interne | **fait** | jetons de lien, `related`, fil d'Ariane, 11 liens contextuels |

Trois chantiers présents au dépôt ne figuraient dans aucun lot et sont désormais rattachés :
`scripts/indexnow.js` et la commande `npm run indexnow` (lot N1), `404.html` (clos),
`docs/en-tetes-securite.md` (lot N2).

### 0.1 Écarts à connaître avant de reprendre les anciens documents

- **L10 tâche 7 est fausse dans son principe**, pas seulement inachevée. Un meublé unique n'est pas
  éligible à une fiche Google Business Profile. Voir `PLAN-SEO-2026-08.md` §0.3.
- **L12 a démarré alors que le document l'interdisait** tant que l'URL `.ics` n'était pas
  disponible. Le code est écrit, testé, câblé, et le build réussit sans flux. C'est défendable, et
  ce n'est acté nulle part : ce document l'acte.
- **L13 a été livré à moitié sans la validation de maquettes** que le document imposait avant toute
  implémentation. La typographie et les ornements sont en place, la palette ne l'est pas.
- **L8 est annoncé traité** alors que `src/index.src.html` porte encore le commentaire
  « À compléter avant publication » sur l'adresse de l'éditeur.
- **Le contact est `bookings@cocoonr.fr`** partout, et non l'adresse dédiée `contact@le1901-nancy.fr`
  que le document prévoyait. Arbitrage implicite, à confirmer ou à corriger dans L8b.
- **La règle 0.6 point 5 est caduque** : le build écrit 16 `index.html` et le `sitemap.xml`, pas
  quatre pages.

---

## 1. Séquence d'exécution

Cinq étapes. L'ordre n'est pas une préférence : chaque étape lève une dépendance de la suivante.

| # | Lot | Titre | Effort | Bloqué par |
| --- | --- | --- | --- | --- |
| **Étape 1 — débloquer, 1 semaine** |
| 1 | **N1** | Intégration continue et automatisation | 3 h | — |
| 2 | ~~**C1**~~ | ~~Courrier à Cocoonr~~ — **envoyé**, en attente de réponse | — | — |
| 3 | ~~**H**~~ | ~~Mesure~~ — **fait**, référence à consigner dans `docs/mesure.md` | — | — |
| 4 | **L8b** | Mentions légales, adresse et statut | 2 h | — |
| **Étape 2 — consolider l'entité, 2 semaines** |
| 5 | **E** | Données structurées et entité | 5 h | C1 pour les URL de `sameAs` |
| 6 | **C2** | Signaux locaux et citations | 4 h | L8b pour le NAP |
| 7 | **G** | Collecte d'avis | 1 h + continu | C2 pour les plateformes |
| 8 | **L11b** | Nettoyage du vocabulaire | 2 h | — |
| **Étape 3 — la surface, 6 semaines** |
| 9 | ~~**B1 + D**~~ | ~~Quatre pages série A et adaptation DE/EN~~ — **livré**, vérifié le 31 juillet | — | — |
| 10 | ~~**B2**~~ | ~~Trois pages, série B~~ — **livré**, vérifié le 31 juillet | — | — |
| **Étape 4 — saisonnalité et mesure, à partir de septembre** |
| 11 | — | *(fusionné dans la ligne 10)* | — | — |
| 12 | **F** | Moteurs de réponse et suivi IA | 1 h par mois | H |
| **Étape 5 — quand les prérequis tombent** |
| 13 | **L12b** | Calendrier de disponibilité | 2 h | URL `.ics` + N1 |
| 14 | **L13b** | Identité visuelle, seconde moitié | 3 j | maquettes validées |
| 15 | **N2** | En-têtes de sécurité | 1 h | hébergement |
| 16 | **C3** | Liens locaux et presse | continu | C2 |

Total des lots chiffrables, hors continu et hors L13b : environ **quinze jours**, dont onze de
rédaction.

### 1.1 Recette commune, révisée

Aucun lot n'est clos sans ces six contrôles. Les cinq premiers viennent de juillet, le sixième est
nouveau.

1. `npm run build` se termine sans erreur.
2. Les **16** pages sont régénérées, aucune ne contient de texte français résiduel hors noms propres.
3. Rendu vérifié à 375, 768, 1024 et 1440 px.
4. Navigation au clavier complète sur la zone modifiée, focus toujours visible.
5. `git diff` ne touche que `src/`, `scripts/`, `dist/`, `docs/` et les fichiers générés.
6. **Le rapport de maillage du build ne régresse pas** : aucune page ne perd de source entrante.

---

## N1 — Intégration continue et automatisation

**Effort : 3 h. Priorité : première, parce qu'elle débloque L12b et rend N1 utile à tout le reste.**

### Objectif

Que le site se reconstruise et se soumette tout seul, et que le calendrier de disponibilité
devienne publiable.

### Constat

Il n'y a pas de `.github/` au dépôt. `scripts/indexnow.js` existe et fonctionne, mais rien ne le
déclenche. `scripts/ical.js` est complet et testé, mais aucune reconstruction quotidienne ne
l'appelle : c'est précisément le risque énoncé par le L12 de juillet, « sans reconstruction
automatique quotidienne, mieux vaut s'en tenir au sélecteur seul ».

### Tâches

1. **Créer `.github/workflows/build.yml`.** Déclencheurs : `push` sur la branche principale, et
   `schedule` quotidien à une heure creuse. Étapes : `npm ci`, `npm run build`, commit des fichiers
   générés s'ils ont changé.
2. **Passer les secrets en variables d'environnement du workflow** : `COCOONR_ICS_URL` et la clé
   IndexNow. Jamais dans le dépôt, `scripts/ical.js` est déjà écrit dans cet esprit.
3. **Enchaîner `npm run indexnow`** après un build qui a produit un diff, jamais à vide : soumettre
   seize URL inchangées chaque jour n'apporte rien et peut agacer.
4. **Faire échouer le workflow bruyamment** si le build casse, et **ne pas le faire échouer** si le
   flux `.ics` est injoignable : le mode dégradé est déjà géré par `fetchBookedNights`, qui renvoie
   `null`.
5. **Documenter la manœuvre** dans un `docs/ci.md` court : ce que fait le workflow, quels secrets,
   comment le relancer à la main.

### Fichiers

`.github/workflows/build.yml`, `docs/ci.md`.

### Critères d'acceptation

- Un `push` déclenche le build et republie les seize pages.
- Le build quotidien tourne et ne commit rien quand rien n'a changé.
- IndexNow n'est appelé que sur diff.
- Un `.ics` injoignable ne fait pas échouer le workflow.

### Risque

Une boucle de commits, si le workflow commit des fichiers qui déclenchent le workflow. Se protège
par une condition sur l'auteur du commit ou `[skip ci]`.

---

## C1 — Courrier à Cocoonr, canaux de diffusion

**Effort : 1 h de rédaction, puis attente. À lancer le premier jour, la réponse conditionne C2, E et G.**

### Objectif

Savoir où le logement est réellement diffusé, et obtenir les deux choses que seule la conciergerie
peut donner : l'accès à Google Vacation Rentals et l'URL `.ics`.

### Tâches

1. **Écrire un courrier unique**, qui pose quatre questions précises plutôt que d'ouvrir une
   discussion. Un brouillon existe pour le point 4 dans `docs/email-cocoonr-ical.md`, à fusionner.
   - Le 1901 est-il diffusé dans Google Vacation Rentals, directement ou via votre channel manager ?
     Si oui, sous quelle URL de réservation. Si non, est-ce prévu.
   - Sur quelles plateformes le logement est-il publié aujourd'hui : Airbnb, Booking, Abritel,
     autres ? Merci de fournir l'URL publique de chaque annonce.
   - Le nom affiché est-il « Le 1901 » à l'identique partout ?
   - Pouvez-vous fournir une URL `.ics` stable des disponibilités, telle que celle analysée le
     31 juillet 2026 ?
2. **Consigner les réponses** dans `docs/canaux-diffusion.md`, avec la date. Ce fichier devient la
   source des `sameAs` du lot E et des plateformes de collecte d'avis du lot G.
3. **Relancer à dix jours** si pas de réponse. C'est leur intérêt commercial autant que le vôtre.

### Fichiers

`docs/email-cocoonr-ical.md` (à fusionner), `docs/canaux-diffusion.md` (nouveau).

### Critères d'acceptation

- Le courrier est parti, la date est notée.
- `docs/canaux-diffusion.md` existe, même incomplet, et porte les questions en attente.

### Risque

Une réponse évasive. Reformuler alors question par question, en demandant une réponse par oui ou
par non sur Google Vacation Rentals : c'est le seul point qui ne se contourne pas.

---

## H — Mesure

**Effort : 2 h. Sans ce lot, aucun des suivants n'est évaluable.**

### Objectif

Établir la référence avant de bouger quoi que ce soit d'autre. Les chiffres du §11 de
`PLAN-SEO-2026-08.md` n'ont de sens que mesurés depuis un point zéro daté.

### Tâches

1. **Search Console**, propriété de domaine sur `le1901-nancy.fr`. Ajouter quatre vues : la racine,
   `/en/`, `/es/`, `/de/`. Soumettre le sitemap.
2. **Bing Webmaster Tools.** Cinq minutes, gratuit, et Bing alimente une partie des réponses de
   ChatGPT. Importer depuis Search Console pour aller plus vite.
3. **Inspection d'URL sur les 16 pages.** Vérifier qu'elles sont indexées et dans la bonne langue.
   Noter celles qui ne le sont pas : c'est le premier signal utile.
4. **Analytics sans cookie**, Plausible ou équivalent, pour éviter le bandeau et rester cohérent
   avec le paragraphe RGPD déjà publié. Mesurer en priorité **les clics sortants vers Cocoonr** :
   c'est le seul indicateur de conversion accessible depuis un site statique.
5. **Relever la référence** dans `docs/mesure.md` : impressions, clics, pages indexées, domaines
   référents, à la date du jour.

### Fichiers

`docs/mesure.md` (nouveau), plus une balise ou un script d'analytics dans `src/index.src.html`.

### Critères d'acceptation

- Le sitemap est soumis et accepté dans les deux outils.
- Les 16 URL ont un statut d'indexation connu et consigné.
- Un clic sur le bouton de réservation remonte dans l'analytics.
- `docs/mesure.md` porte une ligne de référence datée.

### Risque

L'analytics ajoute une requête tierce et fragilise le paragraphe RGPD réécrit au L8. Choisir un
outil sans cookie et **mettre à jour `legal.s5Body` dans les quatre langues** au même moment, pas
après.

---

## L8b — Mentions légales, adresse et statut

**Effort : 2 h. Les arbitrages sont pris, il reste à exécuter.**

### Objectif

Fermer le seul point du bloc légal qui reste ouvert, et poser au passage le NAP dont dépend tout
le référencement local.

### Constat

`src/index.src.html` ligne 2228 porte encore le commentaire « À compléter avant publication :
adresse postale complète de l'éditeur ». L'adresse affichée s'arrête à « Quartier Charles III,
54100 Nancy ». Aucun SIRET.

### Décisions du 31 juillet 2026

| Sujet | Décision |
| --- | --- |
| Adresse affichée | **« Rue Charles III, 54100 Nancy »**, la rue sans le numéro. Coordonnées géographiques au niveau de l'immeuble dans le JSON-LD. Le numéro exact est transmis après réservation |
| Numéro d'enregistrement | **aucun affichage, sujet clos.** Nancy n'est pas raccordée au téléservice, la déclaration a été faite par Cerfa et le récépissé ne porte aucun numéro. Rien à publier, rien à préparer |

### Tâches

1. **Compléter `legal.s1Body`** dans les quatre langues : identité de l'éditeur, adresse,
   hébergeur. Statut juridique et SIRET écartés sur décision du 31 juillet.
2. **Trancher l'adresse de contact.** Le dépôt renvoie partout vers `bookings@cocoonr.fr`, alors
   que juillet prévoyait `contact@le1901-nancy.fr`. Confirmer le choix actuel et le noter, ou
   créer l'adresse dédiée et la substituer dans les quatre langues.
3. **Afficher le classement 3 étoiles et sa date d'obtention** dans le bandeau de faits clés, si
   ce n'est pas déjà le cas au niveau de détail voulu.
4. **Répercuter le NAP dans le JSON-LD** : `streetAddress: "Rue Charles III"`,
   `addressLocality: "Nancy"`, `postalCode: "54100"`, `addressCountry: "FR"`, cohérent au caractère
   près avec ce qui est affiché.

### Fichiers

`src/index.src.html` (bloc `legal`, bloc JSON-LD), les seize pages régénérées.

### Critères d'acceptation

- Le commentaire « À compléter avant publication » a disparu.
- Le nom, l'adresse et le téléphone sont identiques entre les mentions légales, le pied de page et
  le JSON-LD, à la lettre près.
- La même chaîne d'adresse part vers les fiches externes du lot C2.

### Risque

Une variante d'orthographe. « rue Charles-III » ou « r. Charles 3 » sur une fiche externe casse la
cohérence NAP que ce lot vient d'établir. Une seule chaîne, copiée telle quelle partout.

---

## E — Données structurées et entité

**Effort : 5 h. Dépend de C1 pour les URL de `sameAs`.**

### Objectif

Que les moteurs et les modèles puissent recouper que le site, les annonces sur les plateformes et
le profil de l'hôte désignent la même chose.

### Constat

Le balisage est solide. `sameAs` existe mais ne porte qu'une URL sur `#logement`, la fiche Cocoonr.
`#hote` est correctement pourvu, LinkedIn et Instagram. Le tableau `image` compte neuf entrées,
au-dessus du minimum de huit : rien à y faire.

### Tâches

1. **Compléter `sameAs` sur `#logement`** avec les URL recueillies en C1 : Airbnb, Booking,
   Tripadvisor, fiche office de tourisme. À faire au fil de l'eau, une URL dès qu'elle existe.
2. **Ajouter `about` vers `#logement`** sur les seize pages. Les douze pages éditoriales le portent
   déjà via `WebPage.about` ; vérifier la page d'accueil.
3. **Expliciter `inLanguage`** partout où il manque.
4. **Baliser `/nancy-48-heures/` en `TouristTrip`**, avec un `itinerary` en `ItemList` de
   `TouristAttraction`. C'est exactement ce que la page décrit, et c'est un des balisages les mieux
   compris.
5. **Baliser le quartier en `Place`** sur `/quartier-charles-iii/`, relié au logement par
   `containedInPlace`.
6. **Créditer les photographies** : `ImageObject` avec `creator` sur Solène Mangin, `contentUrl` et
   la licence. Utile en recherche d'images et honnête envers la photographe.
7. **Passer les seize pages au validateur de résultats enrichis**, pas seulement les quatre
   françaises.

### Fichiers

`src/index.src.html` (bloc JSON-LD), `scripts/build-i18n.js` (graphe des pages éditoriales),
`src/pages.js` si le balisage doit varier par page.

### Critères d'acceptation

- Aucune erreur au validateur sur les seize pages.
- `sameAs` porte au moins trois URL externes sur `#logement`.
- `aggregateRating` n'est déclaré que tant que la note et le nombre d'avis sont visibles à l'écran.

### Risque

Sur-baliser. Un `TouristAttraction` par lieu cité sur toutes les pages produit du bruit sans
bénéfice. S'en tenir aux deux pages nommées.

---

## C2 — Signaux locaux et citations

**Effort : 4 h de travail effectif, étalées sur six semaines à cause des délais de validation.
Dépend de L8b pour le NAP.**

### Objectif

Exister ailleurs que sur son propre site. C'est le manque le plus lourd du dossier après les avis.

### Rappel

Une fiche Google Business Profile n'est pas possible pour un meublé unique loué en autonomie.
Le raisonnement complet est au §0.3 de `PLAN-SEO-2026-08.md`. Ce lot fait ce qui la remplace.

### Tâches

1. **Destination Nancy, office de tourisme.** La citation locale la plus lourde du dossier.
   Contact par le service hébergement, le classement 3 étoiles est l'argument d'entrée. Demander
   une fiche **avec lien** vers le site, pas seulement une mention.
2. **Vérifier la fiche Atout France** des meublés classés, qui découle du classement et devrait
   déjà exister. La corriger si le NAP n'y est pas exact.
3. **Créer la fiche Tripadvisor**, catégorie location de vacances. Gratuite, elle se positionne, et
   surtout elle est massivement citée par les moteurs conversationnels.
4. **Métropole du Grand Nancy.** La taxe de séjour est déjà collectée pour leur compte : le lien
   administratif existe, demander la page hébergements.
5. **Évaluer Clévacances ou Gîtes de France** au coût réel. Utile pour la clientèle française et la
   caution qualité, payant, à décider et non à subir.
6. **Contrôler la cohérence NAP sur chaque fiche créée** : même nom, même orthographe, même adresse,
   même téléphone, même URL avec `https://` et le slash final. Consigner dans
   `docs/canaux-diffusion.md`.

### Fichiers

`docs/canaux-diffusion.md`. Aucun code.

### Critères d'acceptation

- Au moins trois citations publiées et vérifiées, dont l'office de tourisme.
- Le NAP est identique au caractère près sur toutes.
- Chaque URL obtenue est reportée dans le `sameAs` du lot E.

### Risque

Se disperser sur des annuaires génériques. Les citations ont perdu du poids depuis quelques
années : trois bonnes valent trente médiocres, et le temps passé sur les trente est perdu.

---

## G — Collecte d'avis

**Effort : 1 h de mise en place, puis un geste après chaque séjour. Dépend de C2 pour les plateformes.**

### Objectif

Sortir du seul avis publié. Aucun travail technique ne compense ce manque, et il pèse sur le
classement local, sur la conversion et sur ce que les modèles disent du logement.

### Constat

`docs/message-collecte-avis.md` existe en français et en anglais, mais porte un `[LIEN]` non résolu
qui attendait la fiche Google. Ce lien devient celui de Tripadvisor et des plateformes de C2.

### Tâches

1. **Résoudre le `[LIEN]`** du message type, en trois variantes : Tripadvisor, Airbnb, Booking.
2. **Traduire le message en espagnol et en allemand**, par cohérence avec le reste du site.
3. **Fixer le moment de l'envoi** : le lendemain du départ, pas le jour même. Convenir avec Cocoonr
   de qui envoie, eux ou vous, et l'écrire.
4. **Répartir plutôt que concentrer.** Dix avis sur quatre plateformes valent mieux que dix avis
   sur une seule. Pas d'avis Google possible ici.
5. **Répondre à chaque avis**, y compris les bons. Les réponses sont indexées et lues par les
   modèles.
6. **Mettre à jour `aggregateRating`** quand le nombre d'avis change, et seulement si la valeur
   reste visible à l'écran.

### Fichiers

`docs/message-collecte-avis.md`, `src/index.src.html` (bloc `reviews` et JSON-LD).

### Critères d'acceptation

- Le message type existe en quatre langues, sans `[LIEN]` résiduel.
- Le déclencheur d'envoi est écrit et attribué à quelqu'un.
- Objectif à six mois : 15 avis cumulés, dont 5 hors Cocoonr.

### Risque

Attendre d'avoir « assez » d'avis pour commencer. Le premier geste compte plus que le dispositif.

---

## L11b — Nettoyage du vocabulaire

**Effort : 2 h. Aucune dépendance.**

### Objectif

Fermer la tâche 5 du L11, restée ouverte. Le concret l'emporte sur le superlatif, et c'est aussi
ce que les modèles reprennent.

### Constat

« Sans Compromis » subsiste en surtitre (`src/index.src.html:1295`), « accueil d'exception »
ligne 1338. Le reste du texte a été assaini.

### Tâches

1. **Relever tous les superlatifs non étayés** dans le dictionnaire `translations` : *exception,
   sans compromis, véritable, écrin, intelligemment pensé*, et leurs équivalents dans les trois
   autres langues, qui ont souvent été traduits tels quels.
2. **Remplacer par le fait qui les justifiait.** « Confort thermique d'exception » devient « sol,
   mur et bac de douche chauffants », ce qui est déjà écrit deux lignes plus bas.
3. **Traiter les quatre langues ensemble**, clé par clé, sous peine de faire dériver les versions.
4. **En profiter pour les surtitres en `text-gold`** sur fond clair, relevés au L6 et non corrigés :
   passer en `text-gold-text`, dont le contraste est documenté dans `src/input.css`.

### Fichiers

`src/index.src.html`, `src/input.css` si des classes changent.

### Critères d'acceptation

- Aucun superlatif non étayé dans les quatre langues.
- Aucun surtitre en `text-gold` sur fond clair.
- Le build passe, les seize pages sont régénérées.

---

## B1 — Trois pages, série A

**Effort : 5 jours, dont l'essentiel en rédaction et relecture. Le lot A est le prérequis, il est fait.**

### Objectif

Passer de quatre à sept contenus, soit de seize à vingt-huit URL. Chaque page est une porte
d'entrée et une source de liens internes.

### Les trois pages

| Page | URL française | Ce qu'elle capte | Marché prioritaire |
| --- | --- | --- | --- |
| Dormir près de la place Stanislas | `/dormir-place-stanislas/` | la requête transactionnelle locale la plus recherchée, avec le repère que tout le monde connaît | FR |
| Nancy et l'Art nouveau | `/art-nouveau-ecole-de-nancy/` | la raison numéro un pour laquelle un étranger vient à Nancy | DE, puis EN |
| Venir à Nancy | `/venir-a-nancy/` | accès, stationnement, temps de trajet depuis Paris, Strasbourg, Luxembourg, Sarrebruck | EN et DE |

### Tâches

1. **Une page à la fois**, du premier mot français à la quatrième traduction. Trois pages menées de
   front en quatre langues, ce sont douze chantiers ouverts et aucun fini.
2. **Utiliser le prompt du lot B** fourni séparément, qui charge `redaction-fr:redaction-francaise`,
   `redaction-fr:copywriting` et `redaction-fr:ai-seo` dans cet ordre.
3. **Déclarer la page dans `src/pages.js`** : `id`, `sections`, `image`, `related`, `slug` dans les
   quatre langues. Le contrôle de parité et le sitemap suivent tout seuls.
4. **Mettre à jour `related` des pages existantes** pour que les nouvelles reçoivent des liens
   entrants au lieu d'être des culs-de-sac.
5. **Ajouter les liens contextuels** en jetons `[[page:…|ancre]]`, jamais en URL.
6. **Compléter `llms.txt`** à chaque page publiée.
7. **Vérifier le rapport de maillage** en fin de build : chaque page doit atteindre cinq sources.

### Fichiers

`src/pages.js`, `llms.txt`, sitemap régénéré.

### Critères d'acceptation

- 900 mots minimum en français par page, contre 700 aujourd'hui.
- La réponse à la question du titre tient dans les cent premiers mots.
- Un tableau par page.
- `title` sous 80 caractères et méta-description sous 160, dans les quatre langues.
- Au moins trois liens internes en plein texte par page.
- Le rapport de maillage ne signale plus « sous la cible de 5 ».

### Risque

Publier une traduction automatique non relue. Les quatre versions sont indexées et engagent la
crédibilité du site. Mieux vaut trois langues justes que quatre approximatives.

---

## D — Adaptation allemande et anglophone

**Effort : 3 jours. Dépend de B1.**

### Objectif

Cesser de traduire pour commencer à adapter. Un Allemand de Sarrebruck en voiture et un Américain
qui arrive en TGV depuis Paris n'ont ni les mêmes questions ni les mêmes mots.

### Constat

Le socle technique est bon : `hreflang` complets et réciproques, slugs localisés, sitemap à jour.
Le contenu, lui, est le même partout. Le mot *Jugendstil* figure dans trois cartes du guide
allemand, dans aucun titre, aucune méta, aucune URL.

### Tâches

1. **Basculer `x-default` sur `/en/`.** Il sert aux visiteurs dont la langue ne correspond à aucune
   version : un Néerlandais tombe aujourd'hui sur du français. Une ligne dans
   `scripts/build-i18n.js`, deux endroits, accueil et pages éditoriales.
2. **Créer `/de/jugendstil-nancy/`**, construite pour le vocabulaire allemand et non traduite du
   français. Requêtes visées : *Ferienwohnung Nancy Zentrum, Nancy Sehenswürdigkeiten, Jugendstil
   Nancy, Nancy Städtereise*.
3. **Ajouter un tableau des temps de trajet en voiture** depuis Saarbrücken, Luxemburg, Trier,
   Karlsruhe et Frankfurt, avec les kilomètres. **À vérifier avant publication** : un temps de
   trajet faux se paie cher.
4. **Développer le stationnement dans la version allemande.** Les parkings Saint-Dizier et Dom
   Calmet méritent plus de place qu'en français : ce marché vient en voiture.
5. **Créer `/en/nancy-from-paris/`.** Combien de temps, combien ça coûte, faisable en une journée
   ou non, faut-il dormir sur place. C'est le format le plus repris par les moteurs
   conversationnels sur ce type de destination.
6. **Reprendre le vocabulaire anglophone** : *apartment* et non *flat*, *self check-in*, *washer and
   dryer*. Le lave-linge et le sèche-linge sont un argument de vente majeur pour un séjour long
   américain, et ils sont aujourd'hui noyés dans une liste.
7. **Enrichir la FAQ allemande** : caution, annulation, paiement, animaux, réservation instantanée.
   Ce voyageur veut des conditions écrites et sans ambiguïté.

### Fichiers

`src/pages.js`, `scripts/build-i18n.js` (`x-default`), `src/index.src.html` (FAQ), `llms.txt`.

### Critères d'acceptation

- `x-default` pointe vers `/en/` sur les vingt-huit URL.
- *Jugendstil* figure dans un `title`, une méta-description et une URL allemande.
- Les temps de trajet sont sourcés ou marqués comme à vérifier, jamais estimés en silence.
- Aucune page allemande ou anglaise n'est la traduction mot à mot de la française.

### Risque

Créer des pages qui n'existent que dans une langue et casser la parité. Le contrôle du build
l'interdit : une page déclarée dans `src/pages.js` doit exister dans les quatre langues. Une page
propre à un marché se traite donc comme une variante de contenu, pas comme une page orpheline.

---

## B2 — Trois pages, série B

**Effort : 3 jours. Dépend de B1 pour la méthode, pas pour le contenu.**

### Objectif

Couvrir la saisonnalité et les segments qui remplissent les creux de calendrier.

| Page | URL française | Contrainte de calendrier |
| --- | --- | --- |
| Saint-Nicolas à Nancy | `/saint-nicolas-nancy/` | **à publier avant fin septembre** pour être indexée à temps pour décembre |
| Nancy en famille | `/nancy-en-famille/` | aucune |
| Où manger à Nancy centre | `/ou-manger-nancy/` | aucune |

### Tâches

1. **Saint-Nicolas d'abord**, quoi qu'il arrive. Une page publiée en novembre pour un événement de
   décembre ne sert à rien. Vérifier les dates de l'édition en cours avant d'écrire.
2. **Sortir le carnet d'adresses de l'ancre `#guide`** vers `/ou-manger-nancy/`. Il devient une URL
   positionnable et très citable par les moteurs conversationnels, et l'ancre `#guide` reste sur
   l'accueil pour ne casser aucun lien existant.
3. **`/nancy-en-famille/`** : quatre couchages, lit parapluie, chaise haute, parc de la Pépinière,
   distances poussette. Segment sous-exploité par le site aujourd'hui.
4. **Même mécanique que B1** : déclaration dans `src/pages.js`, `related` mis à jour, jetons de
   lien, `llms.txt`, contrôle du rapport de maillage.

### Critères d'acceptation

Ceux de B1, plus : `/saint-nicolas-nancy/` est en ligne et indexée avant le 30 septembre.

### Risque

Une page événementielle qui vieillit. Prévoir une revue annuelle en septembre, à inscrire dans
`docs/mesure.md`.

---

## F — Moteurs de réponse et suivi IA

**Effort : intégré aux lots de rédaction, plus 1 h par mois. Dépend de H pour la référence.**

### Objectif

Être cité dans les réponses générées, et savoir si on l'est.

### Constat

Le site part avec une avance rare : `llms.txt` dense et à jour, robots IA explicitement autorisés,
FAQ balisée, faits chiffrés. Ce qui manque est en aval, pas sur le site.

### Tâches

1. **Dater et sourcer les affirmations.** « Rénovation complète 2026 » devient « rénovation achevée
   en janvier 2026 ». « Classé 3 étoiles » devient « classé 3 étoiles depuis le [date] ». Une
   affirmation datée est reprise, une affirmation vague est ignorée.
2. **Écrire une formulation distinctive par page**, du type « meublé classé 3 étoiles à 150 m de la
   halle du marché central ». À vérifier avant de l'écrire, mais c'est ce qui résiste à la fusion
   dans les réponses génératives.
3. **Créer la grille de suivi** : 15 requêtes, 5 par langue en français, anglais et allemand.
   Testées une fois par mois sur ChatGPT, Perplexity, Gemini et les AI Overviews. Consignées dans
   `docs/mesure.md` : la réponse cite-t-elle le site, une plateforme, un concurrent, ou rien.
4. **Travailler les sources que les modèles citent réellement.** Ils citent Tripadvisor, Reddit,
   Wikivoyage et les blogs, rarement le site d'un hébergement. Trois gestes : la fiche Tripadvisor
   du lot C2, une contribution factuelle à Wikivoyage sur le quartier Charles III **sans lien
   commercial**, et une réponse utile dans un fil de discussion pertinent en s'identifiant comme
   propriétaire.
5. **Maintenir `llms.txt`** à chaque page publiée. Le fichier actuel est un modèle du genre, il ne
   doit pas dériver.

### Critères d'acceptation

- La grille de 15 requêtes existe et a été relevée au moins une fois.
- Objectif à six mois : 7 requêtes sur 15 citent le site ou une de ses fiches.

### Risque

Payer un outil de suivi de citations IA. Hors de proportion pour un logement unique : la grille
manuelle suffit et vous apprend davantage.

---

## L12b — Calendrier de disponibilité

**Effort : 2 h. Bloqué par l'URL `.ics` (C1) et par la CI (N1). Aucun code à écrire.**

### Objectif

Que le visiteur sache si ses dates sont libres avant de cliquer.

### Constat

Le code est écrit, testé et câblé. `scripts/ical.js` gère le `DTEND` exclusif, ne publie ni
`SUMMARY` ni `UID`, et renvoie `null` en mode dégradé. `applyBookedCalendar` vide proprement
l'emplacement quand il n'y a pas de flux. Le sélecteur de dates bloque déjà les nuits occupées.
Il manque la donnée et le déclencheur.

### Tâches

1. **Obtenir l'URL `.ics`** auprès de Cocoonr, point 4 du courrier C1.
2. **La déclarer en secret du workflow** créé en N1, jamais dans le dépôt.
3. **Vérifier sur un build réel** que les séjours s'affichent, que le jour de départ reste
   réservable en arrivée, et que le sélecteur refuse les chevauchements.
4. **Contrôler la mention de fraîcheur.** `booking.bookedNote` prévient déjà que la disponibilité
   qui fait foi est celle de Cocoonr : avec un build quotidien, la mention reste vraie. Sans build
   quotidien, elle devient un mensonge poli.

### Critères d'acceptation

- Le calendrier s'affiche avec des dates réelles.
- Le build quotidien le rafraîchit.
- Un flux injoignable fait disparaître le bloc sans casser la page.

### Risque

Publier un calendrier périmé, qui est pire que pas de calendrier. **Ne pas livrer ce lot avant
que N1 tourne.**

---

## L13b — Identité visuelle, seconde moitié

**Effort : 3 jours. Bloqué par une validation de maquettes qui n'a pas eu lieu.**

### Objectif

Terminer ce qui a été commencé sans le processus prévu.

### Constat

Gilda Display remplace Playfair, auto-hébergée. Les ornements SVG `orn-umbel` et `orn-whip` sont en
place, les anciens filets `w-12 h-px bg-gold` ont disparu. En revanche la palette n'a pas bougé,
`favicon.ico`, `favicon.png` et `apple-touch-icon.png` datent du 3 avril, et `images/og-le1901.jpg`
est antérieur au lot.

### Décision à prendre

Les deux moitiés du lot sont découplables. Refaire la palette **invalide les contrastes documentés
dans `src/input.css` et oblige à revalider le L6**. Refaire les favicons et l'image Open Graph n'a
aucun impact ailleurs.

**Recommandation : livrer la seconde moitié seule.** Favicons et image OG, sans toucher à la
palette. Le gain visuel est immédiat, le coût de revalidation est nul, et la question de la palette
peut attendre un vrai moment de design.

### Tâches, si la palette est reprise

1. Produire trois directions, sur une page réelle et non sur une planche.
2. Faire valider par écrit avant toute implémentation. C'est ce que juillet imposait et qui n'a pas
   été fait.
3. Recalculer les contrastes et remettre à jour le commentaire de `src/input.css`.
4. Revalider les points du L6 qui dépendent de la couleur.

### Tâches, seconde moitié seule

1. Redessiner `favicon.ico`, `favicon.png` et `apple-touch-icon.png` dans le vocabulaire Art
   nouveau, avec le motif d'ombelle déjà utilisé.
2. Refaire `images/og-le1901.jpg` en 1200×630 avec la typographie retenue.
3. Vérifier le rendu de la carte de partage sur les principaux réseaux.

---

## N2 — En-têtes de sécurité

**Effort : 1 h. Dépend de l'hébergement.**

### Constat

`docs/en-tetes-securite.md` existe au dépôt mais n'est rattaché à aucun lot. Le site est servi par
GitHub Pages, qui ne permet pas de définir d'en-têtes HTTP.

### Tâches

1. **Trancher l'hébergement.** Rester sur GitHub Pages et renoncer aux en-têtes, ou passer par un
   service qui les autorise. La question n'est pas urgente pour un site statique sans formulaire.
2. **Si le service change**, appliquer les en-têtes documentés et vérifier qu'ils ne cassent ni
   l'iframe Google Maps ni la visite Matterport, tous deux chargés au clic.
3. **Sinon**, clore le sujet en une ligne dans `docs/en-tetes-securite.md` : décision assumée,
   raison, date.

---

## C3 — Liens locaux et presse

**Effort : continu, par petites touches. Dépend de C2.**

### Objectif

Obtenir des liens depuis des sites que Google associe déjà à Nancy. Un lien de la presse régionale
ou d'un acteur local reconnu pèse davantage qu'un lien d'un grand site généraliste.

### Pistes, par ordre de facilité

1. **Les commerces du carnet d'adresses.** La Bolée, La Maison dans le Parc, la Maison des Sœurs
   Macarons, Daum. Le site les cite déjà et leur envoie du trafic. Une demande de réciprocité,
   formulée simplement, aboutit plus souvent qu'on ne le croit.
2. **Les institutions culturelles.** Musée de l'École de Nancy, Villa Majorelle, musée des
   Beaux-Arts. Certaines listent des hébergements partenaires.
3. **Les salles de séminaire et les entreprises du bassin**, pour la page séjour professionnel.
   C'est le levier le plus direct sur un segment où la concurrence SEO est faible.
4. **La presse locale.** L'Est Républicain couvre les ouvertures et les rénovations. L'angle
   « appartement rénové en 2026 dans l'esprit de l'École de Nancy, photographié par Solène Mangin »
   est un sujet, pas un communiqué.
5. **Les blogs de voyage lorrains et Art nouveau**, y compris germanophones, une fois les pages du
   lot D en ligne.

### Ce qu'il ne faut pas faire

Acheter des liens, s'inscrire sur cinquante annuaires génériques, échanger des liens avec d'autres
locations. Le rapport risque-bénéfice est mauvais à cette échelle.

---

## 2. Tableau de bord

Reporter ces valeurs dans `docs/mesure.md` à chaque relevé.

| Indicateur | Référence | 3 mois | 6 mois |
| --- | --- | --- | --- |
| Pages indexées | **44 au sitemap**, indexation à confirmer | 44 | 44 |
| Impressions Search Console | à établir en H | référence + 30 % | référence × 2 |
| Part des impressions non françaises | à établir en H | 25 % | 40 % |
| Clics sortants vers Cocoonr | à établir en H | référence établie | + 50 % |
| Avis publiés, toutes plateformes | 1 | 6 | 15 |
| Citations IA, sur 15 requêtes | 0 | 3 | 7 |
| Domaines référents | à établir en H | 5 | 12 |
| Pages sous la cible de 5 sources | **0 sur 10** | 0 | 0 |

Les valeurs à trois mois servent surtout à établir une référence. Sur un site neuf, six mois est le
premier horizon où les chiffres veulent dire quelque chose.

---

## 3. Ce qui n'est pas au plan, et pourquoi

- **Le Google Business Profile** : un meublé unique n'y est pas éligible, voir
  `PLAN-SEO-2026-08.md` §0.3.
- **Une cinquième langue** : le néerlandais serait défendable, mais quatre langues à maintenir en
  parité représentent déjà une charge réelle. À reconsidérer quand les trois marchés prioritaires
  produiront des résultats.
- **Un blog** : une page publiée puis abandonnée nuit plus qu'elle ne sert. Les pages des lots B1
  et B2 sont conçues pour être écrites une fois et revues une fois par an.
- **Le SEO programmatique** : générer des dizaines de pages « appartement + quartier » sur un
  logement unique produit de la page vide. La force de ce site est la profondeur, pas le volume.
- **L'achat de liens et les annuaires en masse** : rapport risque-bénéfice mauvais à cette échelle.

