---
description: Répond en passant par le wiki avant le code et la doc
argument-hint: <question>
---

Question : $ARGUMENTS

Réponds en suivant cet ordre, sans le raccourcir.

1. Lis `wiki/index.md`.
2. Lis en entier les pages que l’index désigne comme pertinentes. Pas de `grep` en guise de
   lecture.
3. Si la question touche `AUDIT-2026-07.md`, `PLAN-SEO-2026-08.md`, `PLAN-EXECUTION.md`,
   `IMPLEMENTATION-2026-07.md` ou `docs/`, lis `wiki/contradictions.md` avant de citer ce fichier.
4. Réponds, en nommant les pages de wiki utilisées.

Règles de la réponse :

- si le wiki couvre la question, cite-le, mais vérifie contre le code toute valeur précise :
  nombre, nom de classe, nom de table, chemin. Le wiki n’est jamais une preuve contre le code ;
- si le wiki ne couvre pas la question, dis-le explicitement, puis réponds depuis le code, et
  signale-le comme un trou à combler ;
- si tu ne peux répondre que depuis `AUDIT-2026-07.md`, `PLAN-SEO-2026-08.md`,
  `PLAN-EXECUTION.md`, `IMPLEMENTATION-2026-07.md` ou `docs/`, dis que la réponse vient d’un
  témoin daté et donne sa date ;
- si tu trouves un écart entre le wiki et le code, ne le corrige pas en silence : signale-le et
  propose de le traiter.

À la fin, dis en une ligne si cette conversation a produit un savoir qui mérite une page. Ne
l’écris pas sans mon accord.
