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

