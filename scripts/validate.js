'use strict';
// Validates the generated API against the schema and against the original sources.
// Usage: node scripts/validate.js   (exit code 1 on any problem)
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const API = path.join(ROOT, 'api', 'v1');
const REF_REPO = 'kanglerian/api-dzikir-pagi-petang';

const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const FOOTER_RE = /Talk Less Dzikr More|Dzikir Pagi & Petang Sesuai Sunnah/;
const EXPECTED = { pagi: { items: 19, groups: 18 }, petang: { items: 18, groups: 17 } };

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

function loadApi(dir = API) {
  const api = {
    index: readJson(path.join(dir, 'index.json')),
    meta: readJson(path.join(dir, 'meta.json')),
    pagi: readJson(path.join(dir, 'pagi.json')),
    petang: readJson(path.join(dir, 'petang.json')),
    all: readJson(path.join(dir, 'all.json')),
    items: {},
  };
  for (const f of fs.readdirSync(path.join(dir, 'items'))) {
    api.items[f.replace(/\.json$/, '')] = readJson(path.join(dir, 'items', f));
  }
  return api;
}

function loadSources() {
  return {
    ref: readJson(path.join(ROOT, 'sources', 'dzikr.json')),
    raw: fs.readFileSync(path.join(ROOT, 'sources', 'raw.txt'), 'utf8').replace(/\r/g, '').replace(/�/g, '×'),
    flags: fs.readFileSync(path.join(ROOT, 'docs', 'FLAGS.md'), 'utf8'),
  };
}

const isStr = (v) => typeof v === 'string' && v.length > 0;
const isStrOrNull = (v) => v === null || isStr(v);
const squash = (s) => s.replace(/\s+/g, '');

function textFields(it) {
  const out = [];
  const add = (k, v) => typeof v === 'string' && out.push([k, v]);
  add('title', it.title);
  add('title_id_note', it.title_id_note);
  add('repeat.text', it.repeat && it.repeat.text);
  add('latin', it.latin);
  add('translation', it.translation);
  add('quran_ref', it.quran_ref);
  add('virtue', it.virtue);
  add('source.text', it.source && it.source.text);
  add('source.grade_text', it.source && it.source.grade_text);
  (it.notes || []).forEach((n, i) => {
    add(`notes[${i}].label`, n.label);
    add(`notes[${i}].text`, n.text);
  });
  return out;
}

function validateItem(it, errs, { ref, rawSquashed, flags }) {
  const at = (m) => errs.push(`${it && it.id}: ${m}`);
  const keys = ['id', 'collection', 'order', 'title', 'pdf_page', 'pdf_pages', 'repeat', 'arabic', 'arabic_status', 'arabic_ref', 'latin', 'translation', 'quran_ref', 'virtue', 'source', 'notes'];
  for (const k of keys) if (!(k in it)) at(`missing field ${k}`);
  if (!isStr(it.id) || !/^(pagi|petang)-[a-z0-9-]+$/.test(it.id)) at('bad id');
  if (!['pagi', 'petang'].includes(it.collection)) at('bad collection');
  if (it.id && it.collection && !it.id.startsWith(it.collection + '-')) at('id prefix does not match collection');
  if (!Number.isInteger(it.order) || it.order < 1) at('bad order');
  if (!isStr(it.title)) at('bad title');
  if (!Number.isInteger(it.pdf_page) || !Array.isArray(it.pdf_pages) || it.pdf_pages[0] !== it.pdf_page) at('bad pdf_page(s)');
  // repeat
  if (!it.repeat || !(it.repeat.count === null || Number.isInteger(it.repeat.count)) || !isStrOrNull(it.repeat.text)) at('bad repeat');
  // text fields
  if (!isStrOrNull(it.latin) || !isStr(it.translation) || !isStrOrNull(it.quran_ref) || !isStrOrNull(it.virtue)) at('bad latin/translation/quran_ref/virtue');
  // source
  const s = it.source;
  if (!s || !isStrOrNull(s.text) || !['shahih', 'hasan', null].includes(s.grade) || !isStrOrNull(s.grade_text)) at('bad source');
  else {
    if (s.grade && !s.grade_text) at('grade without grade_text');
    if (s.grade_text && !(s.text || '').includes(s.grade_text)) at('grade_text is not a substring of source.text');
    if (s.grade && !s.grade_text.toLowerCase().includes(s.grade)) at('grade not stated in grade_text');
    if (s.grade_text && !s.text) at('grade_text without source.text');
  }
  if (!Array.isArray(it.notes) || it.notes.some((n) => !isStr(n.label) || !isStr(n.text))) at('bad notes');
  // text hygiene
  for (const [k, v] of textFields(it)) {
    if (v.includes('�')) at(`U+FFFD in ${k}`);
    if (FOOTER_RE.test(v)) at(`page footer text in ${k}`);
    if (ARABIC_RE.test(v)) at(`Arabic characters in non-arabic field ${k}`);
    if (/\s{2,}|^\s|\s$|[\n\r\t]/.test(v)) at(`whitespace artefact in ${k}`);
    // verbatim: every text field must occur in the book extraction (modulo whitespace)
    if (k !== 'title_id_note' && !(k === 'title' && it.title_id_note) && !/^notes\[\d+\]\.label$/.test(k) && !rawSquashed.includes(squash(v))) {
      at(`${k} is not found verbatim in sources/raw.txt: "${v.slice(0, 60)}"`);
    }
  }
  // Arabic
  if (!['matched', 'ambiguous', 'unmatched'].includes(it.arabic_status)) at('bad arabic_status');
  if (it.arabic !== null && typeof it.arabic !== 'string') at('arabic must be string|null');
  if (typeof it.arabic === 'string') {
    if (it.arabic_status !== 'matched') at('arabic present but status is not matched');
    const r = it.arabic_ref;
    if (!r || r.repo !== REF_REPO || !Number.isInteger(r.id) || r.confidence !== 'high') at('bad arabic_ref for matched item');
    else {
      const entry = (ref[it.collection] || []).find((e) => e.id === r.id);
      if (!entry) at(`reference entry ${r.id} not found in ${it.collection}`);
      else if (entry.arab !== it.arabic) at('arabic is NOT byte-identical to the reference file (hand-edited?)');
    }
  } else {
    if (it.arabic_status === 'matched') at('status matched but arabic is null');
    if (!flags.includes('`' + it.id + '`')) at('arabic is null but id is not listed in docs/FLAGS.md');
    if (it.arabic_ref && it.arabic_ref.id !== null) at('arabic null but arabic_ref.id set');
  }
}

/**
 * @returns {string[]} list of problems (empty = valid)
 */
function validate(api, src = loadSources()) {
  const errs = [];
  const rawSquashed = squash(src.raw);
  const ctx = { ref: src.ref, rawSquashed, flags: src.flags };

  const ids = new Set();
  for (const col of ['pagi', 'petang']) {
    const file = api[col];
    if (!file || !Array.isArray(file.items)) { errs.push(`${col}.json: items missing`); continue; }
    if (file.count !== file.items.length) errs.push(`${col}.json: count ${file.count} != items ${file.items.length}`);
    if (file.items.length !== EXPECTED[col].items) errs.push(`${col}: expected ${EXPECTED[col].items} items, got ${file.items.length}`);
    const groups = file.items.length - file.items.filter((i) => /-ta-awudz$/.test(i.id)).length;
    if (groups !== EXPECTED[col].groups) errs.push(`${col}: expected ${EXPECTED[col].groups} book groups, got ${groups}`);
    file.items.forEach((it, idx) => {
      if (ids.has(it.id)) errs.push(`duplicate id ${it.id}`);
      ids.add(it.id);
      if (it.collection !== col) errs.push(`${it.id}: wrong collection for ${col}.json`);
      if (it.order !== idx + 1) errs.push(`${it.id}: order ${it.order} != position ${idx + 1}`);
      validateItem(it, errs, ctx);
      const single = api.items[it.id];
      if (!single) errs.push(`${it.id}: items/${it.id}.json missing`);
      else if (JSON.stringify(single.item) !== JSON.stringify(it)) errs.push(`${it.id}: items/${it.id}.json differs from ${col}.json`);
    });
    if (JSON.stringify(api.all.collections[col]) !== JSON.stringify(file.items)) errs.push(`all.json collection ${col} differs from ${col}.json`);
  }
  for (const id of Object.keys(api.items)) if (!ids.has(id)) errs.push(`items/${id}.json has no matching item`);

  // book-structure checks
  const byId = Object.fromEntries([...api.pagi.items, ...api.petang.items].map((i) => [i.id, i]));
  for (const col of ['pagi', 'petang']) {
    const t = byId[`${col}-ta-awudz`];
    const a = byId[`${col}-ayat-kursi`];
    if (!t || !a || t.order + 1 !== a.order) errs.push(`${col}: ta'awudz must directly precede ayat kursi`);
    else if (a.translation.includes('berlindung kepada Allah dari godaan')) errs.push(`${col}: ta'awudz text leaked into ayat kursi`);
    for (const k of ['dzikir-xi', 'dzikir-xii']) {
      if (!byId[`${col}-${k}`]) errs.push(`${col}: ${k} (embedded entry) missing`);
    }
    const x12 = byId[`${col}-dzikir-xii`];
    if (x12 && (x12.repeat.count !== 100 || x12.latin !== 'Subhanallahi wabihamdihi')) errs.push(`${col}-dzikir-xii wrongly reconciled`);
  }
  // petang wording must come from petang pages: time-specific dzikir differ from pagi
  for (const k of ['dzikir-i', 'dzikir-iii', 'dzikir-iv']) {
    const p = byId[`pagi-${k}`];
    const q = byId[`petang-${k}`];
    if (p && q) {
      if (p.latin === q.latin) errs.push(`${k}: pagi and petang latin identical`);
      if (p.arabic === q.arabic) errs.push(`${k}: pagi and petang Arabic identical`);
    }
  }
  if (byId['petang-dzikir-i'] && !/^Amsaynaa/.test(byId['petang-dzikir-i'].latin)) errs.push('petang-dzikir-i must start with Amsaynaa');
  if (byId['petang-dzikir-iii'] && !/amsaynaa wa bika ashbahnaa/.test(byId['petang-dzikir-iii'].latin)) errs.push('petang-dzikir-iii latin must come from the petang page');

  // whole-file hygiene
  for (const [name, obj] of Object.entries({ index: api.index, meta: api.meta })) {
    const s = JSON.stringify(obj);
    if (s.includes('�')) errs.push(`${name}.json contains U+FFFD`);
  }
  const talk = JSON.stringify([api.meta.waktu, api.meta.epigraphs]);
  if (/Talk Less Dzikr More/.test(talk)) errs.push('meta contains page footer text');

  // index + meta
  const idx = api.index;
  for (const [k, rel] of Object.entries(idx.endpoints || {})) {
    if (k === 'item') continue;
    if (!fs.existsSync(path.join(API, rel))) errs.push(`index.json endpoint ${k} -> ${rel} does not exist`);
  }
  for (const col of ['pagi', 'petang']) {
    const listed = (idx.item_ids || {})[col] || [];
    if (JSON.stringify(listed) !== JSON.stringify(api[col].items.map((i) => i.id))) errs.push(`index.json item_ids.${col} mismatch`);
  }
  const m = api.meta;
  if (!m.waktu || !isStr(m.waktu.afdhol && m.waktu.afdhol.text) || !isStr(m.waktu.longgar && m.waktu.longgar.text)) errs.push('meta.waktu incomplete');
  else {
    for (const sec of ['afdhol', 'longgar']) if (!rawSquashed.includes(squash(m.waktu[sec].text))) errs.push(`meta.waktu.${sec} not verbatim in raw.txt`);
  }
  const all = [...api.pagi.items, ...api.petang.items];
  const cnt = (s) => all.filter((i) => i.arabic_status === s).length;
  if (!m.counts || m.counts.total !== all.length || m.counts.pagi !== api.pagi.items.length || m.counts.petang !== api.petang.items.length) errs.push('meta.counts mismatch');
  else if (m.counts.arabic.matched !== cnt('matched') || m.counts.arabic.ambiguous !== cnt('ambiguous') || m.counts.arabic.unmatched !== cnt('unmatched')) errs.push('meta.counts.arabic mismatch');
  return errs;
}

if (require.main === module) {
  const errs = validate(loadApi());
  if (errs.length) {
    console.error(`INVALID (${errs.length} problems)`);
    for (const e of errs) console.error(' - ' + e);
    process.exit(1);
  }
  console.log('OK: api/v1 is valid.');
}

module.exports = { validate, loadApi, loadSources, EXPECTED };
