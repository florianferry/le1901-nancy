<!-- BEGIN:wiki-kit -->
# Wiki (CRITIQUE, à appliquer avant toute réponse)

Le projet tient un wiki en `wiki/`. Tu **DOIS** le consulter avant de répondre sur l’architecture,
une décision, un invariant ou un piège connu. La procédure, dans cet ordre :

1. lire `wiki/index.md` ;
2. lire les pages que l’index désigne comme pertinentes, en entier, pas en `grep` ;
3. si la question touche `AUDIT-2026-07.md`, `PLAN-SEO-2026-08.md`, `PLAN-EXECUTION.md`,
   `IMPLEMENTATION-2026-07.md` ou `docs/`, lire `wiki/contradictions.md` avant de citer un de ces
   fichiers ;
4. répondre en citant les pages de wiki utilisées ;
5. ne te rabattre sur `AUDIT-2026-07.md`, `PLAN-SEO-2026-08.md`, `PLAN-EXECUTION.md`,
   `IMPLEMENTATION-2026-07.md` ou `docs/` **que** si le wiki n’a pas de page sur la question, et
   signaler alors que la réponse vient d’un témoin daté ;
6. ce que tu as appris en séance et qui manque au wiki, l’ajouter selon `wiki/CONVENTIONS.md`,
   puis lancer `python3 wiki/lint.py` qui doit afficher `OK`.

Hiérarchie de vérité : le code à `HEAD` arbitre, et en premier lieu `src/index.src.html`,
`src/pages.js` et `scripts/build-i18n.js`. Le wiki en dérive. `AUDIT-2026-07.md`,
`PLAN-SEO-2026-08.md`, `PLAN-EXECUTION.md`, `IMPLEMENTATION-2026-07.md` et `docs/` sont des
témoins datés. Interdiction de citer le wiki comme preuve contre le code.

Suffixe de slug de ce wiki dans le coffre partagé : `-1901`. Aucun wikilink ne sort de ce wiki.
<!-- END:wiki-kit -->
