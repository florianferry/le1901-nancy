#!/usr/bin/env node
/**
 * Contrôle éditorial des pages de `src/pages.js`.
 *
 * `scripts/build-i18n.js` vérifie que les champs *existent* : parité des clés,
 * slugs, `related` valides, jetons de lien résolvables. Il ne regarde jamais ce
 * qu'ils *contiennent*. Ce script comble ce trou, et applique les règles du
 * §3.4 de `PLAN-SEO-2026-08.md` plus la typographie française.
 *
 *   npm run check            rapport complet, sort en échec sur les erreurs
 *   npm run check -- --strict  les avertissements deviennent des erreurs
 *
 * Un avertissement signale ce qui est discutable. Une erreur signale ce qui est
 * cassé et se voit à l'écran ou dans les SERP.
 *
 * Il n'existe pas de marqueur de fait en attente. Un fait dont on n'est pas sûr
 * ne se publie pas assorti d'une réserve entre crochets, visible du visiteur :
 * il se vérifie avant, ou il ne s'écrit pas.
 */

const fs = require('fs');
const path = require('path');
const { PAGES, CONTENT } = require('../src/pages');

const ROOT = path.join(__dirname, '..');
const LANGS = ['fr', 'en', 'es', 'de'];
const STRICT = process.argv.includes('--strict');

/* --------------------------------------------------------------------------
   Seuils. Le français fait référence : c'est la langue de rédaction, les
   trois autres sont des adaptations et tolèrent un écart de longueur.
-------------------------------------------------------------------------- */
const MIN_WORDS = { fr: 900, en: 850, es: 850, de: 850 };
const MAX_META_TITLE = 80;
const MAX_META_DESC = 160;
const MIN_META_DESC = 110;
const INTRO_MIN = 20;      // en dessous, l'intro n'a rien répondu
const INTRO_CONFORT = 70;  // au-delà, la réponse commence à se diluer
const INTRO_MAX = 100;     // la règle dure du §3.4 : la réponse dans les 100 premiers mots
const MIN_INTEXT_LINKS = 3;
const MIN_TABLES = 1;
const DUP_MIN_CHARS = 60;

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(where.padEnd(26) + ' ' + msg);
const warn = (where, msg) => warnings.push(where.padEnd(26) + ' ' + msg);

/* -------------------------------------------------------------------------- */

/** Remplace `[[page:x|libellé]]` par son libellé : le lecteur voit le libellé. */
const unlink = (h) => String(h).replace(/\[\[(?:page|home):[^|\]]+\|([^\]]+)\]\]/g, '$1');

/** Texte nu, tel qu'il sera lu à l'écran. */
const plain = (h) => unlink(h).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const words = (h) => (plain(h) ? plain(h).split(' ').length : 0);

/** Corps complet d'une page : intro + toutes les sections. */
function fullBody(page, lang) {
  const c = CONTENT[lang][page.id];
  let out = c.intro || '';
  for (let i = 1; i <= page.sections; i += 1) {
    out += ' ' + (c['s' + i + 'Title'] || '') + ' ' + (c['s' + i + 'Body'] || '');
  }
  return out;
}

/* --------------------------------------------------------------------------
   1. Longueur des métas et de l'intro
-------------------------------------------------------------------------- */
function checkMeta(page, lang, c, where) {
  if (c.metaTitle.length > MAX_META_TITLE) {
    err(where, 'metaTitle ' + c.metaTitle.length + ' caractères, maximum ' + MAX_META_TITLE);
  }
  if (c.metaDescription.length > MAX_META_DESC) {
    err(where, 'metaDescription ' + c.metaDescription.length + ' caractères, maximum ' + MAX_META_DESC);
  } else if (c.metaDescription.length < MIN_META_DESC) {
    warn(where, 'metaDescription ' + c.metaDescription.length + ' caractères, courte (cible ' + MIN_META_DESC + ' à ' + MAX_META_DESC + ')');
  }

  // La réponse doit tenir dans les cent premiers mots : une intro qui déborde
  // est une mise en bouche, une intro trop courte n'a rien répondu.
  const n = words(c.intro);
  if (n < INTRO_MIN) {
    err(where, 'intro de ' + n + ' mots, trop courte pour répondre (minimum ' + INTRO_MIN + ')');
  } else if (n > INTRO_MAX) {
    err(where, 'intro de ' + n + ' mots, la réponse sort des ' + INTRO_MAX + ' premiers mots');
  } else if (n > INTRO_CONFORT) {
    warn(where, 'intro de ' + n + ' mots, au-delà de ' + INTRO_CONFORT + ' la réponse se dilue');
  }
}

/* --------------------------------------------------------------------------
   2. Volume rédactionnel
-------------------------------------------------------------------------- */
function checkVolume(page, lang, where) {
  const n = words(fullBody(page, lang));
  if (n < MIN_WORDS[lang]) {
    err(where, n + ' mots, plancher ' + MIN_WORDS[lang]);
  }
}

/* --------------------------------------------------------------------------
   3. Tableaux : présence, et surtout cohérence des colonnes.
   Une ligne qui n'a pas le même nombre de cellules que les autres décale tout
   le tableau à l'écran sans rien casser au build.
-------------------------------------------------------------------------- */
function checkTables(page, lang, where) {
  const body = fullBody(page, lang);
  const tables = body.match(/<table>[\s\S]*?<\/table>/g) || [];
  if (tables.length < MIN_TABLES) {
    err(where, 'aucun tableau, le §3.4 en demande au moins ' + MIN_TABLES);
  }
  tables.forEach((tb, i) => {
    const rows = (tb.match(/<tr>[\s\S]*?<\/tr>/g) || []).map((r) => (r.match(/<t[hd]>/g) || []).length);
    const shapes = [...new Set(rows)];
    if (shapes.length > 1) {
      err(where, 'tableau ' + (i + 1) + ' : lignes à ' + shapes.join(' et ') + ' cellules');
    }
    if (!/<th>/.test(tb)) {
      warn(where, 'tableau ' + (i + 1) + ' sans ligne d’en-tête <th>');
    }
    // Un en-tête « Distance » qui contient des minutes est une colonne mal
    // remplie : c'est l'erreur qui est passée en production sur `stanislas`.
    const head = (tb.match(/<th>([^<]*)<\/th>/g) || []).map((h) => h.replace(/<\/?th>/g, '').toLowerCase());
    const cells = (tb.match(/<tr>[\s\S]*?<\/tr>/g) || []).slice(1)
      .map((r) => (r.match(/<td>([^<]*)<\/td>/g) || []).map((d) => d.replace(/<\/?td>/g, '')));
    head.forEach((h, col) => {
      if (!/^(distance|entfernung|distancia)$/.test(h.trim())) return;
      cells.forEach((row) => {
        const v = (row[col] || '').toLowerCase();
        if (v && /\b(min|minute|std|h)\b/.test(v) && !/\b(m|km|ft|mi)\b/.test(v)) {
          err(where, 'colonne « ' + h.trim() + ' » contient une durée : « ' + row[col] + ' »');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. Maillage sortant en plein texte
-------------------------------------------------------------------------- */
function checkLinks(page, lang, where) {
  const body = fullBody(page, lang);
  const tokens = body.match(/\[\[(?:page|home):[^|\]]+\|[^\]]+\]\]/g) || [];
  if (tokens.length < MIN_INTEXT_LINKS) {
    err(where, tokens.length + ' lien(s) en plein texte, minimum ' + MIN_INTEXT_LINKS);
  }
  // Une URL écrite à la main casse les trois autres langues.
  if (/<a\s+href=/i.test(body)) {
    err(where, 'URL en dur dans le corps, utiliser un jeton [[page:…|…]]');
  }
  const generic = tokens.filter((t) => /\|(ici|cliquez ici|en savoir plus|here|click here|aquí|hier)\]\]$/i.test(t));
  if (generic.length) {
    err(where, 'ancre non descriptive : ' + generic.join(', '));
  }
}

/* --------------------------------------------------------------------------
   5. Typographie. Les règles à espace insécable ne valent qu'en français.
-------------------------------------------------------------------------- */
function checkTypography(page, lang, where) {
  const body = fullBody(page, lang);
  const text = unlink(body).replace(/<[^>]+>/g, ''); // hors balises : les attributs portent des "

  if (text.includes('—')) err(where, 'tiret cadratin dans le corps');
  if (text.includes("'")) err(where, 'apostrophe droite, attendu ’');
  if (text.includes('...')) err(where, 'points de suspension en trois points, attendu …');
  if (/"/.test(text)) err(where, 'guillemet droit dans le texte');

  if (lang === 'fr') {
    const tight = text.match(/[^ \s][:;!?»]/g) || [];
    if (tight.length) {
      err(where, 'espace insécable manquante avant ' + [...new Set(tight.map((m) => m.slice(-1)))].join(' '));
    }
    if (/«[^ ]/.test(text)) err(where, 'espace insécable manquante après «');
    // Nombre suivi d'une unité abrégée : 500 m, 6 min, 22 h, 80 %.
    const loose = text.match(/\d+ (m²|m|km|min|h|%)\b/g) || [];
    if (loose.length) {
      warn(where, 'espace sécable entre nombre et unité : ' + [...new Set(loose)].slice(0, 5).join(', '));
    }
  }
}

/* --------------------------------------------------------------------------
   6. Balises équilibrées : le gabarit injecte le corps tel quel, une balise
   non refermée déborde sur la section suivante.
-------------------------------------------------------------------------- */
function checkMarkup(page, lang, where) {
  const body = fullBody(page, lang);
  ['p', 'table', 'tr', 'td', 'th', 'div', 'ul', 'li', 'sup'].forEach((tag) => {
    const open = (body.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>', 'g')) || []).length;
    const close = (body.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (open !== close) err(where, '<' + tag + '> : ' + open + ' ouvrante(s) pour ' + close + ' fermante(s)');
  });
  // Un tableau hors conteneur déborde sur mobile.
  const bare = body.replace(/<div class="t-scroll"><table>/g, '');
  if (/<table>/.test(bare)) warn(where, 'tableau hors conteneur .t-scroll, débordera sur mobile');
}

/* --------------------------------------------------------------------------
   8. Cohérence de langue.
   Un bloc de traduction collé dans la mauvaise langue passe tous les autres
   contrôles : les clés sont là, les slugs sont là, le build est vert, et la
   page part en production dans la mauvaise langue. C'est arrivé sur
   `fr.manger`, rédigé en allemand. On compte les mots outils de chaque langue
   et on vérifie que le bloc ressemble bien à la langue qu'il déclare.
-------------------------------------------------------------------------- */
const MARKERS = {
  fr: /\b(le|la|les|des|une|dans|pour|avec|vous|est|qui|sur|plus|sont|leur)\b/gi,
  en: /\b(the|and|with|from|your|that|which|there|about|between|is|are)\b/gi,
  es: /\b(el|la|los|las|una|para|con|que|desde|está|más|son|donde)\b/gi,
  de: /\b(der|die|das|und|mit|von|sich|nicht|eine|zum|ist|liegt|sind)\b/gi,
};

function checkLanguage(page, lang, c, where) {
  const text = plain(c.h1 + ' ' + fullBody(page, lang));
  const scores = Object.entries(MARKERS)
    .map(([k, re]) => [k, (text.match(re) || []).length])
    .sort((a, b) => b[1] - a[1]);
  const [best, bestScore] = scores[0];
  const mine = (scores.find(([k]) => k === lang) || [lang, 0])[1];
  if (best !== lang && bestScore > mine * 2) {
    err(where, 'bloc rédigé en « ' + best +' » (' + bestScore + ' marqueurs contre ' + mine + ')');
  }
}

/* --------------------------------------------------------------------------
   9. Doublons entre pages : deux pages qui portent la même phrase se
   cannibalisent, et les modèles ne citent pas un contenu interchangeable.
-------------------------------------------------------------------------- */
function checkDuplicates() {
  LANGS.forEach((lang) => {
    const seen = new Map();
    PAGES.forEach((page) => {
      const body = fullBody(page, lang);
      plain(body).split(/(?<=\.)\s+/).forEach((sentence) => {
        const k = sentence.trim();
        if (k.length < DUP_MIN_CHARS) return;
        if (!seen.has(k)) seen.set(k, new Set());
        seen.get(k).add(page.id);
      });
    });
    [...seen.entries()].filter(([, ids]) => ids.size > 1).forEach(([sentence, ids]) => {
      err(lang + '/' + [...ids].join('+'), 'phrase identique sur ' + ids.size + ' pages : « ' + sentence.slice(0, 60) + '… »');
    });
  });
}

/* --------------------------------------------------------------------------
   9. `llms.txt` ne doit pas dériver (§7.1 du plan)
-------------------------------------------------------------------------- */
function checkLlms() {
  const f = path.join(ROOT, 'llms.txt');
  if (!fs.existsSync(f)) return warn('llms.txt', 'fichier absent');
  const txt = fs.readFileSync(f, 'utf8');
  PAGES.forEach((page) => {
    if (!txt.includes('/' + page.slug.fr + '/')) {
      err('llms.txt', 'page « ' + page.id +' » absente (' + page.slug.fr + ')');
    }
  });

  // La note et le nombre d'avis du JSON-LD de l'accueil font foi : un llms.txt
  // resté sur l'ancienne note ferait répéter un chiffre faux aux assistants IA.
  const src = fs.readFileSync(path.join(ROOT, 'src', 'index.src.html'), 'utf8');
  const rating = src.match(/"AggregateRating",[^}]*?"ratingValue":\s*([\d.]+)[^}]*?"reviewCount":\s*(\d+)/);
  if (!rating) return warn('llms.txt', 'AggregateRating introuvable dans src/index.src.html');
  const [, value, count] = rating;
  const fr = value.replace('.', ',') + ' sur 5, sur ' + count + ' avis';
  const en = value + ' out of 5 on ' + count + ' ';
  if (!txt.includes(fr)) err('llms.txt', 'note absente ou périmée, attendu « ' + fr + ' »');
  if (!txt.includes(en)) err('llms.txt', 'note anglaise absente ou périmée, attendu « ' + en + '»');
}

/* -------------------------------------------------------------------------- */

PAGES.forEach((page) => {
  LANGS.forEach((lang) => {
    const c = CONTENT[lang] && CONTENT[lang][page.id];
    if (!c) return; // la parité est déjà contrôlée par le build
    const where = lang + '/' + page.id;
    checkMeta(page, lang, c, where);
    checkVolume(page, lang, where);
    checkTables(page, lang, where);
    checkLinks(page, lang, where);
    checkTypography(page, lang, where);
    checkMarkup(page, lang, where);
    checkLanguage(page, lang, c, where);
  });
});
checkDuplicates();
checkLlms();

/* -------------------------------------------------------------------------- */

const promoted = STRICT ? warnings : [];
const finalErrors = errors.concat(promoted);

if (warnings.length && !STRICT) {
  console.log('\nAvertissements (' + warnings.length + ')');
  warnings.sort().forEach((w) => console.log('  ' + w));
}
if (finalErrors.length) {
  console.log('\nErreurs (' + finalErrors.length + ')');
  finalErrors.sort().forEach((e) => console.log('  ' + e));
  console.log('\n' + finalErrors.length + ' erreur(s), ' + (STRICT ? 0 : warnings.length) + ' avertissement(s).');
  process.exit(1);
}
console.log('\nContrôle éditorial : ' + PAGES.length + ' contenus × ' + LANGS.length + ' langues, aucune erreur.'
  + (warnings.length ? ' ' + warnings.length + ' avertissement(s).' : ''));
