# En-têtes de sécurité

GitHub Pages sert le site avec un jeu d'en-têtes figé : ni `Strict-Transport-Security`,
ni `X-Content-Type-Options`, ni `X-Frame-Options`, et aucun moyen de les ajouter depuis
le dépôt. Un fichier `_headers` n'est lu que par Netlify et Cloudflare Pages, pas ici.

Ce qui est déjà en place, et ce qui reste à faire :

| En-tête | État | Où |
|---|---|---|
| `Content-Security-Policy` | posé | balise `<meta http-equiv>` dans `src/index.src.html` et `404.html` |
| `Referrer-Policy` | posé | balise `<meta name="referrer">`, mêmes fichiers |
| `Strict-Transport-Security` | manquant | en-tête HTTP seulement |
| `X-Content-Type-Options` | manquant | en-tête HTTP seulement |
| `X-Frame-Options` / `frame-ancestors` | manquant | ignoré en balise, en-tête HTTP seulement |

La redirection HTTP vers HTTPS fonctionne déjà (301 vérifié sur l'apex et sur `www`),
et l'option « Enforce HTTPS » de GitHub Pages doit rester cochée. Sans HSTS, la première
visite d'un navigateur passe malgré tout par un aller-retour en clair.

## Poser les trois en-têtes manquants via Cloudflare

Le plan gratuit suffit. Compter une trentaine de minutes, propagation DNS comprise.

1. Ajouter `le1901-nancy.fr` sur Cloudflare, qui importe la zone DNS existante.
2. Chez le registrar, remplacer les serveurs de noms par ceux fournis par Cloudflare.
3. Vérifier que l'enregistrement du domaine racine pointe toujours vers les quatre IP de
   GitHub Pages (`185.199.108.153` à `185.199.111.153`) et que le nuage orange est actif :
   sans proxy, aucune règle ne s'applique.
4. SSL/TLS, régler le mode de chiffrement sur **Full**. En mode Flexible, GitHub Pages
   boucle en redirection.
5. Rules, Transform Rules, **Modify Response Header**, une règle qui s'applique à toutes
   les requêtes, avec trois en-têtes statiques :

   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   X-Content-Type-Options: nosniff
   X-Frame-Options: SAMEORIGIN
   ```

6. Vérifier :

   ```bash
   curl -sSI https://le1901-nancy.fr/ | grep -i "strict-transport\|x-content-type\|x-frame"
   ```

Ne pas activer le preload HSTS tant que `max-age=31536000` n'a pas tourné plusieurs
semaines sans incident : l'inscription sur la liste de preload est difficile à défaire.

## Si Cloudflare n'est pas souhaité

La CSP en balise couvre l'essentiel du risque réel pour un site statique sans formulaire
ni cookie : elle bloque tout script, toute image et toute connexion vers un domaine autre
que le site lui-même, Matterport excepté. Les trois en-têtes manquants protègent contre
le sniffing de type MIME, l'inclusion en iframe et le premier accès en clair. Aucun n'est
un facteur de classement pour Google.

## Attention en cas d'ajout de dépendance externe

La CSP de `src/index.src.html` liste `my.matterport.com` comme seule origine tierce.
Toute ressource ajoutée depuis un autre domaine (police, carte, script de mesure,
drapeaux `flagcdn.com` du sélecteur de langue si le commutateur runtime revenait) sera
bloquée par le navigateur, en silence côté visiteur et avec une erreur en console.
Mettre la directive à jour en même temps que la ressource.
