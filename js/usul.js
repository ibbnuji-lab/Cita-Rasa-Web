/* =========================================================
   usul.js - formulir Usul Resep
   Usulan dikirim ke Google Form (lihat GOOGLE_FORM di bawah),
   dan salinannya disimpan di browser pengunjung (localStorage, kunci: cn_usul).
   Website ini tidak memakai backend sendiri.
   ========================================================= */

/* Pengaturan Google Form.
   - id    : bagian di antara /d/e/ dan /viewform pada link Google Form
   - entry : kode tiap pertanyaan (dari "Dapatkan link yang terisi otomatis")
   Kalau pertanyaan di Google Form diubah, kodenya bisa berubah. Perbarui di sini. */
const GOOGLE_FORM = {
  id: "1FAIpQLScg_K6zNxj6n7pikT_SFW8_UfZhITXB5wgwCGxT5S__SzuhtA",
  entry: {
    nama: "entry.1409947888",
    jenis: "entry.779643602",
    daerah: "entry.1658842437",
    bahan: "entry.1357430489",
    langkah: "entry.1927093650",
    pengirim: "entry.1443940596"
  }
};

const DAFTAR_DAERAH = ["Sumatera", "Jawa", "Bali & Nusa Tenggara", "Kalimantan", "Sulawesi", "Maluku & Papua"];

const Usul = {
  kunci: "cn_usul",
  daftar: Simpan.baca("cn_usul", []),

  init() {
    const form = document.getElementById("usulForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.kirim(form);
    });
    /* hapus pesan galat ketika pengguna mulai mengetik */
    form.addEventListener("input", (e) => {
      e.target.classList.remove("invalid");
      const g = form.querySelector(`.error[data-for="${e.target.name}"]`);
      if (g) g.textContent = "";
    });
    document.getElementById("suggestList").addEventListener("click", (e) => {
      const tombol = e.target.closest("[data-hapus]");
      if (tombol) this.hapus(tombol.dataset.hapus);
    });
    this.tampilkan();
  },

  periksa(data) {
    const galat = {};
    if (data.nama.length < 3) galat.nama = "Nama resep minimal 3 huruf.";
    if (!["ayam", "bebek"].includes(data.jenis)) galat.jenis = "Pilih ayam atau bebek. Website ini khusus resep ayam dan bebek.";
    if (!DAFTAR_DAERAH.includes(data.daerah)) galat.daerah = "Pilih wilayah asal resepnya.";
    if (data.bahan.length < 2) galat.bahan = "Tulis minimal 2 bahan, satu bahan per baris.";
    return galat;
  },

  async kirim(form) {
    const ambil = (n) => form.elements[n].value.trim();
    const data = {
      nama: ambil("nama"),
      jenis: ambil("jenis"),
      daerah: ambil("daerah"),
      bahan: ambil("bahan").split("\n").map((s) => s.trim()).filter(Boolean),
      langkah: ambil("langkah").split("\n").map((s) => s.trim()).filter(Boolean),
      pengirim: ambil("pengirim")
    };

    const galat = this.periksa(data);
    form.querySelectorAll(".error").forEach((el) => { el.textContent = galat[el.dataset.for] || ""; });
    ["nama", "jenis", "daerah", "bahan"].forEach((n) => form.elements[n].classList.toggle("invalid", Boolean(galat[n])));

    const status = document.getElementById("usulStatus");
    if (Object.keys(galat).length > 0) {
      status.style.color = "#b03a2e";
      status.textContent = "Mohon lengkapi bagian yang ditandai.";
      const pertama = Object.keys(galat)[0];
      form.elements[pertama].focus();
      return;
    }

    /* kirim ke Google Form. mode "no-cors": Google tidak membalas isinya,
       jadi kita hanya tahu apakah permintaannya sampai keluar atau gagal (mis. offline). */
    const tombol = form.querySelector("button[type=submit]");
    tombol.disabled = true;
    status.style.color = "";
    status.textContent = "Mengirim...";
    let terkirim = true;
    try {
      const isi = new URLSearchParams();
      const e = GOOGLE_FORM.entry;
      isi.set(e.nama, data.nama);
      isi.set(e.jenis, data.jenis === "bebek" ? "Bebek" : "Ayam");
      isi.set(e.daerah, data.daerah);
      isi.set(e.bahan, data.bahan.join("\n"));
      isi.set(e.langkah, data.langkah.join("\n"));
      isi.set(e.pengirim, data.pengirim);
      await fetch(`https://docs.google.com/forms/d/e/${GOOGLE_FORM.id}/formResponse`, {
        method: "POST",
        mode: "no-cors",
        body: isi
      });
    } catch (err) {
      terkirim = false;
    }
    tombol.disabled = false;

    if (!terkirim) {
      status.style.color = "#b03a2e";
      status.textContent = "Usulanmu belum terkirim. Periksa koneksi internet lalu coba lagi.";
      return;
    }

    data.id = "u" + Date.now();
    data.waktu = new Date().toISOString();
    this.daftar.unshift(data);
    Simpan.tulis(this.kunci, this.daftar);

    form.reset();
    status.style.color = "";
    status.textContent = "Terima kasih! Usulanmu sudah dikirim ke pengelola website.";
    this.tampilkan();
    if (window.Mascot) Mascot.katakan("Wah, usulan resep yang menarik. Terima kasih sudah berbagi!");
  },

  hapus(id) {
    this.daftar = this.daftar.filter((u) => u.id !== id);
    Simpan.tulis(this.kunci, this.daftar);
    this.tampilkan();
  },

  tampilkan() {
    const ul = document.getElementById("suggestList");
    ul.replaceChildren();
    if (this.daftar.length === 0) {
      const li = document.createElement("li");
      li.className = "suggest-empty";
      li.textContent = "Belum ada usulan yang kamu kirim dari browser ini.";
      ul.appendChild(li);
      return;
    }
    this.daftar.forEach((u) => {
      const li = document.createElement("li");
      li.className = "suggest-item";

      const isi = document.createElement("div");
      const h = document.createElement("h4");
      h.textContent = u.nama;
      const p = document.createElement("p");
      const tgl = new Date(u.waktu).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      p.textContent = `${u.jenis === "bebek" ? "Bebek" : "Ayam"} · ${u.daerah} · ${u.bahan.length} bahan · ${tgl}${u.pengirim ? " · oleh " + u.pengirim : ""}`;
      isi.append(h, p);

      const hapus = document.createElement("button");
      hapus.type = "button";
      hapus.className = "link-btn";
      hapus.dataset.hapus = u.id;
      hapus.textContent = "Hapus";
      hapus.setAttribute("aria-label", `Hapus usulan ${u.nama}`);

      li.append(isi, hapus);
      ul.appendChild(li);
    });
  }
};
