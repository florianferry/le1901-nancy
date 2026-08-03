# Conventions du wiki le1901.fr (site statique)

Contrat entre Florian et l’agent. Décrit comment maintenir le wiki, pas son contenu. C’est le
fichier le plus important du dispositif : sans lui l’agent produit une doc générique de plus.

Co-évolutif. Quand une règle se révèle fausse à l’usage, on la change ici, pas dans les pages.

Ce fichier descend du gabarit partagé `wiki-kit/templates/CONVENTIONS.md`. Les sections marquées «
universel » sont communes à tous les dépôts et se modifient dans le gabarit, pas ici. Le reste est
propre à ce dépôt et se modifie ici.

## Hiérarchie de vérité, non négociable (universel)

1. **Le code à `HEAD`, et en premier lieu `src/index.src.html`, `src/pages.js` et
   `scripts/build-i18n.js`.** Seule source de vérité.
2. **Le wiki.** Dérivé du code, jamais autorité contre lui.
3. **`AUDIT-2026-07.md`, `PLAN-SEO-2026-08.md`, `PLAN-EXECUTION.md`, `IMPLEMENTATION-2026-07.md`
   et `docs/`. Témoins datés, utiles pour l’intention, jamais pour l’état courant.**

Corollaire : l’agent ne cite jamais le wiki comme preuve. Quand il met à jour une affirmation
existante, il rouvre le fichier source avant de fusionner. Capitaliser sur la paraphrase du wiki
est le mode d’échec appelé « le wiki lit son propre output ».

## Périmètre : ce qui mérite une page (universel)

Le code dit déjà le « quoi ». Une page ne se justifie que pour ce qui n’est nulle part dans le
dépôt : le pourquoi d’une décision et les options écartées, les invariants qu’un lecteur du code
ne devine pas, les pièges rencontrés, les parcours qui traversent plusieurs fichiers, les écarts
entre ce que la doc annonce et ce que le code fait.

Ne jamais paraphraser une liste de routes, un jeu de tokens ou une arborescence : `grep` fait ça
mieux et ne périme pas.

## Périmètre propre à ce dépôt

Le site est généré. `index.html` et les dossiers `de/`, `en/`, `es/` sont des artefacts de `npm
run build`, versionnés mais jamais édités à la main. Le wiki ne documente donc pas le HTML livré,
il documente `src/pages.js`, le gabarit de `scripts/build-i18n.js` et les arbitrages qui les
gouvernent : mécanique hreflang, résolution des ancres `[[page:...]]` et `[[home:#...]]`, contrôle
de parité des sections entre les quatre langues, périmètre d'`exclude` dans `_config.yml` qui
empêche GitHub Pages de publier les plans internes.

Les quatre gros documents de plan de juillet 2026 sont des témoins datés : ils décrivent une
intention, jamais l’état courant. Une affirmation tirée de l’un d’eux se vérifie dans `src/` avant
d’entrer au wiki.

## Arborescence (universel)

```
wiki/
  index.md            catalogue de routage, lu en premier à chaque session
  log.md              journal append-only, jamais relu en entier
  contradictions.md   écarts doc contre code
  gaps.md             ce qui manque et les questions ouvertes
  CONVENTIONS.md      ce fichier
  decisions/          un fichier par décision, format ADR léger
  concepts/           invariants, mécanismes, vocabulaire
  flows/              parcours bout en bout
  reference/          entités durables : routes, composants, schémas
  sources/            un fichier par document legacy ingéré
  lint.py             vérificateur déterministe, doit afficher OK
```

Pas de sous-niveau supplémentaire. Une page qui ne trouve pas son dossier n’a pas de sujet.

## Frontmatter, obligatoire sur chaque page (universel)

```yaml
---
title: Titre lisible
type: decision | concept | flow | reference | source
status: active | stale
sources:
  - src/index.src.html
  - src/pages.js
created: 2026-08-03
updated: 2026-08-03
---
```

`sources` contient des chemins relatifs à la racine du dépôt, sans `./`. Jamais de wikilink dans
le frontmatter : les wikilinks n’existent que dans le corps.

Les pages `type: source` ajoutent `raw:` (le chemin du document legacy) et `doc_date:` (sa date de
dernière modification réelle).

## Corps de page (universel)

Un seul `# H1`, identique au `title`. Puis une phrase de résumé. Puis les sections utiles. Puis,
en dernier, `## Sources` qui reprend les chemins du frontmatter en clair.

Toute affirmation non triviale se rattache à un chemin de `sources`. Ce qui ne peut pas s’ancrer
s’écrit `> TODO-VERIFY: <ce qu’il faut vérifier>` et reste dedans. Un bloc TODO-VERIFY est une
fonctionnalité, pas un échec.

Interdictions dures : décrire un comportement à l’exécution qui n’est pas lisible dans le code,
décrire ce que voit l’utilisateur sans capture ni test à l’appui, citer un chemin hors du dépôt.

Contrainte de rédaction : pas de tiret cadratin, typographie française tenue. Le wiki n’y échappe
pas, c’est du texte du projet.

## Créer ou mettre à jour (universel)

Avant toute écriture, survol obligatoire : lire `index.md`, puis **lire** (pas grep) chaque page
candidate, puis énoncer la liste des pages à modifier, à créer, et les contradictions repérées.
C’est cette étape qui empêche la même page d’exister deux fois sous deux noms voisins.

- Même thèse centrale qu’une page existante : fusionner, ajouter la source.
- Concept neuf : créer dans le dossier le plus pertinent, nommer d’après le concept et non d’après
  le fichier d’origine.
- À cheval sur deux sujets : placer dans le plus pertinent, ajouter des `[[liens]]` croisés.
- Mention de passage improbable à revoir : ligne inline sur une page existante, pas de page.

**Toute page neuve doit avoir au moins un lien entrant, créé dans la même passe.** Une page que
rien ne pointe est un bug de l’ingestion.

Les éditions sont chirurgicales : on remplace la section concernée, on ne réécrit pas la page.

## Contradictions (universel)

Interdiction de trancher en silence. Quand la doc et le code divergent, ou quand deux documents
divergent : écrire le fait tel que le code l’établit avec son chemin, ajouter une ligne dans
`contradictions.md` avec les deux versions et la date, et si le conflit vit dans deux pages,
l’annoter dans les deux et les inter-lier.

Budget : plus de 8 contradictions dans un lot, on s’arrête et on en parle.

## Nommage et étanchéité du coffre partagé (universel)

Ce wiki cohabite dans le coffre `/tmp/run/coffre` avec les wikis `site`. Deux règles en découlent.

**Suffixe.** Le suffixe de ce wiki est `-1901`. Tout slug qui désigne un concept susceptible
d’exister ailleurs dans le coffre le porte : `design-system-1901.md`. En cas de doute, suffixer.
`vault-lint.py` détecte les collisions réelles et te dit lesquelles renommer.

**Étanchéité.** Aucun wikilink ne sort de ce wiki. Un lien vers une page d’un autre dépôt serait
une affirmation que rien n’ancre à un `HEAD` vérifiable, et `lint.py` ne saurait pas la résoudre.
Quand un sujet traverse deux dépôts, il ne se lie pas : il s’écrit comme une ligne de
`contradictions.md`, ou comme un paragraphe autonome de chaque côté. C’est le prix de la
hiérarchie de vérité, pas une limite technique.

## Cadence (universel)

- **Ingestion** : par lots thématiques, jamais en une passe.
- **Lint structurel** : `python3 wiki/lint.py` à chaque fin de lot. Doit afficher `OK`.
- **Lint sémantique** : toutes les 20 ingestions, ou une fois par semaine active.
- **Fraîcheur** : une page dont un `sources` a changé depuis son `updated` passe en `status:
  stale` avec une note de dérive. Jamais de suppression automatique.

## Ce qu’on ne fait pas (universel)

- pas de score numérique de confiance, c’est de la fausse précision ;
- pas de décroissance par ancienneté ou par fréquence d’accès ;
- pas de dates de revue par page, la maintenance est pilotée par le lint global ;
- pas de recherche vectorielle ni de graphe typé tant que `grep` suffit, donc sous 150 pages ;
- pas de hook automatique d’écriture, l’humain reste la porte d’écriture.

Quand une de ces lignes devient fausse, on la retire et on écrit pourquoi dans `log.md`.
