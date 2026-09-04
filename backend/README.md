# Inventory API

API inventaris sederhana memakai Elysia, Bun, dan MongoDB Driver v6. Data disimpan di MongoDB sesuai relasi tabel pada PDF.

## Menjalankan backend

```bash
cd backend
bun install
bun run index.ts
```

Pastikan MongoDB aktif, lalu server berjalan di `http://localhost:3000`.

Environment variable opsional:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=inventory_db
PORT=3000
```

## Endpoint

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/health` | Status API |
| GET, POST | `/api/users` | Pengguna |
| GET, POST | `/api/categories` | Kategori barang |
| GET, POST | `/api/inventories` | Barang inventaris; GET mendukung `?search=` |
| GET, POST | `/api/stock-histories` | Perubahan stok masuk/keluar |
| GET, POST | `/api/borrowings` | Peminjaman dan detail barang |
| POST | `/api/borrowings/:id/return` | Mengembalikan peminjaman |
| GET, POST | `/api/announcements` | Pengumuman |
| GET, POST | `/api/documentations` | Dokumentasi kegiatan |

Contoh membuat peminjaman:

```json
{
	"userId": 1,
	"namaPeminjam": "Budi",
	"kelas": "X RPL",
	"tujuan": "Presentasi",
	"tanggalPinjam": "2026-09-03",
	"items": [
		{ "inventoryId": 1, "jumlah": 1, "kondisiPinjam": "Baik" }
	]
}
```

Validasi request menggunakan schema Elysia. Jalankan typecheck dengan `bunx tsc --noEmit`.
