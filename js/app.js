/* =========================================================
   app.js - inti website
   Isi: penyimpanan, ilustrasi makanan, kartu resep, halaman,
        pencarian & filter, favorit, detail resep, checklist bahan.
   ========================================================= */

/* Ubah ke true setelah kamu menaruh foto makanan di assets/images/
   dengan nama sesuai id resep, misalnya: assets/images/opor-ayam.jpg */
const PAKAI_FOTO = true;

/* Urutan wilayah saat resep dikelompokkan */
const URUTAN_WILAYAH = ["Sumatera", "Jawa", "Bali & Nusa Tenggara", "Kalimantan", "Sulawesi", "Maluku & Papua"];

/* Resep yang tampil di Beranda */
const RESEP_PILIHAN = [
  "opor-ayam", "ayam-betutu", "ayam-rica-rica", "bebek-bumbu-hitam-madura",
  "soto-ayam-lamongan", "ayam-taliwang", "ayam-geprek-sambal-bawang", "itik-lado-mudo"
];

/* ---------- Penyimpanan aman (localStorage) ---------- */
const Simpan = {
  baca(kunci, awal) {
    try {
      const nilai = localStorage.getItem(kunci);
      return nilai === null ? awal : JSON.parse(nilai);
    } catch (e) {
      return awal;
    }
  },
  tulis(kunci, nilai) {
    try {
      localStorage.setItem(kunci, JSON.stringify(nilai));
    } catch (e) {
      /* penyimpanan diblokir (mode privat), abaikan saja */
    }
  }
};

/* ---------- Objek utama ---------- */
const App = {
  resep: [],
  petaData: null,
  sumber: {},
  favorit: Simpan.baca("cn_favorit", []),
  centang: Simpan.baca("cn_centang", {}),
  filter: { q: "", jenis: "semua", wilayah: "semua" },
  resepTerbuka: null,
  mauAcak: false,
  terakhirAcak: null,
  fokusSebelumnya: null,
  hooks: {}, /* fungsi yang dijalankan saat halaman tertentu dibuka */

  cari(id) {
    return this.resep.find((r) => r.id === id);
  }
};

/* ---------- Alat kecil ---------- */
function escapeHtml(teks) {
  return String(teks).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function normalisasi(teks) {
  return String(teks).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

/* angka acak yang selalu sama untuk teks yang sama (supaya gambar tidak berubah-ubah) */
function benih(teks) {
  let h = 2166136261;
  for (let i = 0; i < teks.length; i++) {
    h ^= teks.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gelapkan(hex, jumlah) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - jumlah))));
  return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join("");
}

/* ---------- Ilustrasi makanan (SVG) ----------
   Dipakai sebagai gambar menu. Kalau PAKAI_FOTO = true dan fotonya ada,
   foto akan menggantikan ilustrasi ini. */
function ilustrasiMakanan(r) {
  const acak = benih(r.id);
  const w = r.warna || "#b9753a";
  const gelap = gelapkan(w, 0.28);
  const kuah = r.tipe === "kuah";
  const bakar = r.tipe === "bakar";
  const sambal = r.tipe === "sambal";
  const hijau = r.tipe === "hijau" || r.id === "ayam-tangkap";
  let isi = "";

  /* piring atau mangkuk */
  if (kuah) {
    isi += `<ellipse cx="200" cy="168" rx="132" ry="104" fill="#f7efe0" stroke="#d9c7a6" stroke-width="3"/>
            <ellipse cx="200" cy="150" rx="116" ry="88" fill="#fffaf0" stroke="#e8d9bb" stroke-width="3"/>
            <ellipse cx="200" cy="150" rx="102" ry="76" fill="${w}"/>
            <ellipse cx="170" cy="128" rx="50" ry="22" fill="#fff" opacity=".18"/>`;
    for (let i = 0; i < 9; i++) {
      const x = 130 + acak() * 140, y = 112 + acak() * 70;
      isi += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(3 + acak() * 4).toFixed(1)}" fill="#fff6d8" opacity=".75"/>`;
    }
    isi += `<ellipse cx="200" cy="150" rx="40" ry="26" fill="#f2c986" stroke="#d9a65a" stroke-width="2"/>
            <path d="M172 146 q14 -14 28 0 q14 -12 28 0 M176 158 q12 8 24 0 q12 8 24 0" stroke="#c98a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <ellipse cx="248" cy="172" rx="16" ry="12" fill="#fffdf4" stroke="#e2cf9e" stroke-width="2"/>
            <circle cx="248" cy="172" r="6" fill="#f2b84a"/>`;
  } else {
    isi += `<ellipse cx="200" cy="170" rx="156" ry="112" fill="#f3e9d6" stroke="#d9c7a6" stroke-width="3"/>
            <ellipse cx="200" cy="162" rx="140" ry="100" fill="#fffaf0" stroke="#e8d9bb" stroke-width="3"/>
            <ellipse cx="200" cy="162" rx="112" ry="78" fill="none" stroke="#efe3c8" stroke-width="3"/>`;
    /* nasi */
    isi += `<ellipse cx="128" cy="176" rx="50" ry="36" fill="#fffdf6" stroke="#e8dcc0" stroke-width="2"/>
            <ellipse cx="124" cy="160" rx="40" ry="26" fill="#fff"/>`;
    for (let i = 0; i < 14; i++) {
      isi += `<ellipse cx="${(100 + acak() * 52).toFixed(0)}" cy="${(146 + acak() * 38).toFixed(0)}" rx="3.2" ry="1.7" fill="#efe4c6" transform="rotate(${(acak() * 180).toFixed(0)} 128 164)"/>`;
    }
    /* sambal / saus */
    if (sambal) {
      isi += `<path d="M230 192 q28 12 56 -2 q10 -22 -10 -34 q-30 -10 -52 12 q-8 14 6 24z" fill="#c8301c"/>
              <circle cx="246" cy="174" r="4" fill="#e85a3a"/><circle cx="268" cy="180" r="3.4" fill="#e85a3a"/>`;
    }
    /* potongan daging (paha) */
    const potong = [[228, 142, -24], [262, 164, 16], [214, 176, 38]];
    potong.slice(0, r.jenis === "bebek" ? 3 : 2).forEach(([x, y, rot], i) => {
      isi += `<g transform="translate(${x} ${y}) rotate(${rot})">
                <rect x="-46" y="-4" width="40" height="8" rx="4" fill="#f6ead2" stroke="#dcc9a2" stroke-width="2"/>
                <circle cx="-48" cy="-5" r="6" fill="#f6ead2" stroke="#dcc9a2" stroke-width="2"/>
                <circle cx="-48" cy="5" r="6" fill="#f6ead2" stroke="#dcc9a2" stroke-width="2"/>
                <ellipse cx="6" cy="0" rx="40" ry="26" fill="${i === 1 ? gelap : w}" stroke="${gelap}" stroke-width="3"/>
                <ellipse cx="-4" cy="-9" rx="22" ry="8" fill="#fff" opacity=".22"/>
                ${bakar ? '<path d="M-14 -14 l16 28 M4 -18 l16 34 M22 -12 l10 22" stroke="#2a150a" stroke-width="3" stroke-linecap="round" opacity=".55"/>' : ""}
              </g>`;
    });
    /* hiasan */
    if (hijau) {
      for (let i = 0; i < 6; i++) {
        isi += `<ellipse cx="${(190 + acak() * 100).toFixed(0)}" cy="${(112 + acak() * 36).toFixed(0)}" rx="14" ry="5" fill="#4c7a2c" transform="rotate(${(acak() * 160 - 80).toFixed(0)} 240 130)"/>`;
      }
    }
    if (r.id.includes("keju")) {
      isi += `<path d="M206 130 q24 -14 48 2 q-4 18 -22 20 q-14 4 -26 -22z" fill="#f6c443" stroke="#e0a424" stroke-width="2"/>`;
    }
    /* lalapan */
    isi += `<ellipse cx="288" cy="206" rx="24" ry="9" fill="#6f9a3c"/>
            <circle cx="268" cy="212" r="9" fill="#e6402a"/><circle cx="268" cy="212" r="4" fill="#f27b60"/>`;
  }

  /* potongan cabai di atas */
  isi += `<ellipse cx="${(250 + acak() * 20).toFixed(0)}" cy="${(120 + acak() * 12).toFixed(0)}" rx="7" ry="3.2" fill="#d7261b"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="Ilustrasi ${escapeHtml(r.nama)}" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="300" fill="#7a4b2a"/>
    <rect width="400" height="300" fill="#3b1f12" opacity=".16"/>
    <path d="M0 40 H400 M0 100 H400 M0 160 H400 M0 220 H400 M0 280 H400" stroke="#4a2a14" stroke-opacity=".28" stroke-width="2"/>
    <ellipse cx="206" cy="272" rx="150" ry="14" fill="#000" opacity=".22"/>
    ${isi}
  </svg>`;
}

/* Membuat isi gambar: ilustrasi, lalu foto kalau PAKAI_FOTO = true */
function isiGambar(wadah, r) {
  wadah.innerHTML = ilustrasiMakanan(r);
  if (!PAKAI_FOTO) return;
  const foto = new Image();
  foto.alt = r.nama;
  foto.onload = () => wadah.replaceChildren(foto);
  foto.src = `assets/images/${r.id}.jpg`;
}

/* ---------- Kartu resep ---------- */
const IKON_HATI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2.2 0 3.7 1.2 5.4 3.2 1.7-2 3.2-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.1C19.5 16.4 12 21 12 21z" stroke-linejoin="round"/></svg>';

function buatKartu(r) {
  const bungkus = document.createElement("div");
  bungkus.className = "card-wrap";

  const kartu = document.createElement("button");
  kartu.type = "button";
  kartu.className = "card";
  kartu.dataset.openRecipe = r.id;
  kartu.setAttribute("aria-label", `Buka resep ${r.nama}`);

  const gbr = document.createElement("div");
  gbr.className = "card-img";
  isiGambar(gbr, r);

  const nama = document.createElement("div");
  nama.className = "card-name";
  nama.textContent = r.nama;

  kartu.append(gbr, nama);

  const hati = document.createElement("button");
  hati.type = "button";
  hati.className = "fav-btn";
  hati.dataset.favId = r.id;
  hati.innerHTML = IKON_HATI;
  tandaiHati(hati, r.id);

  bungkus.append(kartu, hati);
  return bungkus;
}

function tandaiHati(tombol, id) {
  const sukses = App.favorit.includes(id);
  tombol.classList.toggle("is-fav", sukses);
  tombol.setAttribute("aria-pressed", String(sukses));
  const nama = (App.cari(id) || {}).nama || "resep";
  tombol.setAttribute("aria-label", sukses ? `Hapus ${nama} dari favorit` : `Simpan ${nama} ke favorit`);
}

/* ---------- Favorit ---------- */
function toggleFavorit(id) {
  const i = App.favorit.indexOf(id);
  if (i >= 0) App.favorit.splice(i, 1);
  else App.favorit.push(id);
  Simpan.tulis("cn_favorit", App.favorit);

  document.querySelectorAll("[data-fav-id]").forEach((t) => tandaiHati(t, t.dataset.favId));
  const tombolModal = document.getElementById("recipeFav");
  if (App.resepTerbuka === id) tandaiHatiModal(tombolModal, id);
  perbaruiJumlahFavorit();
  tampilkanFavorit();
}

function tandaiHatiModal(tombol, id) {
  tombol.dataset.favId = id;
  tombol.innerHTML = IKON_HATI;
  tandaiHati(tombol, id);
}

function perbaruiJumlahFavorit() {
  const lencana = document.getElementById("favCount");
  lencana.textContent = App.favorit.length;
  lencana.hidden = App.favorit.length === 0;
}

function tampilkanFavorit() {
  const grid = document.getElementById("favGrid");
  const kosong = document.getElementById("favEmpty");
  grid.replaceChildren();
  const daftar = App.favorit.map((id) => App.cari(id)).filter(Boolean);
  daftar.forEach((r) => grid.appendChild(buatKartu(r)));
  kosong.hidden = daftar.length > 0;
}

/* ---------- Katalog, pencarian & filter ---------- */
function isiPilihanWilayah() {
  const pilih = document.getElementById("wilayahSelect");
  pilih.innerHTML = '<option value="semua">Semua wilayah</option>' +
    URUTAN_WILAYAH.map((w) => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join("");
}

function tampilkanKatalog() {
  const { q, jenis, wilayah } = App.filter;
  const kata = normalisasi(q);

  const hasil = App.resep.filter((r) =>
    (jenis === "semua" || r.jenis === jenis) &&
    (wilayah === "semua" || r.wilayah === wilayah) &&
    (kata === "" || normalisasi(r.nama).includes(kata))
  );

  const wadah = document.getElementById("catalog");
  const info = document.getElementById("resultInfo");
  wadah.replaceChildren();

  if (hasil.length === 0) {
    info.textContent = "";
    wadah.innerHTML = `<div class="empty-state"><h3>Resep tidak ditemukan</h3>
      <p>Coba kata kunci lain, atau atur ulang filternya.</p></div>`;
    return;
  }

  info.textContent = `Menampilkan ${hasil.length} dari ${App.resep.length} resep`;

  URUTAN_WILAYAH.forEach((w) => {
    const grup = hasil.filter((r) => r.wilayah === w);
    if (grup.length === 0) return;
    const bagian = document.createElement("section");
    bagian.className = "region-group";
    bagian.innerHTML = `<h3 class="region-title">${escapeHtml(w)} <small>${grup.length} resep</small></h3>`;
    const grid = document.createElement("div");
    grid.className = "grid";
    grup.forEach((r) => grid.appendChild(buatKartu(r)));
    bagian.appendChild(grid);
    wadah.appendChild(bagian);
  });
}

function aturUlangFilter() {
  App.filter = { q: "", jenis: "semua", wilayah: "semua" };
  document.getElementById("searchInput").value = "";
  document.getElementById("wilayahSelect").value = "semua";
  tandaiChipJenis();
  tampilkanKatalog();
}

function tandaiChipJenis() {
  document.querySelectorAll("#jenisChips .chip").forEach((c) => {
    const aktif = c.dataset.jenis === App.filter.jenis;
    c.classList.toggle("is-active", aktif);
    c.setAttribute("aria-pressed", String(aktif));
  });
}

/* ---------- Beranda ---------- */
function tampilkanBeranda() {
  const grid = document.getElementById("featuredGrid");
  grid.replaceChildren();
  RESEP_PILIHAN.map((id) => App.cari(id)).filter(Boolean).forEach((r) => grid.appendChild(buatKartu(r)));

  const piring = App.cari("bebek-bumbu-hitam-madura") || App.resep[0];
  isiGambar(document.getElementById("heroPlate"), piring);
}

/* ---------- Detail resep (modal) ---------- */
function bukaModal(el) {
  App.fokusSebelumnya = document.activeElement;
  el.hidden = false;
  document.body.style.overflow = "hidden";
  const tutup = el.querySelector(".modal-close");
  if (tutup) tutup.focus();
}

function tutupModal(el) {
  el.hidden = true;
  if (document.querySelectorAll(".modal:not([hidden])").length === 0) {
    document.body.style.overflow = "";
  }
  if (App.fokusSebelumnya && document.body.contains(App.fokusSebelumnya)) {
    App.fokusSebelumnya.focus();
  }
}

function bukaResep(id, dariAcak) {
  const r = App.cari(id);
  if (!r) return;
  App.resepTerbuka = id;
  App.mauAcak = Boolean(dariAcak);

  const modal = document.getElementById("recipeModal");
  isiGambar(document.getElementById("recipeMedia"), r);
  document.getElementById("recipeTitle").textContent = r.nama;
  document.getElementById("recipeOrigin").textContent = `Asal: ${r.asal}`;
  document.getElementById("recipeSummary").textContent = r.ringkas;
  document.getElementById("recipeMeta").textContent = `${r.porsi} · ${r.waktu} · ${r.jenis === "bebek" ? "Bebek" : "Ayam"}`;
  tandaiHatiModal(document.getElementById("recipeFav"), id);

  /* bahan + checklist */
  const dicentang = App.centang[id] || [];
  const daftar = document.getElementById("recipeIngredients");
  daftar.replaceChildren();
  r.bahan.forEach((b, i) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const cek = document.createElement("input");
    cek.type = "checkbox";
    cek.checked = dicentang.includes(i);
    cek.addEventListener("change", () => simpanCentang(id, i, cek.checked));
    const teks = document.createElement("span");
    teks.textContent = b;
    label.append(cek, teks);
    li.appendChild(label);
    daftar.appendChild(li);
  });
  perbaruiProgres(r);

  /* langkah */
  const langkah = document.getElementById("recipeSteps");
  langkah.replaceChildren();
  r.langkah.forEach((l) => {
    const li = document.createElement("li");
    li.textContent = l;
    langkah.appendChild(li);
  });

  /* tautan referensi (data/sumber.json), hanya tautan https yang ditampilkan */
  const tautan = (App.sumber[id] || []).filter((s) => /^https:\/\//.test(s.url));
  const daftarSumber = document.getElementById("recipeSourceList");
  daftarSumber.replaceChildren();
  tautan.forEach((s) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = s.judul;
    li.appendChild(a);
    daftarSumber.appendChild(li);
  });
  document.getElementById("recipeSources").hidden = tautan.length === 0;

  document.getElementById("recipeActions").hidden = !App.mauAcak;

  const kotak = modal.querySelector(".modal-box");
  kotak.scrollTop = 0;
  if (modal.hidden) bukaModal(modal);
  else modal.querySelector(".modal-close").focus();
}

function simpanCentang(id, indeks, nilai) {
  const set = new Set(App.centang[id] || []);
  if (nilai) set.add(indeks);
  else set.delete(indeks);
  App.centang[id] = [...set].sort((a, b) => a - b);
  if (App.centang[id].length === 0) delete App.centang[id];
  Simpan.tulis("cn_centang", App.centang);
  perbaruiProgres(App.cari(id));
}

function perbaruiProgres(r) {
  const n = (App.centang[r.id] || []).length;
  document.getElementById("checkProgress").textContent = `(${n} dari ${r.bahan.length} siap)`;
}

function hapusSemuaCentang() {
  const id = App.resepTerbuka;
  if (!id) return;
  delete App.centang[id];
  Simpan.tulis("cn_centang", App.centang);
  document.querySelectorAll("#recipeIngredients input").forEach((c) => { c.checked = false; });
  perbaruiProgres(App.cari(id));
}

/* ---------- Masak Apa Hari Ini? ---------- */
function masakAcak() {
  let pilihan;
  do {
    pilihan = App.resep[Math.floor(Math.random() * App.resep.length)];
  } while (App.resep.length > 1 && pilihan.id === App.terakhirAcak);
  App.terakhirAcak = pilihan.id;
  bukaResep(pilihan.id, true);
  if (window.Mascot) Mascot.katakan(`Hari ini masak ${pilihan.nama}! Pilihan yang enak.`);
}

/* ---------- Halaman (navigasi) ---------- */
const HALAMAN = ["beranda", "jelajah", "peta", "favorit", "usul", "tentang"];

function tampilkanHalaman() {
  let nama = location.hash.replace("#", "");
  if (!HALAMAN.includes(nama)) nama = "beranda";

  HALAMAN.forEach((h) => {
    document.getElementById("page-" + h).hidden = h !== nama;
  });
  document.querySelectorAll(".main-nav a").forEach((a) => {
    const aktif = a.dataset.page === nama;
    a.classList.toggle("is-active", aktif);
    if (aktif) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  const judul = document.getElementById("page-" + nama).dataset.title;
  document.title = `${judul} - Citarasa Nusantara`;

  tutupMenu();
  window.scrollTo({ top: 0, behavior: "auto" });
  if (nama === "favorit") tampilkanFavorit();
  if (App.hooks[nama]) App.hooks[nama]();
}

function tutupMenu() {
  document.getElementById("mainNav").classList.remove("is-open");
  const t = document.getElementById("navToggle");
  t.setAttribute("aria-expanded", "false");
  t.setAttribute("aria-label", "Buka menu");
}

/* ---------- Pasang semua klik & input ---------- */
function pasangEvent() {
  /* tombol menu di HP */
  const toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", () => {
    const buka = document.getElementById("mainNav").classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(buka));
    toggle.setAttribute("aria-label", buka ? "Tutup menu" : "Buka menu");
  });

  /* satu pendengar klik untuk semua kartu & tombol hati */
  document.addEventListener("click", (e) => {
    const hati = e.target.closest("[data-fav-id]");
    if (hati) {
      e.preventDefault();
      toggleFavorit(hati.dataset.favId);
      return;
    }
    const kartu = e.target.closest("[data-open-recipe]");
    if (kartu) bukaResep(kartu.dataset.openRecipe);
  });

  /* tutup modal: tombol X, latar gelap, atau tombol Esc */
  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) tutupModal(m);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const terbuka = [...document.querySelectorAll(".modal:not([hidden])")].pop();
    if (terbuka) tutupModal(terbuka);
  });

  document.getElementById("btnRandom").addEventListener("click", masakAcak);
  document.getElementById("btnRandomAgain").addEventListener("click", masakAcak);
  document.getElementById("btnClearChecks").addEventListener("click", hapusSemuaCentang);

  /* pencarian & filter */
  document.getElementById("searchInput").addEventListener("input", (e) => {
    App.filter.q = e.target.value;
    tampilkanKatalog();
  });
  document.getElementById("jenisChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    App.filter.jenis = chip.dataset.jenis;
    tandaiChipJenis();
    tampilkanKatalog();
  });
  document.getElementById("wilayahSelect").addEventListener("change", (e) => {
    App.filter.wilayah = e.target.value;
    tampilkanKatalog();
  });
  document.getElementById("btnReset").addEventListener("click", aturUlangFilter);

  window.addEventListener("hashchange", tampilkanHalaman);
}

/* ---------- Memuat data JSON ---------- */
async function muatData() {
  const [resep, peta, sumber] = await Promise.all([
    fetch("data/recipes.json").then((r) => { if (!r.ok) throw new Error("recipes.json"); return r.json(); }),
    fetch("data/map.json").then((r) => { if (!r.ok) throw new Error("map.json"); return r.json(); }),
    /* sumber.json boleh tidak ada: website tetap jalan tanpa tautan referensi */
    fetch("data/sumber.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
  ]);
  App.resep = resep;
  App.petaData = peta;
  App.sumber = sumber;
}

function tampilkanGalatMuat(err) {
  const main = document.getElementById("main");
  main.innerHTML = `<div class="container narrow"><div class="empty-state" style="margin-top:40px">
    <h3>Data resep belum bisa dimuat</h3>
    <p>Website ini perlu dijalankan lewat server lokal, bukan dengan klik dua kali pada index.html.
    Di VS Code, pasang ekstensi <b>Live Server</b>, lalu klik kanan <b>index.html</b> &rarr; <b>Open with Live Server</b>.</p>
    <p><small>Detail: ${escapeHtml(err.message)}</small></p></div></div>`;
}
