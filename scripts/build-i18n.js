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
const { PAGES, CONTENT } = require('../src/pages');
const { fetchBookedNights } = require('./ical');

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
				t.classList.remove('border-gold', 'text-nightblue');
				t.classList.add('border-transparent', 'text-anthracite/50');
			});
			const panel = document.getElementById('guide-' + tab);
			const btn = document.querySelector('[data-guide-tab="' + tab + '"]');
			if (panel) panel.classList.remove('hidden');
			if (btn) {
				btn.classList.add('border-gold', 'text-nightblue');
				btn.classList.remove('border-transparent', 'text-anthracite/50');
			}
		}

		document.addEventListener('DOMContentLoaded', () => {
			switchGuideTab('gastro');
		});
	`;

const raw = fs.readFileSync(SRC, 'utf8');
const ICONS = path.join(ROOT, 'src', 'icons.svg');
if (!fs.existsSync(ICONS)) {
  throw new Error('src/icons.svg absent : lancer `npm run build:icons` d\'abord.');
}
const sprite = fs.readFileSync(ICONS, 'utf8').trim();
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

/** Applique le dictionnaire à tous les marqueurs `data-i18n*` du document. */
function applyTranslations($, t, lang) {
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
  // `data-i18n-data-<nom>` traduit l'attribut `data-<nom>` correspondant.
  $('*').each((_, el) => {
    Object.keys(el.attribs || {})
      .filter((a) => a.startsWith('data-i18n-data-'))
      .forEach((a) => {
        const k = el.attribs[a];
        const v = get(t, k);
        if (v === undefined) return missing.push(k);
        $(el).attr('data-' + a.slice('data-i18n-data-'.length), v);
      });
  });
  if (missing.length) {
    throw new Error('Clés manquantes en "' + lang + '" : ' + [...new Set(missing)].join(', '));
  }
}

/** Coche la langue courante dans le sélecteur et pointe chaque option sur sa page. */
function applyLangSwitcher($, lang, hrefOf) {
  $('#langTriggerCode').text(lang.toUpperCase());
  $('.lang-option').each((_, el) => {
    const optLang = $(el).attr('data-lang');
    const check = $(el).find('.lang-check');
    $(el).attr('href', hrefOf(optLang));
    if (optLang === lang) {
      check.removeClass('hidden');
      $(el).attr('aria-current', 'true');
    } else {
      check.addClass('hidden');
      $(el).removeAttr('aria-current');
    }
  });
  // Les raccourcis de langue du panneau mobile suivent la même règle.
  $('#mobileMenu a[hreflang]').each((_, el) => {
    $(el).attr('href', hrefOf($(el).attr('hreflang')));
  });
}

/** Le moteur i18n ne sert qu'à la source : les pages livrées sont monolingues. */
function replaceRuntime($) {
  let replaced = 0;
  $('script').each((_, el) => {
    const code = $(el).html();
    if (code && code.includes('const translations')) {
      $(el).text(RUNTIME);
      replaced += 1;
    }
  });
  if (replaced !== 1) throw new Error('Bloc i18n non remplacé (' + replaced + ' trouvé).');
}

/** Les marqueurs de traduction n'ont plus d'utilité dans les pages livrées. */
function stripI18nAttributes($) {
  $('*').each((_, el) => {
    Object.keys(el.attribs || {})
      .filter((a) => a.startsWith('data-i18n') || a === 'data-home-only')
      .forEach((a) => $(el).removeAttr(a));
  });
}

/** Chemins relatifs -> absolus, sinon /en/ et /quartier-charles-iii/ cassent tout. */
function absolutise(html) {
  return html
    .replace(/(?<!\/)images\//g, '/images/')
    .replace(/(?<!\/)dist\//g, '/dist/')
    .replace(/href="(favicon\.[a-z]+|apple-touch-icon\.png)"/g, 'href="/$1"');
}

/**
 * Dates déjà réservées, sous le formulaire de réservation.
 *
 * Sans flux disponible, l'emplacement et le bloc JSON sont retirés : le
 * sélecteur de dates continue de fonctionner sans contrainte. Le build ne doit
 * jamais échouer parce que Cocoonr est injoignable.
 */
function applyBookedCalendar($, t, lang, booked) {
  const slot = $('[data-booked-calendar]');
  if (!booked || !booked.ranges.length) {
    slot.remove();
    return;
  }

  const locale = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE' }[lang];
  const fmt = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

  const items = booked.ranges.map((r) => {
    // On affiche l'intervalle des nuits, pas le jour de départ : celui-ci
    // reste disponible à l'arrivée d'un séjour suivant.
    const label = r.start === r.end ? fmt(r.start) : fmt(r.start) + ' → ' + fmt(r.end);
    return '\n\t\t\t\t\t\t\t<li class="py-1">' + label + '</li>';
  }).join('');

  slot.html(
    '\n\t\t\t\t\t\t<h3 class="text-xs uppercase tracking-[0.2em] text-anthracite/60 font-semibold mb-3">'
    + t.booking.bookedTitle + '</h3>'
    + '\n\t\t\t\t\t\t<ul class="text-sm text-anthracite/70 divide-y divide-gray-200">' + items + '\n\t\t\t\t\t\t</ul>'
    + '\n\t\t\t\t\t\t<p class="mt-3 text-xs text-anthracite/60 leading-relaxed">' + t.booking.bookedNote + '</p>'
    + '\n\t\t\t\t\t\t<script type="application/json" id="bookedNights">'
    + JSON.stringify(booked.nights) + '</script>\n\t\t\t\t\t'
  );
}

function build(lang, booked) {
  const t = translations[lang];
  const $ = cheerio.load(raw, { decodeEntities: false });

  applyTranslations($, t, lang);
  applyBookedCalendar($, t, lang, booked);

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

  applyLangSwitcher($, lang, pathOf);

  // --- données structurées ---------------------------------------------
  const ld = $('script[type="application/ld+json"]');
  const data = JSON.parse(ld.html());
  const lodging = data.find((d) => d['@type'] === 'VacationRental');
  if (!lodging) throw new Error('Bloc VacationRental introuvable dans le JSON-LD.');
  lodging['@id'] = urlOf(lang) + '#logement';
  lodging.name = t.meta.ldName;
  lodging.description = t.meta.ldDescription;
  lodging.url = urlOf(lang);
  lodging.inLanguage = lang;
  lodging.employee['@id'] = urlOf(lang) + '#hote';
  lodging.makesOffer.itemOffered['@id'] = urlOf(lang) + '#logement';
  lodging.starRating.name = t.meta.ldStarRating;
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

  // --- maillage vers les pages éditoriales ------------------------------
  const strip = $('[data-pages-strip]');
  if (!strip.length) throw new Error('Emplacement [data-pages-strip] introuvable.');
  strip.html(pagesStrip(lang));

  replaceRuntime($);
  stripI18nAttributes($);

  // Sprite d'icônes, en tête de body : les <use href="#i-…"> le trouvent
  // sans requête réseau supplémentaire.
  $('body').prepend('\n\t' + sprite + '\n');

  const html = absolutise($.html());

  const dest = path.join(ROOT, OUT[lang]);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  return { lang, dest: OUT[lang], bytes: Buffer.byteLength(html) };
}

/* ---------------------------------------------------------------------------
   Pages éditoriales
   Trois contenus, quatre langues, douze URL. Le gabarit est la page d'accueil
   elle-même, débarrassée de ce qui lui est propre (`data-home-only`) : l'en-tête,
   le pied de page et les mentions légales restent donc identiques sans être
   dupliqués dans une seconde source.
--------------------------------------------------------------------------- */

const pageUrlOf = (lang, page) => urlOf(lang) + page.slug[lang] + '/';
const pageOutOf = (lang, page) => (lang === 'fr'
  ? path.join(page.slug[lang], 'index.html')
  : path.join(lang, page.slug[lang], 'index.html'));

/** Parité des pages : mêmes clés dans les quatre langues, sections comprises. */
function checkPagesParity() {
  const problems = [];
  const expected = ['metaTitle', 'metaDescription', 'eyebrow', 'h1', 'intro'];
  LANGS.forEach((lang) => {
    const block = CONTENT[lang];
    if (!block) return problems.push('  ' + lang + ' — bloc absent de src/pages.js');
    ['backHome', 'ctaTitle', 'ctaBody', 'ctaButton', 'readAlso', 'stripTitle'].forEach((k) => {
      if (!block.common || !block.common[k]) problems.push('  ' + lang + ' — common.' + k + ' manquante');
    });
    PAGES.forEach((page) => {
      const c = block[page.id];
      if (!c) return problems.push('  ' + lang + ' — page ' + page.id + ' absente');
      expected.forEach((k) => {
        if (!c[k]) problems.push('  ' + lang + '.' + page.id + ' — ' + k + ' manquante');
      });
      for (let i = 1; i <= page.sections; i += 1) {
        ['s' + i + 'Title', 's' + i + 'Body'].forEach((k) => {
          if (!c[k]) problems.push('  ' + lang + '.' + page.id + ' — ' + k + ' manquante');
        });
      }
      if (!page.slug[lang]) problems.push('  ' + lang + '.' + page.id + ' — slug manquant');
    });
  });
  if (problems.length) {
    throw new Error('Parité des pages éditoriales rompue\n' + problems.join('\n'));
  }
  return LANGS.length * PAGES.length;
}

const ORNAMENT = '<svg class="orn-whip orn-whip-center mb-8" viewBox="0 0 66 14" aria-hidden="true" focusable="false">'
  + '<path d="M1 10C10 10 11 3 21 3s10 8 20 8 11-7 21-7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
  + '<circle cx="63.5" cy="4" r="2.2" fill="currentColor"/></svg>';

/** Bandeau de la page d'accueil vers les trois pages éditoriales. */
function pagesStrip(lang) {
  const common = CONTENT[lang].common;
  const cards = PAGES.map((page) => {
    const c = CONTENT[lang][page.id];
    return '\n\t\t\t\t\t<a href="' + pathOf(lang) + page.slug[lang] + '/"'
      + ' class="group block bg-white border border-gray-200 p-6 hover:border-gold transition-colors">'
      + '\n\t\t\t\t\t\t<span class="block text-xs uppercase tracking-[0.2em] text-gold-text font-semibold mb-3">' + c.eyebrow + '</span>'
      + '\n\t\t\t\t\t\t<span class="block font-serif text-xl text-nightblue leading-snug mb-3">' + c.h1 + '</span>'
      + '\n\t\t\t\t\t\t<span class="block text-sm text-anthracite/70 leading-relaxed">' + c.intro + '</span>'
      + '\n\t\t\t\t\t</a>';
  }).join('');

  return '\n\t\t\t\t<h2 class="text-center text-xs uppercase tracking-[0.3em] text-anthracite/50 font-semibold mb-10">'
    + common.stripTitle + '</h2>'
    + '\n\t\t\t\t<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' + cards + '\n\t\t\t\t</div>\n\t\t\t';
}

function pageBody(lang, page) {
  const c = CONTENT[lang][page.id];
  const common = CONTENT[lang].common;
  const others = PAGES.filter((p) => p.id !== page.id);

  const sections = Array.from({ length: page.sections }, (_, i) => {
    const n = i + 1;
    return '\n\t\t\t\t<section class="mb-12">'
      + '\n\t\t\t\t\t<h2 class="text-2xl md:text-3xl font-serif text-nightblue mb-5">' + c['s' + n + 'Title'] + '</h2>'
      + '\n\t\t\t\t\t' + c['s' + n + 'Body']
      + '\n\t\t\t\t</section>';
  }).join('');

  const readAlso = others.map((p) => {
    const o = CONTENT[lang][p.id];
    return '\n\t\t\t\t\t<a href="' + pathOf(lang) + p.slug[lang] + '/" class="block bg-white border border-gray-200 p-6 hover:border-gold transition-colors">'
      + '\n\t\t\t\t\t\t<span class="block text-xs uppercase tracking-[0.2em] text-gold-text font-semibold mb-2">' + o.eyebrow + '</span>'
      + '\n\t\t\t\t\t\t<span class="block font-serif text-lg text-nightblue leading-snug">' + o.h1 + '</span>'
      + '\n\t\t\t\t\t</a>';
  }).join('');

  return [
    '\n\t\t<article>',
    '\n\t\t\t<header class="pt-32 md:pt-40 pb-16 bg-nightblue text-white">',
    '\n\t\t\t\t<div class="max-w-3xl mx-auto px-6 text-center">',
    '\n\t\t\t\t\t<span class="block text-xs uppercase tracking-[0.3em] text-gold-light font-semibold mb-4">' + c.eyebrow + '</span>',
    '\n\t\t\t\t\t<h1 class="text-3xl md:text-5xl font-serif leading-tight mb-6">' + c.h1 + '</h1>',
    '\n\t\t\t\t\t' + ORNAMENT,
    '\n\t\t\t\t\t<p class="text-white/80 text-lg leading-relaxed">' + c.intro + '</p>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</header>',
    '\n\n\t\t\t<div class="page-prose max-w-3xl mx-auto px-6 py-16 md:py-20 text-anthracite/80 text-lg">',
    sections,
    '\n\t\t\t</div>',
    '\n\n\t\t\t<aside class="bg-offwhite border-t border-gray-200 py-16">',
    '\n\t\t\t\t<div class="max-w-3xl mx-auto px-6">',
    '\n\t\t\t\t\t<h2 class="text-xs uppercase tracking-[0.3em] text-anthracite/50 font-semibold mb-6">' + common.readAlso + '</h2>',
    '\n\t\t\t\t\t<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">',
    readAlso,
    '\n\t\t\t\t\t</div>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</aside>',
    '\n\n\t\t\t<section class="py-20 bg-white border-t border-gray-200 text-center">',
    '\n\t\t\t\t<div class="max-w-2xl mx-auto px-6">',
    '\n\t\t\t\t\t<h2 class="text-2xl md:text-3xl font-serif text-nightblue mb-4">' + common.ctaTitle + '</h2>',
    '\n\t\t\t\t\t<p class="text-anthracite/70 mb-8 leading-relaxed">' + common.ctaBody + '</p>',
    '\n\t\t\t\t\t<a href="' + pathOf(lang) + '#booking" class="inline-block bg-gold text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-nightblue transition-colors duration-300">' + common.ctaButton + '</a>',
    '\n\t\t\t\t\t<p class="mt-6"><a href="' + pathOf(lang) + '" class="text-xs uppercase tracking-[0.15em] text-anthracite/60 hover:text-gold-text transition">' + common.backHome + '</a></p>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</section>',
    '\n\t\t</article>\n\t',
  ].join('');
}

function buildPage(lang, page) {
  const t = translations[lang];
  const c = CONTENT[lang][page.id];
  const $ = cheerio.load(raw, { decodeEntities: false });
  const url = pageUrlOf(lang, page);

  applyTranslations($, t, lang);

  // Ce qui n'appartient qu'à l'accueil : galerie, visionneuse, barre collante,
  // navigation à points, carte, sélecteur de dates, préchargement du héro.
  $('[data-home-only]').remove();

  $('html').attr('lang', lang);
  $('title').text(c.metaTitle);
  setMeta($, 'meta[name="description"]', c.metaDescription);
  $('link[rel="canonical"]').attr('href', url);

  setMeta($, 'meta[property="og:url"]', url);
  setMeta($, 'meta[property="og:title"]', c.metaTitle);
  setMeta($, 'meta[property="og:description"]', c.metaDescription);
  setMeta($, 'meta[property="og:image:alt"]', t.hero.imgAlt);
  setMeta($, 'meta[property="og:locale"]', OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocale = $('meta[property="og:locale"]');
  LANGS.filter((l) => l !== lang).forEach((l) => {
    ogLocale.after('\n\t<meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '">');
  });
  setMeta($, 'meta[name="twitter:title"]', c.metaTitle);
  setMeta($, 'meta[name="twitter:description"]', c.metaDescription);
  setMeta($, 'meta[name="twitter:image:alt"]', t.hero.imgAlt);

  // hreflang : ceux de cette page-ci, pas ceux de l'accueil.
  $('link[rel="alternate"][hreflang]').remove();
  let tags = LANGS.map((l) => '\n\t<link rel="alternate" hreflang="' + l + '" href="' + pageUrlOf(l, page) + '">').join('');
  tags += '\n\t<link rel="alternate" hreflang="x-default" href="' + pageUrlOf('fr', page) + '">';
  $('link[rel="canonical"]').after(tags);

  applyLangSwitcher($, lang, (l) => pathOf(l) + page.slug[l] + '/');

  // Balisage : la page est un contenu éditorial rattaché au logement, pas une
  // seconde fiche. On ne redéclare donc ni VacationRental ni FAQPage.
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url + '#page',
      url,
      name: c.metaTitle,
      description: c.metaDescription,
      inLanguage: lang,
      isPartOf: { '@type': 'WebSite', '@id': urlOf(lang) + '#site', url: urlOf(lang), name: 'Le 1901' },
      about: { '@id': urlOf(lang) + '#logement' },
      primaryImageOfPage: SITE + '/images/gallery/' + page.image + '.webp',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Le 1901', item: urlOf(lang) },
        { '@type': 'ListItem', position: 2, name: c.h1.replace(/<[^>]+>/g, ''), item: url },
      ],
    },
  ];
  $('script[type="application/ld+json"]').text('\n' + JSON.stringify(graph, null, '\t') + '\n\t');

  $('main#main').html(pageBody(lang, page));

  // Les ancres de l'en-tête et du pied de page visent des sections de l'accueil,
  // absentes ici : elles doivent repartir vers la page d'accueil de la langue.
  // `#main` (lien d'évitement) et `#i-…` (sprite) restent locaux.
  $('a[href^="#"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href === '#main' || href.startsWith('#i-')) return;
    $(el).attr('href', pathOf(lang) + href);
  });

  $('body').prepend('\n\t' + sprite + '\n');
  stripI18nAttributes($);
  replaceRuntime($);

  const html = absolutise($.html());
  const dest = path.join(ROOT, pageOutOf(lang, page));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  return { lang, dest: pageOutOf(lang, page), bytes: Buffer.byteLength(html) };
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

  function entry(loc, hrefs, images) {
    const alts = LANGS
      .map((l) => '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + hrefs[l] + '"/>')
      .join('\n');
    const imgs = images
      .map((u) => '    <image:image>\n      <image:loc>' + u + '</image:loc>\n    </image:image>')
      .join('\n');
    return [
      '  <url>',
      '    <loc>' + loc + '</loc>',
      '    <lastmod>' + lastmod + '</lastmod>',
      alts,
      '    <xhtml:link rel="alternate" hreflang="x-default" href="' + hrefs.fr + '"/>',
      imgs,
      '  </url>',
    ].filter((line) => line !== '').join('\n');
  }

  const homeHrefs = Object.fromEntries(LANGS.map((l) => [l, urlOf(l)]));
  const rows = LANGS.map((lang) => entry(urlOf(lang), homeHrefs, photos));

  // Les douze pages éditoriales, chacune avec ses trois alternatives.
  PAGES.forEach((page) => {
    const hrefs = Object.fromEntries(LANGS.map((l) => [l, pageUrlOf(l, page)]));
    LANGS.forEach((lang) => {
      rows.push(entry(pageUrlOf(lang, page), hrefs,
        [SITE + '/images/gallery/' + page.image + '.webp']));
    });
  });

  const entries = rows.join('\n');

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
  return { urls: rows.length, images: photos.length, lastmod };
}

async function main() {
  const keyCount = checkParity(translations);
  const pageCount = checkPagesParity();

  // Le flux iCal est facultatif : sans `COCOONR_ICS_URL`, `booked` vaut null et
  // le calendrier disparaît des pages, sans que rien d'autre ne change.
  const booked = await fetchBookedNights();

  const results = LANGS.map((lang) => build(lang, booked));
  const pageResults = LANGS.flatMap((lang) => PAGES.map((page) => buildPage(lang, page)));
  const sm = buildSitemap();
  const srcSize = Buffer.byteLength(raw);
  console.log('Parité i18n : ' + keyCount + ' clés × ' + LANGS.length + ' langues');
  console.log(booked
    ? 'Calendrier : ' + booked.nights.length + ' nuits occupées, ' + booked.ranges.length + ' séjours, relevé le ' + booked.updatedAt
    : 'Calendrier : aucun flux iCal configuré (COCOONR_ICS_URL), sélecteur sans contrainte');
  console.log('Source : ' + (srcSize / 1024).toFixed(0) + ' Ko');
  results.forEach((r) => {
    const pct = Math.round((1 - r.bytes / srcSize) * 100);
    console.log('  ' + r.dest.padEnd(34) + (r.bytes / 1024).toFixed(0).padStart(4) + ' Ko  (-' + pct + ' %)');
  });
  console.log('Pages éditoriales : ' + pageCount + ' (' + PAGES.length + ' contenus × ' + LANGS.length + ' langues)');
  pageResults.forEach((r) => {
    console.log('  ' + r.dest.padEnd(34) + (r.bytes / 1024).toFixed(0).padStart(4) + ' Ko');
  });
  console.log('sitemap.xml : ' + sm.urls + ' URL, lastmod ' + sm.lastmod);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
