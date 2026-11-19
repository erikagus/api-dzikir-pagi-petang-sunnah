'use strict';
// Reproducible build: sources/raw.txt + sources/dzikr.json  ->  api/v1/*.json + docs/FLAGS.md
// Usage: node scripts/build.js
const fs = require('node:fs');
const path = require('node:path');
const P = require('./parse-book');
const B = require('./book-items');
const M = require('./match');
const { renderFlags } = require('./flags');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'api', 'v1');
const REF_REPO = 'kanglerian/api-dzikir-pagi-petang';
const VERSION = '1.0.0';
const ATTRIBUTION =
  'Isi: "Dzikir Pagi & Petang Sesuai Sunnah Nabi", Yayasan Cinta Sedekah (cintasedekah.org), dimurajaah Ustadz Abul Aswad Al Bayaty. ' +
  'Teks Arab: kanglerian/api-dzikir-pagi-petang (Lerian). Lihat NOTICE.md.';

// Explicit grades: only where the book's own rujukan text for that item states one.
// [grade (shahih|hasan|null), exact phrase as written in the book]
const GRADES = {
  'ayat-kursi': ['shahih', 'shahih)'],
  'al-ikhlas': [null, 'hasan shahih'],
  'al-falaq': [null, 'hasan shahih'],
  'an-naas': [null, 'hasan shahih'],
  'dzikir-i': ['shahih', 'shahih'],
  'dzikir-ii': ['hasan', 'hasan'],
  'dzikir-iii': ['shahih', 'shahih'],
  'dzikir-iv': ['shahih', 'shahih'],
  'dzikir-vi': ['shahih', 'shahih'],
  'dzikir-vii': ['hasan', 'hasan'],
  'dzikir-ix': ['shahih', 'sanad-nya shahih'],
  'dzikir-x': ['hasan', 'hasan'],
};

const stripWrap = (s) => (s == null ? s : s.replace(/^"/, '').replace(/"$/, '').trim());

function extractQuranRef(translation) {
  if (!translation) return { translation, quran_ref: null };
  const m = /\s*\[([^\]]+)\]\.?\s*$/.exec(translation);
  if (!m) return { translation, quran_ref: null };
  return { translation: translation.slice(0, m.index).trim(), quran_ref: m[1].trim() };
}

function buildCollection(name, defs, pages, ref) {
  const parsed = B.parseCollection(pages, defs);
  const items = [];
  let order = 0;

  const attachArabic = (item, matchInput, refEntries) => {
    const m = M.matchItem(matchInput, refEntries);
    item._match = m;
    if (m.status === 'matched') {
      const r = refEntries.find((x) => x.id === m.best.id);
      item.arabic = r.arab; // byte-for-byte copy from the reference file
      item.arabic_status = 'matched';
      item.arabic_ref = { repo: REF_REPO, id: r.id, confidence: m.confidence };
      if (m.alt_ids.length) item.arabic_ref.alt_ids = m.alt_ids;
    } else {
      item.arabic = null;
      item.arabic_status = m.status;
      item.arabic_ref = { repo: REF_REPO, id: null, confidence: 'low', candidates: m.candidates.map((c) => c.id) };
    }
  };

  for (const it of parsed) {
    if (it.taawudz) {
      order += 1;
      const t = {
        id: `${name}-ta-awudz`,
        collection: name,
        order,
        title: "Ta'awudz",
        title_id_note:
          'Buku tidak memberi judul terpisah; kalimat ini tertulis sebagai kutipan di bagian atas halaman Ayat Kursi dan dipisah menjadi item sendiri.',
        pdf_page: it.pdf_pages[0],
        pdf_pages: [it.pdf_pages[0]],
        repeat: { count: null, text: null },
        arabic: null,
        arabic_status: 'unmatched',
        arabic_ref: null,
        latin: null,
        translation: stripWrap(it.taawudz),
        quran_ref: null,
        virtue: null,
        source: { text: null, grade: null, grade_text: null },
        notes: [],
      };
      attachArabic(t, { title: "Ta'awudz", translation: t.translation, source: null, quran_ref: null }, ref[name]);
      items.push(t);
    }
    order += 1;
    const { translation, quran_ref } = extractQuranRef(it.translation);
    const g = GRADES[it.key];
    const item = {
      id: `${name}-${it.key}`,
      collection: name,
      order,
      title: it.title,
      pdf_page: it.pdf_pages[0],
      pdf_pages: it.pdf_pages,
      repeat: P.repeatOf(it.dibaca),
      arabic: null,
      arabic_status: 'unmatched',
      arabic_ref: null,
      latin: P.stripQuotes(it.latin),
      translation: stripWrap(translation),
      quran_ref,
      virtue: it.rest.virtue,
      source: { text: it.rest.source, grade: g ? g[0] : null, grade_text: g ? g[1] : null },
      notes: it.rest.notes,
    };
    if (it.rest._conflict) throw new Error(`rujukan differs between pages for ${item.id}`);
    attachArabic(
      item,
      { title: item.title, translation: item.translation, source: item.source.text, quran_ref: quran_ref ? `[${quran_ref}]` : null },
      ref[name]
    );
    items.push(item);
  }
  return items;
}

function buildMeta(pages, all) {
  const credits = P.cleanLines(pages[4]);
  const waktuLines = P.cleanLines(pages[7]);
  const iA = waktuLines.findIndex((l) => /^Waktu Afdhol$/.test(l));
  const iL = waktuLines.findIndex((l) => /^Waktu Longgar$/.test(l));
  const pagiCover = P.cleanLines(pages[8]);
  const petangCover = P.cleanLines(pages[30]);
  const every = [...all.pagi, ...all.petang];
  return {
    version: VERSION,
    book: {
      title: 'Dzikir Pagi & Petang Sesuai Sunnah Nabi',
      publisher: 'Yayasan Cinta Sedekah',
      website: 'www.cintasedekah.org',
      email: 'sekretariat@cintasedekah.org',
      penyusun: 'Sekretariat Yayasan Cinta Sedekah; Ustadz Abul Aswad Al Bayaty',
      murajaah: 'Ustadz Abul Aswad Al Bayaty',
      murajaah_note:
        'Sampul: "Dimurajaah : Ustadz Abul Aswad Al Bayaty". Halaman hak cipta buku memuat nama lain pada baris Murajaah (lihat credits_page_text).',
      copyright_notice:
        'Dilarang mengubah apapun isi tulisan tanpa izin dari penulis. Hak cipta dilindungi Undang-undang. All rights reserved',
      credits_page_text: credits.join('\n'),
      pdf_pages: { pagi: [10, 30], petang: [32, 51], waktu_dzikir: 8 },
    },
    waktu: {
      source_pdf_page: 8,
      afdhol: { heading: 'Waktu Afdhol', text: P.joinLines(waktuLines.slice(iA + 1, iL)) },
      longgar: { heading: 'Waktu Longgar', text: P.joinLines(waktuLines.slice(iL + 1)) },
      note:
        'Teks diambil apa adanya dari ekstraksi PDF. Ayat Arab dan satu kata Arab pada paragraf pertama hilang/bergeser saat ekstraksi; lihat docs/FLAGS.md.',
    },
    epigraphs: {
      pagi: P.joinLines(pagiCover.slice(1)),
      petang: P.joinLines(petangCover.slice(1)),
    },
    counts: {
      pagi: all.pagi.length,
      petang: all.petang.length,
      total: every.length,
      book_groups: { pagi: all.pagi.length - 1, petang: all.petang.length - 1 },
      book_groups_note:
        "Item = grup di buku + 1 item Ta'awudz yang dipisah dari halaman Ayat Kursi. Grup buku: Ayat Kursi, Al-Ikhlas, Al-Falaq, An-Naas, lalu Dzikir i s.d. XIV (pagi) / i s.d. xiii (petang); Sayyidul Istighfar menempati nomor v tanpa label angka; Dzikir XII tertanam di halaman XI.",
      arabic: {
        matched: every.filter((i) => i.arabic_status === 'matched').length,
        ambiguous: every.filter((i) => i.arabic_status === 'ambiguous').length,
        unmatched: every.filter((i) => i.arabic_status === 'unmatched').length,
      },
    },
  };
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function build() {
  const pages = P.loadPages();
  const ref = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources', 'dzikr.json'), 'utf8'));
  const all = {
    pagi: buildCollection('pagi', B.PAGI, pages, ref),
    petang: buildCollection('petang', B.PETANG, pages, ref),
  };
  const meta = buildMeta(pages, all);
  const flagsMd = renderFlags({ all, ref, pages, meta });

  const clean = (it) => {
    const { _match, ...rest } = it;
    return rest;
  };
  const pub = { pagi: all.pagi.map(clean), petang: all.petang.map(clean) };

  fs.rmSync(OUT, { recursive: true, force: true });
  const files = [];
  const w = (rel, data) => {
    writeJson(path.join(OUT, rel), data);
    files.push(rel);
  };

  w('pagi.json', { collection: 'pagi', title: 'Dzikir Pagi', count: pub.pagi.length, attribution: ATTRIBUTION, items: pub.pagi });
  w('petang.json', { collection: 'petang', title: 'Dzikir Petang', count: pub.petang.length, attribution: ATTRIBUTION, items: pub.petang });
  w('all.json', { version: VERSION, attribution: ATTRIBUTION, count: meta.counts.total, collections: pub });
  for (const it of [...pub.pagi, ...pub.petang]) w(`items/${it.id}.json`, { attribution: ATTRIBUTION, item: it });
  w('meta.json', meta);
  w('index.json', {
    name: 'API Dzikir Pagi & Petang Sesuai Sunnah',
    version: VERSION,
    description:
      'API statis (JSON) berisi dzikir pagi & petang dari buku "Dzikir Pagi & Petang Sesuai Sunnah Nabi" (Yayasan Cinta Sedekah), tanpa perubahan isi.',
    base_url_placeholder: 'https://erikagus.github.io/api-dzikir-pagi-petang-sunnah/api/v1/',
    endpoints: {
      index: 'index.json',
      meta: 'meta.json',
      pagi: 'pagi.json',
      petang: 'petang.json',
      all: 'all.json',
      item: 'items/{id}.json',
    },
    counts: meta.counts,
    item_ids: { pagi: pub.pagi.map((i) => i.id), petang: pub.petang.map((i) => i.id) },
    source: {
      book: meta.book.title,
      publisher: meta.book.publisher,
      website: meta.book.website,
      arabic_from: {
        repo: REF_REPO,
        url: 'https://github.com/kanglerian/api-dzikir-pagi-petang',
        note: 'Teks Arab disalin apa adanya dari repositori ini.',
      },
    },
    notice: 'Isi bukan milik pemilik repositori ini. Lihat NOTICE.md dan docs/FLAGS.md.',
  });
  fs.writeFileSync(path.join(ROOT, 'docs', 'FLAGS.md'), flagsMd, 'utf8');
  return { files, all, meta };
}

if (require.main === module) {
  const r = build();
  console.log(`Wrote ${r.files.length} files. pagi=${r.meta.counts.pagi} petang=${r.meta.counts.petang}`, r.meta.counts.arabic);
}
module.exports = { build, GRADES, REF_REPO };
