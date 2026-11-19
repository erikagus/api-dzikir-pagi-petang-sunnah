'use strict';
// Maps the book's structure (pdf pages -> items) and assembles raw parsed items.
const P = require('./parse-book');

// [key, pdfPages, options]
const PAGI = [
  ['ayat-kursi', [10, 11], { taawudz: true }],
  ['al-ikhlas', [12]],
  ['al-falaq', [13]],
  ['an-naas', [14]],
  ['dzikir-i', [15]],
  ['dzikir-ii', [16]],
  ['dzikir-iii', [17]],
  ['dzikir-iv', [18, 19]],
  ['sayyidul-istighfar', [20, 21]],
  ['dzikir-vi', [22, 23]],
  ['dzikir-vii', [24]],
  ['dzikir-viii', [25]],
  ['dzikir-ix', [26]],
  ['dzikir-x', [27]],
  ['dzikir-xi+dzikir-xii', [28], { split: true }],
  ['dzikir-xiii', [29], { latinQuoted: true }],
  ['dzikir-xiv', [30], { latinQuoted: true }],
];
const PETANG = [
  ['ayat-kursi', [32, 33], { taawudz: true }],
  ['al-ikhlas', [34]],
  ['al-falaq', [35]],
  ['an-naas', [36]],
  ['dzikir-i', [37]],
  ['dzikir-ii', [38]],
  ['dzikir-iii', [39]],
  ['dzikir-iv', [40, 41]],
  ['sayyidul-istighfar', [42, 43]],
  ['dzikir-vi', [44, 45]],
  ['dzikir-vii', [46]],
  ['dzikir-viii', [47]],
  ['dzikir-ix', [48]],
  ['dzikir-x', [49]],
  ['dzikir-xi+dzikir-xii', [50], { split: true }],
  ['dzikir-xiii', [51], { latinQuoted: true }],
];

function pageParts(pages, n) {
  const lines = P.cleanLines(pages[n - 1]);
  const di = lines.findIndex((l) => /^Dibaca/.test(l));
  if (di < 1) throw new Error(`pdf page ${n}: no "Dibaca" line`);
  return { n, title: lines[di - 1], dibaca: lines[di], body: lines.slice(di + 1), lines, di };
}

function finish(title, dibaca, bodies, opts, pdfPages, extra = {}) {
  // bodies: array of parsed bodies (one per pdf page of the item)
  const first = bodies[0];
  const last = bodies[bodies.length - 1];
  const rests = bodies.map((b) => P.parseRest(b.rest, opts));
  const norm = (r) => JSON.stringify(r);
  let rest = rests[rests.length - 1];
  const nonEmpty = rests.filter((r) => r.virtue || r.source || r.notes.length);
  if (nonEmpty.length) {
    rest = nonEmpty[nonEmpty.length - 1];
    const differing = nonEmpty.filter((r) => norm(r) !== norm(rest));
    if (differing.length) rest._conflict = nonEmpty.map(norm);
  }
  return {
    title,
    dibaca,
    pdf_pages: pdfPages,
    taawudz: first.taawudz,
    latin: first.latin || last.latin,
    translation: last.translation,
    rest,
    ...extra,
  };
}

function parseDef(pages, [key, pdfPages, opts = {}]) {
  if (opts.split) {
    const pp = pageParts(pages, pdfPages[0]);
    const idx = pp.body.findIndex((l) => P.TITLE_RE.test(l));
    if (idx < 0) throw new Error('no embedded title on split page');
    const body1 = pp.body.slice(0, idx);
    const title2 = pp.body[idx];
    const dibaca2 = pp.body[idx + 1];
    const body2 = pp.body.slice(idx + 2);
    const b1 = P.parseBody(body1, {});
    const b2 = P.parseBody(body2, {});
    return [
      { key: key.split('+')[0], ...finish(pp.title, pp.dibaca, [b1], {}, pdfPages) },
      { key: key.split('+')[1], ...finish(title2, dibaca2, [b2], {}, pdfPages) },
    ];
  }
  const parts = pdfPages.map((n) => pageParts(pages, n));
  const titles = new Set(parts.map((p) => p.title.toLowerCase()));
  if (titles.size !== 1) throw new Error(`title mismatch on pages ${pdfPages}: ${[...titles]}`);
  const bodies = parts.map((p, k) => P.parseBody(p.body, { ...opts, taawudz: opts.taawudz && k === 0 }));
  return [{ key, ...finish(parts[0].title, parts[0].dibaca, bodies, opts, pdfPages) }];
}

function parseCollection(pages, defs) {
  return defs.flatMap((d) => parseDef(pages, d));
}

module.exports = { PAGI, PETANG, parseCollection };
