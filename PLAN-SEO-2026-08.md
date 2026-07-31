# Plan SEO : local et international

**le1901-nancy.fr — août 2026**

Ce document prolonge `AUDIT-2026-07.md` et `IMPLEMENTATION-2026-07.md`. Il ne les répète pas :
il traite la seule question du référencement, sur trois fronts qui se renforcent l'un l'autre,
le local, l'international et le maillage interne.

---

## 0. Point de départ

### 0.1 Ce qui est déjà en place

Le site part de haut, ce qui change la nature du travail : il ne s'agit pas de rattraper des
manques, mais d'ajouter de la surface et de la cohérence.

| Élément | État |
| --- | --- |
| Pages | 16 URL, soit 4 contenus en 4 langues |
| `hreflang` | complets et réciproques sur les 16 pages, avec `x-default` |
| `canonical` | présent et correct sur chaque page |
| Sitemap | 16 URL, `lastmod`, alternates `xhtml:link`, sitemap images intégré |
| `robots.txt` | ouvert, robots IA explicitement autorisés |
| `llms.txt` | présent, dense, à jour |
| Données structurées | `VacationRental`, `FAQPage` (14 questions), `Review`, `AggregateRating`, `BreadcrumbList`, `WebSite`, `@id` stables |
| Contenu | 2 000 mots sur l'accueil, environ 700 mots par page éditoriale |
| Images | WebP et AVIF, quatre largeurs, `alt` rédigés et traduits dans les quatre langues |

### 0.2 Ce qui manque, en une phrase par point

1. **Le maillage est squelettique.** Chaque page éditoriale envoie un seul lien vers chacune des
   deux autres, depuis un bloc dédié en fin de page. L'accueil envoie un lien vers chacune des
   trois, depuis la section « Pour préparer le séjour ». Aucun lien en plein texte, aucune page
   liée depuis plus de trois pages sources.
2. **La surface est trop étroite.** Quatre contenus ne couvrent qu'une fraction des intentions de
   recherche d'un voyageur qui prépare un séjour à Nancy.
3. **Aucun signal local hors-site.** Pas de citation, pas d'annuaire, pas d'office de tourisme,
   aucune cohérence NAP publiée ailleurs que sur le site.
4. **Le `sameAs` est minimal.** Le logement ne pointe que vers sa fiche Cocoonr, l'hôte vers
   LinkedIn et Instagram. Aucun profil de plateforme ni d'annuaire, donc peu de recoupement
   possible pour les moteurs et les modèles.
5. **L'international est traduit, pas adapté.** Les quatre langues portent le même contenu. Or un
   Allemand et un Américain ne cherchent ni les mêmes choses ni avec les mêmes mots.
6. **Rien n'est mesuré.** Pas de Search Console documentée, pas de suivi des positions, pas de
   suivi des citations dans les moteurs IA.

### 0.3 Un correctif au plan de juillet, avant tout le reste

`IMPLEMENTATION-2026-07.md`, lot L10, tâche 7, prévoit de créer une fiche Google Business Profile
en catégorie « Location de vacances ». **Cette action est à annuler.**

Les consignes d'éligibilité de Google exigent qu'un établissement ait un contact en personne avec
ses clients pendant ses horaires d'ouverture affichés, et excluent nommément les biens en location
comme les maisons de vacances et les logements vacants. Un appartement unique loué en autonomie
par serrure connectée ne remplit aucune des deux conditions. Une fiche créée malgré tout est
suspendue tôt ou tard, et une suspension laisse des traces sur le compte.

Ce qui la remplace se trouve au §4.1. Le levier local existe, il passe ailleurs.

### 0.4 Un second arbitrage rouvert : le numéro d'enregistrement

`IMPLEMENTATION-2026-07.md` §0.4 tranchait « statu quo, aucun affichage » sur le numéro
d'enregistrement du meublé, et plaçait le sujet hors périmètre. Ce plan **rouvre cet arbitrage**,
et le dit plutôt que de le contourner. La raison est double : depuis le 20 mai 2026 le numéro à
13 caractères doit figurer sur toutes les annonces de location, et c'est un signal de conformité
repris par les moteurs comme par les modèles.

L'exécution, elle, est suspendue à la mairie : Nancy n'est pas encore raccordée au téléservice
national, la déclaration a été faite par Cerfa n° 14004\*04, et il n'y a de numéro à publier que si
le récépissé en porte un. Le détail et la veille associée sont au §4.2.

C'est le seul autre point sur lequel ce document s'écarte des décisions de juillet.

---

## 1. La cible, en clair

Trois familles de requêtes, trois traitements différents.

| Famille | Exemple | Volume | Concurrence | Ce qui fait gagner |
| --- | --- | --- | --- | --- |
| **Transactionnelle locale** | *appartement location Nancy centre*, *où dormir Nancy hyper-centre* | moyen | forte, occupée par Booking, Airbnb, Abritel | signaux locaux, entité, avis, fraîcheur |
| **Informationnelle de séjour** | *que faire à Nancy en 2 jours*, *Nancy Sehenswürdigkeiten*, *Nancy Art Nouveau* | fort | moyenne, occupée par les blogs et les offices de tourisme | profondeur du contenu, maillage, citations IA |
| **De marque** | *le 1901 nancy*, *le 1901 appartement* | faible | nulle | il suffit d'exister et d'être cohérent partout |

Un site d'un seul logement ne gagnera jamais frontalement sur la première famille contre les
plateformes. Il gagne en passant par la deuxième : capter le voyageur en phase de préparation,
avant qu'il n'ouvre Booking, puis le convertir. C'est exactement ce que fait déjà `/nancy-48-heures/`,
et c'est la logique à démultiplier.

---

## 2. Lot A — Maillage interne

**Effort : environ une journée. Priorité : la plus haute, parce que tout le reste s'y appuie.**

### 2.1 Le modèle : moyeu et rayons, avec des liens latéraux

L'accueil est le moyeu et la page de conversion. Les pages éditoriales sont les rayons et les
portes d'entrée. Aujourd'hui les rayons existent mais ne sont reliés que par un bloc en fin de
page, ce qui transmet peu et n'aide pas le lecteur au moment où il lit.

Trois niveaux de liens, à mettre en place ensemble :

1. **Liens contextuels en plein texte.** Ce sont les seuls qui portent vraiment. Une phrase du
   corps de texte contient le lien, avec une ancre descriptive. Objectif : 3 à 5 par page, placés
   dans le premier tiers autant que possible.
2. **Bloc « À lire aussi ».** Il existe déjà. Le porter à 3 liens au lieu de 2, avec une phrase
   d'accroche par lien plutôt qu'un titre seul.
3. **Fil d'Ariane visible.** Le `BreadcrumbList` est balisé mais n'est pas rendu à l'écran. Un fil
   visible « Accueil › Le quartier Charles III » ajoute un lien montant sur chaque page et aligne
   le rendu sur le balisage.

### 2.2 Règles à tenir

- **Cinq liens entrants minimum** vers chaque page stratégique, depuis des pages thématiquement
  proches.
- **Ancres descriptives et variées.** « le quartier Charles III, tracé en 1588 », « les distances
  à pied depuis l'appartement », « notre itinéraire de deux jours ». Jamais « cliquez ici », jamais
  la même ancre exacte répétée sur 16 pages.
- **Maillage strictement intra-langue.** Une page allemande ne pointe que vers des pages
  allemandes. Les seuls liens inter-langues sont les `hreflang` et le sélecteur de langue.
- **Profondeur maximale de 2 clics** depuis l'accueil, dans chaque langue.
- **Compter les liens sortants.** L'accueil porte 14 liens externes, dont 10 vers Google Maps, tous
  correctement en `rel="noopener"`. C'est beaucoup, pour zéro lien interne descendant en plein
  texte. Le rapport doit s'inverser.
- **Ne pas compter ce qui n'est pas un lien.** Les 28 `href="#i-check"` sont des références au
  sprite SVG, pas des liens. Les ancres de section comme `#faq` ne transmettent rien non plus.
  Ni les unes ni les autres n'entrent dans l'objectif.

### 2.3 Implémentation dans le dépôt

Le contenu vit dans `src/pages.js` et le gabarit dans `scripts/build-i18n.js`. La contrainte de
parité en quatre langues, déjà contrôlée par le script, doit s'étendre au maillage : un lien ajouté
en français sans son équivalent allemand est un lien mort dans le graphe allemand.

Proposition concrète :

1. Ajouter dans `src/pages.js` une table `related` par page, listant les identifiants des pages
   liées : `related: ['weekend', 'pro', 'stanislas']`.
2. Le script résout l'identifiant vers le slug de la langue courante. Une seule source de vérité,
   quatre sorties correctes.
3. Étendre le contrôle de parité existant : échec du build si une page référence un identifiant
   qui n'existe pas dans la langue traitée.
4. Les liens en plein texte restent écrits à la main dans les champs `sNBody`, mais avec des URL
   relatives à la langue générées par une fonction d'aide, pour éviter qu'un lien `/quartier-charles-iii/`
   se retrouve dans la version allemande.

### 2.4 Cible chiffrée

On compte ici en **pages sources distinctes**, dans une seule langue, hors navigation, hors pied de
page et hors ancres de section. C'est la seule unité qui dit quelque chose : dix liens depuis la
même page ne valent pas dix pages qui lient.

| Page | Pages qui la lient aujourd'hui | Cible |
| --- | --- | --- |
| Accueil | 3 | 9 et plus |
| `/quartier-charles-iii/` | 3 | 6 |
| `/nancy-48-heures/` | 3 | 6 |
| `/sejour-professionnel/` | 3 | 5 |
| Nouvelles pages du lot B | aucune | 5 chacune |

---

## 3. Lot B — Nouvelles pages

**Effort : environ une journée de rédaction par page en français, plus la traduction. À étaler.**

Quatre contenus ne suffisent pas. Voici les pages qui manquent, classées par rentabilité attendue.
Chacune est une porte d'entrée, chacune reçoit et envoie des liens, chacune existe en quatre langues.

Toutes les pages ci-dessous sont produites dans les quatre langues, par cohérence de parité. La
colonne « marché prioritaire » indique seulement où porter l'effort d'adaptation, pas où publier.

### 3.1 Série A, les trois qui rapportent le plus

| Page | URL française | Intention captée | Marché prioritaire |
| --- | --- | --- | --- |
| **Dormir près de la place Stanislas** | `/dormir-place-stanislas/` | requête transactionnelle locale la plus recherchée sur Nancy, avec le repère que tout le monde connaît | FR |
| **Nancy et l'Art nouveau** | `/art-nouveau-ecole-de-nancy/` | la raison numéro un pour laquelle un étranger vient à Nancy. École de Nancy, Villa Majorelle, Daum, Gallé | DE, puis EN |
| **Venir à Nancy** | `/venir-a-nancy/` | accès train, voiture, stationnement, temps de trajet depuis Paris, Strasbourg, Luxembourg, Sarrebruck | EN et DE |

Ces trois pages ont un point commun : elles répondent à une question que le voyageur se pose
**avant** de choisir son logement. C'est le moment où un site indépendant peut le capter.

### 3.2 Série B, la saisonnalité et le remplissage

| Page | URL française | Ce qu'elle sert |
| --- | --- | --- |
| **Saint-Nicolas à Nancy** | `/saint-nicolas-nancy/` | l'événement de décembre, très recherché, et un creux de calendrier à remplir. À publier en septembre au plus tard pour être indexée à temps |
| **Nancy en famille** | `/nancy-en-famille/` | 4 couchages, équipements bébé, parc de la Pépinière. Segment sous-exploité par le site |
| **Où manger à Nancy centre** | `/ou-manger-nancy/` | le carnet d'adresses existe déjà en ancre `#guide` sur l'accueil. Sorti en page autonome, il devient positionnable et très citable par les IA |

### 3.3 Série C, si le temps le permet

- **Nancy ou Strasbourg**, ou **Nancy en une journée depuis Paris** : ces formats de comparaison et
  d'excursion sont massivement repris dans les réponses générées par IA.
- **Nos tarifs et disponibilités** : page de conversion pure, qui capte les requêtes de marque avec
  intention d'achat.

### 3.4 Règles de rédaction communes

- 900 mots minimum en français. Les trois pages actuelles tournent autour de 700 mots, ce qui est
  le plancher pour exister, pas pour se positionner contre les offices de tourisme et les blogs.
- **La réponse dans les cent premiers mots.** C'est le critère qui décide de l'extraction par les
  AI Overviews et par les moteurs conversationnels. Pas d'introduction de mise en bouche.
- Des chiffres vérifiables : distances en mètres, temps de marche réels, dates, prix. Les pages
  actuelles le font déjà bien, c'est la marque de fabrique à tenir.
- **Un tableau par page.** Distances, horaires, temps de trajet. Les modèles reprennent les tableaux
  plus volontiers que la prose.
- Une formulation distinctive et citable par page, du type « meublé classé 3 étoiles à 150 m de la
  halle du marché central ». Les contenus interchangeables sont fondus dans les réponses
  génératives sans citation ; les formulations précises et attribuables y résistent.
- Traduction relue, jamais automatique brute. Voir le §5 pour l'adaptation par marché.

---

## 4. Lot C — SEO local, sans fiche Google

**Effort : environ une journée de travail effectif, étalée sur six semaines à cause des délais de
validation externes.**

### 4.1 Ce qui remplace le Google Business Profile

Trois voies, dans cet ordre.

**1. Google Vacation Rentals.** C'est le vrai canal pour un meublé, et il est distinct de la fiche
d'établissement. Google n'accepte pas de connexion directe d'un propriétaire particulier :
l'intégration passe par un partenaire technique certifié, channel manager ou logiciel de gestion.
La question à poser à Cocoonr, par écrit, est donc précise :

> Le 1901 est-il diffusé dans Google Vacation Rentals, directement ou via votre channel manager ?
> Si oui, sous quelle URL de réservation ? Si non, est-ce prévu ?

Si la réponse est oui, le logement apparaît dans les résultats d'hébergement de Google Search et de
Google Maps avec ses dates et son prix, ce qui vaut infiniment mieux qu'une fiche d'établissement.
Si la réponse est non, c'est un argument à porter auprès de la conciergerie, dont c'est l'intérêt
commercial direct.

**2. Le balisage `VacationRental` du site.** Il est déjà en place. Point à connaître pour ne pas
attendre un résultat qui ne viendra pas : le résultat enrichi « location de vacances » de Google
est réservé aux partenaires du programme Hotels, et le balisage seul ne le déclenche pas. Il reste
utile, et il faut le garder, pour deux raisons : il structure l'entité pour la compréhension des
moteurs, et il est lu par les modèles de langage qui parcourent la page. Le tableau `image` compte
déjà neuf entrées, au-dessus du minimum de huit exigé par Google : rien à faire de ce côté.

**3. Les fiches externes qui, elles, se positionnent.** Une fiche Tripadvisor en catégorie location
de vacances, une fiche Booking.com et une fiche Airbnb correctement remplies se positionnent sur
les requêtes de destination bien mieux que le site. Elles ne sont pas des concurrentes du site :
elles sont la découverte, le site est la conversion et le SEO de marque. À vérifier avec Cocoonr :
quelles plateformes sont activées, et le nom « Le 1901 » est-il identique partout.

### 4.2 Cohérence NAP

Le nom, l'adresse et le téléphone doivent être rigoureusement identiques partout où ils
apparaissent. Aujourd'hui le site affiche « quartier Charles III, 54100 Nancy », sans numéro ni rue.

L'arbitrage a été tranché :

| Option | Effet SEO local | Effet vie privée |
| --- | --- | --- |
| Adresse complète affichée | signal fort, cohérence NAP possible, `PostalAddress` complet | l'adresse d'un logement loué en autonomie devient publique |
| Quartier seul, position approchée | signal faible, NAP incomplet | préservée |

**Décision retenue :** afficher **la rue Charles III, sans le numéro**, et conserver des
`geoCoordinates` au niveau de l'immeuble. C'est le compromis retenu par la plupart des meublés
classés : assez précis pour le signal local, pas assez pour sonner à la porte. Le numéro exact est
de toute façon transmis après réservation.

Concrètement, la chaîne NAP devient :

```
Le 1901
Rue Charles III, 54100 Nancy
```

- `streetAddress: "Rue Charles III"` dans le `PostalAddress` du JSON-LD, `addressLocality: "Nancy"`,
  `postalCode: "54100"`, `addressCountry: "FR"`.
- Cette chaîne, à la lettre près, sur toutes les fiches externes (§4.3), sur Cocoonr et sur les
  plateformes. Une variante « rue Charles-III » ou « r. Charles 3 » casse la cohérence.

Deux éléments doivent en revanche être affichés sans réserve :

- **Le numéro d'enregistrement du meublé de tourisme.** C'est l'arbitrage rouvert au §0.4 : juillet
  avait tranché le statu quo, et le calendrier légal comme le bénéfice de conformité justifient
  d'y revenir. Depuis le 20 mai 2026, le code du tourisme impose une déclaration soumise à
  enregistrement, et le numéro à 13 caractères doit figurer sur toutes les annonces.

  *État réel du dossier.* **Nancy n'est pas encore raccordée au téléservice national** ; le portail
  bailleurs ne sera pleinement opérationnel qu'au second semestre 2026. La déclaration a été faite
  par **Cerfa n° 14004\*04**, qui reste valable pendant la période de transition. Deux cas :

  1. **Le récépissé de la mairie porte un numéro de déclaration.** C'est lui qu'on publie, en pied
     de page du site et sur chaque annonce, sans attendre le basculement.
  2. **Le récépissé ne porte aucun numéro.** Rien à publier pour l'instant. On conserve le
     récépissé daté comme preuve de déclaration, et on republie dès que le téléservice délivre le
     numéro à 13 caractères.

  Dans les deux cas, **une veille à ouvrir** : recontacter le service de la Ville de Nancy au
  quatrième trimestre 2026 pour le raccordement, et prévoir l'emplacement dans le pied de page dès
  maintenant pour que la publication ne soit qu'une valeur à renseigner. La sanction prévue en cas
  d'annonce sans numéro une fois le dispositif actif est lourde ; un point avec un professionnel
  reste prudent avant publication.

- **Le classement 3 étoiles** et sa date d'obtention. La mention textuelle existe déjà sur la page
  d'accueil (bloc chiffres + phrase d'explication), mais **sans la date**. Ajouter « classé
  3 étoiles depuis le [date de l'arrêté] » : c'est la datation explicite demandée au §7.
  Le **panonceau officiel** (plaque 150 × 150 mm, arrêté du 30 décembre 2021, charte graphique
  Atout France 2022) se commande auprès d'un fabricant de signalétique une fois le classement
  prononcé — il n'est pas fourni par Atout France. Sa reproduction sur le site est possible mais
  encadrée : le visuel est déposé et ne peut être ni modifié ni recomposé. Le plus sûr est la
  photo du panonceau réellement posé sur place, avec `alt` explicite ; à défaut, s'en tenir à la
  mention textuelle.

### 4.3 Citations et annuaires, par ordre d'utilité

Les citations locales ont perdu du poids depuis quelques années. La quantité ne sert plus à rien ;
trois bonnes citations valent trente annuaires génériques. La liste utile pour Nancy :

| Cible | Nature | Comment |
| --- | --- | --- |
| **Destination Nancy / office de tourisme** | fiche hébergement + lien | la citation locale la plus lourde du dossier. Contact via le service hébergement. Le classement 3 étoiles est l'argument d'entrée |
| **Annuaire des meublés classés Atout France** | fiche officielle | découle du classement, à vérifier qu'elle est bien publiée |
| **Métropole du Grand Nancy** | page hébergements ou taxe de séjour | la taxe de séjour est déjà collectée pour leur compte, le lien existe administrativement |
| **Clévacances ou Gîtes de France** | label payant | à évaluer au coût : utile surtout pour la clientèle française et la caution qualité |
| **Tripadvisor** | fiche location de vacances | gratuite, se positionne bien, et surtout massivement citée par les moteurs conversationnels |
| **Annuaires locaux nancéiens** | citation simple | faible valeur unitaire, à faire une fois et à oublier |

Cohérence obligatoire sur chaque fiche : même nom, même orthographe, même adresse, même téléphone,
même URL avec le `https://` et le slash final.

### 4.4 Liens locaux

Un lien de la presse régionale ou d'un acteur local reconnu pèse davantage qu'un lien d'un grand
site généraliste. Pistes réalistes, par ordre de facilité :

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
5. **Les blogs de voyage lorrains et les blogs Art nouveau**, y compris germanophones. Voir §5.

Ce qu'il ne faut pas faire : acheter des liens, s'inscrire sur cinquante annuaires génériques,
échanger des liens avec d'autres locations. Le rapport risque-bénéfice est mauvais pour un site
de cette taille.

---

## 5. Lot D — International

**Effort : environ trois journées, dont l'essentiel en rédaction et en relecture native.**

### 5.1 Le socle technique est déjà bon

Les `hreflang` sont complets, réciproques, avec `x-default`. Les slugs sont localisés, ce qui est
la bonne pratique et n'est pas si répandu. Le sitemap porte les alternates. Rien à refaire.

Un seul point à trancher : **`x-default` pointe aujourd'hui vers la version française.** Il sert
aux visiteurs dont la langue ne correspond à aucune version disponible. Un Néerlandais ou un
Italien tombe donc sur du français. Pointer `x-default` vers l'anglais servirait mieux ce public.

**Recommandation :** basculer `x-default` sur `/en/`. Le trafic français continue d'arriver par le
`hreflang="fr"`, qui est prioritaire pour un francophone.

### 5.2 Le vrai sujet : traduire n'est pas adapter

Les quatre langues portent aujourd'hui le même contenu, traduit. C'est un bon point de départ et
une limite. Un Allemand et un Américain ne cherchent ni les mêmes choses ni avec les mêmes mots,
et surtout ils n'ont pas les mêmes questions.

### 5.3 Marché allemand

C'est le marché de proximité, et probablement le plus rentable des trois.

**Ce qui l'amène à Nancy :** l'Art nouveau, sous le nom de *Jugendstil*, l'École de Nancy, la place
Stanislas classée à l'UNESCO. Nancy est jumelée avec Karlsruhe depuis 1955, l'un des premiers
jumelages franco-allemands, et la ville est à portée de voiture de la Sarre, du Luxembourg et de
la Rhénanie-Palatinat.

**Ce que le site doit ajouter en allemand :**

- Une page `/de/jugendstil-nancy/` construite pour le vocabulaire allemand, pas traduite de la page
  française. Le mot *Jugendstil* figure aujourd'hui dans trois cartes du guide allemand, mais dans
  aucun titre, aucune méta-description et aucune URL. C'est pourtant le terme de recherche.
- Les temps de trajet en voiture depuis Saarbrücken, Luxemburg, Trier, Karlsruhe et Frankfurt,
  en tableau, avec les kilomètres. **À vérifier avant publication**, un temps de trajet faux se
  paie cher en crédibilité.
- Le stationnement traité pour un voyageur en voiture : les parkings Saint-Dizier et Dom Calmet
  sont déjà mentionnés, c'est central pour ce marché et cela mérite plus de place que dans la
  version française.
- Les questions allemandes dans la FAQ : caution, annulation, paiement, animaux, réservation
  instantanée. Le voyageur allemand veut des conditions écrites et sans ambiguïté.

**Requêtes à cibler :** *Ferienwohnung Nancy Zentrum*, *Nancy Sehenswürdigkeiten*, *Jugendstil
Nancy*, *Nancy Städtereise*, *Nancy Wochenende*, *Unterkunft Nancy Place Stanislas*.

**Hors-site :** blogs de voyage germanophones, forums de voyage allemands, groupes Jugendstil.
Un lien depuis un blog allemand vaut double, en autorité et en pertinence géographique.

### 5.4 Marché anglophone, États-Unis et Royaume-Uni

**Ce qui l'amène à Nancy :** l'Art Nouveau, la place Stanislas, et surtout Paris. L'Américain qui
vient à Nancy vient presque toujours depuis Paris, en TGV depuis la gare de l'Est. Il réserve
plusieurs mois à l'avance et reste plus longtemps.

**Ce que le site doit ajouter en anglais :**

- Une page `/en/nancy-from-paris/`, qui répond à la question réellement posée : combien de temps,
  combien ça coûte, est-ce faisable en une journée, faut-il dormir sur place. C'est le format le
  plus repris par les moteurs conversationnels sur ce type de destination.
- Une page Art Nouveau autonome en anglais, avec les noms internationaux : Émile Gallé, Louis
  Majorelle, les frères Daum, l'École de Nancy. Ces noms sont des entités connues des modèles, et
  les associer explicitement au logement consolide le graphe.
- Les conversions utiles : mètres et minutes de marche vont bien, mais préciser les surfaces en
  pieds carrés entre parenthèses coûte une ligne et rassure.
- Le vocabulaire : *apartment* et non *flat* pour les États-Unis, *self check-in*, *fully equipped
  kitchen*, *washer and dryer*. Le lave-linge **et** le sèche-linge sont un argument de vente
  majeur pour un Américain en séjour long, et ils sont aujourd'hui noyés dans une liste.

**Requêtes à cibler :** *where to stay in Nancy France*, *Nancy France Art Nouveau*, *Nancy day
trip from Paris*, *Nancy France apartment rental*, *is Nancy worth visiting*.

### 5.5 Marché espagnol

Volume faible sur Nancy. Les pages existent, elles sont correctes, elles restent. Aucun
investissement supplémentaire recommandé au-delà de la parité : chaque nouvelle page créée en
français est traduite en espagnol comme les autres, sans travail d'adaptation spécifique.

### 5.6 Distribution internationale

Un site direct ne remplace pas les plateformes pour la découverte internationale. Booking pèse
lourd sur les marchés allemand et néerlandais, Airbnb sur le marché américain. Les deux se
positionnent sur les requêtes de destination là où le site n'a aucune chance.

La stratégie qui fonctionne est en deux temps : les plateformes captent la découverte, le site
capte la requête de marque qui suit. Un voyageur qui a vu le logement sur Booking cherche
« le 1901 nancy » avant de réserver. Il doit alors trouver le site en première position, avec des
photos, un prix, un calendrier et un lien de réservation. Cela suppose deux choses :

1. Que le nom « Le 1901 » soit identique et unique sur toutes les plateformes.
2. Que le site se positionne sur son propre nom, ce qui est acquis dès que les citations du §4.3
   sont en place.

---

## 6. Lot E — Données structurées et entité

**Effort : environ cinq heures, dont trois pour les balisages du §6.2.**

Le balisage est déjà solide. Ce qui manque relève de la consolidation d'entité, et c'est ce qui
compte le plus pour les moteurs conversationnels.

### 6.1 Compléter `sameAs`, en priorité

`sameAs` existe, mais il est presque vide : une seule URL sur `#logement`, la fiche Cocoonr.
`#hote` est correctement pourvu, avec LinkedIn et Instagram, rien à y faire.

C'est la propriété qui permet à un moteur de recouper que le site, la fiche Cocoonr, la fiche
Airbnb, la fiche Tripadvisor et l'annonce d'office de tourisme désignent la même entité. Avec une
seule URL, il n'y a rien à recouper.

À ajouter sur `#logement`, au fur et à mesure que les fiches du §4 existent : URL Airbnb, URL
Booking, URL Tripadvisor, URL de la fiche office de tourisme.

### 6.2 Compléments par page

| Page | À ajouter |
| --- | --- |
| `/nancy-48-heures/` | `TouristTrip` avec un `itinerary` en `ItemList` de `TouristAttraction`. C'est le balisage exact du contenu, et il est très bien compris |
| `/quartier-charles-iii/` | `Place` pour le quartier, relié au logement par `containedInPlace` |
| Pages guides | `TouristAttraction` pour les lieux cités, avec leurs coordonnées |
| Toutes | `inLanguage` explicite, et `about` pointant vers `#logement` pour relier chaque page à l'entité centrale |
| Galerie | `ImageObject` avec `creator` (Solène Mangin), `contentUrl` et licence |

### 6.3 Points de contrôle

- Vérifier les 16 pages dans le validateur de résultats enrichis de Google, pas seulement les
  quatre françaises.
- Ne déclarer `aggregateRating` que tant que la note et le nombre d'avis restent visibles sur la
  page. Avec un seul avis, la valeur du signal est faible : elle grandira avec le lot G.

---

## 7. Lot F — Moteurs de réponse et modèles de langage

**Effort : intégré aux autres lots, plus une demi-journée de mise en place du suivi.**

Une part croissante des recherches de voyage se termine dans une réponse générée, sans clic. Le
site part avec une avance rare : `llms.txt` existe, les robots IA sont explicitement autorisés,
la FAQ est balisée, les faits sont chiffrés. Ce qui reste à faire est précis.

### 7.1 Sur le site

- **La réponse dans les cent premiers mots**, sur chaque page. C'est le levier le plus rentable
  identifié dans les retours d'expérience de 2026 sur les AI Overviews. Les pages actuelles
  commencent bien, à conserver comme règle explicite.
- **Dater et sourcer les affirmations.** « Rénovation complète en 2026 » devient « rénovation
  achevée en janvier 2026 ». « Classé 3 étoiles » devient « classé 3 étoiles depuis le [date] ».
  Une affirmation datée est reprise ; une affirmation vague est ignorée.
- **Des formulations distinctives.** Les contenus interchangeables sont fondus dans les réponses
  génératives sans attribution. Une phrase comme « seul meublé classé 3 étoiles du quartier
  Charles III » (à vérifier avant de l'écrire) survit à la fusion parce qu'elle n'existe nulle
  part ailleurs.
- **Des tableaux.** Distances, temps de trajet, équipements, conditions. Les modèles reprennent
  les tableaux plus volontiers que les paragraphes.
- **Maintenir `llms.txt`** à chaque ajout de page. Le fichier actuel est un modèle du genre, il
  ne doit pas dériver.

### 7.2 Hors du site, et c'est là que ça se joue

Les modèles citent rarement le site d'un hébergement. Ils citent Tripadvisor, Reddit, Wikivoyage,
les blogs de voyage et les offices de tourisme. Être présent dans ces sources compte davantage que
d'optimiser une page de plus.

Trois actions concrètes :

1. Créer et remplir la fiche Tripadvisor (§4.1).
2. Vérifier ce que disent Wikipédia et Wikivoyage sur le quartier Charles III et l'École de Nancy,
   et contribuer factuellement si des informations manquent. Sans autopromotion : ces pages sont
   surveillées, et un lien commercial y est retiré en quelques heures.
3. Répondre dans les fils de discussion pertinents, en s'identifiant comme propriétaire. Une
   réponse utile sur un fil « 2 days in Nancy » vaut des mois de netlinking.

### 7.3 Mesure

Aucun outil ne mesure cela correctement pour un site de cette taille, et les solutions payantes
sont hors de proportion. Une grille manuelle suffit :

- 15 requêtes types, 5 par langue (FR, EN, DE).
- Testées une fois par mois sur ChatGPT, Perplexity, Gemini et Google AI Overviews.
- Consignées dans un tableau : la réponse cite-t-elle le site, une plateforme, un concurrent, ou
  rien.

Exemples de requêtes : « où dormir à Nancy près de la place Stanislas », « best place to stay in
Nancy France », « Ferienwohnung Nancy Zentrum Jugendstil », « que faire à Nancy en deux jours ».

---

## 8. Lot G — Avis

**Effort : faible, mais c'est le lot le plus contraint par le temps.**

Un seul avis publié. C'est le point faible le plus lourd du dossier, et aucun travail technique ne
le compense. Les avis pèsent sur le classement local, sur la conversion et sur ce que les modèles
disent du logement.

- Systématiser la demande d'avis après chaque séjour. `docs/message-collecte-avis.md` existe déjà :
  il doit devenir un automatisme, pas une intention.
- Répartir plutôt que concentrer : Cocoonr, Airbnb, Booking, Tripadvisor. Dix avis sur quatre
  plateformes valent mieux que dix avis sur une seule. Pas d'avis Google possible ici, pour la
  raison exposée au §0.3.
- Répondre à chaque avis, y compris les bons. Les réponses sont indexées et lues par les modèles.
- Objectif réaliste à six mois : 15 avis cumulés, dont 5 hors Cocoonr.

---

## 9. Lot H — Technique et indexation

**Effort : une demi-journée, hors performance, déjà traitée au lot L9 de juillet.**

| Action | Pourquoi |
| --- | --- |
| **Search Console**, propriété de domaine, plus une vue racine et trois vues filtrées sur `/en/`, `/es/` et `/de/` | sans cela, aucune décision n'est fondée. C'est le préalable à tout le reste |
| **Bing Webmaster Tools** | Bing alimente une partie des réponses de ChatGPT. Négligé, gratuit, cinq minutes |
| **IndexNow** | soumission instantanée des URL nouvelles ou modifiées à Bing et Yandex. Utile à chaque publication de page |
| **Inspection d'URL** sur les 16 pages | vérifier qu'elles sont toutes indexées, et dans la bonne langue |
| **Nommage des images** | `solene-mangin-5.webp` ne dit rien. `salon-niche-cintree-1901-nancy.webp` se positionne en recherche d'images. Renommage à faire au build, pas à la main, et à répercuter dans le sitemap images |
| **Analytics** | Plausible ou équivalent sans cookie, pour éviter le bandeau. Mesurer les clics sortants vers Cocoonr, seul indicateur de conversion disponible |
| **404 et redirections** | GitHub Pages, donc pas de redirection serveur. Vérifier qu'aucune ancienne URL ne traîne dans l'index |

---

## 10. Ordre d'exécution

Trois étapes. Chacune produit un résultat mesurable avant de passer à la suivante. À ne pas
confondre avec les séries A, B et C du §3, qui classent les pages par rentabilité, pas par
calendrier.

### Étape 1 — quatre semaines, les fondations

| # | Action | Lot | Effort |
| --- | --- | --- | --- |
| 1 | Ouvrir Search Console et Bing Webmaster Tools | H | 1 h |
| 2 | Annuler la création du Google Business Profile, écrire à Cocoonr sur Google Vacation Rentals et sur les plateformes activées | C | 1 h |
| 3 | Refondre le maillage interne, table `related` dans `src/pages.js`, fil d'Ariane visible, liens en plein texte | A | 1 j |
| 4 | Compléter `sameAs` sur `#logement`, ajouter `about` vers `#logement` sur les 16 pages, `inLanguage` explicite | E | 2 h |
| 5 | Afficher « Rue Charles III, 54100 Nancy » (décision §4.2), dater le classement 3 étoiles, préparer l'emplacement du numéro d'enregistrement et le publier s'il figure sur le récépissé Cerfa | C | 2 h |
| 6 | Contacter Destination Nancy et créer la fiche Tripadvisor | C | 3 h |
| 7 | Mettre la collecte d'avis en routine | G | 30 min |

### Étape 2 — six semaines, la surface

| # | Action | Lot | Effort |
| --- | --- | --- | --- |
| 8 | Rédiger et publier `/dormir-place-stanislas/` en 4 langues | B | 1,5 j |
| 9 | Rédiger et publier `/art-nouveau-ecole-de-nancy/`, avec la version allemande adaptée `/de/jugendstil-nancy/` | B, D | 2 j |
| 10 | Rédiger et publier `/venir-a-nancy/`, avec les temps de trajet allemands vérifiés | B, D | 1,5 j |
| 11 | Publier `/en/nancy-from-paris/` | D | 1 j |
| 12 | Basculer `x-default` sur l'anglais | D | 15 min |
| 13 | Renommer les images au build et répercuter dans le sitemap images | H | 3 h |
| 14 | Premier relevé de la grille de suivi IA | F | 1 h |

### Étape 3 — en continu

| # | Action | Lot | Effort |
| --- | --- | --- | --- |
| 15 | `/saint-nicolas-nancy/`, à publier avant fin septembre | B | 1 j |
| 16 | `/ou-manger-nancy/` et `/nancy-en-famille/` | B | 2 j |
| 17 | Liens locaux : commerces du carnet d'adresses, institutions, presse régionale | C | étalé |
| 18 | Blogs germanophones et anglophones | D | étalé |
| 19 | `TouristTrip` et `Place` sur les pages guides | E | 3 h |
| 20 | Relevé mensuel de la grille IA, revue trimestrielle de Search Console | F, H | 2 h par mois |

---

## 11. Ce qu'on mesure, et à quelle échéance

| Indicateur | Aujourd'hui | 3 mois | 6 mois |
| --- | --- | --- | --- |
| Pages indexées | 16, à confirmer | 29 | 41 |
| Impressions Search Console, toutes langues | non mesuré | référence établie | + 100 % sur la référence |
| Part des impressions non françaises | non mesuré | 25 % | 40 % |
| Clics sortants vers Cocoonr | non mesuré | référence établie | + 50 % |
| Avis publiés, toutes plateformes | 1 | 6 | 15 |
| Citations dans les moteurs IA, sur 15 requêtes | non mesuré | 3 | 7 |
| Domaines référents | à confirmer | 5 | 12 |

Les valeurs à 3 mois servent surtout à établir une référence. Sur un site neuf, six mois est le
premier horizon où les chiffres veulent dire quelque chose.

---

## 12. Ce que je ne recommande pas

Par honnêteté, et pour éviter d'y revenir :

- **Le Google Business Profile**, pour la raison exposée au §0.3.
- **L'achat de liens et les annuaires en masse.** Rapport risque-bénéfice mauvais à cette échelle.
- **Une cinquième langue.** Le néerlandais serait défendable, la Flandre et les Pays-Bas envoyant
  du monde en Lorraine, mais quatre langues à maintenir en parité représentent déjà une charge
  réelle. À reconsidérer quand les trois marchés prioritaires produiront des résultats.
- **Un blog.** Une page publiée puis abandonnée nuit plus qu'elle ne sert. Les pages du lot B sont
  conçues pour être écrites une fois et mises à jour une fois par an, ce qui est tenable.
- **Le SEO programmatique.** Générer des dizaines de pages de type « appartement + quartier » sur
  un logement unique produit de la page vide. Le site n'a qu'un bien à vendre : sa force est la
  profondeur, pas le volume.

---

## Sources

- [Consignes d'éligibilité des établissements, Aide Fiche d'établissement Google](https://support.google.com/business/answer/13763036?hl=fr)
- [Business eligibility and ownership guidelines, Google Business Profile Help](https://support.google.com/business/answer/13763036?hl=en)
- [Locations de vacances : guide de démarrage, Aide Hotel Center](https://support.google.com/hotelprices/answer/12568039?hl=fr)
- [Partenaires de Google pour les locations de vacances, Hotel Center Help](https://support.google.com/hotelprices/answer/11946834?hl=en)
- [Vacation Rental Schema Markup, Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental)
- [Prise en charge du balisage pour les locations de vacances, Google Search Central Blog](https://developers.google.com/search/blog/2023/12/hello-vacation-rentals?hl=fr)
- [Google Vacation Rentals, guide pour conciergeries, Tweelo](https://www.tweelo.fr/blog/google-vacation-rentals-guide-conciergeries)
- [Meublés de tourisme, les règles évoluent en 2026, Service-Public](https://www.service-public.gouv.fr/particuliers/actualites/A18880)
- [70e anniversaire du jumelage Nancy-Karlsruhe, ministère fédéral allemand des Affaires étrangères](https://allemagneenfrance.diplo.de/fr-fr/missions-allemandes/consulat-general-strasbourg/2738956-2738956)
- [Citations locales : les annuaires qui comptent vraiment en France, Toonetcreation](https://www.toonetcreation.com/blog/referencement/citations-locales-annuaires-france-seo-local.html)
- [SEO local : le guide complet du référencement local 2026, Guest Suite](https://www.guest-suite.com/blog/seo-local)
- [Checklist SEO 2026, Mactari](https://mactari.fr/blog/checklist-seo-2026/)
- [Mutations SEO 2025-2026 : AI Overviews, LLM et SEO multimodal, Sébastien Lett](https://www.sebastienlett.com/mutations-seo-2025-2026-conseils/)
- [Guide du Generative Engine Optimization, Natural Net](https://www.natural-net.fr/blog-agence-web/2026/01/29/visibilite-et-seo-sur-les-ia-guide-du-generative-engine-optimization-geo-llm-par-llm.html)


