'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validate, loadApi, loadSources, EXPECTED } = require('../scripts/validate');
const { build } = require('../scripts/build');
const P = require('../scripts/parse-book');
const { matchItem } = require('../scripts/match');

const ROOT = path.join(__dirname, '..');
const src = loadSources();
const clone = (o) => JSON.parse(JSON.stringify(o));
const allItems = (api) => [...api.pagi.items, ...api.petang.items];

test('committed API passes validation', () => {
  assert.deepEqual(validate(loadApi(), src), []);
});

test("counts match the book (pagi 18 groups, petang 17 groups, plus a separate Ta'awudz each)", () => {
  const api = loadApi();
  assert.equal(api.pagi.items.length, EXPECTED.pagi.items);
  assert.equal(api.petang.items.length, EXPECTED.petang.items);
  assert.equal(api.meta.counts.book_groups.pagi, 18);
  assert.equal(api.meta.counts.book_groups.petang, 17);
  assert.equal(api.all.count, 37);
});

test('ids are unique stable slugs; every item has its own file', () => {
  const api = loadApi();
  const ids = allItems(api).map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(fs.existsSync(path.join(ROOT, 'api', 'v1', 'items', `${id}.json`)), id);
  assert.ok(ids.includes('pagi-ayat-kursi') && ids.includes('petang-ta-awudz'));
});

test('every Arabic string is byte-identical to the reference file', () => {
  const api = loadApi();
  for (const it of allItems(api)) {
    if (it.arabic === null) continue;
    const entry = src.ref[it.collection].find((e) => e.id === it.arabic_ref.id);
    assert.ok(entry, it.id);
    assert.equal(it.arabic, entry.arab, it.id);
    assert.equal(Buffer.from(it.arabic, 'utf8').compare(Buffer.from(entry.arab, 'utf8')), 0, it.id);
  }
});

test('no U+FFFD and no page-footer text anywhere in the output files', () => {
  const dir = path.join(ROOT, 'api', 'v1');
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of walk(dir)) {
    const t = fs.readFileSync(f, 'utf8');
    assert.ok(!t.includes('�'), f);
    assert.ok(!/Talk Less Dzikr More/.test(t), f);
  }
  for (const it of allItems(loadApi())) {
    for (const v of [it.latin, it.translation, it.virtue, it.source.text, ...it.notes.map((n) => n.text)]) {
      if (v) assert.ok(!/Dzikir Pagi & Petang Sesuai Sunnah/.test(v), it.id);
    }
  }
});

test('arabic is null only where docs/FLAGS.md lists the item', () => {
  for (const it of allItems(loadApi())) {
    if (it.arabic === null) assert.ok(src.flags.includes('`' + it.id + '`'), it.id);
  }
});

test('petang wording comes from the petang pages, never copied from pagi', () => {
  const api = loadApi();
  const get = (id) => allItems(api).find((i) => i.id === id);
  assert.match(get('petang-dzikir-i').latin, /^Amsaynaa/);
  assert.match(get('petang-dzikir-i').translation, /petang/);
  assert.match(get('petang-dzikir-iii').latin, /amsaynaa wa bika ashbahnaa/);
  assert.match(get('petang-dzikir-iii').translation, /tempat kembali/);
  assert.match(get('pagi-dzikir-iii').translation, /kebangkitan/);
  assert.notEqual(get('pagi-dzikir-iii').arabic, get('petang-dzikir-iii').arabic);
  assert.notEqual(get('pagi-dzikir-i').arabic, get('petang-dzikir-i').arabic);
});

test("Ta'awudz is its own item before Ayat Kursi; embedded XI/XII are split", () => {
  const api = loadApi();
  for (const col of ['pagi', 'petang']) {
    const items = api[col].items;
    assert.equal(items[0].id, `${col}-ta-awudz`);
    assert.equal(items[1].id, `${col}-ayat-kursi`);
    assert.ok(!items[1].translation.includes('terkutuk'));
    const xi = items.find((i) => i.id === `${col}-dzikir-xi`);
    const xii = items.find((i) => i.id === `${col}-dzikir-xii`);
    assert.equal(xi.pdf_page, xii.pdf_page);
    assert.equal(xii.repeat.count, 100);
    assert.equal(xii.latin, 'Subhanallahi wabihamdihi');
    assert.equal(xi.source.text, null);
    assert.match(xii.source.text, /^HR\. Muslim no\. 2726/);
  }
});

test('grades are only set when the book states them', () => {
  const api = loadApi();
  for (const it of allItems(api)) {
    if (it.source.grade) assert.ok(it.source.text.includes(it.source.grade_text), it.id);
  }
  const ik = api.pagi.items.find((i) => i.id === 'pagi-al-ikhlas');
  assert.equal(ik.source.grade, null);
  assert.equal(ik.source.grade_text, 'hasan shahih');
});

test('build is reproducible (rebuilding yields identical files)', () => {
  const dir = path.join(ROOT, 'api', 'v1');
  const snap = () => {
    const out = {};
    const walk = (d) =>
      fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else out[path.relative(dir, p)] = fs.readFileSync(p, 'utf8');
      });
    walk(dir);
    return out;
  };
  const before = snap();
  const flagsBefore = fs.readFileSync(path.join(ROOT, 'docs', 'FLAGS.md'), 'utf8');
  build();
  assert.deepEqual(snap(), before);
  assert.equal(fs.readFileSync(path.join(ROOT, 'docs', 'FLAGS.md'), 'utf8'), flagsBefore);
});

// ---- negative tests: the validator must catch tampering ----
test('validator catches a hand-edited Arabic string', () => {
  const api = clone(loadApi());
  api.pagi.items[3].arabic += 'x';
  api.all.collections.pagi = api.pagi.items;
  assert.ok(validate(api, src).some((e) => /byte-identical/.test(e)));
});

test('validator catches U+FFFD, footer text, duplicate ids and missing fields', () => {
  const api = clone(loadApi());
  api.pagi.items[2].translation += ' �';
  api.pagi.items[4].latin += ' Talk Less Dzikr More';
  api.pagi.items[5].id = api.pagi.items[6].id;
  delete api.petang.items[1].repeat;
  const errs = validate(api, src).join('\n');
  assert.match(errs, /U\+FFFD/);
  assert.match(errs, /page footer text/);
  assert.match(errs, /duplicate id/);
  assert.match(errs, /missing field repeat/);
});

test('validator catches null Arabic that is not in FLAGS.md', () => {
  const api = clone(loadApi());
  const it = api.petang.items[2];
  it.arabic = null;
  it.arabic_status = 'unmatched';
  it.arabic_ref = { repo: 'kanglerian/api-dzikir-pagi-petang', id: null, confidence: 'low' };
  const errs = validate(api, { ...src, flags: 'nothing here' });
  assert.ok(errs.some((e) => /not listed in docs\/FLAGS\.md/.test(e)));
});

test('validator catches text that is not verbatim from the book', () => {
  const api = clone(loadApi());
  api.pagi.items[3].translation += ' tambahan palsu';
  assert.ok(validate(api, src).some((e) => /not found verbatim/.test(e)));
});

// ---- unit tests ----
test('joinLines glues hyphenated line wraps without a space', () => {
  assert.equal(P.joinLines(['kepada-', 'Nya.', 'Lalu', 'ini']), 'kepada-Nya. Lalu ini');
});

test('cleanLines maps U+FFFD to the x-sign and drops footers, page numbers and noise', () => {
  const lines = P.cleanLines('Judul\r\n  Dibaca 3�\r\n\r\n  ,   \r\n12 Talk Less Dzikr More\r\nIsi   teks\r\n');
  assert.deepEqual(lines, ['Judul', 'Dibaca 3×', 'Isi teks']);
});

test('matcher: unrelated text is unmatched, near-duplicates are not "matched", exact text is matched', () => {
  const refs = [
    { id: 1, judul: 'A', arab: 'x', arti: 'Mahasuci Allah aku memuji-Nya', dalil: '' },
    { id: 2, judul: 'B', arab: 'y', arti: 'Ya Allah berikan aku ilmu yang bermanfaat', dalil: '' },
  ];
  const none = matchItem({ title: 'Zzz', translation: 'kalimat yang sama sekali berbeda isinya', source: null, quran_ref: null }, refs);
  assert.equal(none.status, 'unmatched');
  const dup = [
    { id: 1, judul: 'A', arab: 'x', arti: 'Ya Allah lindungilah aku dari kejahatan dan keburukan hari ini', dalil: '' },
    { id: 2, judul: 'B', arab: 'y', arti: 'Ya Allah lindungilah aku dari kejahatan dan keburukan malam ini', dalil: '' },
  ];
  const amb = matchItem({ title: 'Zzz', translation: 'Ya Allah lindungilah aku dari kejahatan dan keburukan', source: null, quran_ref: null }, dup);
  assert.notEqual(amb.status, 'matched');
  const same = matchItem({ title: 'Zzz', translation: 'Mahasuci Allah, aku memuji-Nya.', source: null, quran_ref: null }, refs);
  assert.equal(same.status, 'matched');
});
