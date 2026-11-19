# NOTICE

Repositori ini memuat tiga hal dengan status hak yang berbeda. Lisensi MIT pada berkas `LICENSE` **hanya** berlaku untuk bagian pertama.

## 1. Kode (MIT)

`scripts/`, `test/`, `index.html`, dan `package.json` ditulis untuk repositori ini dan dilisensikan di bawah MIT (lihat `LICENSE`).

## 2. Isi buku (BUKAN MIT, hak pada pemiliknya)

Teks dzikir (judul, latin, terjemahan Indonesia, rujukan hadits, keutamaan, catatan, penjelasan, serta teks waktu dzikir) di `api/v1/`, `sources/raw.txt`, dan `docs/` berasal dari buku:

> **Dzikir Pagi & Petang Sesuai Sunnah Nabi**
> Penyusun: Sekretariat Yayasan Cinta Sedekah; Ustadz Abul Aswad Al Bayaty. Dimurajaah: Ustadz Abul Aswad Al Bayaty.
> Penerbit: Yayasan Cinta Sedekah, Jl. Nyi Ageng NIS, KG/511, Kelurahan Rejowinangun, Kotagede, Yogyakarta. www.cintasedekah.org, sekretariat@cintasedekah.org

Pernyataan hak cipta di buku (apa adanya): "Dilarang mengubah apapun isi tulisan tanpa izin dari penulis. Hak cipta dilindungi Undang-undang. All rights reserved"

Pemilik repositori ini menyatakan bahwa isi buku terbuka untuk dipakai dan yang dilarang hanyalah mengubah isinya. Karena itu:

- isi dipublikasikan **tanpa perubahan** (hanya spasi, pemenggalan baris, dan satu karakter sampah hasil ekstraksi PDF yang dirapikan; dugaan salah ketik di buku dipertahankan dan dicatat di `docs/FLAGS.md`),
- atribusi ke Yayasan Cinta Sedekah dicantumkan di setiap berkas API,
- isi **tidak dilisensikan ulang** di bawah MIT atau lisensi lain oleh repositori ini. Siapa pun yang memakainya wajib mematuhi ketentuan pemilik hak yang sama: tidak mengubah isi dan tetap menyebut sumber.

Siapa pun yang memakai API ini untuk produk sendiri bertanggung jawab memastikan pemakaiannya sesuai ketentuan pemilik hak.

## 3. Teks Arab

Teks Arab (field `arabic`) tidak berasal dari buku. Teks itu disalin tanpa perubahan dari **kanglerian/api-dzikir-pagi-petang** oleh Lerian (https://github.com/kanglerian/api-dzikir-pagi-petang), yang berbasis Hisnul Muslim. Berkas yang dipakai tersimpan sebagai `sources/dzikr.json`.

Catatan jujur soal lisensi proyek asal: README proyek itu menampilkan lencana lisensi MIT dan menyatakan atribusi dihargai, sedangkan `package.json`-nya menulis `ISC` dan tidak ada berkas LICENSE di dalamnya. Atribusi ke Lerian dicantumkan di sini dan di setiap berkas API. Teks Arab tetap tunduk pada ketentuan proyek asalnya, bukan pada MIT repositori ini.

## Kontak dan permintaan penghapusan

Pemilik hak (Yayasan Cinta Sedekah, Lerian, atau pihak lain) yang ingin isi diubah, ditambah, atau dihapus, atau siapa pun yang menemukan kesalahan penyalinan, silakan hubungi pemilik repositori lewat GitHub Issues di repositori ini atau profil https://github.com/erikagus. Permintaan penghapusan akan segera ditindaklanjuti.

## Batasan

Isi disalin dari hasil ekstraksi PDF dan dicocokkan ke Arab secara otomatis. Tidak ada jaminan bebas dari kesalahan. Verifikasi teks Arab oleh orang yang paham diperlukan sebelum dipakai untuk hal penting (lihat `docs/FLAGS.md`).
