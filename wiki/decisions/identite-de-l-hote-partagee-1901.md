---
title: L’identité de l’hôte est partagée avec deux autres sites
type: decision
status: active
sources:
  - src/index.src.html
  - scripts/build-i18n.js
created: 2026-08-04
updated: 2026-08-04
---

# L’identité de l’hôte est partagée avec deux autres sites

Le nœud `#hote` de `src/index.src.html` déclare une personne qui est aussi déclarée ailleurs : deux
autres sites qu’elle édite portent la même `Person`, et `flo-perspectives.com` en est la page de
référence. Ce site n’est donc pas libre du contenu de son `sameAs`.

## Ce que ça impose

Les quatre comptes de publication s’écrivent ici dans la forme exacte qu’ils prennent sur les deux
autres domaines, sous-domaine et barre oblique finale comprises. Deux écritures d’un même profil
désignent deux ressources pour un moteur, donc ne recoupent rien, et le recoupement est tout
l’intérêt de `sameAs`.

Le défaut est vécu : le profil LinkedIn du nœud `#hote` s’écrivait sans barre oblique finale ici et
sans tiret sur l’un des deux autres sites, donc une des deux entrées pointait vers une page
absente. Une entrée qui ne résout pas n’est pas neutre, elle affaiblit le nœud, et rien n’échoue au
build pour le signaler.

Corollaire : un compte ajouté, retiré ou renommé se répercute sur les trois domaines dans la même
passe. Un seul site à jour rescinde l’entité au lieu de l’enrichir.

## Pourquoi ce site pèse dans cette histoire

Des trois, il est le seul à réunir des attestations que son éditeur n’a pas écrites lui-même : le
récépissé de meublé de tourisme, le classement en étoiles porté par `ldStarRating`, et les avis
publiés chez la conciergerie que reprennent les nœuds `Review` et `AggregateRating`. Le `sameAs` du
nœud `#hote` est ce qui rattache ces attestations à la personne qui les a obtenues, au lieu de les
laisser au seul logement.

C’est la même raison qui a fait naître la clé `history.renovePar` : elle nomme le propriétaire
comme auteur de la rénovation et pointe vers sa page de référence. Un lien sortant réel vaut plus
que sa déclaration structurée, parce qu’un moteur le suit au lieu de le croire.

## Ce qui a été écarté

**Déclarer le logement dans le `sameAs` de l’hôte.** Un logement n’est pas une personne, et
`sameAs` désigne la même entité. Le nœud porte déjà `worksFor` vers le logement, qui dit la
relation juste.

**Une propriété de balisage pour « rénové par ».** Le vocabulaire n’en offre aucune sur un
`VacationRental`, et un champ que le validateur ignore ne fait que rallonger le nœud, comme le
retient [[json-ld-logement-contraintes-google-1901]]. La phrase visible et son lien suffisent.

## Sources

- `src/index.src.html`, nœud `#hote` et clé `history.renovePar` des quatre dictionnaires
- `scripts/build-i18n.js`, localisation des nœuds du graphe par langue
