---
title: Le parcours de réservation, du site à la fiche Cocoonr
type: flow
status: active
sources:
  - src/index.src.html
  - src/pages.js
  - .github/workflows/calendrier.yml
  - scripts/build-i18n.js
  - llms.txt
created: 2026-11-17
updated: 2026-11-17
---

# Le parcours de réservation, du site à la fiche Cocoonr

Le site ne réserve rien : chaque bouton de réservation finit sur la fiche du logement chez
Cocoonr, la conciergerie qui gère l’annonce, et le seul travail du site est d’y arriver avec le
moins de clics possible.

## La fiche cible, et pourquoi son identifiant compte

L’URL de la fiche porte un identifiant numérique de logement chez Cocoonr. Il a changé le
2026-11-17 : la fiche `le-1901-15241` renvoyait une 404 d’après Florian, la fiche actuelle est
`le-1901-20072`, donnée par lui le même jour. L’URL est écrite en dur à plusieurs endroits du
gabarit (constante `COCOONR` du script du sélecteur, liens directs, nœud JSON-LD) et dans
`llms.txt`. Un changement de fiche se fait donc par un remplacement global dans `src/` et
`llms.txt`, suivi de `npm run build`, jamais dans les pages générées.

Le flux iCal suit lui aussi l’identifiant de fiche : celui de la 15241 ne sert plus, et Florian a
fourni celui de la 20072 le 2026-11-17.

## Les paramètres du lien profond

La fiche accepte `arrival`, `departure` (AAAA-MM-JJ), `nb_persons` et `nb_children`, et affiche
alors le devis. La fonction `cocoonrUrl` du script du sélecteur est le seul endroit qui compose
ces paramètres ; les liens directs du HTML les laissent vides.

Florian a vérifié le 2026-11-17 que la fiche 20072 pré-remplit les dates et affiche le prix.

## Le chemin le plus court

Depuis le 2026-11-17, le bouton final du calendrier (« Voir le prix chez Cocoonr ») ouvre
directement la fiche avec les dates choisies. Avant, il se contentait de reporter les dates dans
le formulaire puis faisait défiler la page jusqu’à lui, et il fallait encore cliquer sur « Voir le
prix ». Le parcours mobile passe ainsi de cinq gestes à quatre, et surtout le visiteur ne quitte
plus le calendrier pour retrouver un formulaire plus bas.

Le bouton de l’en-tête (desktop, « Voir les disponibilités » depuis le 2026-11-17) ouvre lui aussi le calendrier sur place, au lieu de
faire défiler vers le formulaire. C’est une ancre `#booking` : hors de l’accueil, où le script du
sélecteur est retiré au build, elle mène simplement au formulaire de l’accueil.

Le `window.open` reste dans le gestionnaire du clic : sorti de ce geste, il serait bloqué comme
fenêtre surgissante. Les voyageurs viennent du formulaire d’où le calendrier a été ouvert, sinon de
celui de la section réservation.

Pour qui préfère choisir ses dates chez Cocoonr, un lien direct (« Choisir mes dates chez
Cocoonr ») figure sous le bouton du héros mobile, sous le formulaire de la section réservation et
dans le pied de page. Il a été retiré de la barre collante mobile le 2026-11-17 : à 320 px, deux
actions y tenaient mal et la barre n’en garde qu’une.

## Trois libellés, un par étape

Depuis l’audit UX du 2026-11-17, validé par Florian, les libellés suivent l’étape au lieu de tous
dire « Réserver » : « Voir les disponibilités » ouvre le calendrier (en-tête, barre collante,
encarts des articles), « Voir le prix chez Cocoonr » part vers la fiche avec les dates, « Choisir
mes dates chez Cocoonr » part vers la fiche sans dates. Le visiteur sait qu’il quitte le site au
moment où il le quitte. Les clés sont `nav.book`, `chooseDates`, `submit` et `directLink` du
dictionnaire, et `ctaButton` dans `src/pages.js`.

La barre collante mobile se cache tant que le héros ou la section réservation est à l’écran : elle
doublerait un formulaire déjà visible.

Le formulaire et son bouton « Voir le prix » restent : ils servent à qui veut changer le nombre de
voyageurs avant de partir.

## Le calendrier des nuits prises

Les nuits occupées viennent du flux iCal au build ([[chaine-de-generation-1901]]). Jusqu’au
2026-11-17, rien ne relançait le build : la liste publiée est restée figée au 4 août, et elle
concernait l’ancienne fiche.

Depuis, `.github/workflows/calendrier.yml` régénère le site chaque nuit avec le secret de dépôt
`COCOONR_ICS_URL` (flux de la fiche 20072) et pousse sur `main` si le calendrier a changé.
Choix délibéré : si le flux ne répond pas, le build passe en mode dégradé et retirerait le
calendrier ; le workflow échoue alors sans rien publier, pour garder le calendrier de la veille
plutôt qu’aucun.

Depuis le 2026-11-17, ces nuits ne sont plus publiées en liste sous le formulaire : le build ne
pose plus que le JSON `bookedNights`, que le calendrier grise. La liste doublait le calendrier et
allongeait la section sur mobile. Corollaire : sans flux, le calendrier n’a plus de nuits grisées,
et rien d’autre ne le signale à l’œil.

> TODO-VERIFY: que le push du workflow, fait avec `GITHUB_TOKEN`, déclenche bien la publication
> GitHub Pages.

## Sources

- `src/index.src.html`, script « Sélecteur de dates », fonctions `cocoonrUrl` et `apply`
- `scripts/build-i18n.js`, `applyBookedCalendar`
- `src/pages.js`, clé `ctaButton`
- `llms.txt`
- `.github/workflows/calendrier.yml`
