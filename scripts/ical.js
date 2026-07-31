/**
 * Récupération et analyse du flux iCal Cocoonr, au moment du build.
 *
 * Sécurité : l'URL du flux contient un jeton qui vaut identifiant. Elle vit dans
 * la variable d'environnement `COCOONR_ICS_URL`, jamais dans le dépôt et jamais
 * dans le code livré au navigateur. Seule la liste anonyme des nuits occupées
 * est publiée : ni `SUMMARY` (qui porte les numéros de réservation), ni `UID`.
 *
 * Piège traité : `DTEND` est exclusif. `DTSTART:20260819 / DTEND:20260822`
 * décrit trois nuits, celles du 19, du 20 et du 21. Le 22 est un jour de départ,
 * donc disponible à l'arrivée. Le calendrier raisonne en nuits, pas en jours.
 *
 * Mode dégradé : toute erreur renvoie une liste vide. Le build ne doit jamais
 * échouer parce que Cocoonr est indisponible.
 */

const MONTHS_AHEAD = 12;

/** `20260819` -> `2026-08-19` */
function toIso(raw) {
  return raw.slice(0, 4) + '-' + raw.slice(4, 6) + '-' + raw.slice(6, 8);
}

/** Journée suivante, en ISO, sans dépendre du fuseau local. */
function nextDay(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Extrait les nuits occupées d'un contenu iCal.
 * @returns {string[]} dates ISO triées, sans doublon.
 */
function parseNights(ics, { from, monthsAhead = MONTHS_AHEAD } = {}) {
  // Le pliage iCal coupe les lignes longues et les poursuit par une espace.
  const text = ics.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n');
  const start = from || new Date().toISOString().slice(0, 10);
  const horizon = new Date(start + 'T00:00:00Z');
  horizon.setUTCMonth(horizon.getUTCMonth() + monthsAhead);
  const limit = horizon.toISOString().slice(0, 10);

  const nights = new Set();
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const s = block.match(/^DTSTART[^:\n]*:(\d{8})/m);
    const e = block.match(/^DTEND[^:\n]*:(\d{8})/m);
    if (!s || !e) continue;
    const end = toIso(e[1]); // exclusif : jour de départ, donc disponible
    for (let day = toIso(s[1]); day < end; day = nextDay(day)) {
      if (day >= start && day <= limit) nights.add(day);
    }
  }
  return [...nights].sort();
}

/** Regroupe des nuits isolées en plages contiguës, pour l'affichage. */
function toRanges(nights) {
  const ranges = [];
  nights.forEach((night) => {
    const last = ranges[ranges.length - 1];
    if (last && nextDay(last.end) === night) last.end = night;
    else ranges.push({ start: night, end: night });
  });
  // `end` est la dernière nuit occupée ; le départ a lieu le lendemain matin.
  return ranges.map((r) => ({ ...r, checkout: nextDay(r.end) }));
}

/**
 * Interroge le flux. Renvoie `{ nights, ranges, updatedAt }`, ou `null` si
 * aucune URL n'est configurée ou si la récupération échoue.
 */
async function fetchBookedNights(url = process.env.COCOONR_ICS_URL, now) {
  if (!url) return null;
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const body = await response.text();
    if (!body.includes('BEGIN:VCALENDAR')) throw new Error('Réponse non iCal');
    const from = (now || new Date()).toISOString().slice(0, 10);
    const nights = parseNights(body, { from });
    return { nights, ranges: toRanges(nights), updatedAt: from };
  } catch (error) {
    console.warn('Calendrier : flux indisponible (' + error.message + '), '
      + 'le sélecteur de dates fonctionne sans contrainte.');
    return null;
  }
}

module.exports = { parseNights, toRanges, fetchBookedNights, nextDay };
