# Wiki le1901.fr (site statique)

Mémoire du projet, écrite et maintenue par l’agent, lue par toi. Le code arbitre toujours : ce
wiki explique le pourquoi, pas le quoi.

**À lire avant d’écrire ici : [[CONVENTIONS]].** Les écarts entre la doc et le code sont dans
[[contradictions]], ce qui manque dans [[gaps]], l’historique dans `log.md`.

## État

- Wiki amorcé le 2026-08-03, premier lot ingéré le même jour.
- Périmètre ingéré : la chaîne de génération et l’exposition du dépôt. Suffixe de slug de ce wiki : `-1901`.
- Arbitre de vérité : `src/index.src.html`, `src/pages.js` et `scripts/build-i18n.js`.

## Décisions

- [[racine-du-depot-servie-en-http-1901]] : GitHub Pages sert la racine, donc tout fichier neuf
  est public tant qu’il n’est pas exclu.
- [[identite-de-l-hote-partagee-1901]] : le nœud `#hote` déclare une personne déclarée sur deux
  autres sites, ce qui contraint la forme de son `sameAs`.

## Concepts

- [[chaine-de-generation-1901]] : un gabarit et un dictionnaire produisent quinze pages, et les
  quatre endroits par où la chaîne casse.
- [[jetons-de-lien-et-coffre-obsidian-1901]] : la syntaxe de liens du générateur a la même forme
  que celle du wiki, et ne s’écrit donc jamais en prose ici.
- [[licence-des-photos-et-modale-legale-1901]] : le `license` des images renvoie à une modale sans
  URL, par une constante déclarée dans deux fichiers que rien ne compare.
- [[json-ld-logement-contraintes-google-1901]] : les quatre formes que Search Console refuse dans
  le nœud `VacationRental`, alors que schema.org les autorise.

## Parcours

Rien encore.

## Référence

Rien encore.

## Sources legacy ingérées

Rien encore.

## Sources

- `CLAUDE.md`
- `src/index.src.html`
- `src/pages.js`
- `scripts/build-i18n.js`
