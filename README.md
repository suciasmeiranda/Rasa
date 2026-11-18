# Rasa — Aplikasi Pemesanan Makanan

Rasa adalah aplikasi web pemesanan makanan yang dibangun dengan **React + Vite + TypeScript**. Aplikasi mencakup alur pemesanan lengkap untuk pelanggan dan panel admin untuk mengelola menu serta pesanan.

Semua data disimpan di **localStorage** browser, jadi tidak perlu backend atau database. Saat pertama kali dibuka, aplikasi otomatis mengisi menu dan pesanan demo.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Perintah lain:

```bash
npm run build      # cek tipe + build produksi ke folder dist
npm run preview    # pratinjau hasil build
npm run typecheck  # cek tipe saja
```

## Deploy ke GitHub Pages

Push ke `main` otomatis build dan deploy lewat `.github/workflows/deploy.yml`. Sekali saja setelah repo dibuat, buka **Settings → Pages** lalu set **Source** ke **GitHub Actions**.

Situs akan tersedia di `https://suciasmeiranda.github.io/Rasa/`. Workflow menjalankan build dengan `GITHUB_PAGES=true`, yang membuat Vite memakai base path `/Rasa/`. Build lokal (`npm run build`) tetap memakai root, jadi aman untuk Vercel, Netlify, atau domain sendiri.

## Fitur pelanggan

- **Katalog menu** dengan pencarian, filter kategori, dan pengurutan (populer, harga, rating).
- **Detail menu** dalam modal: pilih jumlah, tambah catatan, lalu masukkan ke keranjang.
- **Keranjang** dengan ubah jumlah, hapus item, dan kode promo.
- **Checkout** untuk antar atau ambil sendiri, lengkap dengan validasi form.
- **Halaman sukses** dengan ringkasan pesanan dan status terkini.
- **Riwayat pesanan**: lihat detail, lacak status, pesan ulang, atau batalkan pesanan.
- Tampilan responsif untuk desktop dan ponsel (navigasi bawah di layar kecil).

## Panel admin

Buka menu **Admin** atau alamat `#/admin`.

- **Ringkasan**: statistik pesanan, pendapatan, grafik 7 hari, menu terlaris, dan pesanan terbaru.
- **Kelola menu**: tambah, ubah, hapus menu, serta atur ketersediaan (tersedia/habis).
- **Kelola pesanan**: cari/filter pesanan, lihat detail, dan ubah status pesanan.
- **Reset data demo** untuk mengembalikan menu dan pesanan ke kondisi awal.

> Panel admin bersifat demo dan belum memakai autentikasi.

## Kode promo demo

| Kode | Keterangan |
| --- | --- |
| `HEMAT10` | Diskon 10% dari subtotal, maksimal Rp25.000 |
| `GRATISONGKIR` | Gratis biaya antar |

## Aturan biaya

- Biaya antar Rp12.000, gratis untuk subtotal mulai Rp100.000.
- Biaya layanan Rp2.000.
- Pesanan ambil sendiri tidak dikenakan biaya antar.

## Struktur singkat

```
src/
  components/   Header, keranjang, checkout, toast, footer, navigasi
  data/         Menu dan pesanan demo
  lib/          Format rupiah/tanggal, perhitungan total, status pesanan
  pages/        Menu, pesanan, sukses, dan admin
  store/        State global + penyimpanan localStorage
  styles/       CSS per area (base, home, cart, checkout, admin, responsif)
```

## Teknologi

React 18, TypeScript, Vite 6, dan `lucide-react` untuk ikon.
