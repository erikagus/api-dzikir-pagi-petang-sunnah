# FLAGS: item yang perlu diverifikasi manusia

File ini dibuat otomatis oleh `scripts/build.js`. Jangan disunting tangan; ubah sumbernya lalu jalankan `node scripts/build.js`.

## 1. Aturan dasar

- Teks Indonesia, latin, dan rujukan disalin dari ekstraksi PDF buku tanpa diubah. Hanya urusan spasi/pemenggalan baris, karakter sampah pdftotext (U+FFFD, yang aslinya tanda kali), dan pembungkus tanda kutip ganda terluar pada latin/terjemahan yang dirapikan.
- Teks Arab TIDAK ada di ekstraksi PDF (glyph Arab hilang). Semua teks Arab di API ini disalin otomatis, byte demi byte, dari `sources/dzikr.json` (kanglerian/api-dzikir-pagi-petang). Tidak ada satu huruf Arab pun diketik atau disunting manual.
- Pencocokan buku ke entri referensi dilakukan lewat kemiripan terjemahan Indonesia (plus judul, kutipan ayat, dan nama kitab hadits bila ada). Skor dan sinyalnya dicatat di bawah.
- Karena terjemahan referensi berbeda redaksi dari buku, SEMUA Arab tetap harus dicek oleh orang yang paham sebelum dipakai untuk hal penting (mis. cetak, ajar). Harakat dan pilihan lafaz di referensi bisa saja berbeda dari latin buku.

## 2. Status Arab per item

Ringkasan: matched 37, ambiguous 0, unmatched 0 (dari 37 item).

| id | status | id referensi | skor terjemahan | selisih ke kandidat lain | sinyal | perlu perhatian ekstra |
|---|---|---|---|---|---|---|
| `pagi-ta-awudz` | matched | 1 | 1 | 0.687 | translation+title | - |
| `pagi-ayat-kursi` | matched | 2 | 0.593 | 0.393 | translation+title+quran-citation | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-al-ikhlas` | matched | 3 | 0.571 | 0.265 | translation+title+quran-citation | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-al-falaq` | matched | 4 | 0.706 | 0.486 | translation+title+quran-citation | - |
| `pagi-an-naas` | matched | 5 | 0.84 | 0.613 | translation+title+quran-citation | - |
| `pagi-dzikir-i` | matched | 15 | 0.543 | 0.361 | translation+title+hadith-collections | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-dzikir-ii` | matched | 13 | 0.55 | 0.4 | translation+hadith-collections | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-dzikir-iii` | matched | 7 | 1 | 0.776 | translation | - |
| `pagi-dzikir-iv` | matched | 6 | 0.636 | 0.321 | translation | - |
| `pagi-sayyidul-istighfar` | matched | 8 | 0.41 | 0.142 | translation+title | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-dzikir-vi` | matched | 10 | 0.741 | 0.566 | translation+hadith-collections | - |
| `pagi-dzikir-vii` | matched | 9 | 0.818 | 0.479 | translation | - |
| `pagi-dzikir-viii` | matched | 11 | 0.74 | 0.436 | translation+hadith-collections | - |
| `pagi-dzikir-ix` | matched | 12 | 0.414 | 0.157 | translation+hadith-collections | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-dzikir-x` | matched | 14 | 0.839 | 0.639 | translation | - |
| `pagi-dzikir-xi` | matched | 21 | 0.591 | 0.328 | translation | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-dzikir-xii` | matched | 23 | 1 | 0.687 | translation | - |
| `pagi-dzikir-xiii` | matched | 20 | 0.536 | 0.25 | translation | redaksi terjemahan referensi cukup berbeda dari buku |
| `pagi-dzikir-xiv` | matched | 24 | 0.778 | 0.478 | translation+hadith-collections | - |
| `petang-ta-awudz` | matched | 1 | 1 | 0.687 | translation+title | - |
| `petang-ayat-kursi` | matched | 2 | 0.593 | 0.393 | translation+title+quran-citation | redaksi terjemahan referensi cukup berbeda dari buku |
| `petang-al-ikhlas` | matched | 3 | 0.571 | 0.265 | translation+title+quran-citation | redaksi terjemahan referensi cukup berbeda dari buku |
| `petang-al-falaq` | matched | 4 | 0.706 | 0.486 | translation+title+quran-citation | - |
| `petang-an-naas` | matched | 5 | 0.84 | 0.613 | translation+title+quran-citation | - |
| `petang-dzikir-i` | matched | 16 | 0.759 | 0.577 | translation+title+hadith-collections | - |
| `petang-dzikir-ii` | matched | 13 | 0.55 | 0.418 | translation+hadith-collections | redaksi terjemahan referensi cukup berbeda dari buku |
| `petang-dzikir-iii` | matched | 7 | 0.826 | 0.63 | translation | - |
| `petang-dzikir-iv` | matched | 6 | 0.75 | 0.434 | translation | - |
| `petang-sayyidul-istighfar` | matched | 8 | 0.41 | 0.142 | translation+title | redaksi terjemahan referensi cukup berbeda dari buku |
| `petang-dzikir-vi` | matched | 10 | 0.727 | 0.555 | translation+hadith-collections | - |
| `petang-dzikir-vii` | matched | 9 | 0.844 | 0.499 | translation | - |
| `petang-dzikir-viii` | matched | 11 | 0.74 | 0.436 | translation+hadith-collections | - |
| `petang-dzikir-ix` | matched | 12 | 0.414 | 0.157 | translation+hadith-collections | redaksi terjemahan referensi cukup berbeda dari buku |
| `petang-dzikir-x` | matched | 14 | 0.839 | 0.639 | translation | - |
| `petang-dzikir-xi` | matched | 21 | 0.846 | 0.533 | translation | - |
| `petang-dzikir-xii` | matched | 23 | 1 | 0.786 | translation | - |
| `petang-dzikir-xiii` | matched | 15 | 0.536 | 0.255 | translation | redaksi terjemahan referensi cukup berbeda dari buku; referensi punya entri kembar (id 22) yang hanya beda urutan tanda baca Unicode; dipakai id 15 |

Item dengan `arabic: null` (wajib terdaftar di sini):

- (tidak ada; semua item berhasil dicocokkan dengan keyakinan tinggi, tetapi lihat poin di bawah)

## 3. Arab yang perlu dicek lebih teliti

- `pagi-dzikir-viii` dan `petang-dzikir-viii`: terjemahan referensi menyebut "balatentaranya", sedangkan buku menulis "ajakannya menyekutukan Allah" (latin buku: "syirkihi"). Harakat/lafaz pada kata ini di referensi bisa berbeda dari latin buku.
- `pagi-dzikir-vi` dan `petang-dzikir-vi`: referensi menerjemahkan "ampunan dan keselamatan", buku "kebajikan dan keselamatan". Doanya sama; cek lafaz Arab kata pertama.
- `pagi-sayyidul-istighfar`, `petang-sayyidul-istighfar`, `pagi-dzikir-ix`, `petang-dzikir-ix`: skor kemiripan terjemahan rendah (sekitar 0.41) karena redaksi terjemahan berbeda; dicocokkan dengan bantuan sinyal tambahan (judul / nama kitab hadits). Dzikirnya jelas sama menurut isi, tetapi tetap perlu dicek.
- `pagi-dzikir-iii` dan `petang-dzikir-iii`: buku pagi "ilaikan nusyuur", petang "ilaikal mashir". Pastikan Arab pagi berakhir "an-nusyur" dan petang "al-mashir" (keduanya dicocokkan dari entri pagi/petang referensi yang berbeda; tes memastikan string Arab keduanya memang berbeda).
- Pasangan pagi/petang lain yang redaksinya berbeda sengaja dicocokkan ke entri referensi pagi atau petang masing-masing, bukan disalin dari sisi lain.

## 4. Jumlah bacaan: buku vs referensi

Nilai buku dipertahankan; referensi tidak digabung.

- `pagi-ta-awudz`: buku tidak menyebut jumlah bacaan; referensi id 1 "Ta'awudz" ulang 1.
- `pagi-dzikir-xiii`: buku "Dibaca 1× atau 10x atau 100x" (count null); referensi id 20 "Tahlil (10x atau 1x)" ulang 10.
- `petang-ta-awudz`: buku tidak menyebut jumlah bacaan; referensi id 1 "Ta'awudz" ulang 1.
- `petang-dzikir-xiii`: buku "Dibaca 1× atau 10x atau 100x" (count null); referensi id 15 "Tahlil (10x atau 1x)" ulang 10.

## 5. Struktur buku yang tidak biasa

- **Ta'awudz**: kalimat ini hanya tertulis sebagai kutipan di bagian atas halaman Ayat Kursi (pagi hlm. 10, petang hlm. 32). Dipisah jadi item sendiri (`pagi-ta-awudz`, `petang-ta-awudz`). Buku tidak memberi latin untuk Ta'awudz dan tidak memberi jumlah bacaan/rujukan sendiri, jadi `latin`, `repeat.count`, dan `source` bernilai null.
- **Dzikir XI dan XII tertanam di satu halaman** (pagi hlm. 28; petang xi dan xii di hlm. 50). Keduanya dipisah jadi dua item. Dua baris rujukan di bagian bawah halaman diletakkan di item XII saja (posisinya di bawah blok XII). Item XI (`pagi-dzikir-xi`, `petang-dzikir-xi`) memiliki `source.text` null karena buku tidak menempatkan rujukan di bawahnya. Baris rujukan pertama (Muslim no. 2726, Juwairiyah) kemungkinan milik XI pada pagi, tetapi tidak ditebak.
- Pada petang, dua baris rujukan yang sama muncul di bawah XII (Muslim no. 2726 dari Juwairiyah dan Muslim no. 2691/2692 dari Abu Hurairah); item xi petang (a'udzu bikalimaatillah) tidak memiliki rujukan sendiri di buku.
- **Sayyidul Istighfar** menempati urutan ke-5 tanpa label angka; penomoran berlanjut "vI" (Dzikir pagi vI / petang vi).
- Item dua halaman (latin di halaman pertama, terjemahan di halaman kedua): Ayat Kursi, IV, Sayyidul Istighfar, vI. Rujukan dan keutamaan yang tertulis di kedua halaman identik dan hanya dicantumkan sekali (build gagal bila keduanya berbeda).
- `virtue` adalah kutipan keutamaan ("Barangsiapa ...") yang di buku tertulis tepat sebelum rujukan hadits; `notes` memuat "Catatan" dan "Penjelasan" apa adanya. Pada `pagi-dzikir-xiv` terdapat hadits Ibnu Umar tambahan yang disimpan di `notes` dengan label "Dalil tambahan".
- Petang tidak memiliki Dzikir XIV (istighfar 100x) dan tasbih XI "adada khalqihi" dalam buku; pagi tidak memiliki a'udzu bikalimaatillah. Itu sesuai buku, tidak ditambah dari referensi.

## 6. Perbedaan latin antara versi pagi dan petang (dari buku)

Daftar kata yang hanya ada di salah satu sisi. Sebagian memang disengaja (amsaynaa vs ashbahnaa, dst.), sebagian bisa jadi salah ketik di buku. Tidak ada yang diubah.

- `pagi-ayat-kursi` vs `petang-ayat-kursi`: hanya di pagi: maa, hifdzu; hanya di petang: man, khifdzu
- `pagi-dzikir-i` vs `petang-dzikir-i`: hanya di pagi: ashbahnaa; hanya di petang: amsaynaa
- `pagi-dzikir-iii` vs `petang-dzikir-iii`: hanya di pagi: ashbahna, ilaikan, nusyuur; hanya di petang: ashbahnaa, ilaikal, mashir
- `pagi-dzikir-iv` vs `petang-dzikir-iv`: teks latin berbeda menyeluruh (68 kata berbeda); memang dzikir versi pagi dan petang yang berbeda redaksi, tidak dirinci.
- `pagi-sayyidul-istighfar` vs `petang-sayyidul-istighfar`: hanya di pagi: bidhanbii; hanya di petang: bidzanbii
- `pagi-dzikir-vi` vs `petang-dzikir-vi`: hanya di pagi: min, adzamatika; hanya di petang: an, adzomatika
- `pagi-dzikir-viii` vs `petang-dzikir-viii`: hanya di pagi: faathiras, rabba, in, min, syaithoni; hanya di petang: faathiris, rabbi, sysyaitahaai
- `pagi-dzikir-ix` vs `petang-dzikir-ix`: hanya di pagi: ladzi, samaa, i, huwassamiiul; hanya di petang: samaai, huwa, ssmiiul
- `pagi-dzikir-x` vs `petang-dzikir-x`: hanya di pagi: hayyu, qayyumu, kullahu; hanya di petang: hayyun, qayyum, kullihi
- `pagi-dzikir-xi` vs `petang-dzikir-xi`: teks latin berbeda menyeluruh (23 kata berbeda); memang dzikir versi pagi dan petang yang berbeda redaksi, tidak dirinci.
- `pagi-dzikir-xiii` vs `petang-dzikir-xiii`: hanya di pagi: qadiiru; hanya di petang: qadiir

Catatan khusus: latin Ayat Kursi pagi ("ya'lamu maa baina", "hifdzu") berbeda dari petang ("ya'lamu man baina", "khifdzu"). Arab dari referensi identik untuk keduanya; salah satu latin di buku kemungkinan salah ketik.

## 7. Dugaan salah ketik di buku (dipertahankan apa adanya)

- `pagi-dzikir-xi`: Latin "Subahnallah" (kemungkinan maksudnya Subhanallah).
- `petang-al-ikhlas`: Latin "ya kullahu" (kemungkinan maksudnya "yakun lahu"). Sama di pagi.
- `pagi-al-ikhlas`: Sama seperti petang: "ya kullahu".
- `pagi-dzikir-vii`: Latin "sasm'ii" (kemungkinan sam'ii). Sama di petang.
- `pagi-dzikir-viii`: Latin "syain in wa" memuat "in" yang berdiri sendiri; di petang tertulis "syain wa".
- `petang-dzikir-viii`: Latin "sysyaitahaai" tampak ganjil dibanding versi pagi ("syaithoni").
- `petang-dzikir-vi`: Terjemahan "kebaikn" (kemungkinan kebaikan).
- `pagi-dzikir-iv`: Terjemahan memuat tanda hubung di tengah kata ("se-suatu", "berlin-dung") akibat tata letak buku.
- `petang-dzikir-iv`: Terjemahan: spasi hilang setelah titik ("sesuatu.Wahai").
- `pagi-dzikir-vii`: Rujukan memuat "Shahiib" (kemungkinan Shahiih). Sama di petang.
- `pagi-dzikir-viii`: Rujukan: spasi hilang setelah koma ("5067,Lihat"). Sama di petang.
- `pagi-dzikir-ix`: Rujukan: spasi hilang setelah koma ("5088,Ibnu").
- `pagi-dzikir-iii`: Rujukan "Ahmad 11/354" (angka Romawi II kemungkinan tertulis sebagai "11"). Sama di petang.
- `pagi-dzikir-ix`: Latin "samaa' i" (spasi), sedangkan petang menulis "samaa'I".
- `petang-dzikir-ix`: Latin "samaa'I" (huruf besar I di tengah kata).
- `pagi-dzikir-xiv`: Dalil tambahan diawali "[" tetapi tidak ditutup "]" di buku.
- `pagi-dzikir-i`: Terjemahan tidak diakhiri tanda kutip penutup di buku (juga di petang-dzikir-i).
- `pagi-al-falaq`: Terjemahan berakhir dengan tanda kutip ganda yang diikuti backtick di buku; tidak dirapikan. Sama di petang-al-falaq.
- `pagi-dzikir-vi`: Judul bertuliskan "vI" (huruf besar I) di buku. Judul lain berselang-seling huruf besar/kecil (II, III, IV vs i, vii).

## 8. Glyph/teks yang hilang atau bergeser saat ekstraksi PDF

- Simbol shalawat (glyph kaligrafi setelah nama Nabi) hilang pada halaman PDF: 15, 16, 30, 37, 38. Terlihat sebagai spasi ganda setelah "Muhammad"/"Rasulullah" dan sudah dirapatkan menjadi satu spasi. Tidak ada glyph yang ditambahkan.
- Tanda akhir ayat pada latin Al-Ikhlas, Al-Falaq, An-Naas hilang; potongan ayat kini dipisah spasi tunggal (mis. "Qul huwa Allahu ahad Allahus Shamad Lam yalid ...").
- `meta.json` > `waktu.afdhol`: dua kata Arab pada paragraf pertama hilang, dan kata "ashil" bergeser dari tempat aslinya ("...sampai terbit ashil matahari. Adapun adalah, sore hari..."). Kemungkinan teks aslinya: "Adapun ashil adalah sore hari". Tidak diperbaiki karena itu mengubah teks; mohon cek ke PDF.
- `meta.json` > `waktu.longgar`: frasa "waktu waktu zawal" (kata ganda) ada di buku.
- Karakter pengganti pdftotext (U+FFFD) setelah "Dibaca 1" dan "Dibaca 3" dipetakan ke tanda kali (×). Pada "Dibaca 1× atau 10x atau 100x" dan "Dibaca 100x dalam sehari" buku memang memakai huruf x biasa.

## 9. Derajat hadits (grade)

`source.grade` hanya diisi bila buku menyebutkannya eksplisit di rujukan item itu. `source.grade_text` memuat frasa persis dari buku.

- Al-Ikhlas, Al-Falaq, An-Naas: buku menulis "hasan shahih" (dua kata). `grade` dibiarkan null supaya tidak memilih salah satu.
- `dzikir-ii` (Radhiitu): rujukan menulis "dishahihkan oleh Imam al-Hakim ... disetujui oleh Imam adz-Dzahabi, hasan". `grade` = hasan sesuai kata penutup eksplisit; pembaca perlu membaca `source.text` lengkapnya.
- `dzikir-ix`: buku menulis "sanad-nya shahih" (derajat sanad). `grade` = shahih dengan `grade_text` "sanad-nya shahih".
- Item tanpa kata derajat di rujukannya (Sayyidul Istighfar, viii, xi, xii, xiii, xiv, dan Ta'awudz) memiliki `grade` null. Catatan di `dzikir-xiii`/`xiv` tentang riwayat dha'if bukan derajat item itu sendiri.

## 10. Entri referensi yang TIDAK dimasukkan (tidak ada di buku)

- pagi: 16 "Persaksian Tauhid di Waktu Pagi"; 17 "Pengakuan Nikmat di Waktu Pagi"; 18 "Doa Memasuki Waktu Pagi"; 19 "Dzikir Hasbiyallahu (Cukup Allah bagiku)"; 22 "Doa Perlindungan dari Makhluk"; 25 "Doa Ilmu, Rizki, dan Amal"; 26 "Shalawat Nabi"
- petang: 17 "Persaksian di Waktu Sore"; 18 "Pengakuan Nikmat di Waktu Sore"; 19 "Dzikir Hasbiyallahu (Cukup Allah bagiku)"; 20 "Doa Memohon Kebaikan Malam"; 24 "Shalawat Nabi"

## 11. Hak cipta

Halaman hak cipta buku: "Dilarang mengubah apapun isi tulisan tanpa izin dari penulis. Hak cipta dilindungi Undang-undang. All rights reserved". Pemilik repositori menyatakan isi buku terbuka untuk dipakai dengan syarat tidak diubah; sebaiknya izin tertulis dari Yayasan Cinta Sedekah disimpan dan ditautkan di NOTICE.md sebelum repositori dipublikasikan.

