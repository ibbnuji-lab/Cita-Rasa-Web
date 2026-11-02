/* =========================================================
   mascot.js - tiga maskot: Tomo, Caca, Cili
   Pilihan maskot disimpan di localStorage (kunci: cn_maskot)
   ========================================================= */

const DAFTAR_MASKOT = [
  {
    id: "tomo",
    nama: "Tomo",
    peran: "Si Tomat",
    warna: "#d8402f",
    latar: "#fdeae4",
    gambar: "assets/mascots/tomo.svg",
    deskripsi: "Tomo adalah si penuh energi! Selalu semangat mencoba hal baru, dan percaya bahwa setiap masakan bisa jadi cerita yang istimewa.",
    sapaan: [
      "Halo! Aku Tomo si tomat. Yuk masak bareng!",
      "Hai, teman dapur! Siap mencoba resep baru hari ini?"
    ],
    tips: [
      "Bakar tomat dan cabai sebentar sebelum diulek, sambalnya jadi lebih harum.",
      "Ayam sebaiknya diungkep dulu sebelum digoreng, supaya bumbunya meresap sampai dalam.",
      "Tiriskan ayam goreng di atas rak atau kertas dapur supaya tetap renyah."
    ],
    ajakan: [
      "Bingung mau masak apa? Coba tombol Masak Apa Hari Ini!",
      "Penasaran resep khas daerahmu? Cek Peta Kuliner, yuk!"
    ]
  },
  {
    id: "caca",
    nama: "Caca",
    peran: "Si Wortel",
    warna: "#ee7a1c",
    latar: "#fff1dc",
    gambar: "assets/mascots/caca.svg",
    deskripsi: "Caca adalah si ceria dan penuh perhatian. Selalu punya ide sehat dan lezat, karena baginya, makanan enak juga harus baik untuk tubuh.",
    sapaan: [
      "Hai! Aku Caca si wortel. Senang ketemu kamu!",
      "Halo! Ada yang bisa Caca bantu di dapur hari ini?"
    ],
    tips: [
      "Lumuri bebek dengan jeruk nipis dan garam sebelum dimasak untuk mengurangi bau amisnya.",
      "Tambahkan lalapan segar seperti wortel dan timun di sisi piring supaya hidangan lebih seimbang.",
      "Daging ayam sudah matang kalau cairannya bening saat ditusuk, tidak lagi merah muda."
    ],
    ajakan: [
      "Centang bahan yang sudah siap di halaman resep, biar belanjanya tidak ada yang ketinggalan.",
      "Suka sebuah resep? Tekan ikon hati untuk menyimpannya ke Resep Favorit."
    ]
  },
  {
    id: "cili",
    nama: "Cili",
    peran: "Si Cabai",
    warna: "#c8281d",
    latar: "#fde6e3",
    gambar: "assets/mascots/cili.svg",
    deskripsi: "Cili adalah si berani dan penuh warna! Memberikan rasa pedas yang bikin hidup lebih bersemangat, terutama saat melangkah bersama teman-teman.",
    sapaan: [
      "Halo! Aku Cili si cabai. Siap yang pedas-pedas?",
      "Hai! Cili di sini. Ayo kita jelajahi rasa Nusantara!"
    ],
    tips: [
      "Buang biji cabai kalau ingin sambal yang pedasnya lebih lembut.",
      "Siram sambal dengan minyak panas supaya aromanya keluar dan rasanya lebih matang.",
      "Santan jangan dididihkan terlalu keras supaya tidak pecah. Aduk pelan dan pakai api kecil."
    ],
    ajakan: [
      "Berani coba Ayam Taliwang dari Lombok? Pedasnya mantap!",
      "Punya resep ayam atau bebek andalan keluargamu? Kirim lewat Usul Resep!"
    ]
  }
];

const Mascot = {
  kunci: "cn_maskot",
  terpilih: null,
  waktu: null,
  urutan: 0,
  daftarPesan: [],

  cari(id) {
    return DAFTAR_MASKOT.find((m) => m.id === id);
  },

  init() {
    this.buatKartuPilihan();

    document.querySelectorAll('[data-action="open-picker"]').forEach((t) => {
      t.addEventListener("click", () => {
        this.sembunyikanBalon();
        this.bukaPemilih();
      });
    });
    document.getElementById("mascotBtn").addEventListener("click", () => this.bicara());

    const tersimpan = this.cari(Simpan.baca(this.kunci, null));
    if (tersimpan) {
      this.pasang(tersimpan);
      setTimeout(() => this.katakan(this.acakDari(tersimpan.sapaan)), 1200);
    } else {
      this.bukaPemilih();
    }
  },

  buatKartuPilihan() {
    const grid = document.getElementById("pickerGrid");
    grid.replaceChildren();
    DAFTAR_MASKOT.forEach((m) => {
      const kartu = document.createElement("button");
      kartu.type = "button";
      kartu.className = "picker-card";
      kartu.dataset.maskot = m.id;
      kartu.style.setProperty("--card-color", m.warna);
      kartu.style.setProperty("--card-bg", m.latar);
      kartu.innerHTML = `
        <img src="${m.gambar}" alt="Maskot ${m.nama}, ${m.peran.toLowerCase()}" width="150" height="191">
        <span class="picker-name">${m.nama}</span>
        <span class="picker-role">${m.peran}</span>
        <p class="picker-desc">${m.deskripsi}</p>`;
      kartu.addEventListener("click", () => this.pilih(m.id));
      grid.appendChild(kartu);
    });
  },

  bukaPemilih() {
    const modal = document.getElementById("pickerModal");
    document.querySelectorAll(".picker-card").forEach((k) => {
      k.classList.toggle("is-chosen", k.dataset.maskot === (this.terpilih && this.terpilih.id));
    });
    if (modal.hidden) bukaModal(modal);
  },

  pilih(id) {
    const m = this.cari(id);
    if (!m) return;
    Simpan.tulis(this.kunci, id);
    this.pasang(m);
    tutupModal(document.getElementById("pickerModal"));
    this.katakan(`${this.acakDari(m.sapaan)} Aku akan menemanimu di sini.`);
  },

  pasang(m) {
    this.terpilih = m;
    this.daftarPesan = [...m.tips, ...m.ajakan, ...m.sapaan];
    this.urutan = Math.floor(Math.random() * this.daftarPesan.length);
    const img = document.getElementById("mascotImg");
    img.src = m.gambar;
    img.alt = `${m.nama}, ${m.peran.toLowerCase()}. Klik untuk mengajak bicara.`;
    document.getElementById("mascotFloat").hidden = false;
  },

  acakDari(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /* klik maskot: tampilkan pesan berikutnya (tidak berulang berurutan) */
  bicara() {
    if (!this.terpilih) return;
    this.urutan = (this.urutan + 1) % this.daftarPesan.length;
    this.katakan(this.daftarPesan[this.urutan]);
  },

  /* tampilkan balon percakapan, tutup otomatis setelah 7 detik */
  katakan(teks) {
    if (!this.terpilih) return;
    document.getElementById("mascotText").textContent = teks;
    document.getElementById("mascotBubble").hidden = false;
    clearTimeout(this.waktu);
    this.waktu = setTimeout(() => this.sembunyikanBalon(), 7000);
  },

  sembunyikanBalon() {
    clearTimeout(this.waktu);
    document.getElementById("mascotBubble").hidden = true;
  }
};
