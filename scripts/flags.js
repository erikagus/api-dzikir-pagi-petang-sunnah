'use strict';
// Generates docs/FLAGS.md: everything that needs a human check, and why.
const M = require('./match');

const TYPOS = [
  // [id, exact snippet that must occur in the item, remark]
  ['pagi-dzikir-xi', 'Subahnallah', 'Latin "Subahnallah" (kemungkinan maksudnya Subhanallah).'],
  ['petang-al-ikhlas', 'Wa lam ya kullahu', 'Latin "ya kullahu" (kemungkinan maksudnya "yakun lahu"). Sama di pagi.'],
  ['pagi-al-ikhlas', 'Wa lam ya kullahu', 'Sama seperti petang: "ya kullahu".'],
  ['pagi-dzikir-vii', "sasm'ii", 'Latin "sasm\'ii" (kemungkinan sam\'ii). Sama di petang.'],
  ['pagi-dzikir-viii', 'syain in wa', 'Latin "syain in wa" memuat "in" yang berdiri sendiri; di petang tertulis "syain wa".'],
  ['petang-dzikir-viii', 'sysyaitahaai', 'Latin "sysyaitahaai" tampak ganjil dibanding versi pagi ("syaithoni").'],
  ['petang-dzikir-vi', 'kebaikn', 'Terjemahan "kebaikn" (kemungkinan kebaikan).'],
  ['pagi-dzikir-iv', 'se-suatu', 'Terjemahan memuat tanda hubung di tengah kata ("se-suatu", "berlin-dung") akibat tata letak buku.'],
  ['petang-dzikir-iv', 'sesuatu.Wahai', 'Terjemahan: spasi hilang setelah titik ("sesuatu.Wahai").'],
  ['pagi-dzikir-vii', 'Shahiib', 'Rujukan memuat "Shahiib" (kemungkinan Shahiih). Sama di petang.'],
  ['pagi-dzikir-viii', 'Abu Daud no. 5067,Lihat', 'Rujukan: spasi hilang setelah koma ("5067,Lihat"). Sama di petang.'],
  ['pagi-dzikir-ix', 'no. 5088,Ibnu', 'Rujukan: spasi hilang setelah koma ("5088,Ibnu").'],
  ['pagi-dzikir-iii', 'Ahmad 11/354', 'Rujukan "Ahmad 11/354" (angka Romawi II kemungkinan tertulis sebagai "11"). Sama di petang.'],
  ['pagi-dzikir-ix', "samaa' i", 'Latin "samaa\' i" (spasi), sedangkan petang menulis "samaa\'I".'],
  ['petang-dzikir-ix', "samaa'I", 'Latin "samaa\'I" (huruf besar I di tengah kata).'],
  ['pagi-dzikir-xiv', '(42)', 'Dalil tambahan diawali "[" tetapi tidak ditutup "]" di buku.'],
  ['pagi-dzikir-i', 'musyrik.', 'Terjemahan tidak diakhiri tanda kutip penutup di buku (juga di petang-dzikir-i).'],
  ['pagi-al-falaq', 'dengki."', 'Terjemahan berakhir dengan tanda kutip ganda yang diikuti backtick di buku; tidak dirapikan. Sama di petang-al-falaq.'],
  ['pagi-dzikir-vi', 'Dzikir pagi vI', 'Judul bertuliskan "vI" (huruf besar I) di buku. Judul lain berselang-seling huruf besar/kecil (II, III, IV vs i, vii).'],
];

function tokens(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[`'’"]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function multisetDiff(a, b) {
  const count = (arr) => arr.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map());
  const A = count(a);
  const B = count(b);
  const onlyA = [];
  const onlyB = [];
  for (const [t, n] of A) for (let i = 0; i < n - (B.get(t) || 0); i++) onlyA.push(t);
  for (const [t, n] of B) for (let i = 0; i < n - (A.get(t) || 0); i++) onlyB.push(t);
  return { onlyA, onlyB };
}

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function renderFlags({ all, ref, pages, meta }) {
  const L = [];
  const every = [...all.pagi, ...all.petang];
  const byId = new Map(every.map((i) => [i.id, i]));
  const push = (...x) => L.push(...x);

  push('# FLAGS: item yang perlu diverifikasi manusia', '');
  push('File ini dibuat otomatis oleh `scripts/build.js`. Jangan disunting tangan; ubah sumbernya lalu jalankan `node scripts/build.js`.', '');
  push('## 1. Aturan dasar', '');
  push('- Teks Indonesia, latin, dan rujukan disalin dari ekstraksi PDF buku tanpa diubah. Hanya urusan spasi/pemenggalan baris, karakter sampah pdftotext (U+FFFD, yang aslinya tanda kali), dan pembungkus tanda kutip ganda terluar pada latin/terjemahan yang dirapikan.');
  push('- Teks Arab TIDAK ada di ekstraksi PDF (glyph Arab hilang). Semua teks Arab di API ini disalin otomatis, byte demi byte, dari `sources/dzikr.json` (kanglerian/api-dzikir-pagi-petang). Tidak ada satu huruf Arab pun diketik atau disunting manual.');
  push('- Pencocokan buku ke entri referensi dilakukan lewat kemiripan terjemahan Indonesia (plus judul, kutipan ayat, dan nama kitab hadits bila ada). Skor dan sinyalnya dicatat di bawah.');
  push('- Karena terjemahan referensi berbeda redaksi dari buku, SEMUA Arab tetap harus dicek oleh orang yang paham sebelum dipakai untuk hal penting (mis. cetak, ajar). Harakat dan pilihan lafaz di referensi bisa saja berbeda dari latin buku.');
  push('');

  push('## 2. Status Arab per item', '');
  push(`Ringkasan: matched ${meta.counts.arabic.matched}, ambiguous ${meta.counts.arabic.ambiguous}, unmatched ${meta.counts.arabic.unmatched} (dari ${every.length} item).`, '');
  push('| id | status | id referensi | skor terjemahan | selisih ke kandidat lain | sinyal | perlu perhatian ekstra |');
  push('|---|---|---|---|---|---|---|');
  for (const it of every) {
    const m = it._match;
    const extra = [];
    if (it.arabic_status !== 'matched') extra.push('Arab TIDAK dilampirkan (null)');
    if (m.best.score < 0.6) extra.push('redaksi terjemahan referensi cukup berbeda dari buku');
    if (m.alt_ids && m.alt_ids.length) extra.push(`referensi punya entri kembar (id ${m.alt_ids.join(', ')}) yang hanya beda urutan tanda baca Unicode; dipakai id ${m.best.id}`);
    push(`| \`${it.id}\` | ${it.arabic_status} | ${m.best.id} | ${m.best.score} | ${m.margin} | ${m.signals.join('+')} | ${cell(extra.join('; ') || '-')} |`);
  }
  push('');
  const needArabic = every.filter((i) => i.arabic_status !== 'matched');
  push('Item dengan `arabic: null` (wajib terdaftar di sini):', '');
  if (needArabic.length) for (const it of needArabic) push(`- \`${it.id}\` (${it.arabic_status}), kandidat referensi: ${(it.arabic_ref.candidates || []).join(', ')}`);
  else push('- (tidak ada; semua item berhasil dicocokkan dengan keyakinan tinggi, tetapi lihat poin di bawah)');
  push('');

  push('## 3. Arab yang perlu dicek lebih teliti', '');
  push('- `pagi-dzikir-viii` dan `petang-dzikir-viii`: terjemahan referensi menyebut "balatentaranya", sedangkan buku menulis "ajakannya menyekutukan Allah" (latin buku: "syirkihi"). Harakat/lafaz pada kata ini di referensi bisa berbeda dari latin buku.');
  push('- `pagi-dzikir-vi` dan `petang-dzikir-vi`: referensi menerjemahkan "ampunan dan keselamatan", buku "kebajikan dan keselamatan". Doanya sama; cek lafaz Arab kata pertama.');
  push('- `pagi-sayyidul-istighfar`, `petang-sayyidul-istighfar`, `pagi-dzikir-ix`, `petang-dzikir-ix`: skor kemiripan terjemahan rendah (sekitar 0.41) karena redaksi terjemahan berbeda; dicocokkan dengan bantuan sinyal tambahan (judul / nama kitab hadits). Dzikirnya jelas sama menurut isi, tetapi tetap perlu dicek.');
  push('- `pagi-dzikir-iii` dan `petang-dzikir-iii`: buku pagi "ilaikan nusyuur", petang "ilaikal mashir". Pastikan Arab pagi berakhir "an-nusyur" dan petang "al-mashir" (keduanya dicocokkan dari entri pagi/petang referensi yang berbeda; tes memastikan string Arab keduanya memang berbeda).');
  push('- Pasangan pagi/petang lain yang redaksinya berbeda sengaja dicocokkan ke entri referensi pagi atau petang masing-masing, bukan disalin dari sisi lain.');
  push('');

  push('## 4. Jumlah bacaan: buku vs referensi', '');
  push('Nilai buku dipertahankan; referensi tidak digabung.', '');
  for (const it of every) {
    const r = it.arabic_ref && it.arabic_ref.id ? ref[it.collection].find((x) => x.id === it.arabic_ref.id) : null;
    if (!r) continue;
    if (it.repeat.count !== r.ulang) {
      push(`- \`${it.id}\`: buku ${it.repeat.text ? `"${it.repeat.text}" (count ${it.repeat.count})` : 'tidak menyebut jumlah bacaan'}; referensi id ${r.id} "${r.judul}" ulang ${r.ulang}.`);
    }
  }
  push('');

  push('## 5. Struktur buku yang tidak biasa', '');
  push("- **Ta'awudz**: kalimat ini hanya tertulis sebagai kutipan di bagian atas halaman Ayat Kursi (pagi hlm. 10, petang hlm. 32). Dipisah jadi item sendiri (`pagi-ta-awudz`, `petang-ta-awudz`). Buku tidak memberi latin untuk Ta'awudz dan tidak memberi jumlah bacaan/rujukan sendiri, jadi `latin`, `repeat.count`, dan `source` bernilai null.");
  push('- **Dzikir XI dan XII tertanam di satu halaman** (pagi hlm. 28; petang xi dan xii di hlm. 50). Keduanya dipisah jadi dua item. Dua baris rujukan di bagian bawah halaman diletakkan di item XII saja (posisinya di bawah blok XII). Item XI (`pagi-dzikir-xi`, `petang-dzikir-xi`) memiliki `source.text` null karena buku tidak menempatkan rujukan di bawahnya. Baris rujukan pertama (Muslim no. 2726, Juwairiyah) kemungkinan milik XI pada pagi, tetapi tidak ditebak.');
  push('- Pada petang, dua baris rujukan yang sama muncul di bawah XII (Muslim no. 2726 dari Juwairiyah dan Muslim no. 2691/2692 dari Abu Hurairah); item xi petang (a\'udzu bikalimaatillah) tidak memiliki rujukan sendiri di buku.');
  push('- **Sayyidul Istighfar** menempati urutan ke-5 tanpa label angka; penomoran berlanjut "vI" (Dzikir pagi vI / petang vi).');
  push('- Item dua halaman (latin di halaman pertama, terjemahan di halaman kedua): Ayat Kursi, IV, Sayyidul Istighfar, vI. Rujukan dan keutamaan yang tertulis di kedua halaman identik dan hanya dicantumkan sekali (build gagal bila keduanya berbeda).');
  push('- `virtue` adalah kutipan keutamaan ("Barangsiapa ...") yang di buku tertulis tepat sebelum rujukan hadits; `notes` memuat "Catatan" dan "Penjelasan" apa adanya. Pada `pagi-dzikir-xiv` terdapat hadits Ibnu Umar tambahan yang disimpan di `notes` dengan label "Dalil tambahan".');
  push('- Petang tidak memiliki Dzikir XIV (istighfar 100x) dan tasbih XI "adada khalqihi" dalam buku; pagi tidak memiliki a\'udzu bikalimaatillah. Itu sesuai buku, tidak ditambah dari referensi.');
  push('');

  push('## 6. Perbedaan latin antara versi pagi dan petang (dari buku)', '');
  push('Daftar kata yang hanya ada di salah satu sisi. Sebagian memang disengaja (amsaynaa vs ashbahnaa, dst.), sebagian bisa jadi salah ketik di buku. Tidak ada yang diubah.', '');
  for (const p of all.pagi) {
    const q = all.petang.find((x) => x.id === p.id.replace(/^pagi-/, 'petang-'));
    if (!q || !p.latin || !q.latin) continue;
    const d = multisetDiff(tokens(p.latin), tokens(q.latin));
    if (d.onlyA.length + d.onlyB.length > 12) {
      push(`- \`${p.id}\` vs \`${q.id}\`: teks latin berbeda menyeluruh (${d.onlyA.length + d.onlyB.length} kata berbeda); memang dzikir versi pagi dan petang yang berbeda redaksi, tidak dirinci.`);
    } else if (d.onlyA.length || d.onlyB.length) {
      push(`- \`${p.id}\` vs \`${q.id}\`: hanya di pagi: ${d.onlyA.join(', ') || '-'}; hanya di petang: ${d.onlyB.join(', ') || '-'}`);
    }
  }
  push('');
  push('Catatan khusus: latin Ayat Kursi pagi ("ya\'lamu maa baina", "hifdzu") berbeda dari petang ("ya\'lamu man baina", "khifdzu"). Arab dari referensi identik untuk keduanya; salah satu latin di buku kemungkinan salah ketik.', '');

  push('## 7. Dugaan salah ketik di buku (dipertahankan apa adanya)', '');
  for (const [id, snippet, remark] of TYPOS) {
    const it = byId.get(id);
    const hay = it ? JSON.stringify(it) : '';
    // snippets that contain quotes are matched against the JSON-escaped form too
    const present = hay.includes(snippet) || hay.includes(JSON.stringify(snippet).slice(1, -1));
    if (!present) throw new Error(`FLAGS typo snippet not found in ${id}: ${snippet}`);
    push(`- \`${id}\`: ${remark}`);
  }
  push('');

  push('## 8. Glyph/teks yang hilang atau bergeser saat ekstraksi PDF', '');
  const lost = [];
  pages.forEach((txt, i) => {
    if (/(Muhammad|Rasulullah) {2,}\S/.test(txt.replace(/\r/g, ''))) lost.push(i + 1);
  });
  push(`- Simbol shalawat (glyph kaligrafi setelah nama Nabi) hilang pada halaman PDF: ${lost.join(', ')}. Terlihat sebagai spasi ganda setelah "Muhammad"/"Rasulullah" dan sudah dirapatkan menjadi satu spasi. Tidak ada glyph yang ditambahkan.`);
  push('- Tanda akhir ayat pada latin Al-Ikhlas, Al-Falaq, An-Naas hilang; potongan ayat kini dipisah spasi tunggal (mis. "Qul huwa Allahu ahad Allahus Shamad Lam yalid ...").');
  push('- `meta.json` > `waktu.afdhol`: dua kata Arab pada paragraf pertama hilang, dan kata "ashil" bergeser dari tempat aslinya ("...sampai terbit ashil matahari. Adapun adalah, sore hari..."). Kemungkinan teks aslinya: "Adapun ashil adalah sore hari". Tidak diperbaiki karena itu mengubah teks; mohon cek ke PDF.');
  push('- `meta.json` > `waktu.longgar`: frasa "waktu waktu zawal" (kata ganda) ada di buku.');
  push('- Karakter pengganti pdftotext (U+FFFD) setelah "Dibaca 1" dan "Dibaca 3" dipetakan ke tanda kali (×). Pada "Dibaca 1× atau 10x atau 100x" dan "Dibaca 100x dalam sehari" buku memang memakai huruf x biasa.');
  push('');

  push('## 9. Derajat hadits (grade)', '');
  push('`source.grade` hanya diisi bila buku menyebutkannya eksplisit di rujukan item itu. `source.grade_text` memuat frasa persis dari buku.', '');
  push('- Al-Ikhlas, Al-Falaq, An-Naas: buku menulis "hasan shahih" (dua kata). `grade` dibiarkan null supaya tidak memilih salah satu.');
  push('- `dzikir-ii` (Radhiitu): rujukan menulis "dishahihkan oleh Imam al-Hakim ... disetujui oleh Imam adz-Dzahabi, hasan". `grade` = hasan sesuai kata penutup eksplisit; pembaca perlu membaca `source.text` lengkapnya.');
  push('- `dzikir-ix`: buku menulis "sanad-nya shahih" (derajat sanad). `grade` = shahih dengan `grade_text` "sanad-nya shahih".');
  push('- Item tanpa kata derajat di rujukannya (Sayyidul Istighfar, viii, xi, xii, xiii, xiv, dan Ta\'awudz) memiliki `grade` null. Catatan di `dzikir-xiii`/`xiv` tentang riwayat dha\'if bukan derajat item itu sendiri.');
  push('');

  push('## 10. Entri referensi yang TIDAK dimasukkan (tidak ada di buku)', '');
  for (const col of ['pagi', 'petang']) {
    const used = new Set();
    for (const it of all[col]) {
      if (it.arabic_ref && it.arabic_ref.id) used.add(it.arabic_ref.id);
      if (it._match && it._match.alt_ids) it._match.alt_ids.forEach((x) => used.add(x));
    }
    const rest = ref[col].filter((r) => !used.has(r.id));
    push(`- ${col}: ${rest.map((r) => `${r.id} "${r.judul}"`).join('; ') || '-'}`);
  }
  push('');

  push('## 11. Hak cipta', '');
  push(`Halaman hak cipta buku: "${meta.book.copyright_notice}". Pemilik repositori menyatakan isi buku terbuka untuk dipakai dengan syarat tidak diubah; sebaiknya izin tertulis dari Yayasan Cinta Sedekah disimpan dan ditautkan di NOTICE.md sebelum repositori dipublikasikan.`);
  push('');
  return L.join('\n') + '\n';
}

module.exports = { renderFlags, TYPOS, multisetDiff, tokens };
