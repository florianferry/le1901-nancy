# Demande du lien d'abonnement iCal à Cocoonr

**Objet** : Le 1901 (15241) : lien d'abonnement iCal du calendrier

---

Bonjour,

Je mets en place un calendrier de disponibilité sur le site du 1901 (le1901-nancy.fr) et j'ai besoin de l'URL d'abonnement iCal du logement, référence 15241.

J'ai bien récupéré un export `.ics` depuis mon espace client, et le format convient parfaitement. En revanche c'est un fichier téléchargé, donc figé : il sera périmé dès la prochaine réservation.

Ce qu'il me faut, c'est l'URL permanente du même flux, du type `https://cocoonr.fr/.../<identifiant>.ics`, celle que l'on donne à Airbnb ou à Google Agenda pour synchroniser un calendrier. Mon site l'interrogera une fois par jour pour marquer les dates déjà réservées.

Deux questions complémentaires :

1. Cette URL est-elle stable dans le temps, ou est-elle régénérée périodiquement ? Je préfère le savoir pour prévoir le cas où elle expirerait.
2. Le flux couvre-t-il uniquement les réservations confirmées, ou également les blocages manuels et les délais de préparation entre deux séjours ?

Je précise que le flux ne sera jamais exposé publiquement : il est lu côté serveur au moment de la génération du site, et seules les plages de dates en sortent, sans les numéros de réservation ni les identifiants.

Merci d'avance,

Florian Ferry
Le 1901, quartier Charles III, Nancy
