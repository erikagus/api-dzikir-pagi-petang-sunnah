'use strict';
// Matches a book item to an entry of the reference file (kanglerian/api-dzikir-pagi-petang)
// by comparing Indonesian translations (+ title, Quran citation and hadith-collection overlap).
// This module never reads or produces Arabic itself; build.js copies the reference
// string byte-for-byte when (and only when) the match is "matched".

// Unicode-canonical comparison only (used to detect duplicate reference entries); never modifies strings.
const canon = (s) => (s || '').normalize('NFC');

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[`'’"]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter || 1);
}

const COLLECTIONS = ['bukhari', 'muslim', 'tirmidzi', 'abu dawud', 'ahmad', 'nasa', 'ibnu majah', 'hakim', 'ibnus sunni', 'darimi'];
function collectionsOf(text) {
  const t = (text || '').toLowerCase().replace(/tirmdzi/g, 'tirmidzi').replace(/abu daud/g, 'abu dawud');
  return COLLECTIONS.filter((c) => t.includes(c));
}

const titleKey = (t) =>
  norm(t).filter((w) => !['surat', 'membaca', 'dzikir', 'doa', 'pagi', 'petang', 'sore'].includes(w)).join(' ');

function titleMatches(bookTitle, refTitle) {
  const a = titleKey(bookTitle);
  const b = titleKey(refTitle);
  return !!a && !!b && (a === b || a.includes(b) || b.includes(a));
}

function quranCite(s) {
  const m = /(?:\[|QS\.\s*)([A-Za-z\- ]+?)\s*[\/:]/.exec(s || '');
  return m ? norm(m[1]).join('') : null;
}

/**
 * @param {{title:string, translation:string, source:string|null, quran_ref:string|null}} item
 * @param {Array} refList reference entries for the same collection
 */
function matchItem(item, refList) {
  const tt = norm(item.translation);
  const scored = refList
    .map((r) => {
      const j = jaccard(tt, norm(r.arti));
      const titleOk = titleMatches(item.title, r.judul);
      const bookQ = quranCite(item.quran_ref);
      const refQ = quranCite(r.dalil);
      const quranOk = !!bookQ && !!refQ && bookQ === refQ;
      const bc = collectionsOf(item.source);
      const rc = collectionsOf(r.dalil);
      // containment: every hadith collection named by the reference also appears in the book's rujukan
      const dalilOk = rc.length >= 2 && rc.every((c) => bc.includes(c));
      return { id: r.id, judul: r.judul, arab: r.arab, score: Number(j.toFixed(3)), titleOk, quranOk, dalilOk };
    })
    .sort((a, b) => b.score - a.score);
  const [best] = scored;
  // reference entries that carry the identical Arabic string are the same dzikir (e.g. duplicated tahlil)
  const sameArabic = scored.filter((s) => s !== best && canon(s.arab) === canon(best.arab)).map((s) => s.id);
  const second = scored.find((s) => s !== best && canon(s.arab) !== canon(best.arab));
  const margin = best.score - (second ? second.score : 0);
  const extra = [best.titleOk && 'title', best.quranOk && 'quran-citation', best.dalilOk && 'hadith-collections'].filter(Boolean);
  let status = 'unmatched';
  let confidence = 'low';
  if (best.score >= 0.5 && margin >= 0.2) {
    status = 'matched';
    confidence = 'high';
  } else if (best.score >= 0.38 && margin >= 0.12 && extra.length >= 1) {
    status = 'matched';
    confidence = 'high';
  } else if (best.score >= 0.3) {
    status = 'ambiguous';
    confidence = 'low';
  }
  return {
    status,
    confidence,
    best,
    margin: Number(margin.toFixed(3)),
    signals: ['translation', ...extra],
    alt_ids: sameArabic,
    candidates: scored.slice(0, 3).map((s) => ({ id: s.id, judul: s.judul, score: s.score })),
  };
}

module.exports = { matchItem, jaccard, norm, collectionsOf };
