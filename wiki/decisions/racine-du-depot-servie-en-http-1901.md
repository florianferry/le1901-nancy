---
title: La racine du dépôt est servie en HTTP
type: decision
status: active
sources:
  - _config.yml
created: 2026-08-03
updated: 2026-08-03
---

# La racine du dépôt est servie en HTTP

GitHub Pages publie la racine du dépôt, pas un dossier de sortie. Tout fichier ajouté à la racine
est donc accessible en ligne par défaut, et le seul rempart est la liste `exclude` de `_config.yml`.

Le fichier explique lui-même le motif et le détail des entrées, cette page ne le recopie pas. Elle
retient la règle de conduite qui en découle, laquelle ne se lit dans aucun fichier.

## La règle

**Un document interne neuf n’est pas privé tant qu’il n’est pas dans `exclude`.** Un plan, un
audit, une note de travail ou un fichier de configuration déposé à la racine se retrouve en HTTP
au premier déploiement. La vérification appartient à la même passe que l’ajout du fichier, pas à
une revue ultérieure.

Le piège se referme d’autant plus facilement que `exclude` **remplace** la liste par défaut de
Jekyll au lieu de la compléter : les entrées habituelles y sont reprises à la main, et un oubli ne
produit aucune erreur, seulement une exposition silencieuse.

## Le contre-piège

La liste inverse compte autant. Exclure trop large casse le site : les pages générées, les
dossiers de langue, les images, les polices, `dist/`, et surtout le fichier de vérification
IndexNow, dont un 404 invaliderait les soumissions. `_config.yml` porte cette liste en commentaire
final, c’est elle qu’on relit avant d’élargir une exclusion.

## Sources

- `_config.yml`, liste `exclude` et son commentaire d’en-tête
