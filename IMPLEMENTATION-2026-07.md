# Plan d'implémentation : le1901-nancy.fr

**Date** : 31 juillet 2026
**Source** : `AUDIT-2026-07.md`
**Nature** : spécifications détaillées, sans code. Chaque lot est autoportant et peut être exécuté seul.
**Ordre retenu** : conversion d'abord, conformité et technique ensuite, contenu puis identité de marque à la fin.

---

## 0. Préambule

### 0.1 État réel du dépôt au moment d'écrire

L'architecture a changé pendant l'audit. Ce n'est plus un fichier HTML unique.

| Fichier | Rôle |
| --- | --- |
| `src/index.src.html` | **source unique**, 2 614 lignes. Contient le balisage, les styles en ligne, les scripts et le dictionnaire `translations` (fr/en/es/de) |
| `scripts/build-i18n.js` | génère quatre pages monolingues via `cheerio`. Les traductions sont appliquées **au build**, pas au runtime |
| `index.html`, `en/index.html`, `es/index.html`, `de/index.html` | **fichiers générés, jamais édités à la main** |
| `src/input.css` | tokens Tailwind v4 (`@theme`) et utilitaires |
| `dist/output.css` | généré par la CLI Tailwind |

**Règle absolue** : toute modification passe par `src/`. Éditer `index.html` directement sera écrasé au prochain build.

Commandes :

```
npm run build        # pages + CSS
npm run build:pages  # pages seules
npm run dev          # watch CSS
```

### 0.2 Ce qui est déjà traité (à ne pas refaire)

Vérifié dans le dépôt local, non encore déployé.

- Paragraphe « L'Esprit du 1901 » : texte complet rendu en français.
- Quatre pages statiques par langue, `hreflang` réciproques, `og:locale` par version. Les répertoires `en/`, `es/`, `de/` existent désormais, donc les `hreflang` ne pointent plus vers des 404.
- Photos réencodées (héro : 842 → 184 Ko), cran `1440w` ajouté, `preload` du héro en place.
- Drapeaux `flagcdn.com` supprimés.
- Phosphor épinglé à `@2.1.2`.
- Méta-description réécrite avec des faits chiffrés.
- Image Open Graph dédiée (`images/og-le1901.jpg`, 1200x630).
- JSON-LD enrichi : `numberOfBedrooms`, `numberOfBeds`, `numberOfBathroomsTotal`, `occupancy`, `checkinTime`, `checkoutTime`, `petsAllowed`, `hasMap`, `potentialAction`, `review`, `@id`.
- Section `#avis` créée avec l'avis 5/5 en `<figure>` sémantique.
- Surface 50 m² présente dans le contenu.

### 0.3 Contrainte structurante : tout texte visible existe en quatre langues

Le dictionnaire `translations` porte quatre blocs (`fr`, `en`, `es`, `de`) strictement parallèles. **Ajouter une phrase, c'est ajouter quatre entrées.** Une clé manquante dans une langue produit silencieusement le texte français dans la page étrangère, sans erreur de build.

Conventions à respecter :

- clé en `camelCase` sous un namespace de section (`facts.surface`, `booking.priceFrom`) ;
- `data-i18n` pour du texte simple, `data-i18n-html` si le contenu porte du balisage, `data-i18n-alt` / `data-i18n-aria-label` / `data-i18n-title` pour les attributs ;
- une clé par unité de sens, jamais de phrase concaténée en JavaScript, sous peine de casser l'ordre des mots en allemand.

**À ajouter à `scripts/build-i18n.js` dès le lot 1** : une vérification de parité qui compare les jeux de clés des quatre langues et **fait échouer le build** si l'une manque. Sans ce garde-fou, les lots suivants introduiront des trous invisibles.

### 0.4 Arbitrages validés

| Sujet | Décision |
| --- | --- |
| Couchages | « 2 chambres », aligné sur Cocoonr |
| Prix | « À partir de X € la nuit » affiché |
| Code postal | **54100** (le site et le JSON-LD sont à corriger) |
| Carte | iframe Google conservée, style corrigé, **chargement au clic** |
| Section « Votre hôte » | non |
| Contact | lien e-mail simple |
| Instagram | compte personnel conservé, libellé du lien à ajuster |
| Numéro d'enregistrement | statu quo, aucun affichage. Le reste du lot légal est traité |
| Avis | « Avis vérifié, séjour de [mois] », source citée sans lien vers Airbnb |
| Contenu SEO | les trois blocs |
| Identité visuelle | refonte typographie et palette, après validation de maquettes |
| Calendrier | conditionnel, dépend d'une URL `.ics` exploitable |

### 0.5 Carte des lots

| Lot | Titre | Effort | Dépend de |
| --- | --- | --- | --- |
| **L1** | Données du logement et bandeau de faits clés | 3 h | garde-fou i18n (0.3) |
| **L2** | Sélecteur de dates et lien profond Cocoonr | 3 h | L1 |
| **L3** | Prix et conditions de réservation | 2 h | L1 |
| **L4** | Preuve sociale et classement 3 étoiles | 2 h | L1 |
| **L5** | Navigation mobile | 2 h | aucune |
| **L6** | Correctifs d'interface et d'accessibilité | 4 h | aucune |
| **L7** | Sémantique, structure et sitemap | 2 h | aucune |
| **L8** | Conformité, RGPD et mentions légales | 3 h | L6 (carte) |
| **L9** | Performance et dépendances tierces | 4 h | L8 |
| **L10** | SEO et données structurées | 3 h | L1, L3, L4 |
| **L11** | Contenu éditorial, trois blocs | 12 h | L7 |
| **L12** | Calendrier de disponibilité *(conditionnel)* | 5 h | L2 + URL `.ics` |
| **L13** | Identité visuelle Art Nouveau | 3 j | maquette validée |

Total hors L13 : environ **cinq jours**. L11 est le plus lourd et il est essentiellement rédactionnel.

### 0.6 Recette commune à tous les lots

Aucun lot n'est considéré terminé sans ces cinq contrôles.

1. `npm run build` se termine sans erreur.
2. Les quatre pages sont régénérées et aucune ne contient de texte français résiduel (hors noms propres).
3. Rendu vérifié à 375 px, 768 px, 1024 px et 1440 px.
4. Navigation au clavier complète sur la zone modifiée, focus toujours visible.
5. `git diff` ne touche que `src/`, `scripts/`, `dist/` et les quatre `index.html` générés.

---

## L1 — Données du logement et bandeau de faits clés

**Objectif** : que le visiteur sache en dix secondes ce qu'il regarde, et que la même vérité soit dite partout.

### Prérequis

Implémenter d'abord le contrôle de parité des clés i18n décrit en 0.3. C'est le socle de tous les lots suivants.

### Contenu de référence

Source de vérité, tirée de la fiche Cocoonr et validée : **50 m²**, **4 voyageurs**, **2 chambres**, **2 lits**, **1 salle de bain**, **2e étage avec ascenseur**, **meublé classé 3 étoiles**, **54100 Nancy**.

### Tâches

1. **Créer un bandeau de faits clés**, section autonome insérée **entre le héro et la galerie**. Six à sept entités : surface, capacité, chambres, salle de bain, étage et ascenseur, classement. Format pictogramme plus libellé plus valeur. Sur mobile, grille de deux colonnes plutôt que défilement horizontal, pour que tout soit lu sans interaction.
2. **Traiter la formulation des chambres.** La décision est « 2 chambres », mais la seconde pièce sert aussi de bureau. Retenir partout la formule *« 2 chambres, dont une avec espace de travail et lit escamotable 140 cm »*. Cela dit la vérité sans dévaloriser.
   - Renommer le bloc « Bureau & Appoint » de la section Prestations en « La Seconde Chambre ».
   - Vérifier que le filtre « Chambres » de la galerie contient bien des photos des deux pièces.
3. **Corriger le code postal** en `54100` dans : le contenu de la section Localisation, le JSON-LD (`postalCode`), `llms.txt`, et la fiche Cocoonr si elle diverge.
4. **Aligner les quatre langues** pour toutes les clés créées.

### Fichiers

`src/index.src.html` (balisage plus dictionnaire), `scripts/build-i18n.js` (contrôle de parité), `llms.txt`.

### Critères d'acceptation

- Le bandeau est visible sans défilement sur un écran de 375 x 812 px, immédiatement sous le héro.
- Une recherche de `54000` dans tout le dépôt ne renvoie aucun résultat.
- Aucune occurrence de « Bureau & Appoint » ne subsiste.
- Le build échoue si l'on retire volontairement une clé du bloc `en`.

### Risque

Annoncer « 2 chambres » engage : si la seconde pièce n'a ni porte ni fenêtre, la mention « espace de travail » ne suffira pas à éviter la déception. À vérifier avant publication.

---

## L2 — Sélecteur de dates et lien profond Cocoonr

**Objectif** : que le clic sur le CTA débouche sur un devis chiffré et non sur un formulaire vide. C'est le lot au plus fort effet sur le chiffre d'affaires.

### Comportement vérifié

`https://cocoonr.fr/location-court-sejour/nancy-54/le-1901-15241/?arrival=AAAA-MM-JJ&departure=AAAA-MM-JJ&nb_persons=N&nb_children=N` pré-remplit le formulaire Cocoonr et affiche immédiatement le détail du prix, les frais et le total. Testé le 31 juillet 2026.

### Tâches

1. **Créer un composant de réservation** : deux champs de date natifs (`arrivée`, `départ`), un sélecteur de voyageurs (1 à 4), un sélecteur d'enfants (0 à 3), un bouton de validation.
   - Champs natifs, sans bibliothèque de calendrier. Ils sont accessibles, traduits par le système et gratuits en poids.
   - `min` sur l'arrivée = date du jour. `min` sur le départ = arrivée plus un jour, recalculé à chaque changement.
2. **Placer le composant à deux endroits** : dans la section `#booking`, en remplacement du bouton seul ; dans le héro, en version compacte sous le titre. Une seule implémentation, deux instances.
3. **Construire l'URL au clic** à partir des valeurs saisies. Si aucune date n'est renseignée, conserver le comportement actuel (paramètres vides) plutôt que de bloquer : ne jamais empêcher un visiteur pressé de partir vers la réservation.
4. **Adapter la barre collante mobile** : au clic, faire défiler vers le composant de la section `#booking` plutôt que de partir directement sur Cocoonr avec des dates vides. Conserver un second lien « réserver directement » pour ceux qui veulent sauter l'étape.
5. **Ajouter `rel="noopener"`** sur les liens Cocoonr qui en sont dépourvus.
6. **Vérifier la validité des dates** avant construction : départ strictement postérieur à l'arrivée, durée maximale raisonnable, dates non passées. Message d'erreur en ligne, traduit.

### Fichiers

`src/index.src.html` (balisage, script, dictionnaire).

### Critères d'acceptation

- Saisir 12/09/2026 au 15/09/2026 pour 2 voyageurs, cliquer, et voir Cocoonr afficher le récapitulatif chiffré sans ressaisie.
- Sans date saisie, le clic mène toujours à la fiche Cocoonr.
- Le composant est utilisable au clavier seul, du premier champ au bouton.
- Le format de date affiché suit la langue de la page.

### Risque

Le format attendu par Cocoonr (`AAAA-MM-JJ`) doit être confirmé sur plusieurs cas, notamment un changement de mois et un changement d'année. Si Cocoonr modifie ses paramètres d'URL, le lien profond se dégrade silencieusement vers un formulaire vide, ce qui reste acceptable. Prévoir un contrôle semestriel.

---

## L3 — Prix et conditions de réservation

**Objectif** : lever les trois questions qui font partir un visiteur : combien, puis-je annuler, dois-je attendre une réponse.

### Contenu de référence

Relevé sur Cocoonr le 31 juillet 2026, pour un séjour de trois nuits en septembre : **77,50 €** la nuit, ménage **66 €**, frais de service **18,60 €**, taxe de séjour **8,10 €**. Annulation gratuite jusqu'à **7 jours** avant l'arrivée, **sans acompte**, **réservation instantanée**.

Ces chiffres varient. Le site n'affiche qu'un plancher, à réviser.

### Tâches

1. **Afficher « À partir de X € la nuit »** sous le composant de réservation, dans le héro et dans `#booking`. Mention accolée : *« hors frais de ménage et taxe de séjour, détaillés avant paiement »*. Cette précision est ce qui évite l'effet de surprise au moment du devis.
2. **Isoler la valeur du prix dans une seule clé i18n** (`booking.priceFrom`), documentée en commentaire comme devant être révisée deux fois par an. Un prix affiché à trois endroits et modifiable en un seul.
3. **Créer un bloc de trois arguments de réassurance** au-dessus du CTA : annulation gratuite jusqu'à 7 jours avant, aucun acompte demandé, confirmation immédiate. Ce sont des arguments réels que vous ne revendiquez pas aujourd'hui.
4. **Remplacer la mention actuelle** « Réservation sécurisée et service dédié », vague, par une formulation nommant le partenaire : *« Réservation gérée par Cocoonr, notre conciergerie »*, avec son logo si l'usage en est autorisé. Annoncer la transition supprime l'effet de rupture.
5. **Mentionner la taxe de séjour** dans la FAQ, sous une nouvelle question, en précisant qu'elle est collectée par la conciergerie.

### Fichiers

`src/index.src.html`.

### Critères d'acceptation

- Le prix plancher apparaît à trois emplacements et provient d'une clé unique.
- Le nom « Cocoonr » est visible avant le clic sur un CTA, à tous les emplacements.
- Une nouvelle entrée FAQ sur la taxe de séjour est présente en quatre langues, et reprise dans le `FAQPage` du JSON-LD.

### Risque

Un prix plancher obsolète est pire que pas de prix. Inscrire la révision au calendrier, deux fois par an, et vérifier qu'il correspond toujours au plancher réel de la grille Cocoonr.

---

## L4 — Preuve sociale et classement 3 étoiles

**Objectif** : donner au visiteur une raison de croire, sans surjouer un volume d'avis que vous n'avez pas.

### Décision d'attribution

L'avis 5/5 provient d'Airbnb, republié par Cocoonr. Il sera présenté comme *« Avis vérifié, séjour de juillet 2026 »*, **sans lien ni logo Airbnb**. Renvoyer vers Airbnb au moment où le visiteur allait réserver en direct est contre-productif. La section `#avis` existante cite aujourd'hui Cocoonr avec un lien : à ajuster.

### Tâches

1. **Ajuster la section `#avis`** : remplacer « Avis vérifié, publié sur Cocoonr » par « Avis vérifié, séjour de juillet 2026 ». Retirer le lien sortant. La note et le verbatim restent.
2. **Traiter le verbatim espagnol.** « Fabuloso !! » est authentique mais court et non traduit. Deux options : conserver tel quel avec l'attribut `lang="es"` déjà présent et ajouter une traduction entre parenthèses dans les autres versions linguistiques ; ou solliciter un avis plus étoffé auprès du prochain voyageur. La première est immédiate, la seconde est meilleure à terme.
3. **Créer un bloc « Classé 3 étoiles »**, visible et expliqué en une phrase : c'est un classement officiel délivré après visite de contrôle, que personne ne peut s'auto-attribuer. C'est votre meilleur signal de confiance disponible aujourd'hui, et il est absent du site.
4. **Conserver la note d'honnêteté existante** (« Le 1901 a ouvert en 2026, les avis sont encore peu nombreux »). Elle est bien vue et désamorce le soupçon.
5. **Mettre en place la collecte d'avis** : après chaque séjour, solliciter un avis sur Google Business Profile en priorité, car il alimente le référencement local et les réponses des moteurs IA, contrairement à un avis Cocoonr. Rédiger le message type, en français et en anglais.

### Fichiers

`src/index.src.html`. Le balisage `aggregateRating` est traité en L10.

### Critères d'acceptation

- Aucun lien sortant vers Airbnb, Cocoonr ou une plateforme tierce dans la section `#avis`.
- Le classement 3 étoiles est visible sans défilement dans le premier tiers de la page, via le bandeau de faits clés du L1.
- Le message type de collecte d'avis existe, en deux langues.

### Risque

Un seul avis affiché comme s'il s'agissait d'une moyenne établie serait trompeur. Toujours accompagner la note du nombre d'avis. Ne pas déclarer `aggregateRating` sans que le nombre d'avis soit visible sur la page, Google le sanctionne.

---

## L5 — Navigation mobile

**Objectif** : rendre le site navigable sur téléphone, où il ne l'est pas du tout aujourd'hui.

### Constat

| Élément | Classe actuelle | Masqué en dessous de |
| --- | --- | --- |
| Liens de menu | `hidden lg:flex` | 1024 px |
| Bouton « Réserver » | `hidden md:inline-block` | 768 px |
| Navigation à points | `dot-nav hidden md:flex` | 768 px |

Sous 768 px, la barre supérieure ne contient que le logo et le sélecteur de langue. Aucun accès aux sections.

### Tâches

1. **Créer un bouton de menu** visible en dessous de `lg`, aligné à droite, cible tactile d'au moins 44 x 44 px.
2. **Créer un panneau de navigation** plein écran ou en tiroir, contenant : les quatre liens de section, le sélecteur de langue, le CTA de réservation, et le lien de contact ajouté en L8.
   - Fermeture au clic sur un lien, au clic hors panneau, et à la touche `Échap`.
   - Blocage du défilement d'arrière-plan pendant l'ouverture, comme le font déjà les modales existantes.
   - Piège à focus, `aria-expanded` sur le bouton, `aria-controls` vers le panneau.
   - Animation respectant `prefers-reduced-motion`, déjà géré globalement dans la feuille en ligne.
3. **Rendre le CTA « Réserver » visible dès 375 px** dans la barre, ou l'assumer comme absent puisque la barre collante basse le porte. Trancher explicitement plutôt que de laisser le trou actuel entre 375 et 768 px.
4. **Traiter la plage 768 à 1024 px** : aujourd'hui les points de navigation apparaissent sans que les libellés du menu soient disponibles. Le nouveau bouton de menu doit couvrir toute la plage inférieure à `lg`.

### Fichiers

`src/index.src.html`.

### Critères d'acceptation

- À 375 px, toutes les sections sont atteignables en deux interactions maximum.
- Le panneau se ferme aux trois gestes prévus.
- Au clavier, la tabulation reste enfermée dans le panneau tant qu'il est ouvert, et le focus revient sur le bouton à la fermeture.
- Aucun décalage de mise en page à l'ouverture, la barre de défilement étant compensée.

---

## L6 — Correctifs d'interface et d'accessibilité

**Objectif** : réparer ce qui est cassé ou inaccessible. Aucun de ces points ne demande d'arbitrage.

### Tâches

1. **Infobulles de la navigation à points.** La règle `.dot:hover::after` (ligne 403 de `src/index.src.html`) n'a ni `content` ni `position`. Le pseudo-élément n'est donc jamais généré et les six `data-title`, plus leurs vingt-quatre traductions, sont du code mort. Ajouter `content: attr(data-title)` et un positionnement absolu à gauche du point. Retirer le `scale(0.66)` du `transform`, qui rendrait le texte illisible. Prévoir aussi l'affichage au focus clavier, pas seulement au survol.
2. **Vignettes du bento sur mobile.** Les vignettes 3 et 4 portent `hidden md:block`. Les afficher en grille de deux colonnes sous 768 px. La salle de bain est l'une des pièces les plus regardées et porte votre argument le plus distinctif, le chauffage du sol, du mur et du bac de douche.
3. **Hauteur fixe des cartes du guide.** Remplacer `h-20` par `min-h-20`, ou passer les cartes en `flex` avec `justify-between`. En allemand et en espagnol, les textes actuels débordent.
4. **Harmoniser les traitements photographiques.** Trois filtres coexistent sur les mêmes images : `premium-vibe` sur le héro, aucun sur le bento, `nancy-vibe` sur la galerie modale. Une même photo apparaît donc en trois colorimétries. Décision : **supprimer les trois filtres CSS**. Si un rendu chaud est souhaité, il sera appliqué aux fichiers sources en L13, une fois pour toutes.
5. **Contraste de l'or.** `#C5A059` donne 2,46:1 sur blanc et 2,33:1 sur le canvas `#F9F9F8`, très en dessous du minimum AA de 4,5:1. Dédoubler le token dans `src/input.css` :
   - `--color-gold` reste `#C5A059` pour le décor pur (traits, aplats, bordures, coches), non soumis au seuil ;
   - `--color-gold-text` vaut **`#896F3E`** (4,77:1 sur blanc, 4,52:1 sur `#F9F9F8`), appliqué à tous les surtitres et à tous les liens du guide.
   Attention, les valeurs intermédiaires ne suffisent pas : `#9C7B3C` plafonne à 3,95:1 et `#8D7340` échoue sur le fond `#F9F9F8`.
6. **Accessibilité des modales.** Les trois modales (galerie, visionneuse, mentions légales) gèrent déjà `Échap` et le blocage du défilement. Ajouter `role="dialog"`, `aria-modal="true"`, un libellé accessible, un piège à focus et le retour du focus au déclencheur à la fermeture.
7. **Vignettes de galerie non focalisables.** Quinze `<div onclick>` sans `tabindex` : la galerie est inutilisable au clavier. Les convertir en `<button>`, ce qui apporte gratuitement le focus, l'activation à `Entrée` et à `Espace`, et le rôle correct.
8. **Navigation dans la visionneuse.** Ajouter des boutons précédent et suivant, et le pilotage aux flèches du clavier. Aujourd'hui il faut fermer et rouvrir pour changer d'image.
9. **Sélecteur de langue.** Le script cible `document.querySelector('.group.relative')`, c'est-à-dire le premier élément portant ces deux classes dans le document. Utiliser l'identifiant existant `#langSwitcher`, stable.
10. **Indice de défilement sous le héro.** `h-screen` sans repère : rien n'indique qu'il y a du contenu en dessous. Laisser dépasser le haut du bandeau de faits clés du L1, ce qui règle le problème sans ajouter d'ornement.
11. **Tailles de texte.** Les `text-[10px]` et `text-[11px]` en capitales très espacées sont sous le seuil de confort. Remonter à 12 px minimum. Alléger l'usage de `font-light` sur le texte courant, en particulier sur le fond sombre de la section Prestations, où il dégrade nettement la lisibilité.

### Fichiers

`src/index.src.html`, `src/input.css`.

### Critères d'acceptation

- Survoler ou focaliser un point de navigation affiche son libellé traduit.
- Quatre vignettes visibles dans le bento à 375 px.
- Aucune classe `premium-vibe` ou `nancy-vibe` ne subsiste.
- Un contrôle de contraste automatisé ne remonte plus d'échec sur les surtitres ni sur les liens du guide.
- La galerie complète se parcourt entièrement au clavier, ouverture, navigation entre images, fermeture.

---

## L7 — Sémantique, structure et sitemap

**Objectif** : donner au document une charpente lisible par les lecteurs d'écran et par les extracteurs de contenu.

### Tâches

1. **Introduire `<header>` et `<main>`.** Vérifié : zéro occurrence de l'un comme de l'autre. La barre de navigation va dans `<header>`, les sections de contenu dans `<main id="main">`. Le lien d'évitement pointe aujourd'hui vers `#hero`, une section parmi d'autres : le faire pointer vers `#main`.
2. **Réordonner les sections.** Ordre actuel : héro, galerie, histoire, prestations, localisation, guide, avis, réservation. La localisation est le deuxième critère de décision après la photo et arrive en cinquième position.
   Ordre cible : **héro, faits clés (L1), galerie, localisation, prestations, histoire, guide, avis, FAQ, réservation**.
   Mettre à jour en conséquence : les six ancres de la navigation à points, les liens du menu, et les libellés `dots.*` du dictionnaire.
3. **Étendre le sitemap.** Il ne contient qu'une URL. Y ajouter les trois versions linguistiques et déclarer les correspondances `xhtml:link` entre elles, en miroir des `hreflang`.
4. **Alléger les extensions image du sitemap.** Les quinze légendes du type « Airbnb luxe et prestige » relèvent du bourrage de mots-clés, sans effet depuis longtemps, et contredisent un site qui ne mentionne jamais Airbnb. Les réécrire en descriptions factuelles ou les supprimer.
5. **Générer le sitemap au build** plutôt que de le maintenir à la main, pour qu'il suive l'ajout des pages du L11.

### Fichiers

`src/index.src.html`, `scripts/build-i18n.js`, `sitemap.xml`.

### Critères d'acceptation

- Un seul `<main>` et un seul `<header>` par page générée.
- Le lien d'évitement mène au premier élément focalisable du contenu principal.
- Le sitemap liste quatre URL, chacune avec ses trois alternatives déclarées.
- L'ordre des sections est identique dans la page, dans la navigation à points et dans le menu.

---

## L8 — Conformité, RGPD et mentions légales

**Objectif** : que ce que disent les mentions légales soit vrai, et le rester.

### Décision

Le numéro d'enregistrement reste **hors périmètre** : statu quo sur ce point, aucun affichage, aucune modification de la formulation actuelle. Le reste du lot est traité.

Rappel factuel, à toutes fins utiles et sans valeur de conseil juridique : les sources publiques consultées indiquent que depuis le 20 mai 2026 la déclaration des meublés de tourisme passe par un téléservice national dans toutes les communes, et que les déclarations communales antérieures ne sont pas reprises automatiquement. Un point avec un professionnel serait prudent. Le lot est conçu pour que l'ajout ultérieur d'un numéro ne demande qu'une seule clé i18n.

### Tâches

1. **Charger la carte au clic.** L'iframe Google Maps dépose des cookies tiers dès l'affichage de la page, sans consentement, alors que les mentions légales affirment le contraire. Remplacer l'iframe par un aperçu statique aux couleurs du site, avec marqueur, surmonté d'un bouton « Afficher la carte interactive ». L'iframe n'est injectée qu'après le clic. Aucun bandeau de consentement n'est alors nécessaire.
2. **Corriger la carte elle-même.** Retirer le filtre `map-dark` (`grayscale(1) invert(1) contrast(1.2)`), qui rend les noms de rue illisibles et fausse les couleurs. Resserrer le zoom sur le quartier Charles III : le cadrage actuel couvre Laxou et Saurupt et ne permet pas de situer l'appartement. Poser un marqueur, absent aujourd'hui.
3. **Réécrire le paragraphe RGPD** pour décrire ce qui se passe réellement après les corrections du L9 : polices auto-hébergées, icônes locales, carte chargée sur action de l'utilisateur, une seule donnée conservée en `localStorage` sous la clé `le1901-lang` pour mémoriser la langue, à finalité strictement fonctionnelle donc exemptée de consentement.
4. **Compléter les mentions légales** : directeur de la publication, adresse e-mail de contact, adresse de l'éditeur (« Quartier Charles III » n'est pas une adresse), et numéro SIRET si l'activité est exercée sous un statut le comportant.
5. **Ajouter le lien de contact.** Une adresse dédiée du type `contact@le1901-nancy.fr`, en `mailto:`, dans le pied de page, dans les mentions légales et dans le panneau de navigation mobile du L5. Zéro traitement de données, zéro maintenance.
6. **Résumer les conditions de réservation** dans la FAQ : annulation, absence d'acompte, règles de la maison, caution le cas échéant. Le visiteur ne peut pas savoir aujourd'hui à quoi il s'engage sans quitter le site.
7. **Ajuster le libellé du lien Instagram.** Le compte personnel est conservé, mais « Instagram » laisse attendre un compte du logement. Écrire « Instagram de l'hôte », ce qui lève l'ambiguïté sans rien coûter.
8. **Corriger `llms.txt`** : il annonce « Luxury Apartment » et « premium stay », vocabulaire abandonné sur le site au commit `20a5bd3`. Il mentionne aussi un statut réglementaire à revoir en cohérence avec le point 3. Le traduire en français, puisque le site et sa cible principale le sont.

### Fichiers

`src/index.src.html`, `llms.txt`.

### Critères d'acceptation

- Au chargement de la page, l'onglet Réseau ne montre aucune requête vers `google.com` avant le clic sur le bouton de carte.
- Toute affirmation des mentions légales est vérifiable dans l'onglet Réseau.
- Une adresse de contact est atteignable depuis le pied de page et depuis le menu mobile.
- `llms.txt` ne contient plus « luxury » ni « premium ».

### Risque

Ce lot dépend du L9 pour être exact : tant que Google Fonts et unpkg sont chargés, l'affirmation « aucun cookie tiers » resterait inexacte. **Ne pas publier la réécriture du paragraphe RGPD avant que le L9 soit déployé.**

---

## L9 — Performance et dépendances tierces

**Objectif** : rendre le site rapide et autonome. Six domaines tiers pour un site statique d'une page, c'est cinq de trop.

### Domaines contactés aujourd'hui

`fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com`, `www.google.com` (Maps), plus `cdn.jsdelivr.net` atteint à l'exécution par le script Phosphor. Seul Maps ne peut pas être internalisé, et le L8 le neutralise en le chargeant au clic.

### Tâches

1. **Auto-héberger les polices.** Google Fonts est chargé en feuille bloquante : deux résolutions DNS et deux connexions TLS avant le moindre affichage de texte, plus un transfert d'adresse IP vers Google sans consentement. Télécharger les graisses réellement utilisées en WOFF2, les servir depuis `/fonts/`, déclarer les `@font-face` avec `font-display: swap`, précharger les deux graisses du premier écran. Vérifier au passage la liste réelle des graisses employées : la déclaration actuelle en charge sept, ce qui est probablement au-delà du besoin.
2. **Internaliser les icônes.** Le site utilise **24 icônes distinctes** pour 63 occurrences. Les extraire en un sprite SVG local, de l'ordre de 6 à 8 Ko, et supprimer le script Phosphor. Cela retire deux domaines, un script externe et une dépendance de chaîne d'approvisionnement.
3. **Terminer le réencodage des images.** Le dossier racine est traité. Reprendre `images/gallery/640/` et `images/gallery/1024/` au même profil de qualité, et vérifier qu'aucune variante n'est plus lourde que nécessaire.
4. **Ajouter une source AVIF** en `<picture>` pour le héro et les quatre vignettes du bento. Entre 30 et 40 % de moins que WebP, supporté partout en 2026. Conserver WebP en repli.
5. **Remplacer l'écouteur de défilement.** Le gestionnaire actuel lit `offsetTop` et `clientHeight` de toutes les sections et exécute un `querySelectorAll` à chaque événement, sans `requestAnimationFrame`, sans limitation de fréquence et sans `{ passive: true }`. Ces lectures forcent un recalcul de mise en page jusqu'à soixante fois par seconde. C'est le motif classique de dégradation de l'INP, dont le seuil « bon » est de 200 ms. Le remplacer par un `IntersectionObserver`, comme c'est déjà fait pour la barre collante mobile, dont le code est immédiatement à côté.
6. **Nettoyer les classes mortes.** `prose prose-gold` (le plugin `@tailwindcss/typography` n'est pas installé, zéro occurrence dans `dist/output.css`) et `guide-tab-active` (aucune définition CSS, le style actif passe par les classes ajoutées en JavaScript).

### Fichiers

`src/index.src.html`, `src/input.css`, `images/`, nouveau dossier `fonts/`.

### Critères d'acceptation

- Aucune requête sortante vers un domaine tiers au chargement initial, carte comprise tant qu'elle n'est pas demandée.
- Poids total du premier écran inférieur à 400 Ko.
- LCP mesuré sous 2,5 s en 4G simulée, sur la page française sans cache.
- Aucun avertissement de recalcul forcé de mise en page pendant un défilement continu.

---

## L10 — SEO et données structurées

**Objectif** : que le balisage dise tout ce que la page dit, et que le titre corresponde à ce que les gens cherchent.

### Prérequis

L1, L3 et L4 doivent être faits : on ne déclare pas dans le balisage ce qui n'est pas visible sur la page.

### Tâches

1. **Passer le type à `VacationRental`.** `schema.org` propose depuis sa version 30.0 ce sous-type de `LodgingBusiness`, destiné à la location d'un bien entier pour une durée limitée. C'est exactement le cas.
2. **Compléter les propriétés manquantes.** Le JSON-LD porte déjà `numberOfBedrooms`, `numberOfBeds`, `numberOfBathroomsTotal`, `occupancy`, `checkinTime`, `checkoutTime`, `petsAllowed`, `hasMap`, `review` et un `@id`. Restent à ajouter : `aggregateRating` (5, un avis), `starRating` (3, classement officiel), `floorSize` (50 m², unité `MTK`), et un bloc `Offer` chiffré en euros avec `priceCurrency` et `lowPrice`.
3. **Corriger `priceRange`.** La valeur `"$$$"` est une notation américaine sur un site français. Le bloc `Offer` la remplace avantageusement.
4. **Vérifier la sémantique de l'hôte.** L'audit relevait un `memberOf` pointant vers une `Person`, ce que la propriété n'attend pas. Le dépôt local emploie désormais `employee` et `worksFor` : à contrôler dans le validateur, ces propriétés ayant elles aussi des domaines attendus précis.
5. **Porter le nombre d'images à huit minimum.** Le tableau `image` en compte quatre. Google demande au moins huit photos de qualité pour les résultats enrichis de location de vacances.
6. **Réécrire le `<title>`.** L'actuel, `Le 1901 | Appartement de Charme & Confort à Nancy`, contient « Confort », qui n'est pas une requête. Les requêtes réelles ressemblent à *location appartement Nancy centre*, *airbnb Nancy Place Stanislas*, *où dormir à Nancy centre-ville*. Proposition : `Le 1901 · Appartement 4 pers. hyper-centre Nancy, à 6 min de Place Stanislas`, soit 75 caractères, avec capacité, localisation et point de repère universellement connu. Décliner en quatre langues. La méta-description a déjà été refaite selon ce principe.
7. **Créer la fiche Google Business Profile**, catégorie « Location de vacances ». C'est le premier levier de référencement local, et il alimente aussi les réponses des moteurs IA. Renseigner l'adresse, les photos, le classement 3 étoiles, et y diriger la collecte d'avis du L4.
8. **Se référencer** auprès de l'office de tourisme de Nancy et des annuaires de meublés classés. Ces citations consolident la cohérence NAP corrigée en L1.

### Fichiers

`src/index.src.html`, `scripts/build-i18n.js` (le JSON-LD est en partie généré).

### Critères d'acceptation

- Le validateur de résultats enrichis de Google ne remonte aucune erreur sur les quatre pages.
- `aggregateRating` n'est déclaré que si la note et le nombre d'avis sont visibles sur la page.
- Le titre fait moins de 80 caractères dans les quatre langues.
- La fiche Google Business Profile est créée et en attente de validation.

---

## L11 — Contenu éditorial, trois blocs

**Objectif** : passer d'environ 700 mots visibles, dont la moitié en listes, à un volume qui permette de se positionner. C'est le lot le plus lourd, et il est presque entièrement rédactionnel.

### Décision

Les trois blocs sont traités. Environ 1 000 mots en français, à traduire en trois langues, soit près de 4 000 mots au total.

### Les trois blocs

| Bloc | Angle | Ce qu'il capte |
| --- | --- | --- |
| **Le quartier Charles III** | histoire du quartier, ce qu'on y trouve, pourquoi c'est un bon point de chute | requêtes de quartier, contexte pour les moteurs IA |
| **Nancy en 48 heures** | itinéraire concret au départ de l'appartement, heure par heure | requêtes de séjour, très recherchées et volontiers citées par les IA |
| **Séjour professionnel à Nancy** | bureau, Ethernet, fibre, lit escamotable, gare à 10 minutes | clientèle de semaine, qui remplit les creux de calendrier. Angle commercial autant que SEO |

### Tâches

1. **Trancher le format.** Deux options, à décider avant d'écrire.
   - *Sections de la page d'accueil* : plus simple, mais alourdit une page déjà longue et ne crée aucune URL positionnable.
   - *Pages dédiées* (`/quartier-charles-iii/`, `/nancy-48-heures/`, `/sejour-professionnel/`, et leurs équivalents par langue) : douze pages à générer, mais chacune devient une porte d'entrée. **Recommandation : pages dédiées**, ce qui suppose d'étendre `scripts/build-i18n.js` pour gérer plusieurs gabarits.
2. **Étendre le script de build** au multi-page si l'option retenue le demande : un gabarit par contenu, la même mécanique de traduction, la génération du sitemap et des `hreflang` en conséquence.
3. **Rédiger les trois blocs en français**, 250 à 400 mots chacun. Points de vigilance : du concret plutôt que des superlatifs, des chiffres et des noms de lieux vérifiables, des distances au départ du 1901, et au moins un lien interne vers le carnet d'adresses existant.
4. **Traduire en anglais, espagnol et allemand.** Pas de traduction automatique non relue : les trois versions sont indexées et engagent la crédibilité du site.
5. **Nettoyer le vocabulaire existant** pendant qu'on est dans le texte. Trois « exception » sur une page courte, « Sans Compromis » en surtitre, « intelligemment pensé », « un véritable écrin ». Le concret l'emporte : « sol, mur et bac à douche chauffants » convainc bien davantage que « confort thermique d'exception », et vous l'écrivez déjà deux lignes plus bas.
6. **Ajouter le maillage interne** : depuis la page d'accueil vers les trois pages, et de chaque page vers la réservation.

### Fichiers

`src/`, `scripts/build-i18n.js`, nouveaux gabarits, `sitemap.xml`.

### Critères d'acceptation

- Chaque bloc fait au moins 250 mots en français et existe dans les quatre langues.
- Chaque page dédiée a son `title`, sa méta-description et ses `hreflang` propres.
- Aucun superlatif non étayé dans les nouveaux textes.
- Le sitemap est régénéré et complet.

---

## L12 — Calendrier de disponibilité *(conditionnel)*

**Objectif** : que le visiteur sache si ses dates sont libres avant de cliquer.

### Format confirmé

Un export `.ics` Cocoonr a été analysé le 31 juillet 2026. **Le format convient sans réserve.**

```
PRODID:Cocoonr - https://cocoonr.fr
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260819
DTEND;VALUE=DATE:20260822
SUMMARY:Réservation #710868
UID:4f28af4d-…@cocoonr.fr
END:VEVENT
```

Dates en valeur `DATE` simple, sans fuseau ni récurrence : l'analyse tient en une vingtaine de lignes, sans bibliothèque iCal. L'échantillon comportait cinq réservations, soit vingt nuits occupées entre le 9 juillet et le 21 août 2026.

### Prérequis bloquant : une URL, pas un fichier

Le fichier fourni est un **téléchargement ponctuel**. Il sera périmé dès la prochaine réservation.

Il faut obtenir auprès de Cocoonr l'**URL d'abonnement iCal**, de la forme `https://…/<jeton>.ics`, accessible sans session, que le script pourra interroger à chaque build. Tant que cette URL n'est pas disponible, le lot ne peut pas démarrer.

### Deux pièges à traiter impérativement

1. **`DTEND` est exclusif.** `DTSTART:20260819 / DTEND:20260822` signifie trois nuits, celles du 19, du 20 et du 21. **Le 22 est un jour de départ, donc disponible à l'arrivée.** Bloquer le `DTEND` reviendrait à refuser une nuit sur quatre en haute saison. Le calendrier doit raisonner en nuits, pas en jours.
2. **Le champ `SUMMARY` contient les numéros de réservation** (`Réservation #710868`), et `UID` un identifiant interne. Ces deux champs ne doivent jamais sortir du build. Seules les plages de dates sont publiées, sans libellé.

### Limite à assumer

Une date absente du flux n'est pas nécessairement réservable : durée minimale de séjour, blocage manuel ou délai de préparation ne figurent pas dans l'export. Le calendrier du site indique donc **ce qui est certainement occupé**, jamais l'inverse. La formulation doit le refléter : « dates déjà réservées » et non « dates disponibles ».

### Contrainte de sécurité

Une URL iCal contient un jeton qui vaut identifiant. **Elle ne doit jamais apparaître dans le code livré au navigateur.** Le flux est donc récupéré **au moment du build**, converti en une liste de dates occupées, et c'est cette liste, anonyme, qui est publiée. Le jeton reste dans une variable d'environnement, hors du dépôt.

### Tâches

1. Obtenir l'URL `.ics` auprès de Cocoonr et la stocker en variable d'environnement.
2. Étendre `scripts/build-i18n.js` : récupération du flux, analyse des périodes `VEVENT`, production d'un tableau de dates occupées sur douze mois glissants, injecté dans les pages générées.
3. Griser les dates occupées dans les champs du sélecteur du L2, et empêcher la sélection d'une plage qui en chevauche une.
4. Gérer la fraîcheur : les données datent du dernier build. Prévoir une reconstruction automatique quotidienne, ou afficher la date de mise à jour et rappeler que la disponibilité définitive est celle de Cocoonr.
5. Prévoir le mode dégradé : si le flux est indisponible au build, le calendrier disparaît et le sélecteur de dates continue de fonctionner sans contrainte. Le build ne doit jamais échouer pour cette raison.

### Critères d'acceptation

- Aucune URL de flux ni jeton dans les fichiers livrés.
- Une date occupée connue est effectivement non sélectionnable.
- Le build réussit avec le flux volontairement rendu inaccessible.

### Risque

Un calendrier périmé est pire que pas de calendrier : il promet une disponibilité qui n'existe plus. Sans reconstruction automatique quotidienne, il vaut mieux s'en tenir au sélecteur de dates seul.

---

## L13 — Identité visuelle Art Nouveau

**Objectif** : faire passer le site de « bien fait » à « mémorable ». C'est le seul lot où le résultat n'est pas mesurable, et le seul qui demande une validation sur rendu visuel.

### Constat

Le positionnement École de Nancy est juste, singulier et défendable. Personne d'autre à Nancy ne peut le revendiquer avec autant de légitimité. Mais rien n'en descend dans l'interface : bleu nuit, or, Playfair Display et Inter constituent le code visuel par défaut du luxe hôtelier sur le web, identique sur des milliers de sites. Playfair est de surcroît un Didone du XVIIIe siècle, historiquement décalé de plus d'un siècle par rapport à 1901.

L'Art Nouveau a un vocabulaire formel très identifiable : ligne en coup de fouet, motifs végétaux, ferronneries, verre irisé, ombelles, chardon lorrain. Vous en avez le sujet en photo, le papier peint floral du salon en particulier, mais rien n'en est extrait.

### Déroulé

**Étape 1, maquettes.** Trois directions à produire et à comparer sur le même écran, avant toute écriture de code.

| Direction | Titrage | Palette | Risque |
| --- | --- | --- | --- |
| **Sécession géométrique** | lettrage viennois, capitales larges, structure rigoureuse | bleu-gris du papier peint, or, blanc cassé | froide si trop appliquée |
| **Arts and Crafts chaleureuse** | serif à empattements marqués, inspiration 1900 anglaise | vert amande de la cuisine, terracotta du couvre-lit, crème | peut virer au rustique |
| **Art Nouveau florale** | titrage à courbes végétales, sur les grands titres seulement | dégradés chauds tirés des photos, or profond | pastiche si mal dosé |

Chaque maquette montre le héro, le bandeau de faits clés et une carte du guide, en français, à 1440 px et à 375 px.

**Étape 2, implémentation de la direction retenue.**

1. Remplacer la police de titrage. Conserver Inter en texte courant : elle fonctionne, et deux familles suffisent. Les polices sont auto-hébergées, comme prévu en L9.
2. Étendre les tokens de `src/input.css` avec la palette validée, sans supprimer `--color-nightblue` ni `--color-gold`, qui restent utiles.
3. Créer un motif de séparation en SVG, dérivé d'une ferronnerie ou d'une ombelle, en remplacement des traits `w-12 h-px bg-gold` actuels, qui ne disent rien.
4. Appliquer, si la direction le prévoit, un étalonnage unique aux fichiers photo sources, ce qui remplace définitivement les filtres CSS supprimés en L6.
5. Refaire le favicon et l'image Open Graph dans le nouveau système.
6. Revalider tous les contrastes après changement de palette. Le travail du L6 sur l'or ne vaut que pour l'or actuel.

### Critères d'acceptation

- Les trois maquettes sont produites et une direction est validée par écrit avant implémentation.
- Aucune régression de contraste après application de la nouvelle palette.
- Le site reste lisible et sobre : la typographie caractérisée ne descend pas dans le texte courant.
- Deux familles de polices au maximum sur l'ensemble du site.

### Risque

C'est le lot le plus facile à rater. Une typographie Art Nouveau mal dosée fait basculer un site premium vers l'ambiance brasserie à décor. La règle de sécurité : titrage caractérisé, tout le reste neutre.

---

## Annexe A — Couverture des constats de l'audit

Les 37 points du plan d'action de `AUDIT-2026-07.md` sont tous affectés.

| Points de l'audit | Lot |
| --- | --- |
| 1 (paragraphe tronqué) | déjà traité |
| 2 (navigation mobile) | L5 |
| 3 (héro réencodé) | déjà traité, finition en L9 |
| 4 (faits clés) | L1 |
| 5 (sélecteur de dates) | L2 |
| 6 (prix, annulation) | L3 |
| 7 (avis, `aggregateRating`) | L4 et L10 |
| 8 (numéro d'enregistrement) | hors périmètre sur décision |
| 9 (polices, carte, RGPD) | L8 et L9 |
| 10 (pages par langue) | déjà traité |
| 11 (infobulles) | L6 |
| 12 (carte) | L8 |
| 13 (filtres photo) | L6 |
| 14 (section hôte) | écarté sur décision |
| 15 (JSON-LD enrichi) | L10 |
| 16 (`title`, méta-description) | L10, méta déjà traitée |
| 17 (bento mobile) | L6 |
| 18 (`main` et `header`) | L7 |
| 19 (icônes, drapeaux) | L9, drapeaux déjà traités |
| 20 (Instagram) | L8, libellé ajusté |
| 21 (contact) | L8 |
| 22 (mentions légales) | L8 |
| 23 (Google Business Profile) | L10 |
| 24 (contraste de l'or) | L6 |
| 25 (visite virtuelle) | L1, à lier depuis la galerie |
| 26 (trois blocs de contenu) | L11 |
| 27 (ordre des sections) | L7 |
| 28 (`IntersectionObserver`) | L9 |
| 29 (calendrier iCal) | L12 |
| 30 (identité Art Nouveau) | L13 |
| 31 (ARIA des modales) | L6 |
| 32 (nettoyage du vocabulaire) | L11 |
| 33 (`llms.txt`) | L8 |
| 34 (`h-20`) | L6 |
| 35 (code postal) | L1 |
| 36 (classes mortes) | L9 |
| 37 (collecte d'avis) | L4 |

---

## Annexe B — Recette avant mise en ligne

À passer une fois, après le dernier lot déployé.

**Fonctionnel**

- [ ] Le sélecteur de dates produit un devis chiffré chez Cocoonr, sur trois jeux de dates différents.
- [ ] Les quatre langues sont complètes, sans texte français résiduel.
- [ ] Toutes les sections sont atteignables à 375 px.
- [ ] Les trois modales s'ouvrent, se ferment et rendent le focus.

**Technique**

- [ ] Aucune requête tierce au chargement initial.
- [ ] LCP sous 2,5 s en 4G simulée, sans cache.
- [ ] Aucune erreur dans la console sur les quatre pages.
- [ ] Validateur de résultats enrichis sans erreur.

**Contenu**

- [ ] Surface, capacité, chambres, salle de bain, étage et classement cohérents entre le site, le JSON-LD, `llms.txt` et Cocoonr.
- [ ] Code postal `54100` partout.
- [ ] Prix plancher à jour, avec sa mention de frais.
- [ ] Aucun lien mort, en particulier vers Cocoonr et Google Maps.

**Accessibilité**

- [ ] Contrastes AA sur tout texte.
- [ ] Parcours clavier complet, du lien d'évitement au pied de page.
- [ ] Tous les `alt` renseignés et traduits.

**Légal**

- [ ] Chaque affirmation des mentions légales est vérifiable dans l'onglet Réseau.
- [ ] Contact e-mail joignable et fonctionnel.
- [ ] Conditions d'annulation visibles sans quitter le site.
