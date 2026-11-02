/* =========================================================
   peta.js - peta kuliner interaktif (Leaflet + OpenStreetMap)
   Data penanda ada di data/map.json
   ========================================================= */

const Peta = {
  peta: null,
  penanda: {}, /* provinsi -> marker */
  wilayahAktif: "semua",
  pusatAwal: [-2.5, 118],
  zoomAwal: 5,

  /* dipanggil setiap kali halaman Peta dibuka */
  tampil() {
    if (!window.L) {
      document.getElementById("map").hidden = true;
      document.getElementById("mapFallback").hidden = false;
      return;
    }
    if (!this.peta) {
      this.buat();
    } else {
      /* peta sebelumnya tersembunyi, hitung ulang ukurannya */
      setTimeout(() => this.peta.invalidateSize(), 50);
    }
  },

  buat() {
    this.peta = L.map("map", { minZoom: 4, maxZoom: 12, scrollWheelZoom: true })
      .setView(this.pusatAwal, this.zoomAwal);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.peta);

    this.peta.setMaxBounds([[-14, 90], [9, 145]]);

    App.petaData.titik.forEach((t) => {
      const kosong = t.resep.length === 0;
      const ikon = L.divIcon({
        className: "",
        html: `<div class="pin${kosong ? " kosong" : ""}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });
      const marker = L.marker([t.lat, t.lng], { icon: ikon, title: t.provinsi, keyboard: true })
        .addTo(this.peta)
        .bindPopup(this.isiPopup(t), { maxWidth: 280 });
      this.penanda[t.provinsi] = marker;
    });

    this.buatDaftar();
    this.peta.invalidateSize();
  },

  isiPopup(t) {
    const kotak = document.createElement("div");

    const judul = document.createElement("h4");
    judul.className = "pop-title";
    judul.textContent = t.provinsi;

    const wil = document.createElement("p");
    wil.className = "pop-region";
    wil.textContent = t.wilayah;

    const info = document.createElement("p");
    info.className = "pop-info";
    info.textContent = t.info;

    kotak.append(judul, wil, info);

    if (t.resep.length > 0) {
      const daftar = document.createElement("div");
      daftar.className = "pop-list";
      t.resep.forEach((id) => {
        const r = App.cari(id);
        if (!r) return;
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = `${r.nama} (${r.jenis})`;
        b.addEventListener("click", () => bukaResep(id));
        daftar.appendChild(b);
      });
      kotak.appendChild(daftar);
    }
    return kotak;
  },

  buatDaftar() {
    const chips = document.getElementById("regionChips");
    chips.replaceChildren();
    const semua = ["semua", ...App.petaData.wilayah.map((w) => w.nama)];
    semua.forEach((nama) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.wilayah = nama;
      b.textContent = nama === "semua" ? "Semua" : nama;
      b.addEventListener("click", () => this.pilihWilayah(nama));
      chips.appendChild(b);
    });
    this.pilihWilayah("semua", false);
  },

  pilihWilayah(nama, gerak = true) {
    this.wilayahAktif = nama;
    document.querySelectorAll("#regionChips .chip").forEach((c) => {
      c.classList.toggle("is-active", c.dataset.wilayah === nama);
    });

    const daftar = document.getElementById("regionList");
    daftar.replaceChildren();
    App.petaData.titik
      .filter((t) => nama === "semua" || t.wilayah === nama)
      .forEach((t) => {
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        const n = t.resep.length;
        b.innerHTML = `<b>${escapeHtml(t.provinsi)}</b><span>${n > 0 ? n + " resep" : "belum ada"}</span>`;
        b.addEventListener("click", () => this.fokusKe(t));
        li.appendChild(b);
        daftar.appendChild(li);
      });

    if (gerak && this.peta) {
      if (nama === "semua") {
        this.peta.flyTo(this.pusatAwal, this.zoomAwal, { duration: 0.8 });
      } else {
        const w = App.petaData.wilayah.find((x) => x.nama === nama);
        if (w) this.peta.flyTo(w.pusat, w.zoom, { duration: 0.8 });
      }
    }
  },

  fokusKe(t) {
    if (!this.peta) return;
    this.peta.flyTo([t.lat, t.lng], 8, { duration: 0.8 });
    this.peta.once("moveend", () => this.penanda[t.provinsi].openPopup());
    document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
  }
};
