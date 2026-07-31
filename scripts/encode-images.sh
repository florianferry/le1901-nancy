#!/usr/bin/env bash
#
# Réencode les variantes responsives de la galerie depuis les masters 1920 px
# de `images/gallery/`, et produit les sources AVIF de toutes les photos.
#
# Profil retenu : WebP q78 (-35 % sur les variantes précédentes, sur-encodées)
# et AVIF q50 (-32 % de plus que le WebP à qualité comparable).
#
# Dépendances : cwebp (libwebp) et magick (ImageMagick avec libheif).
# À relancer après tout ajout ou remplacement de photo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
G="$ROOT/images/gallery"

WEBP_Q=78
AVIF_Q=50

for width in 640 1024 1440; do
	mkdir -p "$G/$width"
	for src in "$G"/solene-mangin-*.webp; do
		name="$(basename "$src")"
		cwebp -quiet -q "$WEBP_Q" -m 6 -sharp_yuv -resize "$width" 0 "$src" -o "$G/$width/$name"
	done
done

# AVIF sur l'ensemble de la galerie. Une source AVIF déclarée dans le HTML sans
# le fichier correspondant casse l'image sur tout navigateur qui sait la lire :
# la couverture doit rester totale, d'où la boucle sur les masters plutôt que
# sur une liste tenue à la main.
count=0
for src in "$G"/solene-mangin-*.webp; do
	name="$(basename "$src" .webp)"
	magick "$src" -quality "$AVIF_Q" "$G/$name.avif"
	for width in 640 1024 1440; do
		magick "$src" -resize "${width}x" -quality "$AVIF_Q" "$G/$width/$name.avif"
	done
	count=$((count + 1))
done

echo "Galerie réencodée : WebP q$WEBP_Q (640/1024/1440), AVIF q$AVIF_Q sur $count photos"
du -sh "$G"/640 "$G"/1024 "$G"/1440
