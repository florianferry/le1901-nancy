#!/usr/bin/env bash
#
# Contrôle ce que le site publié expose réellement.
#
# À lancer après un déploiement touchant _config.yml : l'exclusion Jekyll ne
# s'évalue qu'au build de GitHub Pages, elle n'est donc vérifiable qu'en ligne.
#
#   ./scripts/check-exposition.sh [origine]
#
# Sort en 1 si une source est encore servie ou si une ressource attendue
# a disparu, ce qui rend le script utilisable en garde-fou automatisé.

set -uo pipefail

ORIGIN="${1:-https://le1901-nancy.fr}"
fails=0

# Ne doit plus répondre : sources de build, documentation interne, plans.
doit_disparaitre=(
	src/index.src.html
	src/input.css
	src/pages.js
	scripts/build-i18n.js
	scripts/encode-images.sh
	docs/en-tetes-securite.md
	package.json
	package-lock.json
	skills-lock.json
	README.md
	CLAUDE.md
	LICENSE.txt
	AUDIT-2026-07.md
	IMPLEMENTATION-2026-07.md
	PLAN-SEO-2026-08.md
	_config.yml
)

# Doit continuer à répondre : le site lui-même et ses fichiers de service.
doit_rester=(
	""
	404.html
	en/
	es/
	de/
	quartier-charles-iii/
	nancy-48-heures/
	sejour-professionnel/
	dist/output.css
	sitemap.xml
	robots.txt
	llms.txt
	favicon.ico
	apple-touch-icon.png
	00b0fabe76fc01fba926f3761d8095ec.txt
)

code() { curl -s -o /dev/null -w '%{http_code}' "$ORIGIN/$1"; }

printf '\nSources, attendu 404\n'
for p in "${doit_disparaitre[@]}"; do
	c=$(code "$p")
	if [ "$c" = "404" ]; then
		printf '  ok    %s  %s\n' "$c" "$p"
	else
		printf '  ECHEC %s  %s  encore servi\n' "$c" "$p"
		fails=$((fails + 1))
	fi
done

printf '\nSite, attendu 200\n'
for p in "${doit_rester[@]}"; do
	c=$(code "$p")
	if [ "$c" = "200" ]; then
		printf '  ok    %s  /%s\n' "$c" "$p"
	else
		printf '  ECHEC %s  /%s  disparu\n' "$c" "$p"
		fails=$((fails + 1))
	fi
done

# La clé IndexNow doit non seulement répondre, mais rendre son propre nom :
# un 200 servant autre chose (une page 404 déguisée) invaliderait les
# soumissions sans que le code HTTP ne le laisse voir.
cle=00b0fabe76fc01fba926f3761d8095ec
if [ "$(curl -s "$ORIGIN/$cle.txt" | tr -d '[:space:]')" = "$cle" ]; then
	printf '\n  ok    clé IndexNow conforme\n'
else
	printf '\n  ECHEC clé IndexNow : contenu inattendu\n'
	fails=$((fails + 1))
fi

if [ "$fails" -eq 0 ]; then
	printf '\nAucune source exposée, aucune régression.\n\n'
else
	printf '\n%d contrôle(s) en échec.\n\n' "$fails"
fi
exit $((fails > 0))
