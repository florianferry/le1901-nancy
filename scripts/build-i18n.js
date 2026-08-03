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
const { execFileSync } = require('child_process');
const cheerio = require('cheerio');
const { PAGES, CONTENT, HUB } = require('../src/pages');
const { fetchBookedNights } = require('./ical');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'index.src.html');
const SITE = 'https://le1901-nancy.fr';

const LANGS = ['fr', 'en', 'es', 'de'];
const OG_LOCALE = { fr: 'fr_FR', en: 'en_GB', es: 'es_ES', de: 'de_DE' };
const OUT = { fr: 'index.html', en: 'en/index.html', es: 'es/index.html', de: 'de/index.html' };
const urlOf = (l) => (l === 'fr' ? SITE + '/' : SITE + '/' + l + '/');
const pathOf = (l) => (l === 'fr' ? '/' : '/' + l + '/');

/* ---------------------------------------------------------------------------
   Dates de dernière modification.

   Le sitemap datait toutes les pages du jour du build, y compris celles dont
   le contenu n'avait pas bougé d'une virgule. Un `lastmod` qui saute à chaque
   déploiement finit par être ignoré, et le signal est perdu pour les pages qui
   changent vraiment.

   Deux sources, dans cet ordre : la page a-t-elle changé pendant ce build, et
   sinon, quand a-t-elle été committée pour la dernière fois. La première évite
   le décalage d'un cycle qu'aurait produit `git` seul, puisque le sitemap est
   écrit avant le commit qui l'accompagne.
--------------------------------------------------------------------------- */

const TODAY = new Date().toISOString().slice(0, 10);

/** Chemins réécrits par ce build, avec un contenu différent de l'existant. */
const touched = new Set();

/**
 * Date du dernier commit de chaque fichier suivi, en une seule passe.
 * `git log` sort en ordre antichronologique : la première occurrence d'un
 * chemin est donc la bonne. Hors dépôt git, la table est vide et tout
 * retombe sur la date du jour.
 */
function gitLastmodMap() {
  try {
    const log = execFileSync('git', ['log', '--format=%cs', '--name-only', '--no-renames'],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const dates = new Map();
    let current = null;
    for (const line of log.split('\n')) {
      if (line === '') continue;
      if (/^\d{4}-\d{2}-\d{2}$/.test(line)) { current = line; continue; }
      if (current && !dates.has(line)) dates.set(line, current);
    }
    return dates;
  } catch (error) {
    console.warn('Sitemap : historique git illisible (' + error.message
      + '), toutes les pages sont datées du jour.');
    return new Map();
  }
}

/**
 * Écrit une page et retient si son contenu a changé.
 * @param {string} out chemin relatif à la racine du dépôt
 */
function writePage(out, html) {
  const dest = path.join(ROOT, out);
  const previous = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
  if (previous !== html) touched.add(out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  return { dest: out, bytes: Buffer.byteLength(html) };
}

// Page hub du guide : une URL par langue, parente des dix pages éditoriales.
const hubPathOf = (l) => pathOf(l) + HUB.slug[l] + '/';
const hubUrlOf = (l) => SITE + hubPathOf(l);
const hubOutOf = (l) => (l === 'fr'
  ? path.join(HUB.slug[l], 'index.html')
  : path.join(l, HUB.slug[l], 'index.html'));

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
				t.classList.add('border-transparent', 'text-anthracite/70');
			});
			const panel = document.getElementById('guide-' + tab);
			const btn = document.querySelector('[data-guide-tab="' + tab + '"]');
			if (panel) panel.classList.remove('hidden');
			if (btn) {
				btn.classList.add('border-gold', 'text-nightblue');
				btn.classList.remove('border-transparent', 'text-anthracite/70');
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

/* ---------------------------------------------------------------------------
   Maillage interne : jetons de lien
   Les URL ne sont jamais écrites à la main dans le contenu. On écrit
   `[[page:weekend|itinéraire de deux jours]]` ou `[[home:#guide|carnet
   d'adresses]]`, et le build résout vers la bonne langue. Sans cela, un lien
   ajouté en français se retrouve tel quel dans les trois autres langues et
   pointe vers une page qui n'existe pas.
--------------------------------------------------------------------------- */

const LINK_TOKEN = /\[\[(page|home):([^|\]]+)\|([^\]]+)\]\]/g;

function resolveLinks(html, lang, where) {
  return String(html).replace(LINK_TOKEN, (_, kind, target, label) => {
    if (kind === 'home') {
      const anchor = target === '/' ? '' : target;
      return '<a href="' + pathOf(lang) + anchor + '">' + label + '</a>';
    }
    const page = PAGES.find((p) => p.id === target);
    if (!page) {
      throw new Error('Jeton de lien vers une page inconnue : "' + target + '" (' + where + ')');
    }
    return '<a href="' + pathOf(lang) + page.slug[lang] + '/">' + label + '</a>';
  });
}

const hasLinkToken = (value) => typeof value === 'string' && /\[\[(page|home):/.test(value);

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
    // Un jeton de lien dans une valeur texte s'afficherait tel quel : la clé
    // doit passer en `data-i18n-html` pour que le lien soit rendu.
    if (hasLinkToken(v)) {
      throw new Error('Jeton de lien dans une clé texte : ' + k + ' (' + lang + '). '
        + 'Passer le marqueur en data-i18n-html.');
    }
    $(el).text(v);
  });
  $('[data-i18n-html]').each((_, el) => {
    const k = $(el).attr('data-i18n-html');
    const v = get(t, k);
    if (v === undefined) return missing.push(k);
    $(el).html(resolveLinks(v, lang, lang + '.' + k));
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

/**
 * Habillage commun aux 48 pages : lien « Guide » de la barre supérieure et du
 * menu mobile, colonne du pied de page.
 *
 * Ces liens ne peuvent pas vivre en dur dans la source : l'adresse du hub
 * change de langue en langue, et une ancre `#` serait réécrite en ancre
 * d'accueil par `buildPage`. On pose donc un marqueur, résolu ici.
 */
function applyChrome($, lang) {
  const t = translations[lang];

  const hubLinks = $('[data-hub-link]');
  if (!hubLinks.length) throw new Error('Aucun marqueur [data-hub-link] dans la source.');
  hubLinks.attr('href', hubPathOf(lang));

  const slot = $('[data-pages-footer]');
  if (!slot.length) throw new Error('Emplacement [data-pages-footer] introuvable.');

  const items = PAGES.map((page) => '\n\t\t\t\t\t\t<li><a href="' + pathOf(lang) + page.slug[lang] + '/"'
    + ' class="hover:text-gold-text transition-colors">' + CONTENT[lang][page.id].eyebrow + '</a></li>').join('');

  slot.html(
    '\n\t\t\t\t\t<h2 class="text-xs uppercase tracking-[0.2em] text-white/70 font-semibold mb-5">'
    + t.footer.guideTitle + '</h2>'
    + '\n\t\t\t\t\t<ul class="flex flex-wrap justify-center gap-x-6 gap-y-3 text-white/50 normal-case tracking-normal">'
    + items + '\n\t\t\t\t\t</ul>'
    + '\n\t\t\t\t\t<p class="mt-5"><a href="' + hubPathOf(lang) + '"'
    + ' class="uppercase tracking-[0.1em] text-white/70 hover:text-gold-text transition-colors">'
    + t.footer.guideAll + '</a></p>\n\t\t\t\t'
  );
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
      .filter((a) => a.startsWith('data-i18n') || a === 'data-home-only'
        || a === 'data-hub-link' || a === 'data-pages-footer')
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
    '\n\t\t\t\t\t\t<h3 class="text-xs uppercase tracking-[0.2em] text-anthracite/70 font-semibold mb-3">'
    + t.booking.bookedTitle + '</h3>'
    + '\n\t\t\t\t\t\t<ul class="text-sm text-anthracite/70 divide-y divide-gray-200">' + items + '\n\t\t\t\t\t\t</ul>'
    + '\n\t\t\t\t\t\t<p class="mt-3 text-xs text-anthracite/70 leading-relaxed">' + t.booking.bookedNote + '</p>'
    + '\n\t\t\t\t\t\t<script type="application/json" id="bookedNights">'
    + JSON.stringify(booked.nights) + '</script>\n\t\t\t\t\t'
  );
}

function build(lang, booked) {
  const t = translations[lang];
  const $ = cheerio.load(raw, { decodeEntities: false });

  applyTranslations($, t, lang);
  applyChrome($, lang);
  applyBookedCalendar($, t, lang, booked);

  // --- en-tête ---------------------------------------------------------
  $('html').attr('lang', lang);
  $('title').text(t.meta.title);
  setMeta($, 'meta[name="description"]', t.meta.description);
  $('link[rel="canonical"]').attr('href', urlOf(lang));

  setMeta($, 'meta[property="og:url"]', urlOf(lang));
  setMeta($, 'meta[property="og:title"]', t.meta.ogTitle);
  setMeta($, 'meta[property="og:description"]', t.meta.ogDescription);
  setMeta($, 'meta[property="og:image:alt"]', t.meta.ogImageAlt);
  setMeta($, 'meta[property="og:locale"]', OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocale = $('meta[property="og:locale"]');
  LANGS.filter((l) => l !== lang).forEach((l) => {
    ogLocale.after('\n\t<meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '">');
  });

  setMeta($, 'meta[name="twitter:title"]', t.meta.twitterTitle);
  setMeta($, 'meta[name="twitter:description"]', t.meta.twitterDescription);
  setMeta($, 'meta[name="twitter:image:alt"]', t.meta.ogImageAlt);

  // hreflang : identiques sur les 4 pages, chacune se référençant elle-même
  $('link[rel="alternate"][hreflang]').remove();
  const anchor = $('link[rel="canonical"]');
  let tags = LANGS.map((l) => '\n\t<link rel="alternate" hreflang="' + l + '" href="' + urlOf(l) + '">').join('');
  // x-default sert les visiteurs dont la langue ne correspond à aucune version :
  // l'anglais leur parle plus que le français. Le trafic français arrive par hreflang="fr".
  tags += '\n\t<link rel="alternate" hreflang="x-default" href="' + urlOf('en') + '">';
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
  // Google attend les équipements sur l'`Accommodation` de `containsPlace`, pas
  // seulement sur le `VacationRental` : on y recopie la même liste localisée.
  lodging.containsPlace.amenityFeature = lodging.amenityFeature;

  // Les photographies sont créditées à Solène Mangin : `creator` pointe vers
  // le nœud Person du photographe, dont l'`@id` suit la langue comme les autres.
  lodging.image = lodging.image.map((img) => (typeof img === 'string' ? img : {
    ...img, creator: { '@id': urlOf(lang) + '#photographe' },
  }));

  const site = data.find((d) => d['@type'] === 'WebSite');
  site['@id'] = urlOf(lang) + '#site';
  site.url = urlOf(lang);
  site.inLanguage = lang;
  site.publisher['@id'] = urlOf(lang) + '#hote';

  const page = data.find((d) => d['@type'] === 'WebPage');
  page['@id'] = urlOf(lang) + '#page';
  page.url = urlOf(lang);
  page.name = t.meta.title;
  page.description = t.meta.description;
  page.inLanguage = lang;
  page.isPartOf['@id'] = urlOf(lang) + '#site';
  page.about['@id'] = urlOf(lang) + '#logement';

  const people = data.filter((d) => d['@type'] === 'Person');
  const person = people.find((d) => String(d['@id']).endsWith('#hote'));
  person['@id'] = urlOf(lang) + '#hote';
  person.url = urlOf(lang);
  person.worksFor['@id'] = urlOf(lang) + '#logement';

  const photographer = people.find((d) => String(d['@id']).endsWith('#photographe'));
  photographer['@id'] = urlOf(lang) + '#photographe';

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

  return { lang, ...writePage(OUT[lang], html) };
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
    ['backHome', 'breadcrumb', 'ctaTitle', 'ctaBody', 'ctaButton', 'readAlso', 'stripTitle'].forEach((k) => {
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
  const ids = new Set(PAGES.map((p) => p.id));
  PAGES.forEach((page) => {
    if (!Array.isArray(page.related) || !page.related.length) {
      problems.push('  ' + page.id + ' — `related` absent ou vide dans src/pages.js');
      return;
    }
    page.related.forEach((id) => {
      if (!ids.has(id)) problems.push('  ' + page.id + ' — related pointe vers "' + id + '", inconnu');
      if (id === page.id) problems.push('  ' + page.id + ' — related se référence lui-même');
    });
  });

  if (problems.length) {
    throw new Error('Parité des pages éditoriales rompue\n' + problems.join('\n'));
  }
  return LANGS.length * PAGES.length;
}

/**
 * Contrôles propres au hub : clés présentes dans les quatre langues, et surtout
 * couverture exacte. Une page absente de `groups` disparaîtrait du hub sans que
 * rien ne le signale ; une page citée deux fois y apparaîtrait deux fois.
 */
function checkHub() {
  const problems = [];
  const listed = HUB.groups.flatMap((g) => g.pages);
  const expected = ['metaTitle', 'metaDescription', 'eyebrow', 'h1', 'intro', 'outroTitle', 'outroBody'];

  PAGES.forEach((page) => {
    const n = listed.filter((id) => id === page.id).length;
    if (n === 0) problems.push('  ' + page.id + ' — absente de HUB.groups');
    if (n > 1) problems.push('  ' + page.id + ' — citée ' + n + ' fois dans HUB.groups');
  });
  const known = new Set(PAGES.map((p) => p.id));
  listed.filter((id) => !known.has(id)).forEach((id) => {
    problems.push('  HUB.groups cite "' + id + '", inconnu de PAGES');
  });

  LANGS.forEach((lang) => {
    if (!HUB.slug[lang]) problems.push('  ' + lang + ' — slug du hub manquant');
    const c = HUB.content[lang];
    if (!c) return problems.push('  ' + lang + ' — contenu du hub absent');
    expected.forEach((k) => {
      if (!c[k]) problems.push('  ' + lang + '.hub — ' + k + ' manquante');
    });
    HUB.groups.forEach((g) => {
      [g.id + 'Title', g.id + 'Body'].forEach((k) => {
        if (!c[k]) problems.push('  ' + lang + '.hub — ' + k + ' manquante');
      });
    });
  });

  // Le slug du hub ne doit pas entrer en collision avec une page éditoriale :
  // le second build écraserait silencieusement le premier.
  LANGS.forEach((lang) => {
    PAGES.filter((p) => p.slug[lang] === HUB.slug[lang]).forEach((p) => {
      problems.push('  ' + lang + ' — le slug du hub est déjà celui de ' + p.id);
    });
  });

  if (problems.length) throw new Error('Page hub invalide\n' + problems.join('\n'));
  return LANGS.length;
}

/**
 * Maillage interne : qui lie qui, en comptant les pages sources, pas les liens.
 *
 * Le compte porte sur le français, les quatre langues étant construites depuis
 * la même structure. La navigation, le pied de page et les ancres de section
 * sont exclus : ils ne disent rien de la thématique.
 */
function linkReport() {
  const inbound = Object.fromEntries([...PAGES.map((p) => p.id), 'home', 'hub'].map((id) => [id, new Set()]));
  const record = (from, html) => {
    String(html).replace(LINK_TOKEN, (_, kind, target) => {
      const id = kind === 'home' ? 'home' : target;
      if (inbound[id] && from !== id) inbound[id].add(from);
      return '';
    });
  };

  // Depuis l'accueil : le bandeau `#reading` et les liens en plein texte.
  PAGES.forEach((page) => inbound[page.id].add('home'));
  leafKeys(translations.fr).forEach((k) => record('home', get(translations.fr, k) || ''));

  // Depuis les pages éditoriales : `related` et les liens en plein texte.
  PAGES.forEach((page) => {
    const c = CONTENT.fr[page.id];
    page.related.forEach((id) => inbound[id].add(page.id));
    inbound.home.add(page.id); // fil d'Ariane et bouton de retour
    inbound.hub.add(page.id); // fil d'Ariane : le hub est le parent
    record(page.id, c.intro);
    for (let i = 1; i <= page.sections; i += 1) record(page.id, c['s' + i + 'Body']);
  });

  // Depuis le hub : les cartes de chaque groupe et les liens de leurs
  // paragraphes. Le lien de la barre supérieure et celui du pied de page ne
  // comptent pas ici : ils sont sur les 48 pages et ne disent rien du sujet.
  HUB.groups.flatMap((g) => g.pages).forEach((id) => inbound[id].add('hub'));
  inbound.home.add('hub');
  const hubContent = HUB.content.fr;
  record('hub', hubContent.intro);
  record('hub', hubContent.outroBody);
  HUB.groups.forEach((g) => record('hub', hubContent[g.id + 'Body']));

  return Object.entries(inbound).map(([id, from]) => ({ id, count: from.size, from: [...from] }));
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

  return '\n\t\t\t\t<h2 class="text-center text-xs uppercase tracking-[0.3em] text-anthracite/70 font-semibold mb-10">'
    + common.stripTitle + '</h2>'
    + '\n\t\t\t\t<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">' + cards + '\n\t\t\t\t</div>'
    + '\n\t\t\t\t<p class="text-center mt-10"><a href="' + hubPathOf(lang) + '"'
    + ' class="inline-block text-xs uppercase tracking-[0.2em] font-semibold text-nightblue border-b border-gold pb-1 hover:text-gold-text transition-colors">'
    + translations[lang].footer.guideAll + '</a></p>\n\t\t\t';
}

function pageBody(lang, page) {
  const c = CONTENT[lang][page.id];
  const common = CONTENT[lang].common;
  const link = (html, where) => resolveLinks(html, lang, lang + '.' + page.id + '.' + where);
  const plain = (html) => String(html).replace(/<[^>]+>/g, '');

  const sections = Array.from({ length: page.sections }, (_, i) => {
    const n = i + 1;
    return '\n\t\t\t\t<section class="mb-12">'
      + '\n\t\t\t\t\t<h2 class="text-2xl md:text-3xl font-serif text-nightblue mb-5">' + c['s' + n + 'Title'] + '</h2>'
      + '\n\t\t\t\t\t' + link(c['s' + n + 'Body'], 's' + n + 'Body')
      + '\n\t\t\t\t</section>';
  }).join('');

  // « À lire aussi » : l'ordre vient de `related`, pas de celui de PAGES, et
  // chaque carte porte une accroche plutôt qu'un titre seul.
  const readAlso = page.related.map((id) => {
    const p = PAGES.find((x) => x.id === id);
    const o = CONTENT[lang][id];
    return '\n\t\t\t\t\t<a href="' + pathOf(lang) + p.slug[lang] + '/" class="block bg-white border border-gray-200 p-6 hover:border-gold transition-colors">'
      + '\n\t\t\t\t\t\t<span class="block text-xs uppercase tracking-[0.2em] text-gold-text font-semibold mb-2">' + o.eyebrow + '</span>'
      + '\n\t\t\t\t\t\t<span class="block font-serif text-lg text-nightblue leading-snug mb-3">' + o.h1 + '</span>'
      + '\n\t\t\t\t\t\t<span class="block text-sm text-anthracite/70 leading-relaxed">' + o.intro + '</span>'
      + '\n\t\t\t\t\t</a>';
  }).join('');

  // Fil d'Ariane visible, calqué sur le BreadcrumbList du JSON-LD : un lien
  // montant de plus sur chaque page, et un balisage qui correspond à l'écran.
  // Le hub s'intercale entre l'accueil et la page : c'est ce qui fait de lui un
  // parent réel plutôt qu'une simple page de liens.
  const breadcrumb = '\n\t\t\t\t\t<nav aria-label="' + common.breadcrumb + '" class="mb-6 text-xs uppercase tracking-[0.15em] text-white/60">'
    + '\n\t\t\t\t\t\t<a href="' + pathOf(lang) + '" class="hover:text-gold-light transition-colors">Le 1901</a>'
    + '\n\t\t\t\t\t\t<span aria-hidden="true" class="text-white/50"> / </span>'
    + '\n\t\t\t\t\t\t<a href="' + hubPathOf(lang) + '" class="hover:text-gold-light transition-colors">' + HUB.content[lang].eyebrow + '</a>'
    + '\n\t\t\t\t\t\t<span aria-hidden="true" class="text-white/50"> / </span>'
    + '\n\t\t\t\t\t\t<span class="text-white/80">' + plain(c.h1) + '</span>'
    + '\n\t\t\t\t\t</nav>';

  return [
    '\n\t\t<article>',
    '\n\t\t\t<header class="pt-32 md:pt-40 pb-16 bg-nightblue text-white">',
    '\n\t\t\t\t<div class="max-w-3xl mx-auto px-6 text-center">',
    breadcrumb,
    '\n\t\t\t\t\t<span class="block text-xs uppercase tracking-[0.3em] text-gold-light font-semibold mb-4">' + c.eyebrow + '</span>',
    '\n\t\t\t\t\t<h1 class="text-3xl md:text-5xl font-serif leading-tight mb-6">' + c.h1 + '</h1>',
    '\n\t\t\t\t\t' + ORNAMENT,
    '\n\t\t\t\t\t<p class="text-white/80 text-lg leading-relaxed">' + link(c.intro, 'intro') + '</p>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</header>',
    '\n\n\t\t\t<div class="page-prose max-w-3xl mx-auto px-6 py-16 md:py-20 text-anthracite/80 text-lg">',
    sections,
    '\n\t\t\t</div>',
    '\n\n\t\t\t<aside class="bg-offwhite border-t border-gray-200 py-16">',
    '\n\t\t\t\t<div class="max-w-3xl mx-auto px-6">',
    '\n\t\t\t\t\t<h2 class="text-xs uppercase tracking-[0.3em] text-anthracite/70 font-semibold mb-6">' + common.readAlso + '</h2>',
    '\n\t\t\t\t\t<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">',
    readAlso,
    '\n\t\t\t\t\t</div>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</aside>',
    '\n\n\t\t\t<section class="py-20 bg-white border-t border-gray-200 text-center">',
    '\n\t\t\t\t<div class="max-w-2xl mx-auto px-6">',
    '\n\t\t\t\t\t<h2 class="text-2xl md:text-3xl font-serif text-nightblue mb-4">' + common.ctaTitle + '</h2>',
    '\n\t\t\t\t\t<p class="text-anthracite/70 mb-8 leading-relaxed">' + common.ctaBody + '</p>',
    '\n\t\t\t\t\t<a href="' + pathOf(lang) + '#booking" class="inline-block bg-gold text-nightblue px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-nightblue hover:text-white transition-colors duration-300">' + common.ctaButton + '</a>',
    '\n\t\t\t\t\t<p class="mt-6"><a href="' + pathOf(lang) + '" class="text-xs uppercase tracking-[0.15em] text-anthracite/70 hover:text-gold-text transition">' + common.backHome + '</a></p>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</section>',
    '\n\t\t</article>\n\t',
  ].join('');
}

/* ---------------------------------------------------------------------------
   Page hub du guide
   Même gabarit que les pages éditoriales, mais le corps est une liste groupée
   plutôt qu'une suite de sections. Chaque groupe porte un paragraphe qui lie
   ses pages en plein texte : sans lui, la page serait un annuaire de liens et
   n'aurait aucune raison d'être indexée.
--------------------------------------------------------------------------- */

/** Carte de page, réutilisée par le hub. Le même gabarit que « À lire aussi ». */
function pageCard(lang, id) {
  const p = PAGES.find((x) => x.id === id);
  const o = CONTENT[lang][id];
  return '\n\t\t\t\t\t\t<a href="' + pathOf(lang) + p.slug[lang] + '/" class="block bg-white border border-gray-200 p-6 hover:border-gold transition-colors">'
    + '\n\t\t\t\t\t\t\t<span class="block text-xs uppercase tracking-[0.2em] text-gold-text font-semibold mb-2">' + o.eyebrow + '</span>'
    + '\n\t\t\t\t\t\t\t<span class="block font-serif text-lg text-nightblue leading-snug mb-3">' + o.h1 + '</span>'
    + '\n\t\t\t\t\t\t\t<span class="block text-sm text-anthracite/70 leading-relaxed">' + o.intro + '</span>'
    + '\n\t\t\t\t\t\t</a>';
}

function hubBody(lang) {
  const c = HUB.content[lang];
  const common = CONTENT[lang].common;
  const link = (html, where) => resolveLinks(html, lang, lang + '.hub.' + where);

  const groups = HUB.groups.map((group) => '\n\t\t\t\t<section class="mb-14">'
    + '\n\t\t\t\t\t<h2 class="text-2xl md:text-3xl font-serif text-nightblue mb-5">' + c[group.id + 'Title'] + '</h2>'
    + '\n\t\t\t\t\t' + link(c[group.id + 'Body'], group.id + 'Body')
    + '\n\t\t\t\t\t<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">'
    + group.pages.map((id) => pageCard(lang, id)).join('')
    + '\n\t\t\t\t\t</div>'
    + '\n\t\t\t\t</section>').join('');

  const breadcrumb = '\n\t\t\t\t\t<nav aria-label="' + common.breadcrumb + '" class="mb-6 text-xs uppercase tracking-[0.15em] text-white/60">'
    + '\n\t\t\t\t\t\t<a href="' + pathOf(lang) + '" class="hover:text-gold-light transition-colors">Le 1901</a>'
    + '\n\t\t\t\t\t\t<span aria-hidden="true" class="text-white/50"> / </span>'
    + '\n\t\t\t\t\t\t<span class="text-white/80">' + c.eyebrow + '</span>'
    + '\n\t\t\t\t\t</nav>';

  return [
    '\n\t\t<article>',
    '\n\t\t\t<header class="pt-32 md:pt-40 pb-16 bg-nightblue text-white">',
    '\n\t\t\t\t<div class="max-w-3xl mx-auto px-6 text-center">',
    breadcrumb,
    '\n\t\t\t\t\t<span class="block text-xs uppercase tracking-[0.3em] text-gold-light font-semibold mb-4">' + c.eyebrow + '</span>',
    '\n\t\t\t\t\t<h1 class="text-3xl md:text-5xl font-serif leading-tight mb-6">' + c.h1 + '</h1>',
    '\n\t\t\t\t\t' + ORNAMENT,
    '\n\t\t\t\t\t<p class="text-white/80 text-lg leading-relaxed">' + link(c.intro, 'intro') + '</p>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</header>',
    '\n\n\t\t\t<div class="page-prose max-w-3xl mx-auto px-6 py-16 md:py-20 text-anthracite/80 text-lg">',
    groups,
    '\n\t\t\t\t<section>',
    '\n\t\t\t\t\t<h2 class="text-2xl md:text-3xl font-serif text-nightblue mb-5">' + c.outroTitle + '</h2>',
    '\n\t\t\t\t\t' + link(c.outroBody, 'outroBody'),
    '\n\t\t\t\t</section>',
    '\n\t\t\t</div>',
    '\n\n\t\t\t<section class="py-20 bg-white border-t border-gray-200 text-center">',
    '\n\t\t\t\t<div class="max-w-2xl mx-auto px-6">',
    '\n\t\t\t\t\t<h2 class="text-2xl md:text-3xl font-serif text-nightblue mb-4">' + common.ctaTitle + '</h2>',
    '\n\t\t\t\t\t<p class="text-anthracite/70 mb-8 leading-relaxed">' + common.ctaBody + '</p>',
    '\n\t\t\t\t\t<a href="' + pathOf(lang) + '#booking" class="inline-block bg-gold text-nightblue px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-nightblue hover:text-white transition-colors duration-300">' + common.ctaButton + '</a>',
    '\n\t\t\t\t\t<p class="mt-6"><a href="' + pathOf(lang) + '" class="text-xs uppercase tracking-[0.15em] text-anthracite/70 hover:text-gold-text transition">' + common.backHome + '</a></p>',
    '\n\t\t\t\t</div>',
    '\n\t\t\t</section>',
    '\n\t\t</article>\n\t',
  ].join('');
}

function buildHub(lang) {
  const t = translations[lang];
  const c = HUB.content[lang];
  const $ = cheerio.load(raw, { decodeEntities: false });
  const url = hubUrlOf(lang);

  applyTranslations($, t, lang);
  applyChrome($, lang);
  $('[data-home-only]').remove();

  $('html').attr('lang', lang);
  $('title').text(c.metaTitle);
  setMeta($, 'meta[name="description"]', c.metaDescription);
  $('link[rel="canonical"]').attr('href', url);

  setMeta($, 'meta[property="og:url"]', url);
  setMeta($, 'meta[property="og:title"]', c.metaTitle);
  setMeta($, 'meta[property="og:description"]', c.metaDescription);
  setMeta($, 'meta[property="og:image:alt"]', t.meta.ogImageAlt);
  setMeta($, 'meta[property="og:locale"]', OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocale = $('meta[property="og:locale"]');
  LANGS.filter((l) => l !== lang).forEach((l) => {
    ogLocale.after('\n\t<meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '">');
  });
  setMeta($, 'meta[name="twitter:title"]', c.metaTitle);
  setMeta($, 'meta[name="twitter:description"]', c.metaDescription);
  setMeta($, 'meta[name="twitter:image:alt"]', t.meta.ogImageAlt);

  $('link[rel="alternate"][hreflang]').remove();
  let tags = LANGS.map((l) => '\n\t<link rel="alternate" hreflang="' + l + '" href="' + hubUrlOf(l) + '">').join('');
  tags += '\n\t<link rel="alternate" hreflang="x-default" href="' + hubUrlOf('en') + '">';
  $('link[rel="canonical"]').after(tags);

  applyLangSwitcher($, lang, hubPathOf);

  // CollectionPage plutôt que WebPage : la page existe pour rassembler les dix
  // autres, et l'ItemList le dit dans l'ordre où elles sont présentées.
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': url + '#page',
      url,
      name: c.metaTitle,
      description: c.metaDescription,
      inLanguage: lang,
      isPartOf: { '@type': 'WebSite', '@id': urlOf(lang) + '#site', url: urlOf(lang), name: 'Le 1901' },
      about: { '@id': urlOf(lang) + '#logement' },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        contentUrl: SITE + '/images/gallery/' + HUB.image + '.webp',
        creator: { '@id': urlOf(lang) + '#photographe' },
        creditText: 'Solène Mangin',
        copyrightNotice: '© Solène Mangin',
      },
      mainEntity: { '@id': url + '#liste' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': urlOf(lang) + '#photographe',
      name: 'Solène Mangin',
      jobTitle: 'Photographe',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': url + '#liste',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: PAGES.length,
      itemListElement: HUB.groups.flatMap((g) => g.pages).map((id, i) => {
        const p = PAGES.find((x) => x.id === id);
        return {
          '@type': 'ListItem',
          position: i + 1,
          name: CONTENT[lang][id].h1.replace(/<[^>]+>/g, ''),
          url: urlOf(lang) + p.slug[lang] + '/',
        };
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Le 1901', item: urlOf(lang) },
        { '@type': 'ListItem', position: 2, name: c.eyebrow, item: url },
      ],
    },
  ];
  $('script[type="application/ld+json"]').text('\n' + JSON.stringify(graph, null, '\t') + '\n\t');

  $('main#main').html(hubBody(lang));

  $('a[href^="#"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href === '#main' || href.startsWith('#i-')) return;
    $(el).attr('href', pathOf(lang) + href);
  });

  $('body').prepend('\n\t' + sprite + '\n');
  stripI18nAttributes($);
  replaceRuntime($);

  const html = absolutise($.html());
  return { lang, ...writePage(hubOutOf(lang), html) };
}

/* ---------------------------------------------------------------------------
   Balisages propres à deux pages

   Deux contenus décrivent autre chose que le logement et méritent leur type :
   l'itinéraire de deux jours est un `TouristTrip`, le quartier est un `Place`.
   On s'en tient à ces deux-là. Déclarer un `TouristAttraction` pour chaque lieu
   cité sur chaque page produirait du bruit sans bénéfice.

   Les lieux sont nommés une fois ici, en français, parce que ce sont des noms
   propres : « Place Stanislas » ne se traduit pas.
--------------------------------------------------------------------------- */

const ITINERAIRE = [
  { name: 'Place Stanislas', sameAs: 'https://fr.wikipedia.org/wiki/Place_Stanislas' },
  { name: 'Musée de l’École de Nancy', sameAs: 'https://fr.wikipedia.org/wiki/Musée_de_l%27École_de_Nancy' },
  { name: 'Villa Majorelle', sameAs: 'https://fr.wikipedia.org/wiki/Villa_Majorelle' },
  { name: 'Parc de la Pépinière', sameAs: 'https://fr.wikipedia.org/wiki/Parc_de_la_Pépinière' },
  { name: 'Vieille Ville de Nancy' },
];

function pageExtras(lang, page, url) {
  const c = CONTENT[lang][page.id];
  const plain = (s) => String(s).replace(/<[^>]+>/g, '');

  if (page.id === 'weekend') {
    return [{
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      '@id': url + '#itineraire',
      name: plain(c.h1),
      description: c.metaDescription,
      inLanguage: lang,
      url,
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: ITINERAIRE.length,
        itemListElement: ITINERAIRE.map((lieu, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'TouristAttraction',
            name: lieu.name,
            ...(lieu.sameAs ? { sameAs: lieu.sameAs } : {}),
            address: {
              '@type': 'PostalAddress', addressLocality: 'Nancy', postalCode: '54100', addressCountry: 'FR',
            },
          },
        })),
      },
    }];
  }

  if (page.id === 'quartier') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Place',
        '@id': url + '#quartier',
        name: 'Quartier Charles III',
        description: c.metaDescription,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Nancy',
          addressRegion: 'Grand Est',
          postalCode: '54100',
          addressCountry: 'FR',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 48.6878, longitude: 6.1755 },
        containedInPlace: {
          '@type': 'City', name: 'Nancy', sameAs: 'https://fr.wikipedia.org/wiki/Nancy',
        },
      },
      // Rattachement du logement au quartier, sans redéclarer la fiche : seule
      // la relation est ajoutée au nœud existant, par son `@id`.
      {
        '@context': 'https://schema.org',
        '@id': urlOf(lang) + '#logement',
        containedInPlace: { '@id': url + '#quartier' },
      },
    ];
  }

  return [];
}

function buildPage(lang, page) {
  const t = translations[lang];
  const c = CONTENT[lang][page.id];
  const $ = cheerio.load(raw, { decodeEntities: false });
  const url = pageUrlOf(lang, page);

  applyTranslations($, t, lang);
  applyChrome($, lang);

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
  setMeta($, 'meta[property="og:image:alt"]', t.meta.ogImageAlt);
  setMeta($, 'meta[property="og:locale"]', OG_LOCALE[lang]);
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocale = $('meta[property="og:locale"]');
  LANGS.filter((l) => l !== lang).forEach((l) => {
    ogLocale.after('\n\t<meta property="og:locale:alternate" content="' + OG_LOCALE[l] + '">');
  });
  setMeta($, 'meta[name="twitter:title"]', c.metaTitle);
  setMeta($, 'meta[name="twitter:description"]', c.metaDescription);
  setMeta($, 'meta[name="twitter:image:alt"]', t.meta.ogImageAlt);

  // hreflang : ceux de cette page-ci, pas ceux de l'accueil.
  $('link[rel="alternate"][hreflang]').remove();
  let tags = LANGS.map((l) => '\n\t<link rel="alternate" hreflang="' + l + '" href="' + pageUrlOf(l, page) + '">').join('');
  tags += '\n\t<link rel="alternate" hreflang="x-default" href="' + pageUrlOf('en', page) + '">';
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
      primaryImageOfPage: {
        '@type': 'ImageObject',
        contentUrl: SITE + '/images/gallery/' + page.image + '.webp',
        creator: { '@id': urlOf(lang) + '#photographe' },
        creditText: 'Solène Mangin',
        copyrightNotice: '© Solène Mangin',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': urlOf(lang) + '#photographe',
      name: 'Solène Mangin',
      jobTitle: 'Photographe',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Le 1901', item: urlOf(lang) },
        { '@type': 'ListItem', position: 2, name: HUB.content[lang].eyebrow, item: hubUrlOf(lang) },
        { '@type': 'ListItem', position: 3, name: c.h1.replace(/<[^>]+>/g, ''), item: url },
      ],
    },
    ...pageExtras(lang, page, url),
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
  return { lang, ...writePage(pageOutOf(lang, page), html) };
}

/**
 * Sitemap : une entrée par langue, chacune déclarant ses alternates.
 * Depuis mai 2022 Google n'exploite plus que <image:loc> dans les
 * sitemaps images : title, caption et license sont ignorés.
 */
function buildSitemap() {
  const photos = Array.from({ length: 15 }, (_, i) =>
    SITE + '/images/gallery/solene-mangin-' + (i + 1) + '.webp');

  const committed = gitLastmodMap();
  const dated = new Set();

  /** Une page modifiée aujourd'hui porte la date du jour, les autres celle de git. */
  function lastmodOf(out) {
    if (touched.has(out)) {
      dated.add(out);
      return TODAY;
    }
    return committed.get(out) || TODAY;
  }

  function entry(loc, out, hrefs, images) {
    const lastmod = lastmodOf(out);
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
      '    <xhtml:link rel="alternate" hreflang="x-default" href="' + hrefs.en + '"/>',
      imgs,
      '  </url>',
    ].filter((line) => line !== '').join('\n');
  }

  const homeHrefs = Object.fromEntries(LANGS.map((l) => [l, urlOf(l)]));
  const rows = LANGS.map((lang) => entry(urlOf(lang), OUT[lang], homeHrefs, photos));

  // Le hub, juste après l'accueil : c'est le parent des dix pages qui suivent.
  const hubHrefs = Object.fromEntries(LANGS.map((l) => [l, hubUrlOf(l)]));
  LANGS.forEach((lang) => {
    rows.push(entry(hubUrlOf(lang), hubOutOf(lang), hubHrefs,
      [SITE + '/images/gallery/' + HUB.image + '.webp']));
  });

  // Les douze pages éditoriales, chacune avec ses trois alternatives.
  PAGES.forEach((page) => {
    const hrefs = Object.fromEntries(LANGS.map((l) => [l, pageUrlOf(l, page)]));
    LANGS.forEach((lang) => {
      rows.push(entry(pageUrlOf(lang, page), pageOutOf(lang, page), hrefs,
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
  return { urls: rows.length, images: photos.length, dated: dated.size };
}

async function main() {
  const keyCount = checkParity(translations);
  const pageCount = checkPagesParity();
  const hubCount = checkHub();

  // Le flux iCal est facultatif : sans `COCOONR_ICS_URL`, `booked` vaut null et
  // le calendrier disparaît des pages, sans que rien d'autre ne change.
  const booked = await fetchBookedNights();

  const results = LANGS.map((lang) => build(lang, booked));
  const hubResults = LANGS.map((lang) => buildHub(lang));
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
  console.log('Page hub du guide : ' + hubCount + ' langues, ' + PAGES.length + ' pages listées');
  hubResults.forEach((r) => {
    console.log('  ' + r.dest.padEnd(34) + (r.bytes / 1024).toFixed(0).padStart(4) + ' Ko');
  });
  console.log('Pages éditoriales : ' + pageCount + ' (' + PAGES.length + ' contenus × ' + LANGS.length + ' langues)');
  pageResults.forEach((r) => {
    console.log('  ' + r.dest.padEnd(34) + (r.bytes / 1024).toFixed(0).padStart(4) + ' Ko');
  });
  console.log('sitemap.xml : ' + sm.urls + ' URL, ' + sm.dated + ' datée(s) du jour ('
    + TODAY + '), le reste à la date de son dernier commit');

  // Maillage : pages sources distinctes, hors navigation et pied de page.
  // La cible du plan SEO est 5 sources minimum par page éditoriale ; elle ne
  // sera atteignable qu'avec les pages du lot B.
  console.log('Maillage interne (pages sources distinctes, hors navigation) :');
  linkReport()
    .sort((a, b) => b.count - a.count)
    .forEach((r) => {
      const flag = r.count >= 5 ? '' : '  ← sous la cible de 5';
      console.log('  ' + (r.id === 'home' ? 'accueil' : r.id).padEnd(10)
        + String(r.count).padStart(2) + '  ← ' + r.from.join(', ') + flag);
    });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
