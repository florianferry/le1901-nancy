---
description: Contrôle de santé du wiki, mécanique puis sémantique
argument-hint: [structurel | complet]
---

Portée : $ARGUMENTS (par défaut, complet)

## Partie mécanique, toujours

Lance `python3 wiki/lint.py`. Il vérifie le frontmatter, l’unicité des slugs, l’existence des
chemins de `sources`, les liens cassés, les pages orphelines, les plafonds de taille.

S’il n’affiche pas `OK`, corrige chaque erreur avant de continuer. Une erreur de lint n’est pas
une opinion.

Si `$ARGUMENTS` vaut `structurel`, arrête-toi ici.

## Partie sémantique, seulement en mode complet

Ce que le script ne peut pas voir. Pour chaque point, rends un constat, ne corrige pas sans mon
accord.

**Fraîcheur.** Pour chaque page, compare la date `updated` du frontmatter à la date du dernier
commit des chemins listés en `sources` :

```sh
git log -1 --format=%ad --date=short -- <chemin>
```

Toute page dont une source a bougé après son `updated` est candidate au statut `stale`. Ne
supprime jamais, marque et note la dérive.

**Affirmations démenties.** Reprends les affirmations chiffrées ou nominatives des pages et
vérifie-les contre le code. C’est là que se cachent les vraies erreurs : un compte de classes, un
nom de table, un nom de route.

**TODO-VERIFY en attente.** Liste-les tous avec leur page. Pour chacun, dis s’il est désormais
vérifiable et comment. Un TODO-VERIFY qui traîne depuis trois passes est soit une question pour
moi, soit une ligne à supprimer.

**Contradictions.** Rejoue les commandes de vérification de `wiki/contradictions.md`. Celles qui
ne reproduisent plus l’écart passent en `[résolu]`, sans que la ligne disparaisse.

**Trous.** Concepts cités dans plusieurs pages sans page à eux. Pages que rien ne cite malgré un
lien entrant formel depuis l’index seul. Zones de code que le wiki ne couvre pas du tout alors
qu’elles bougent souvent.

**Dérive de nommage.** Le même objet désigné de deux façons dans deux pages.

## Sortie

Mets à jour `wiki/gaps.md` avec ce que tu as trouvé, ajoute une entrée dans `wiki/log.md`, et
donne-moi le compte : pages contrôlées, périmées, TODO-VERIFY ouverts, contradictions résolues,
trous nouveaux.

Si le rapport dépasse une page, ne me le livre pas tel quel : dis-moi que le wiki a besoin d’une
révision de conventions plutôt que d’une passe de ménage.
