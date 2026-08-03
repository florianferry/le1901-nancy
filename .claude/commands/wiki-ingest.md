---
description: Ingère une source dans le wiki, en la confrontant au code
argument-hint: <chemin du fichier, ou sujet>
---

Ingestion de : $ARGUMENTS

Lis `wiki/CONVENTIONS.md` avant toute chose. Le code à `HEAD` arbitre, la source est un témoin.

## Phase 1, annonce, sans écrire

1. Lis la source. Si `$ARGUMENTS` n’est pas un chemin mais un sujet, cherche d’abord dans `docs/`,
   et dis-moi ce que tu as retenu comme source.
2. Lis `wiki/index.md`, puis **lis en entier** (pas en `grep`) chaque page du wiki que l’index
   désigne comme voisine du sujet.
3. Confronte chaque affirmation vérifiable de la source à `src/`, `scripts/`,
   `src/index.src.html`, `src/pages.js` et `scripts/build-i18n.js`. Établis pour chacune :
   confirmée, contredite, ou non concluante.
4. Annonce-moi, sans rien modifier :
   - les pages du wiki à mettre à jour, et quelle section de chacune ;
   - les pages à créer, avec leur dossier et leur slug, en respectant le suffixe `-1901` et
     l’unicité des slugs à travers le coffre partagé ;
   - les contradictions repérées, avec l’affirmation d’origine et le fait réel ;
   - ce que la source apporte et qui ne mérite pas de page.

Arrête-toi là et attends mon accord. Si tu dépasses 8 contradictions, ne propose rien et dis-le :
c’est un problème de périmètre de la source.

## Phase 2, après mon accord seulement

Écris ce qui a été validé, et rien d’autre.

- Éditions chirurgicales : tu remplaces la section concernée, tu ne réécris pas la page.
- Avant de fusionner une affirmation existante, rouvre le fichier de code correspondant. Ne
  capitalise jamais sur la paraphrase du wiki.
- Ne recopie pas ce que `grep` produit mieux. Un inventaire devient un pointeur vers la commande,
  plus ce que la commande ne dit pas : le rôle, l’invariant, le piège.
- Ce qui ne peut pas s’ancrer sur un chemin s’écrit `> TODO-VERIFY: <quoi>` et reste dedans.
- Aucun wikilink ne sort de ce wiki. Un sujet qui traverse deux dépôts s’écrit en autonomie de
  chaque côté, ou comme une ligne de `contradictions.md`.
- Toute page neuve reçoit au moins un lien entrant dans la même passe, depuis `wiki/index.md` ou
  depuis une page voisine.
- Si la source est un document legacy, crée sa fiche dans `wiki/sources/` avec `raw:` et
  `doc_date:`, et donne-lui le statut qu’elle mérite.

Puis, dans le même acte : ligne dans `wiki/contradictions.md` pour chaque écart, entrée dans
`wiki/log.md`, mise à jour de `wiki/index.md`, et `python3 wiki/lint.py` qui doit afficher `OK`.

Pas de tiret cadratin. Typographie française tenue.
