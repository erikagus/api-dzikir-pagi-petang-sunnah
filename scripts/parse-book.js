'use strict';
// Parses sources/raw.txt (pdftotext -layout output of the book) into item records.
// The book's text is never rewritten: only whitespace / line-wrap artefacts and
// the pdftotext replacement character (U+FFFD, a lost multiplication sign) are normalised.
const fs = require('node:fs');
const path = require('node:path');

const RAW = path.join(__dirname, '..', 'sources', 'raw.txt');

const FOOTER = /Talk Less Dzikr More|Dzikir Pagi & Petang Sesuai Sunnah/;
const MARKER = /^(\(?HR\.|\(Lihat|"?Barangsiapa|Catatan:|Dari Ibnu)/;

function loadPages(file = RAW) {
  return fs.readFileSync(file, 'utf8').replace(/\r/g, '').split('\f');
}

function cleanLines(pageText) {
  return pageText
    .replace(/�/g, '×')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l && !FOOTER.test(l) && /[A-Za-z0-9]/.test(l) && !/^\d+$/.test(l));
}

// Join wrapped lines. A line ending in "-" is glued to the next one without a space
// (the book wraps "kepada-" / "Nya" where the original is "kepada-Nya").
function joinLines(lines) {
  let out = '';
  for (const l of lines) {
    if (!out) out = l;
    else if (out.endsWith('-')) out += l;
    else out += ' ' + l;
  }
  return out.trim();
}

const isQuoteStart = (l) => l.startsWith('"') && !/^"Barangsiapa/.test(l);

// Collect a quoted block starting at index i: runs until a line that ends with a quote
// (or until a marker line). Returns [lines, nextIndex].
function quotedBlock(lines, i, { untilMarker = true } = {}) {
  const out = [];
  let j = i;
  for (; j < lines.length; j++) {
    if (j > i && untilMarker && MARKER.test(lines[j])) break;
    out.push(lines[j]);
  }
  return [out, j];
}

/**
 * Parse the lines of one (sub)page after title + "Dibaca" have been removed.
 * opts.latinQuoted: latin is itself inside quotes (Dzikir XIII, XIV)
 * opts.taawudz: the page starts with the quoted ta'awudz line
 */
function parseBody(lines, opts = {}) {
  const r = { taawudz: null, latin: null, translation: null, rest: [] };
  let i = 0;
  if (opts.taawudz) {
    let j = i;
    const t = [];
    for (; j < lines.length; j++) {
      t.push(lines[j]);
      if (lines[j].endsWith('"')) { j++; break; }
    }
    r.taawudz = joinLines(t);
    i = j;
  }
  if (opts.latinQuoted) {
    const t = [];
    let j = i;
    for (; j < lines.length; j++) {
      t.push(lines[j]);
      if (lines[j].endsWith('"')) { j++; break; }
    }
    r.latin = joinLines(t);
    i = j;
  }
  // translation start
  let ts = -1;
  for (let k = i; k < lines.length; k++) {
    if (isQuoteStart(lines[k])) { ts = k; break; }
    if (MARKER.test(lines[k])) break;
  }
  if (!opts.latinQuoted) {
    const latinEnd = ts >= 0 ? ts : lines.findIndex((l, k) => k >= i && MARKER.test(l));
    const end = latinEnd < 0 ? lines.length : latinEnd;
    const L = lines.slice(i, end);
    r.latin = L.length ? joinLines(L) : null;
  }
  if (ts >= 0) {
    let te = lines.length;
    for (let k = ts + 1; k < lines.length; k++) if (MARKER.test(lines[k])) { te = k; break; }
    r.translation = joinLines(lines.slice(ts, te));
    r.rest = lines.slice(te);
  } else {
    const m = lines.findIndex((l, k) => k >= i && MARKER.test(l));
    r.rest = m < 0 ? [] : lines.slice(m);
  }
  return r;
}

const stripQuotes = (s) => (s == null ? s : s.replace(/^"/, '').replace(/"$/, '').trim());

/**
 * Split the rest block (virtue quote, rujukan, catatan, penjelasan) into fields.
 */
function parseRest(lines, opts = {}) {
  const notes = [];
  let ls = lines.slice();
  const ci = ls.findIndex((l) => /^Catatan:/.test(l));
  if (ci >= 0) {
    let ce = ci;
    while (ce < ls.length && !/\)\.$/.test(ls[ce])) ce++;
    const block = ls.slice(ci, ce + 1);
    notes.push({ label: 'Catatan', text: joinLines(block).replace(/^Catatan:\s*/, '') });
    ls = ls.slice(0, ci).concat(ls.slice(ce + 1));
  }
  let S = joinLines(ls);
  let virtue = null;
  let source = null;
  const m = /(\(HR\.|\(Lihat |\bHR\. )/.exec(S);
  if (m) {
    virtue = S.slice(0, m.index).trim() || null;
    source = S.slice(m.index).trim();
  } else if (S) {
    virtue = S;
  }
  if (source) {
    const pj = /\sPenjelasan:\s*/.exec(source);
    if (pj) {
      notes.push({ label: 'Penjelasan', text: source.slice(pj.index + pj[0].length).trim() });
      source = source.slice(0, pj.index).trim();
    }
    const ib = /\s(?=Dari Ibnu `Umar )/.exec(source);
    if (ib) {
      notes.push({ label: 'Dalil tambahan', text: source.slice(ib.index).trim() });
      source = source.slice(0, ib.index).trim();
    }
  }
  return { virtue: stripQuotes(virtue), source, notes };
}

function repeatOf(text) {
  const m = /^Dibaca (\d+)\s*[×x]?$/.exec(text) || /^Dibaca (\d+)x dalam sehari$/.exec(text);
  return { count: m ? Number(m[1]) : null, text };
}

const TITLE_RE = /^Dzikir (pagi|petang) [xivIVX]+$/;

/**
 * Parse an item spanning the given pdf pages (1-based). If the page holds two items
 * (XI + XII), pass split:true and get an array of two sub-results.
 */
function parseUnit(pages, pdfPages, opts = {}) {
  const per = pdfPages.map((n) => {
    const lines = cleanLines(pages[n - 1]);
    const di = lines.findIndex((l) => /^Dibaca/.test(l));
    return { n, title: lines[0], dibaca: lines[di], di, lines };
  });
  return per;
}

module.exports = { loadPages, cleanLines, joinLines, parseBody, parseRest, parseUnit, repeatOf, stripQuotes, TITLE_RE, MARKER };
