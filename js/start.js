/* =========================================================
   start.js - titik awal. Dijalankan paling akhir.
   Urutan: muat data -> tampilkan halaman -> pasang fitur
   ========================================================= */

(async function mulai() {
  try {
    await muatData();
  } catch (err) {
    tampilkanGalatMuat(err);
    return;
  }

  isiPilihanWilayah();
  pasangEvent();
  tandaiChipJenis();
  tampilkanBeranda();
  tampilkanKatalog();
  perbaruiJumlahFavorit();

  App.hooks.peta = () => Peta.tampil();

  Usul.init();
  tampilkanHalaman();
  Mascot.init();
})();
