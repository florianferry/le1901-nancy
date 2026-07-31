#!/usr/bin/env node
/**
 * Génère les 4 pages statiques (fr, en, es, de) depuis src/index.src.html.
 *
 * Chaque page est monolingue : les traductions sont appliquées au build,
 * pas au runtime. Le tableau `translations` et le commutateur JavaScript
 * ne sont donc pas embarqués dans les pages livrées.
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'index.src.html');
const SITE = 'https://le1901-nancy.fr';

const LANGS = ['fr', 'en', 'es', 'de'];
const OG_LOCALE = { fr: 'fr_FR', en: 'en_GB', es: 'es_ES', de: 'de_DE' };
const OUT = { fr: 'index.html', en: 'en/index.html', es: 'es/index.html', de: 'de/index.html' };
const urlOf = (l) => (l === 'fr' ? SITE + '/' : SITE + '/' + l + '/');
const pathOf = (l) => (l === 'fr' ? '/' : '/' + l + '/');

// Équipements pour le JSON-LD. Le contenu affiché vit dans les traductions ;
// ces libellés-là ne servent qu'au balisage.
const AMENITIES = {
  fr: ['Fibre optique très haut débit (Wifi 6)', 'Prises Ethernet câblées', 'Cuisine équipée',
    'Plaque à induction et four', 'Lave-vaisselle', 'Réfrigérateur-congélateur', 'Lave-linge',
    'Sèche-linge', "Salle d'eau à sol, mur et bac de douche chauffants",
    'Chauffage à inertie automatisé', 'TV OLED connectée', 'Enceinte connectée',
    'Espace de travail', 'Double vitrage sur les 5 fenêtres', 'Ascenseur',
    'Arrivée autonome par serrure connectée', 'Linge de lit en percale fourni',
    'Lit parapluie et chaise haute', 'Animaux acceptés'],
  en: ['High-speed fibre internet (Wi-Fi 6)', 'Wired Ethernet sockets', 'Fully equipped kitchen',
    'Induction hob and oven', 'Dishwasher', 'Fridge-freezer', 'Washing machine',
    'Tumble dryer', 'Shower room with heated floor, wall and shower tray',
    'Automated inertia heating', 'Smart OLED TV', 'Smart speaker',
    'Work space', 'Double glazing on all 5 windows', 'Lift',
    'Self check-in with smart lock', 'Percale bed linen provided',
    'Travel cot and high chair', 'Pets welcome'],
  es: ['Fibra óptica de muy alta velocidad (Wi-Fi 6)', 'Tomas Ethernet por cable', 'Cocina equipada',
    'Placa de inducción y horno', 'Lavavajillas', 'Frigorífico-congelador', 'Lavadora',
    'Secadora', 'Baño con suelo, pared y plato de ducha calefactados',
    'Calefacción de inercia automatizada', 'TV OLED conectada', 'Altavoz conectado',
    'Zona de trabajo', 'Doble acristalamiento en las 5 ventanas', 'Ascensor',
    'Entrada autónoma con cerradura conectada', 'Ropa de cama de percal incluida',
    'Cuna de viaje y trona', 'Se admiten mascotas'],
  de: ['Glasfaser mit sehr hoher Bandbreite (Wi-Fi 6)', 'Kabelgebundene Ethernet-Anschlüsse',
    'Voll ausgestattete Küche', 'Induktionskochfeld und Backofen', 'Geschirrspüler',
    'Kühl-Gefrier-Kombination', 'Waschmaschine', 'Wäschetrockner',
    'Duschbad mit beheiztem Boden, beheizter Wand und beheizter Duschwanne',
    'Automatisierte Trägheitsheizung', 'Smart-OLED-TV', 'Smart Speaker',
    'Arbeitsplatz', 'Doppelverglasung an allen 5 Fenstern', 'Aufzug',
    'Autonomer Check-in per Smart Lock', 'Perkal-Bettwäsche gestellt',
    'Reisebett und Hochstuhl', 'Haustiere willkommen'],
};

// Script conservé dans les pages livrées : uniquement l'onglet du guide local.
const RUNTIME = `
		function switchGuideTab(tab) {
			document.querySelectorAll('.guide-panel').forEach(p => p.classList.add('hidden'));
			document.querySelectorAll('.guide-tab').forEach(t => {
				t.classList.remove('guide-tab-active', 'border-gold', 'text-nightblue');
				t.classList.add('border-transparent', 'text-anthracite/50');
			});
			const panel = document.getElementById('guide-' + tab);
			const btn = document.querySelector('[data-guide-tab="' + tab + '"]');
			if (panel) panel.classList.remove('hidden');
			if (btn) {
				btn.classList.add('guide-tab-active', 'border-gold', 'text-nightblue');
				btn.classList.remove('border-transparent', 'text-anthracite/50');
			}
		}

		document.addEventListener('DOMContentLoaded', () => {
			switchGuideTab('gastro');
		});
	`;

const raw = fs.readFileSync(SRC, 'utf8');
const block = raw.match(/const translations = \{[\s\S]*?\n\t\t\};/);
if (!block) throw new Error('Bloc `translations` introuvable dans la source.');
const translations = new Function(block[0] + ' return translations;')();

const get = (obj, key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/**
 * Parité des clés entre les quatre langues.
 *
 * Sans ce contrôle, une clé absente d'un bloc étranger produit silencieusement
 * le texte français dans la page correspondante : la page se construit, se
 * déploie et personne ne voit le trou. Le français fait référence.
 */
function leafKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? prefix + '.' + k : k;
    return v && typeof v === 'object' && !Array.isArray(v) ? leafKeys(v, path) : [path];
  });
}

function checkParity(translations) {
  const reference = leafKeys(translations.fr);
  const refSet = new Set(reference);
  const problems = [];

  LANGS.filter((l) => l !== 'fr').forEach((lang) => {
    const keys = new Set(leafKeys(translations[lang]));
    const missing = reference.filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !refSet.has(k));
    if (missing.length) problems.push('  ' + lang + ' — manquantes : ' + missing.join(', '));
    if (extra.length) problems.push('  ' + lang + ' — en trop : ' + extra.join(', '));
  });

  if (problems.length) {
    throw new Error('Parité i18n rompue (référence : fr)\n' + problems.join('\n'));
  }
  return reference.length;
}

/** Les questions de la FAQ sont numérotées q1..qN / a1..aN : on compte la série. */
function faqCount(t) {
  let n = 0;
  while (t.faq['q' + (n + 1)] !== undefined) n += 1;
  if (!n) throw new Error('Aucune question trouvée dans le bloc faq.');
  for (let i = 1; i <= n; i += 1) {
    if (t.faq['a' + i] === undefined) throw new Error('Réponse faq.a' + i + ' manquante.');
  }
  return n;
}

function setMeta($, sel, value) {
  const el = $(sel);
  if (!el.length) throw new Error('Balise absente : ' + sel);
  el.attr('content', value);
}

function build(lang) {
  const t = translations[lang];
  const $ = cheerio.load(raw, { decodeEntities: false });

  // --- contenu ---------------------------------------------------------
  const missing = [];
  $('[data-i18n]').each((_, el) => {
    const k = $(el).attr('data-i18n');
    const v = get(t, k);
    if (v === undefined) return missing.push(k);
    $(el).text(v);
  });
  $('[data-i18n-html]').each((_, el) => {
    const k = $(el).attr('data-i18n-html');
    const v = get(t, k);
    if (v === undefined) return missing.push(k);
    $(el).html(v);
  });
  ['alt', 'aria-label', 'title'].forEach((attr) => {
    $('[data-i18n-' + attr + ']').each((_, el) => {
      const k = $(el).attr('data-i18n-' + attr);
      const v = get(t, k);
      if (v === undefined) return missing.push(k);
      $(el).attr(attr, v);
    });
  });
  $('[data-i18n-data-title]').each((_, el) => {
    const k = $(el).attr('data-i18n-data-title');
    const v = get(t, k);
    if (v === undefined) return missing.push(k);
    $(el).attr('data-title', v);
  });
  if (missing.length) {
    throw new Error('Clés manquantes en "' + lang + '" : ' + [...new Set(missing)].join(', '));
  }

  // --- en-tête ---------------------------------------------------------
  $('html').attr('lang', lang);
  $('title').text(t.meta.title);
  setMeta($, 'meta[name="description"]', t.meta.description);
  $('link[rel="canonical"]').attr('href', urlOf(lang));

  setMeta($, 'meta[property="og:url"]', urlOf(lang));
  setMeta($, 'meta[property="og:title"]', t.meta.ogTitle);
  setMeta($, 'meta[property="og:description"]', t.meta.ogDescription);
  setMeta($, 'meta[property="og:image:alt"]', t.hero.imgAlt);
  setMeta($, 'meta[property="og:locale"]', OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocale = $('meta[property="og:locale"]');
  LANGS.filter((l) => l !== lang).forEach((l) => {
    ogLocale.after('\n\t<meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '">');
  });

  setMeta($, 'meta[name="twitter:title"]', t.meta.twitterTitle);
  setMeta($, 'meta[name="twitter:description"]', t.meta.twitterDescription);
  setMeta($, 'meta[name="twitter:image:alt"]', t.hero.imgAlt);

  // hreflang : identiques sur les 4 pages, chacune se référençant elle-même
  $('link[rel="alternate"][hreflang]').remove();
  const anchor = $('link[rel="canonical"]');
  let tags = LANGS.map((l) => '\n\t<link rel="alternate" hreflang="' + l + '" href="' + urlOf(l) + '">').join('');
  tags += '\n\t<link rel="alternate" hreflang="x-default" href="' + urlOf('fr') + '">';
  anchor.after(tags);

  // --- sélecteur de langue --------------------------------------------
  $('#langTriggerCode').text(lang.toUpperCase());
  $('.lang-option').each((_, el) => {
    const optLang = $(el).attr('data-lang');
    const check = $(el).find('.lang-check');
    if (optLang === lang) {
      check.removeClass('hidden');
      $(el).attr('aria-current', 'true');
    } else {
      check.addClass('hidden');
      $(el).removeAttr('aria-current');
    }
  });

  // --- données structurées ---------------------------------------------
  const ld = $('script[type="application/ld+json"]');
  const data = JSON.parse(ld.html());
  const lodging = data.find((d) => d['@type'] === 'LodgingBusiness');
  lodging['@id'] = urlOf(lang) + '#logement';
  lodging.name = t.meta.ldName;
  lodging.description = t.meta.ldDescription;
  lodging.url = urlOf(lang);
  lodging.inLanguage = lang;
  lodging.employee['@id'] = urlOf(lang) + '#hote';
  lodging.amenityFeature = AMENITIES[lang].map((name) => ({
    '@type': 'LocationFeatureSpecification', name, value: true,
  }));

  const person = data.find((d) => d['@type'] === 'Person');
  person['@id'] = urlOf(lang) + '#hote';
  person.url = urlOf(lang);
  person.worksFor['@id'] = urlOf(lang) + '#logement';

  const faq = data.find((d) => d['@type'] === 'FAQPage');
  faq['@id'] = urlOf(lang) + '#faq';
  faq.inLanguage = lang;
  faq.mainEntity = Array.from({ length: faqCount(t) }, (_, i) => ({
    '@type': 'Question',
    name: t.faq['q' + (i + 1)],
    acceptedAnswer: { '@type': 'Answer', text: t.faq['a' + (i + 1)] },
  }));
  ld.text('\n' + JSON.stringify(data, null, '\t') + '\n\t');

  // --- runtime : on retire le moteur i18n ------------------------------
  let replaced = 0;
  $('script').each((_, el) => {
    const code = $(el).html();
    if (code && code.includes('const translations')) {
      $(el).text(RUNTIME);
      replaced++;
    }
  });
  if (replaced !== 1) throw new Error('Bloc i18n non remplacé (' + replaced + ' trouvé).');

  // --- nettoyage --------------------------------------------------------
  // Les marqueurs de traduction n'ont plus d'utilité dans les pages livrées.
  $('[data-i18n], [data-i18n-html], [data-i18n-alt], [data-i18n-aria-label], [data-i18n-title], [data-i18n-data-title]')
    .each((_, el) => {
      Object.keys(el.attribs)
        .filter((a) => a.startsWith('data-i18n'))
        .forEach((a) => $(el).removeAttr(a));
    });

  let html = $.html();

  // Chemins relatifs -> absolus, sinon /en/ casse les images et le CSS.
  html = html
    .replace(/(?<!\/)images\//g, '/images/')
    .replace(/(?<!\/)dist\//g, '/dist/')
    .replace(/href="(favicon\.[a-z]+|apple-touch-icon\.png)"/g, 'href="/$1"');

  const dest = path.join(ROOT, OUT[lang]);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  return { lang, dest: OUT[lang], bytes: Buffer.byteLength(html) };
}

/**
 * Sitemap : une entrée par langue, chacune déclarant ses alternates.
 * Depuis mai 2022 Google n'exploite plus que <image:loc> dans les
 * sitemaps images : title, caption et license sont ignorés.
 */
function buildSitemap() {
  const photos = Array.from({ length: 15 }, (_, i) =>
    SITE + '/images/gallery/solene-mangin-' + (i + 1) + '.webp');
  const lastmod = new Date().toISOString().slice(0, 10);

  const entries = LANGS.map((lang) => {
    const alts = LANGS
      .map((l) => '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + urlOf(l) + '"/>')
      .join('\n');
    const imgs = photos.map((u) => '    <image:image>\n      <image:loc>' + u + '</image:loc>\n    </image:image>').join('\n');
    return [
      '  <url>',
      '    <loc>' + urlOf(lang) + '</loc>',
      '    <lastmod>' + lastmod + '</lastmod>',
      alts,
      '    <xhtml:link rel="alternate" hreflang="x-default" href="' + urlOf('fr') + '"/>',
      imgs,
      '  </url>',
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    entries,
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  return { urls: LANGS.length, images: photos.length, lastmod };
}

const keyCount = checkParity(translations);
const results = LANGS.map(build);
const sm = buildSitemap();
const srcSize = Buffer.byteLength(raw);
console.log('Parité i18n : ' + keyCount + ' clés × ' + LANGS.length + ' langues');
console.log('Source : ' + (srcSize / 1024).toFixed(0) + ' Ko');
results.forEach((r) => {
  const pct = Math.round((1 - r.bytes / srcSize) * 100);
  console.log('  ' + r.dest.padEnd(15) + (r.bytes / 1024).toFixed(0).padStart(4) + ' Ko  (-' + pct + ' %)');
});
console.log('sitemap.xml : ' + sm.urls + ' URL, ' + sm.images + ' images, lastmod ' + sm.lastmod);
