# Sumber data

Berkas di folder ini adalah masukan untuk `scripts/build.js`. Jangan disunting; hasil build bergantung penuh pada keduanya.

## `raw.txt`

Keluaran `pdftotext -layout` dari PDF buku **"Dzikir Pagi & Petang Sesuai Sunnah Nabi"** (Yayasan Cinta Sedekah). Halaman dipisahkan karakter form-feed (`\f`); halaman PDF ke-N adalah potongan ke-N.

- Halaman 5: halaman hak cipta/kredit, 8: Waktu Dzikir (afdhol dan longgar), 9: sampul dzikir pagi, 10 sampai 30: dzikir pagi, 31: sampul dzikir petang, 32 sampai 51: dzikir petang.
- Glyph Arab tidak ikut terekstrak (hilang). Karakter U+FFFD setelah "Dibaca 1" dan "Dibaca 3" adalah tanda kali yang rusak saat ekstraksi.
- PDF aslinya tidak disertakan di repositori ini.

## `dzikr.json`

Salinan `dzikr.json` dari https://github.com/kanglerian/api-dzikir-pagi-petang (oleh Lerian, berbasis Hisnul Muslim). Kunci `pagi` (26 entri) dan `petang` (24 entri), dengan field `id`, `judul`, `arab`, `dalil`, `latin`, `arti`, `ulang`. Hanya field `arab` yang dipakai sebagai teks (disalin byte demi byte); `arti`, `judul`, `dalil` hanya dipakai untuk mencocokkan entri referensi dengan item buku.

Catatan lisensi proyek asal: README menampilkan lencana MIT, `package.json` menulis ISC, dan tidak ada berkas LICENSE. Atribusi ke Lerian dicantumkan di NOTICE.md dan setiap berkas API.
