#!/usr/bin/env bash
#
# Réencode les variantes responsives de la galerie depuis les masters 1920 px
# de `images/gallery/`, et produit les sources AVIF du premier écran.
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

# Photos du premier écran : héro et vignettes du bento. Seules celles-là
# reçoivent une source AVIF, le reste de la galerie n'étant chargé qu'à la demande.
ABOVE_FOLD=(14 2 8 7)

for width in 640 1024 1440; do
	mkdir -p "$G/$width"
	for src in "$G"/solene-mangin-*.webp; do
		name="$(basename "$src")"
		cwebp -quiet -q "$WEBP_Q" -m 6 -sharp_yuv -resize "$width" 0 "$src" -o "$G/$width/$name"
	done
done

for n in "${ABOVE_FOLD[@]}"; do
	src="$G/solene-mangin-$n.webp"
	magick "$src" -quality "$AVIF_Q" "$G/solene-mangin-$n.avif"
	for width in 640 1024 1440; do
		magick "$src" -resize "${width}x" -quality "$AVIF_Q" "$G/$width/solene-mangin-$n.avif"
	done
done

echo "Galerie réencodée : WebP q$WEBP_Q (640/1024/1440), AVIF q$AVIF_Q sur ${ABOVE_FOLD[*]}"
du -sh "$G"/640 "$G"/1024 "$G"/1440
