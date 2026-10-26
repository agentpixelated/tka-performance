# TKA Performance — versi bisa diisi

Salinan situs TKA Performance kemarin (commit `6135b7a`) yang dibuat **bisa
diisi siapa saja**, tanpa mengubah desain, komponen, atau data template
kemarin. Yang diubah hanya lapisan datanya: dari RPC server Muse
(`@hatch/space-sdk`, `bun:sqlite`) menjadi store lokal di browser.

## Cara pakai (pengunjung)

1. Buka situs hasil build (`dist/index.html` dari `bun run build:static`,
   atau deploy `dist/` ke GitHub Pages).
2. Saat pertama dibuka, situs menampilkan data template kemarin persis seperti
   aslinya: Hari 00–03, grafik akurasi, dan refleksi yang sudah ada.
3. Gulir ke bagian **Isi data** (tautan di navigasi atas) untuk mengisi:
   - **Hasil sesi per hari** — pilih Hari 01–15, tanggal, lalu isi per mapel:
     ditugaskan, dikerjakan, benar, dan (opsional) benar setelah refleksi.
     Rincian LOTS/MOTS/HOTS bersifat opsional. Tekan "Simpan hasil hari ini":
     grafik, snapshot bukti, dan rata-rata langsung berubah.
   - **Refleksi per soal** — tambah baris baru atau pilih baris yang sudah ada
     untuk diubah/dihapus. Isi judul, fokus, tautan, kategori (salah/tidak
     diisi), isi catatan KaTeX (Markdown, rumus di antara `$...$`), dan/atau
     tautan gambar diagram. Untuk video, pakai tautan MP4 langsung agar bisa
     diputar di halaman.
   - **Bank soal per mapel** — ubah angka LOTS/MOTS/HOTS per mapel.
4. **Ekspor JSON** untuk cadangan atau pindah perangkat; **Impor JSON** untuk
   memuat kembali; **Reset ke template kemarin** untuk mengembalikan data
   awal (konfirmasi dulu).

## Penting: data tidak bersama

Isian tersimpan di `localStorage` browser masing-masing dengan kunci
`tka-performance-fillable`. Dua orang yang membuka situs ini **tidak**
saling melihat isian satu sama lain dan tidak ada database bersama.
GitHub Pages hanya menyajikan berkas statis; ia tidak bisa menyimpan data
pengunjung. Untuk cadangan lintas perangkat, pakai Ekspor/Impor JSON.

## Aturan hitung yang dipertahankan

- Akurasi mapel Hari 01 memakai penyebut "dikerjakan"; Hari ≥ 2 memakai
  penyebut "ditugaskan" (sama seperti situs kemarin).
- Rata-rata harian = mean aritmetik akurasi mapel yang ada, bukan nol untuk
  mapel yang kosong. Hari tanpa data tidak punya titik grafik, jadi garisnya
  putus (tidak disambung).
- Hari 00 adalah arsip penilaian awal dan tidak diubah lewat formulir.
- Bagian "Yang harus diperbaiki per materi" (peta topik) masih memakai teks
  template kemarin; ia tidak dihitung ulang otomatis dari hasil hari yang
  baru — ubah lewat Impor JSON bila perlu.

## Keamanan input

Angka dikoersi dan dijepit, teks dibersihkan dari tag HTML dan dipangkas,
dan tautan hanya menerima `http(s)://`. Baris refleksi yang tautannya tidak
valid dibuang saat impor. Isian yang dirender sebagai teks React juga
ter-escape; catatan KaTeX dirender dengan `trust: false` seperti semula.

## Build statis (GitHub Pages)

```sh
bun install
bun run build:static   # output di dist/
```

Perubahan build dibanding aslinya:

- `client/src/api.ts` tidak lagi memakai `@hatch/space-sdk/client`; ia
  membaca `client/src/localStore.ts`.
- `client/src/main.tsx` membuat `QueryClient` sendiri (dulu
  `spaceQueryClient` dari SDK).
- `SafeAreaTopScrim` diganti stub lokal `client/src/SafeAreaTopScrim.tsx`.
- `client/build-static.mjs` menggantikan `client/build.mjs` (SDK). Karena
  `theme.css` mengimpor Tailwind tetapi JSX tidak memakai kelas utilitas
  Tailwind (semua kelas didefinisikan di `theme.css`), build ini mengganti
  impor CSS Tailwind dengan CSS kosong; preflight Tailwind tidak ikut.
  Bun juga menamai chunk CSS berekstensi `.js` bila nama entry memakai
  hash, jadi skrip build mengganti namanya menjadi `.css` dan menautkannya
  di `dist/index.html`.
- Dependensi `@hatch/space-sdk` (berkas lokal `/opt/hatch/...`, tidak ada di
  mesin lain) dihapus dari `package.json`; `client/tsconfig.json` tidak lagi
  menyertakan `server/src`. Skrip build Muse lama (`build`, `build:server`,
  `build:client`) dipertahankan apa adanya tetapi membutuhkan SDK dan tidak
  dipakai untuk situs statis ini.
- `server/` dan `drizzle/` tidak diubah dan tidak dipakai oleh build statis;
  mereka tinggal sebagai arsip sumber asli.
- Data template kemarin disalin verbatim dari `server/src/actions.ts` ke
  `client/src/dashboardTemplate.ts` (dengan definisi tipe yang sama), supaya
  build statis tidak perlu menyentuh server.

## Batasan yang masih ada sebelum deploy

- Video refleksi template tetap berupa berkas MP4 di repo (tidak diubah);
  deploy `dist/` hasil build akan menyertakan salinannya.
- TikZ tidak dirender di browser: unggah dulu hasil render diagram (PNG)
  lalu tempel tautannya. Manim juga tidak dirender di browser: pakai tautan
  MP4 hasil render.
- Belum ada uji klik di browser sungguhan untuk formulir ini (verifikasi
  dilakukan lewat typecheck, build statis, serve `dist/` + curl, dan uji
  logika store dengan Bun — lihat laporan verifikasi). Sebelum push ke
  `main`, sebaiknya dibuka sekali di browser dan dicoba: isi Hari 04, tambah
  satu refleksi, lalu muat ulang halaman untuk memastikan isian bertahan.
