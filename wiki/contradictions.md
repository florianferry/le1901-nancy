# Contradictions, le1901.fr (site statique)

Écarts entre ce qu’un document annonce et ce que le code établit. Une contradiction ne se tranche
jamais en silence : elle s’écrit ici, avec les deux versions, la date, et la commande qui
reproduit l’écart.

Format : un `###` par contradiction. Une contradiction résolue garde sa ligne et reçoit `[résolu]`
dans son titre : on ne supprime pas l’historique. `lint.py --contradictions` compte les titres
sans `[résolu]`.

Budget : au-delà de 8 contradictions ouvertes dans un même lot, on arrête le lot et on en parle.

### Identifiant de la fiche Cocoonr, 15241 contre 20072

Constaté le 2026-11-17. `AUDIT-2026-07.md`, `IMPLEMENTATION-2026-07.md` et
`docs/email-cocoonr-ical.md` citent la fiche `le-1901-15241`. Le code à `HEAD` pointe vers
`le-1901-20072`, l’ancienne fiche répondant en 404 d’après Florian. Reproduire :
`grep -rn "le-1901-" src llms.txt docs *.md`. Voir [[reservation-vers-cocoonr-1901]].
