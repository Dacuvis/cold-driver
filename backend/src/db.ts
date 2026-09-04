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

export async function connectDatabase(): Promise<Database> {
	const client = new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017");
	await client.connect();
	const database: Db = client.db(process.env.MONGODB_DB ?? "inventory_db");

	return {
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
}

export async function nextId<T extends { id: number }>(collection: Collection<T>): Promise<number> {
	const last = await collection.findOne({}, { sort: { id: -1 }, projection: { id: 1 } });
	return (last?.id ?? 0) + 1;
}

export const now = () => new Date().toISOString();
export const notFound = (message: string) => ({ error: message });
