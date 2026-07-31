#!/usr/bin/env node
/**
 * Construit `src/icons.svg`, le sprite d'icônes servi depuis le domaine du site.
 *
 * Le script lit les `<use href="#i-…">` présents dans les sources, va chercher
 * le SVG correspondant dans @phosphor-icons/core et n'embarque que ce qui est
 * réellement employé. Il remplace le script Phosphor distant : deux domaines
 * tiers et une dépendance de chaîne d'approvisionnement en moins.
 *
 * Convention : `#i-<nom>` pour la graisse regular, `#i-<nom>-fill` pour fill.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'node_modules', '@phosphor-icons', 'core', 'assets');
const OUT = path.join(ROOT, 'src', 'icons.svg');

// Toutes les sources HTML susceptibles de référencer une icône.
const SOURCES = [
  path.join(ROOT, 'src', 'index.src.html'),
  ...fs.existsSync(path.join(ROOT, 'src', 'pages'))
    ? fs.readdirSync(path.join(ROOT, 'src', 'pages'))
      .filter((f) => f.endsWith('.html'))
      .map((f) => path.join(ROOT, 'src', 'pages', f))
    : [],
];

function usedIds() {
  const ids = new Set();
  SOURCES.forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    for (const m of html.matchAll(/href="#(i-[a-z0-9-]+)"/g)) ids.add(m[1]);
  });
  return [...ids].sort();
}

/** `i-star-fill` -> assets/fill/star-fill.svg ; `i-star` -> assets/regular/star.svg */
function assetPath(id) {
  const name = id.slice(2);
  return name.endsWith('-fill')
    ? path.join(ASSETS, 'fill', name + '.svg')
    : path.join(ASSETS, 'regular', name + '.svg');
}

function symbolOf(id) {
  const file = assetPath(id);
  if (!fs.existsSync(file)) {
    throw new Error('Icône introuvable dans @phosphor-icons/core : ' + id + ' (' + file + ')');
  }
  const svg = fs.readFileSync(file, 'utf8');
  const viewBox = (svg.match(/viewBox="([^"]+)"/) || [, '0 0 256 256'])[1];
  // On ne garde que le contenu graphique : le <svg> englobant est remplacé
  // par le <symbol>, et les <rect width="256" fill="none"/> de calage sont inutiles.
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<rect[^>]*fill="none"[^>]*\/>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return '<symbol id="' + id + '" viewBox="' + viewBox + '">' + body + '</symbol>';
}

const ids = usedIds();
const sprite = [
  '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true" data-sprite="icons">',
  ...ids.map((id) => '\t' + symbolOf(id)),
  '</svg>',
  '',
].join('\n');

fs.writeFileSync(OUT, sprite, 'utf8');
console.log('icons.svg : ' + ids.length + ' icônes, ' + (Buffer.byteLength(sprite) / 1024).toFixed(1) + ' Ko');
