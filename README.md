# Citarasa Nusantara

Website interaktif untuk menjelajahi resep ayam dan bebek khas Indonesia.
Dibuat dengan HTML, CSS, dan JavaScript biasa. Tanpa framework, tanpa backend.

## Cara menjalankan

Website ini memuat data dari file JSON, jadi **tidak bisa** dibuka dengan klik dua kali pada `index.html`. Jalankan lewat server lokal:

1. Buka folder `citarasa-nusantara` di VS Code (File > Open Folder).
2. Pasang ekstensi **Live Server** (pembuat: Ritwick Dey) dari tab Extensions.
3. Klik kanan `index.html` > **Open with Live Server**.

Website akan terbuka di browser, biasanya di `http://127.0.0.1:5500`.

Perangkat harus terhubung ke internet karena peta (Leaflet dan OpenStreetMap) dan font (Google Fonts) dimuat dari internet. Tanpa internet, resep dan fitur lain tetap jalan, hanya peta dan font yang tidak muncul.

## Struktur file

```
citarasa-nusantara/
├── index.html          Semua halaman (Beranda, Jelajah, Peta, Favorit, Usul, Tentang)
├── css/
│   └── style.css       Semua tampilan. Warna ada di bagian :root paling atas
├── js/
│   ├── app.js          Inti: data, kartu resep, pencarian, filter, favorit, detail, checklist
│   ├── mascot.js       Tiga maskot (Tomo, Caca, Cili) dan balon percakapan
│   ├── peta.js         Peta interaktif Leaflet
│   ├── usul.js         Formulir Usul Resep
│   └── start.js        Titik awal, menjalankan semuanya (harus dimuat paling akhir)
├── data/
│   ├── recipes.json    25 resep ayam dan bebek
│   ├── map.json        Penanda dan info daerah untuk peta
│   └── sumber.json     Tautan referensi tiap resep (Cookpad dan sumber lain)
└── assets/
    ├── logo.svg
    ├── mascots/        tomo.svg, caca.svg, cili.svg
    ├── patterns/       tenun.svg, kawung.svg, daun.svg
    └── images/         25 foto makanan, nama file = id resep
```

## Cara menambah resep

Buka `data/recipes.json`, salin satu blok resep, lalu ubah isinya. Aturan penting:

- `id` harus unik dan tanpa spasi (contoh: `ayam-bakar-taliwang`).
- `jenis` hanya `"ayam"` atau `"bebek"`.
- `wilayah` harus salah satu dari: `Sumatera`, `Jawa`, `Bali & Nusa Tenggara`, `Kalimantan`, `Sulawesi`, `Maluku & Papua`.
- `tipe` mengatur gaya ilustrasi piring: `goreng`, `bakar`, `kuah`, `sambal`, `kuning`, `hitam`, atau `hijau`.
- Tambahkan id resep itu ke daftar `resep` pada provinsinya di `data/map.json` supaya muncul di peta.

Hati-hati dengan koma di JSON. Resep terakhir tidak boleh diakhiri koma.

## Tautan referensi

Tautan di bagian bawah detail resep dibaca dari `data/sumber.json`. Satu tautan per baris, berisi `judul` dan `url` (harus diawali `https://`). Hapus baris yang tidak cocok. Resep yang tidak punya entri di file ini tetap tampil tanpa bagian referensi.

## Foto makanan

Foto ada di `assets/images/`, satu file per resep dengan nama sesuai id resep (misalnya `opor-ayam.jpg`). Di `js/app.js`, `const PAKAI_FOTO = true;` menyalakannya. Kalau diubah ke `false`, website memakai ilustrasi piring buatan sendiri. Resep yang fotonya tidak ada juga otomatis memakai ilustrasi.

Untuk resep baru: taruh fotonya dengan nama `<id>.jpg`. Ukuran sekitar 800 sampai 1000 piksel sudah cukup.

**Soal hak cipta:** foto milik fotografernya masing-masing. Sebelum website dipublikasikan, pastikan kamu punya izin memakainya atau ganti dengan foto berlisensi bebas atau fotomu sendiri.

## Data yang tersimpan di browser

Disimpan lewat `localStorage` dan hanya ada di browser pengunjung itu sendiri:

| Kunci | Isi |
| --- | --- |
| `cn_maskot` | Maskot pilihan |
| `cn_favorit` | Daftar resep favorit |
| `cn_centang` | Bahan yang sudah dicentang |
| `cn_usul` | Usulan resep dari formulir |

Formulir Usul Resep mengirim usulan ke **Google Form** milik pengelola (jawabannya masuk ke Google Sheets), dan menyimpan salinannya di browser pengirim. Untuk mengatur ulang data browser, hapus data situs di pengaturan browser.

## Menyambungkan Google Form

Pengaturannya ada di bagian atas `js/usul.js` (`GOOGLE_FORM`): `id` form dan kode `entry.xxx` tiap pertanyaan. Kalau pertanyaan di Google Form diubah atau dibuat ulang, ambil lagi link lewat menu ⋮ > **Dapatkan link yang terisi otomatis**, lalu perbarui kodenya. Di setelan Google Form, **Wajib login** dan **Batasi ke 1 tanggapan** harus mati. Pilihan wilayah di Google Form harus sama persis dengan yang ada di formulir website.

## Ganti warna

Semua warna ada di bagian `:root` pada awal `css/style.css` (`--krem`, `--kayu`, `--terakota`, `--daun`). Ubah di sana dan seluruh website ikut berubah.

## Catatan

- Takaran bumbu pada resep adalah perkiraan. Sesuaikan dengan seleramu.
- Peta memakai tile OpenStreetMap. Untuk lalu lintas besar, sebaiknya pakai penyedia tile sendiri (lihat kebijakan OpenStreetMap).
