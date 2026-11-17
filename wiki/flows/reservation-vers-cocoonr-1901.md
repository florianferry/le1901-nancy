---
title: Le parcours de réservation, du site à la fiche Cocoonr
type: flow
status: active
sources:
  - src/index.src.html
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

> TODO-VERIFY: le flux iCal de `COCOONR_ICS_URL` a été demandé pour la fiche 15241 (voir
> `docs/email-cocoonr-ical.md`). Vérifier qu’il suit la fiche 20072, sinon en redemander un.

## Les paramètres du lien profond

La fiche accepte `arrival`, `departure` (AAAA-MM-JJ), `nb_persons` et `nb_children`, et affiche
alors le devis. La fonction `cocoonrUrl` du script du sélecteur est le seul endroit qui compose
ces paramètres ; les liens directs du HTML les laissent vides.

> TODO-VERIFY: le pré-remplissage a été testé sur la fiche 15241 en juillet 2026, pas sur la 20072.

## Le chemin le plus court

Depuis le 2026-11-17, le bouton final du calendrier (« Voir le prix chez Cocoonr ») ouvre
directement la fiche avec les dates choisies. Avant, il se contentait de reporter les dates dans
le formulaire puis faisait défiler la page jusqu’à lui, et il fallait encore cliquer sur « Voir le
prix ». Le parcours mobile passe ainsi de cinq gestes à quatre, et surtout le visiteur ne quitte
plus le calendrier pour retrouver un formulaire plus bas.

Le bouton « Réserver » de l’en-tête (desktop) ouvre lui aussi le calendrier sur place, au lieu de
faire défiler vers le formulaire. C’est une ancre `#booking` : hors de l’accueil, où le script du
sélecteur est retiré au build, elle mène simplement au formulaire de l’accueil.

Le `window.open` reste dans le gestionnaire du clic : sorti de ce geste, il serait bloqué comme
fenêtre surgissante. Les voyageurs viennent du formulaire d’où le calendrier a été ouvert, sinon de
celui de la section réservation.

Pour qui préfère choisir ses dates chez Cocoonr, un lien direct vers la fiche figure sous le
bouton du héros mobile, sous le formulaire de la section réservation, dans la barre collante
mobile et dans le pied de page.

Le formulaire et son bouton « Voir le prix » restent : ils servent à qui veut changer le nombre de
voyageurs avant de partir.

## Le calendrier des nuits prises

Les nuits occupées viennent du flux iCal au build ([[chaine-de-generation-1901]]). Un build sans
`COCOONR_ICS_URL` retire la liste et laisse le calendrier sans contrainte : c’est le mode dégradé
prévu, et c’est l’état des pages générées le 2026-11-17.

## Sources

- `src/index.src.html`, script « Sélecteur de dates », fonctions `cocoonrUrl` et `apply`
- `scripts/build-i18n.js`, `applyBookedCalendar`
- `llms.txt`
