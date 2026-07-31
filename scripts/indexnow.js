#!/usr/bin/env node
/**
 * Soumet les URL du sitemap au protocole IndexNow.
 *
 * IndexNow prévient Bing, Yandex, Seznam et Naver qu'une page a changé, au lieu
 * d'attendre leur passage. Google ne participe pas au protocole : ce script ne
 * remplace donc rien côté Search Console, il couvre les autres moteurs.
 *
 * La propriété du domaine est prouvée par le fichier `<clé>.txt` servi à la
 * racine. Sa suppression casse la soumission (403), pas le site.
 *
 * Usage :
 *   node scripts/indexnow.js            toutes les URL du sitemap
 *   node scripts/indexnow.js /en/ /de/  seulement ces chemins
 *   node scripts/indexnow.js --dry-run  affiche la charge utile sans l'envoyer
 *
 * À lancer après déploiement, jamais avant : les moteurs récupèrent les pages
 * dans la foulée de l'appel.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://le1901-nancy.fr';
const HOST = 'le1901-nancy.fr';
const KEY = '00b0fabe76fc01fba926f3761d8095ec';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const paths = args.filter((a) => !a.startsWith('--'));

  // Le fichier clé doit exister en local avant d'exister en ligne : cette
  // vérification attrape l'oubli le plus courant, le renommage de la clé.
  const keyFile = path.join(ROOT, KEY + '.txt');
  if (!fs.existsSync(keyFile)) {
    throw new Error('Fichier clé absent : ' + KEY + '.txt doit être servi à la racine du site');
  }
  if (fs.readFileSync(keyFile, 'utf8').trim() !== KEY) {
    throw new Error('Le contenu de ' + KEY + '.txt ne correspond pas à la clé');
  }

  const urlList = paths.length
    ? paths.map((p) => (p.startsWith('http') ? p : SITE + (p.startsWith('/') ? p : '/' + p)))
    : sitemapUrls();

  if (!urlList.length) throw new Error('Aucune URL à soumettre');
  if (urlList.length > 10000) throw new Error('IndexNow plafonne à 10 000 URL par appel');

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: SITE + '/' + KEY + '.txt',
    urlList,
  };

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n--dry-run : rien n\'a été envoyé (' + urlList.length + ' URL)');
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  // 200 et 202 valent acceptation ; 202 signale que la clé n'est pas encore
  // vérifiée, ce qui se résout tout seul dès que le fichier est en ligne.
  const body = await response.text();
  if (response.status !== 200 && response.status !== 202) {
    throw new Error('IndexNow a répondu ' + response.status + ' ' + response.statusText
      + (body ? ' : ' + body.slice(0, 300) : ''));
  }

  console.log('IndexNow : ' + urlList.length + ' URL soumises, réponse ' + response.status
    + (response.status === 202 ? ' (clé en cours de vérification)' : ''));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
