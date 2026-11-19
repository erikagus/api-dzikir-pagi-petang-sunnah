# API Dzikir Pagi & Petang Sesuai Sunnah

API statis (berkas JSON, tanpa server) berisi dzikir pagi dan petang dari buku **"Dzikir Pagi & Petang Sesuai Sunnah Nabi"** terbitan **Yayasan Cinta Sedekah** ([cintasedekah.org](https://www.cintasedekah.org)), dimurajaah Ustadz Abul Aswad Al Bayaty.

Isi buku dipublikasikan **tanpa diubah** (hanya spasi/pemenggalan baris yang dirapikan). Teks Arab diambil dari proyek lain (lihat bagian Pemberitahuan). Semua berkas disajikan lewat GitHub Pages.

> Baca bagian [Pemberitahuan](#pemberitahuan-penting) dan [Verifikasi Arab](#verifikasi-teks-arab) sebelum memakai data ini untuk hal yang penting.

## Base URL

```
https://erikagus.github.io/api-dzikir-pagi-petang-sunnah/api/v1/
```

(Ganti dengan alamat GitHub Pages yang sebenarnya bila nama pengguna atau nama repositori berbeda.)

## Endpoint

Semua endpoint adalah berkas statis, hanya mendukung `GET`.

| Endpoint | Isi |
|---|---|
| `index.json` | Daftar endpoint, versi, jumlah item, daftar id, sumber dan atribusi |
| `pagi.json` | Semua item dzikir pagi (19 item) |
| `petang.json` | Semua item dzikir petang (18 item) |
| `all.json` | Pagi dan petang sekaligus (`collections.pagi`, `collections.petang`) |
| `items/<id>.json` | Satu item, mis. `items/pagi-ayat-kursi.json` |
| `meta.json` | Metadata buku, teks waktu afdhol dan waktu longgar (dari buku), jumlah item, hitungan status Arab |

Daftar id lengkap ada di `index.json` > `item_ids`. Contoh: `pagi-ta-awudz`, `pagi-ayat-kursi`, `pagi-al-ikhlas`, `pagi-dzikir-i`, `pagi-sayyidul-istighfar`, `petang-dzikir-xiii`.

## Skema item

```json
{
  "id": "petang-dzikir-iii",
  "collection": "petang",
  "order": 9,
  "title": "Dzikir petang III",
  "pdf_page": 39,
  "pdf_pages": [39],
  "repeat": { "count": 1, "text": "Dibaca 1×" },
  "arabic": "(string Arab, atau null)",
  "arabic_status": "matched",
  "arabic_ref": { "repo": "kanglerian/api-dzikir-pagi-petang", "id": 7, "confidence": "high" },
  "latin": "Allahumma bika amsaynaa wa bika ashbahnaa ...",
  "translation": "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu petang ...",
  "quran_ref": null,
  "virtue": null,
  "source": { "text": "HR. Al-Bukhari dalam al-Adabul Mufrad no. 1199 ...", "grade": "shahih", "grade_text": "shahih" },
  "notes": []
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | Slug stabil: `<koleksi>-<kunci>`. Tidak akan berubah antar versi minor |
| `collection` | `"pagi"` / `"petang"` | |
| `order` | integer | Urutan dalam koleksi, mulai dari 1 |
| `title` | string | Judul persis seperti di buku (termasuk gaya huruf besar/kecil angka Romawinya) |
| `title_id_note` | string, opsional | Hanya pada Ta'awudz: buku tidak memberi judul terpisah |
| `pdf_page` / `pdf_pages` | integer / array | Halaman PDF sumber (halaman pertama / semua halaman item) |
| `repeat.count` | integer atau `null` | Jumlah bacaan bila satu angka tegas; `null` bila buku menulis beberapa pilihan atau tidak menyebut |
| `repeat.text` | string atau `null` | Tulisan buku apa adanya, mis. `Dibaca 1× atau 10x atau 100x` |
| `arabic` | string atau `null` | Teks Arab (dengan harakat), disalin dari proyek referensi. `null` bila tidak yakin cocok |
| `arabic_status` | `matched` / `ambiguous` / `unmatched` | Hasil pencocokan ke referensi |
| `arabic_ref` | object atau `null` | `repo`, `id` entri referensi, `confidence`; bila bukan `matched`: `candidates`. `alt_ids` bila referensi punya entri kembar |
| `latin` | string atau `null` | Transliterasi latin dari buku (apa adanya, termasuk ejaan buku) |
| `translation` | string | Terjemahan Indonesia dari buku, tanpa tanda kutip pembungkus |
| `quran_ref` | string atau `null` | Rujukan surat/ayat yang tertulis di buku (mis. `Al-Ikhlash/112: 1-4`) |
| `virtue` | string atau `null` | Kutipan keutamaan ("Barangsiapa ...") yang tertulis sebelum rujukan hadits |
| `source.text` | string atau `null` | Rujukan hadits dari buku, apa adanya |
| `source.grade` | `shahih` / `hasan` / `null` | Hanya bila buku menyebutnya eksplisit di rujukan item itu |
| `source.grade_text` | string atau `null` | Frasa derajat persis dari buku (mis. `hasan shahih`, yang dibiarkan tanpa `grade`) |
| `notes` | array | `{ "label": "Catatan" \| "Penjelasan" \| "Dalil tambahan", "text": "..." }` dari buku |

Struktur buku yang tidak biasa (Ta'awudz di halaman Ayat Kursi, Dzikir XI dan XII dalam satu halaman, dan lain-lain) dijelaskan di [`docs/FLAGS.md`](docs/FLAGS.md).

## Contoh pemakaian

JavaScript (`fetch`):

```js
const BASE = 'https://erikagus.github.io/api-dzikir-pagi-petang-sunnah/api/v1/';

const pagi = await (await fetch(BASE + 'pagi.json')).json();
for (const item of pagi.items) {
  console.log(item.order, item.title, item.repeat.text);
}

const { item } = await (await fetch(BASE + 'items/pagi-ayat-kursi.json')).json();
console.log(item.latin, item.translation, item.source.text);
```

`curl` (dan `jq`):

```bash
curl -s https://erikagus.github.io/api-dzikir-pagi-petang-sunnah/api/v1/index.json | jq '.counts'
curl -s https://erikagus.github.io/api-dzikir-pagi-petang-sunnah/api/v1/petang.json | jq -r '.items[] | "\(.order). \(.title)"'
```

Jangan lupa menampilkan atribusi (field `attribution` ada di setiap berkas koleksi dan item) dan menampilkan isi tanpa diubah.

## Verifikasi teks Arab

Buku sumber berupa PDF yang teks Arabnya tidak bisa diekstrak. Karena itu **teks Arab tidak berasal dari buku ini**. Teks Arab disalin otomatis (byte demi byte, tidak diketik atau disunting manual) dari [kanglerian/api-dzikir-pagi-petang](https://github.com/kanglerian/api-dzikir-pagi-petang), lalu dicocokkan ke setiap item buku lewat kemiripan terjemahan Indonesia (ditambah judul, kutipan ayat, dan nama kitab hadits).

Hal-hal yang perlu kamu tahu:

- Redaksi terjemahan di referensi sering berbeda dari buku, jadi ada kemungkinan lafaz atau harakat di referensi tidak persis sama dengan latin di buku. **Semua teks Arab harus dicek oleh orang yang paham sebelum dipakai untuk hal yang penting.**
- Status saat ini: 37 item `matched`, 0 `ambiguous`, 0 `unmatched`. Skor kemiripan tiap item dan item yang perlu perhatian ekstra ada di [`docs/FLAGS.md`](docs/FLAGS.md).
- Kalau pencocokan tidak yakin, `arabic` bernilai `null` dan item dicatat di FLAGS.
- Jumlah bacaan, latin, terjemahan, dan rujukan selalu dari buku, bukan dari referensi.
- Buku punya dugaan salah ketik di beberapa tempat. Semuanya dipertahankan dan dicatat di FLAGS, tidak diperbaiki.

## Pengembangan

Tanpa dependensi npm. Butuh Node.js 20 ke atas.

```bash
node scripts/build.js      # membaca sources/ lalu menulis api/v1/* dan docs/FLAGS.md
node scripts/validate.js   # cek skema dan keaslian teks
npm test                   # node:test
```

`sources/raw.txt` adalah hasil `pdftotext -layout` dari PDF buku, dan `sources/dzikr.json` adalah berkas referensi Arab. Asal-usulnya ada di [`sources/SOURCES.md`](sources/SOURCES.md). Validator memastikan antara lain: setiap string Arab identik byte demi byte dengan berkas referensi, setiap teks Indonesia/latin/rujukan ada persis di ekstraksi buku, tidak ada karakter sampah (U+FFFD) atau sisa footer halaman, id unik, jumlah item sesuai buku, dan `arabic: null` hanya untuk item yang tercantum di FLAGS.

## Pemberitahuan penting

- **Isi (teks dzikir, latin, terjemahan, rujukan, keutamaan, catatan) adalah milik Yayasan Cinta Sedekah** ([cintasedekah.org](https://www.cintasedekah.org)), disusun oleh Sekretariat Yayasan Cinta Sedekah dan Ustadz Abul Aswad Al Bayaty. Buku menyatakan: "Dilarang mengubah apapun isi tulisan tanpa izin dari penulis." Karena itu isi diterbitkan **tanpa perubahan** dan dengan atribusi.
- **Teks Arab** diambil dari [kanglerian/api-dzikir-pagi-petang](https://github.com/kanglerian/api-dzikir-pagi-petang) oleh Lerian, yang berbasis Hisnul Muslim. Terima kasih kepada Lerian.
- **Lisensi MIT di repositori ini hanya berlaku untuk kode** (`scripts/`, `test/`, `index.html`). Isi buku **tidak** dilisensikan ulang di bawah MIT dan haknya tetap pada pemiliknya. Teks Arab tetap tunduk pada ketentuan proyek asalnya.
- Pemilik repositori bukan penulis buku. Kalau kamu pemilik hak dan ingin isi ini diubah atau dihapus, atau kamu menemukan kesalahan penyalinan, hubungi pemilik repositori lewat GitHub Issues di repositori ini (atau profil [@erikagus](https://github.com/erikagus)); permintaan penghapusan akan segera ditindaklanjuti.

Detail lengkap: [`NOTICE.md`](NOTICE.md). Lisensi kode: [`LICENSE`](LICENSE).
