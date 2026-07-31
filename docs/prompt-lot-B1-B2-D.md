# Prompt autoportant — lots B1, B2 et D

À coller tel quel dans une session neuve, avec le dossier `le1901-nancy-main` ouvert.
Le prompt commence après la ligne de tirets et va jusqu'à la fin du fichier.

---

Tu vas écrire sept pages éditoriales pour le site le1901-nancy.fr, chacune en quatre langues,
soit vingt-huit URL. Le dossier du projet est ouvert. Lis ce briefing en entier avant de toucher
à quoi que ce soit.

## 1. Charge ces skills, dans cet ordre

1. `redaction-fr:redaction-francaise` — **prime sur tout le reste** pour le français : typographie,
   tics d'IA à bannir, structures à casser, grille de contrôle finale.
2. `redaction-fr:copywriting`
3. `redaction-fr:ai-seo`

## 2. Le contexte, en trente secondes

Le 1901 est un appartement meublé de 50 m², 4 couchages, classé 3 étoiles, en hyper-centre de
Nancy, quartier Charles III, à 150 m du marché central et 500 m de la place Stanislas. Rénové en
2026 dans l'esprit de l'École de Nancy. Loué à la nuitée, arrivée autonome par serrure connectée,
commercialisé par la conciergerie Cocoonr.

**Tous les faits vérifiés sont dans `llms.txt`, à la racine.** Lis-le avant d'écrire une ligne.
C'est la source unique : distances, équipements, conditions de réservation, horaires, prix
plancher. N'invente aucun chiffre qui n'y figure pas.

## 3. Comment le site est construit

Ce n'est pas un site où l'on édite du HTML.

| Fichier | Rôle |
| --- | --- |
| `src/pages.js` | **le contenu éditorial**, dans les quatre langues. C'est là que tu écris |
| `src/index.src.html` | source de la page d'accueil, avec le dictionnaire `translations` |
| `scripts/build-i18n.js` | assemble tout, génère les pages, le sitemap, les `hreflang` |
| `index.html`, `en/…`, `es/…`, `de/…` | **générés, jamais édités à la main** |

Commandes : `npm run build:pages` pour les pages seules, `npm run build` pour tout.
Le build **échoue** si une clé manque dans une langue, si un jeton de lien pointe vers une page
inconnue, ou si une page déclarée n'a pas de slug dans les quatre langues. C'est voulu.

### La structure d'une page dans `src/pages.js`

```js
// dans PAGES
{
  id: 'stanislas',              // identifiant interne, jamais affiché
  sections: 4,                  // nombre de blocs sNTitle/sNBody attendus
  image: 'solene-mangin-7',     // photo de la page, sans extension
  related: ['weekend', 'quartier'],  // bloc « À lire aussi », dans l'ordre
  slug: { fr: '…', en: '…', es: '…', de: '…' },
}

// dans CONTENT[lang]
stanislas: {
  metaTitle: '…',        // moins de 80 caractères
  metaDescription: '…',  // moins de 160 caractères
  eyebrow: '…',          // surtitre court
  h1: '…',
  intro: '…',            // rendu dans le bandeau sombre, sous le h1
  s1Title: '…', s1Body: '<p>…</p><p>…</p>',
  s2Title: '…', s2Body: '…',
  // … jusqu'à sN
}
```

`sNBody` accepte `<p>`, `<ul>`, `<li>`, `<table>`, `<sup>`, `<strong>`. Rien d'autre.

### Les liens internes s'écrivent en jetons, jamais en URL

```
[[page:weekend|itinéraire de deux jours]]   → une page éditoriale, par son id
[[home:#guide|notre carnet d'adresses]]     → une ancre de la page d'accueil
```

Le build les résout dans la langue construite. **Une URL écrite à la main dans le bloc français
casse les trois autres langues.** Ancres de l'accueil disponibles : `#hero`, `#facts`, `#gallery`,
`#tour`, `#location`, `#amenities`, `#history`, `#guide`, `#avis`, `#faq`, `#booking`.

## 4. Ce qui existe déjà

Trois pages éditoriales, ids `quartier`, `weekend`, `pro`. Lis-les dans `src/pages.js` : elles
donnent le ton, le niveau de détail et le rythme à tenir. Elles font entre 650 et 750 mots, ce qui
est le plancher à dépasser.

## 5. Les sept pages à écrire

Écris-les **une par une, du premier mot français à la quatrième traduction**. Sept pages menées de
front en quatre langues, ce sont vingt-huit chantiers ouverts et aucun fini.

### Série A — priorité 1

| id | Slug FR | Angle | Marché prioritaire |
| --- | --- | --- | --- |
| `stanislas` | `dormir-place-stanislas` | la requête transactionnelle locale la plus recherchée. Distances réelles, ce qu'on voit depuis le quartier, pourquoi dormir à 500 m vaut mieux que sur la place | FR |
| `artnouveau` | `art-nouveau-ecole-de-nancy` | la raison numéro un pour laquelle un étranger vient à Nancy. Gallé, Majorelle, Daum, Gruber, la villa Majorelle, le musée de l'École de Nancy, la maison Bergeret | DE puis EN |
| `acces` | `venir-a-nancy` | train, voiture, stationnement, temps de trajet, depuis Paris, Strasbourg, Luxembourg, Sarrebruck, Metz | EN et DE |
| `paris` | `nancy-depuis-paris` | 1 h 30 de TGV depuis Paris-Est. Faisable en une journée ou faut-il dormir sur place, combien ça coûte, que voir en une journée | EN |

### Série B — priorité 2

| id | Slug FR | Angle | Contrainte |
| --- | --- | --- | --- |
| `noel` | `saint-nicolas-nancy` | les fêtes de Saint-Nicolas début décembre, le marché, le défilé, le Jardin éphémère | **doit être écrite en premier de la série B** : une page publiée en novembre pour décembre ne sert à rien. Vérifie les dates de l'édition en cours |
| `famille` | `nancy-en-famille` | 4 couchages, lit parapluie, chaise haute, parc de la Pépinière, distances poussette, musées adaptés | — |
| `manger` | `ou-manger-nancy` | le carnet d'adresses sorti de l'ancre `#guide` vers une URL autonome. L'ancre `#guide` reste sur l'accueil, ne casse rien | reprends les adresses déjà citées sur l'accueil, ne les invente pas |

## 6. Le lot D n'est pas une série de pages allemandes

C'est le piège à éviter. Le contrôle de parité impose qu'une page déclarée existe dans les quatre
langues : **il ne peut pas y avoir de page allemande orpheline.**

L'adaptation par marché passe donc par deux leviers, pas par des pages en plus :

1. **Le slug par langue.** La page `artnouveau` a pour slug allemand `jugendstil-nancy` et non la
   traduction du slug français. Idem pour les autres si le mot de recherche diffère.
2. **Le contenu adapté langue par langue.** Les quatre versions portent les mêmes faits, jamais les
   mêmes phrases.

### Marché allemand

Le mot **Jugendstil** ne figure aujourd'hui dans aucun titre, aucune méta-description, aucune URL
du site. C'est pourtant le terme de recherche. Requêtes visées : *Ferienwohnung Nancy Zentrum,
Nancy Sehenswürdigkeiten, Jugendstil Nancy, Nancy Städtereise, Nancy Wochenende*.

Ce marché vient **en voiture**, depuis la Sarre, le Luxembourg et la Rhénanie. Conséquences
concrètes :

- Sur `acces`, la version allemande développe le stationnement bien plus que la française. Les
  parkings Saint-Dizier et Dom Calmet sont un argument, pas une note de bas de page.
- Ajoute un tableau des temps de trajet en voiture depuis Saarbrücken, Luxemburg, Trier, Metz,
  Karlsruhe et Frankfurt, avec les kilomètres. **Ne les invente pas.** Si tu ne peux pas les
  vérifier, écris-les entre crochets avec `[à vérifier]` et signale-le-moi.
- Nancy est jumelée avec Karlsruhe depuis 1955, un des premiers jumelages franco-allemands. C'est
  un angle, utilise-le une fois, pas trois.

### Marché anglophone

L'Américain qui vient à Nancy arrive presque toujours depuis Paris, en TGV depuis la gare de
l'Est, et réserve plusieurs mois à l'avance. La page `paris` est écrite pour lui d'abord.

Vocabulaire : *apartment* et non *flat*, *self check-in*, *fully equipped kitchen*, **washer and
dryer**. Le lave-linge et le sèche-linge sont un argument de vente majeur sur un séjour long
américain, et ils sont aujourd'hui noyés dans une liste d'équipements.

Requêtes visées : *where to stay in Nancy France, Nancy France Art Nouveau, Nancy day trip from
Paris, is Nancy worth visiting*.

### Espagnol

Parité uniquement. Traduction soignée, pas de travail d'adaptation spécifique.

## 7. Règles de rédaction

- **900 mots minimum en français** par page. Les pages actuelles font 700, c'est le plancher pour
  exister, pas pour se positionner contre les offices de tourisme et les blogs.
- **La réponse à la question du titre tient dans les cent premiers mots.** Pas d'introduction de
  mise en bouche. C'est le critère qui décide de l'extraction par les moteurs de réponse.
- **Un tableau par page** au minimum : distances, horaires, temps de trajet, tarifs. Les modèles
  reprennent les tableaux plus volontiers que la prose.
- **Une formulation distinctive et citable par page**, du type « meublé classé 3 étoiles à 150 m de
  la halle du marché central ». Les contenus interchangeables sont fondus dans les réponses
  génératives sans attribution ; les formulations précises y résistent.
- **Des faits datés.** « Rénovation achevée en janvier 2026 », pas « récemment rénové ».
- **Trois liens internes en plein texte minimum**, en jetons, avec des ancres descriptives et
  variées. Jamais « cliquez ici », jamais la même ancre exacte répétée d'une page à l'autre.
- **Du concret, pas des superlatifs.** « Sol, mur et bac de douche chauffants » convainc, « confort
  thermique d'exception » ne convainc personne. Le site a déjà été nettoyé de ce vocabulaire, ne le
  réintroduis pas.
- **Vouvoiement**, comme les pages existantes, dans les quatre langues.

## 8. Marche à suivre, par page

1. Déclare la page dans `PAGES` : `id`, `sections`, `image`, `related`, les quatre `slug`.
   Choisis l'image parmi `images/gallery/solene-mangin-1` à `-15`, sans réutiliser celles déjà
   prises par `quartier` (5), `weekend` (13) et `pro` (10).
2. Écris le bloc français dans `CONTENT.fr`.
3. Écris les blocs `en`, `es`, `de`. Adapte selon le §6.
4. **Mets à jour le `related` des pages existantes** pour que la nouvelle reçoive des liens
   entrants au lieu d'être un cul-de-sac. Une page qui ne reçoit rien ne se positionne pas.
5. Ajoute les liens contextuels en jetons, dans les nouvelles pages **et** vers les nouvelles pages
   depuis les anciennes.
6. Complète `llms.txt` : une ligne par page, avec les quatre URL.
7. Lance `npm run build:pages`. Il doit passer sans erreur.
8. Lis le **rapport de maillage** en fin de sortie. Chaque page doit atteindre 5 pages sources.
   Tant qu'il affiche « sous la cible de 5 », le travail n'est pas fini.

## 9. Une modification technique, une seule

Dans `scripts/build-i18n.js`, `x-default` pointe aujourd'hui vers la version française, à deux
endroits : la fonction `build` pour l'accueil, et `buildPage` pour les pages éditoriales.
**Bascule-le sur l'anglais.** Il sert aux visiteurs dont la langue ne correspond à aucune version
disponible : un Néerlandais ou un Italien tombe aujourd'hui sur du français. Le trafic français
continue d'arriver par `hreflang="fr"`.

Ne touche à rien d'autre dans le script.

## 10. Avant de me rendre chaque page

1. Applique la **grille de contrôle du §5 de `redaction-francaise`** sur le texte français, et
   donne-moi les cinq notes. Sous 40 sur 50, réécris avant de me montrer quoi que ce soit.
2. Vérifie la typographie : apostrophes `’`, insécables avant `:` `;` `!` `?` et dans les
   guillemets « », pas de tiret cadratin, nombres à la française.
3. Confirme que `npm run build:pages` passe et donne-moi le rapport de maillage.
4. Liste les chiffres que tu n'as pas pu vérifier, s'il y en a. **Ne les publie pas en silence.**

Commence par `stanislas`. Montre-moi le bloc français avant de traduire.
