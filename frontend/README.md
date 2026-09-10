# 🧪 Cold Driver - Frontend API Documentation & Testing Console

Aplikasi antarmuka web interaktif berbasis **React 19**, **TypeScript**, dan **Vite** yang berfungsi khusus sebagai **konsol dokumentasi dan playground pengujian** untuk REST API backend Cold Driver.

Antarmuka ini mempermudah developer dan penguji untuk:
- Menginspeksi isi koleksi database MongoDB secara visual (*read*).
- Menguji pengiriman payload dokumen JSON ke endpoint backend tanpa tools eksternal (*write / POST*).
- Mengetahui status koneksi langsung ke backend API (`http://localhost:3000`).

---

## 🚀 Panduan Menjalankan Konsol

### 1. Pastikan Backend Telah Berjalan
Sebelum menyalakan konsol ini, pastikan server backend Cold Driver sudah aktif di `http://localhost:3000`.

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Menjalankan Mode Development
```bash
bun dev
```
Buka peramban pada alamat lokal Vite yang muncul di terminal (default: `http://localhost:5173`).

---

## 🛠️ Skrip yang Tersedia

| Perintah | Keterangan |
| :--- | :--- |
| `bun dev` | Menjalankan Vite development server dengan HMR |
| `bun run build` | Kompilasi build antarmuka ke folder `dist/` |
| `bun run preview` | Menjalankan preview lokal dari hasil build |
| `bun run lint` | Menjalankan linter cepat menggunakan [Oxlint](https://oxc.rs/) |

---

## 📂 Struktur Kode Konsol

```text
src/
├── main.tsx     # Bootstrapping React DOM
├── App.tsx      # Komponen utama konsol dokumentasi & form pengujian JSON
├── App.css      # Styling tampilan konsol gelap (Dark Console)
└── index.css    # Gaya dasar & typography
```

---

## ⚙️ Target Endpoint Backend

Secara default, konsol ini terhubung ke backend API pada:
```ts
const API_URL = 'http://localhost:3000/api'
```
Mendukung interaksi langsung dengan resource:
- `users`
- `categories`
- `inventories`
- `stock-histories`
- `announcements`
- `documentations`
