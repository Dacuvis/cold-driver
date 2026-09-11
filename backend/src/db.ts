import { Collection, Db, MongoClient } from "mongodb";
import type { Announcement, Borrowing, BorrowingItem, Category, Documentation, Inventory, StockHistory, User } from "./types";

export interface Database {
	client: MongoClient;
	users: Collection<User>;
	categories: Collection<Category>;
	inventories: Collection<Inventory>;
	stockHistories: Collection<StockHistory>;
	borrowings: Collection<Borrowing>;
	borrowingItems: Collection<BorrowingItem>;
	announcements: Collection<Announcement>;
	documentations: Collection<Documentation>;
}

export async function seedDatabase(db: Database) {
	const userCount = await db.users.countDocuments();
	if (userCount === 0) {
		await db.users.insertMany([
			{ id: 1, nama: "Administrator", username: "admin", password: "password123", role: "admin", createdAt: now() },
			{ id: 2, nama: "Petugas Lab", username: "petugas", password: "password123", role: "petugas", createdAt: now() },
			{ id: 3, nama: "Ahmad Peminjam", username: "ahmad", password: "password123", role: "peminjam", kelas: "XII RPL 1", createdAt: now() },
			{ id: 4, nama: "Budi Santoso", username: "budis", password: "password123", role: "peminjam", kelas: "XII RPL 2", createdAt: now() },
		]);
	}

	const categoryCount = await db.categories.countDocuments();
	if (categoryCount === 0) {
		await db.categories.insertMany([
			{ id: 1, namaKategori: "Elektronik", deskripsi: "Peralatan elektronik & komputer" },
			{ id: 2, namaKategori: "Perabot & Furnitur", deskripsi: "Meja, kursi, dan peralatan ruangan" },
			{ id: 3, namaKategori: "Alat Tulis Kantor", deskripsi: "Peralatan tulis dan ATK" },
		]);
	}

	const inventoryCount = await db.inventories.countDocuments();
	if (inventoryCount === 0) {
		await db.inventories.insertMany([
			{ id: 1, categoryId: 1, kodeBarang: "EL-001", namaBarang: "Laptop Asus ROG", stok: 5, kondisi: "Baik", lokasi: "Lab RPL 1", deskripsi: "Core i7 / 16GB RAM" },
			{ id: 2, categoryId: 1, kodeBarang: "EL-002", namaBarang: "Proyektor Epson HD", stok: 2, kondisi: "Baik", lokasi: "Ruang Media", deskripsi: "HDMI 4K support" },
			{ id: 3, categoryId: 2, kodeBarang: "FR-001", namaBarang: "Meja Komputer Ergonomis", stok: 10, kondisi: "Baik", lokasi: "Lab RPL 1", deskripsi: "Ukuran 120x60 cm" },
			{ id: 4, categoryId: 3, kodeBarang: "ATK-001", namaBarang: "Spidol Whiteboard Marker", stok: 24, kondisi: "Baik", lokasi: "Lemari ATK", deskripsi: "Warna hitam dan biru" },
		]);
	}

	const stockCount = await db.stockHistories.countDocuments();
	if (stockCount === 0) {
		await db.stockHistories.insertMany([
			{ id: 1, inventoryId: 1, userId: 1, jenis: "masuk", jumlah: 5, stokSebelum: 0, stokSesudah: 5, keterangan: "Pengadaan unit baru", createdAt: now() },
			{ id: 2, inventoryId: 2, userId: 2, jenis: "masuk", jumlah: 2, stokSebelum: 0, stokSesudah: 2, keterangan: "Stok proyektor lab", createdAt: now() },
		]);
	}

	const borrowingCount = await db.borrowings.countDocuments();
	if (borrowingCount === 0) {
		await db.borrowings.insertMany([
			{ id: 1, userId: 3, kodePeminjaman: "PJ-0001", namaPeminjam: "Ahmad Peminjam", kelas: "XII RPL 1", tujuan: "Praktikum Pemrograman Web", tanggalPinjam: "2026-09-10", status: "dipinjam", parafGuru: "Pak Budi S.Kom" },
			{ id: 2, userId: 4, kodePeminjaman: "PJ-0002", namaPeminjam: "Budi Santoso", kelas: "XII RPL 2", tujuan: "Presentasi Project PKK", tanggalPinjam: "2026-09-08", tanggalKembali: "2026-09-09", status: "dikembalikan", parafGuru: "Bu Siti M.Kom" },
		]);

		await db.borrowingItems.insertMany([
			{ id: 1, borrowingId: 1, inventoryId: 1, jumlah: 1, kondisiPinjam: "Baik" },
			{ id: 2, borrowingId: 2, inventoryId: 2, jumlah: 1, kondisiPinjam: "Baik", kondisiKembali: "Baik" },
		]);
	}

	const announcementCount = await db.announcements.countDocuments();
	if (announcementCount === 0) {
		await db.announcements.insertMany([
			{ id: 1, judul: "Pengumuman Stock Opname Lab RPL", isi: "Diberitahukan kepada seluruh siswa agar mengembalikan peralatan paling lambat hari Jumat.", createdBy: 1, createdAt: now() },
			{ id: 2, judul: "Aturan Baru Peminjaman Alat", isi: "Wajib menyertakan paraf guru pembimbing saat mengajukan peminjaman barang inventaris.", createdBy: 2, createdAt: now() },
		]);
	}

	const documentationCount = await db.documentations.countDocuments();
	if (documentationCount === 0) {
		await db.documentations.insertMany([
			{ id: 1, judul: "Serah Terima Laptop Lab 1", kategori: "Pengadaan", deskripsi: "Pengecekan fisik dan unit laptop baru.", tanggal: "2026-09-01", createdBy: 1 },
			{ id: 2, judul: "Maintenance Kebersihan Lab", kategori: "Pemeliharaan", deskripsi: "Pembersihan rutin perangkat komputer lab.", tanggal: "2026-09-05", createdBy: 2 },
		]);
	}
}

export async function connectDatabase(): Promise<Database> {
	const client = new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017");
	await client.connect();
	const database: Db = client.db(process.env.MONGODB_DB ?? "inventory_db");

	const db: Database = {
		client,
		users: database.collection<User>("users"),
		categories: database.collection<Category>("categories"),
		inventories: database.collection<Inventory>("inventories"),
		stockHistories: database.collection<StockHistory>("stock_histories"),
		borrowings: database.collection<Borrowing>("borrowings"),
		borrowingItems: database.collection<BorrowingItem>("borrowing_items"),
		announcements: database.collection<Announcement>("announcements"),
		documentations: database.collection<Documentation>("documentations"),
	};

	await seedDatabase(db);
	return db;
}

export async function nextId<T extends { id: number }>(collection: Collection<T>): Promise<number> {
	const last = await collection.findOne({}, { sort: { id: -1 }, projection: { id: 1 } });
	return (last?.id ?? 0) + 1;
}

export const now = () => new Date().toISOString();
export const notFound = (message: string) => ({ error: message });

