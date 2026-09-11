import { Elysia, t } from "elysia";
import type { Database } from "../db";
import { nextId, notFound, now } from "../db";

export const catalogRoutes = (database: Database) => new Elysia()
	.get("/categories", () => database.categories.find().toArray())
	.post("/categories", async ({ body, set }) => {
		const category = {
			id: await nextId(database.categories),
			...body,
		};
		await database.categories.insertOne(category);
		set.status = 201;
		return category;
	}, {
		body: t.Object({
			namaKategori: t.String(),
			deskripsi: t.Optional(t.String()),
		}),
	})
	.put("/categories/:id", async ({ params, body }) => {
		const id = Number(params.id);
		const category = await database.categories.findOne({ id });
		if (!category) return notFound("Kategori tidak ditemukan");
		await database.categories.updateOne({ id }, { $set: body });
		return { ...category, ...body };
	}, {
		body: t.Object({
			namaKategori: t.String(),
			deskripsi: t.Optional(t.String()),
		}),
	})
	.delete("/categories/:id", async ({ params }) => {
		const id = Number(params.id);
		const result = await database.categories.deleteOne({ id });
		if (result.deletedCount === 0) return notFound("Kategori tidak ditemukan");
		return { success: true, message: "Kategori berhasil dihapus" };
	})
	.get("/inventories", ({ query }) => database.inventories.find(
		query.search
			? {
				$or: [
					{ namaBarang: { $regex: query.search, $options: "i" } },
					{ kodeBarang: { $regex: query.search, $options: "i" } },
				],
			}
			: {},
	).toArray(), {
		query: t.Object({
			search: t.Optional(t.String()),
		}),
	})
	.get("/inventories/:id", async ({ params }) => {
		const inventory = await database.inventories.findOne({ id: Number(params.id) });
		if (!inventory) return notFound("Inventaris tidak ditemukan");
		return inventory;
	})
	.post("/inventories", async ({ body, set }) => {
		if (!await database.categories.findOne({ id: body.categoryId })) return notFound("Kategori tidak ditemukan");
		const inventory = {
			id: await nextId(database.inventories),
			...body,
		};
		await database.inventories.insertOne(inventory);
		set.status = 201;
		return inventory;
	}, {
		body: t.Object({
			categoryId: t.Number(),
			kodeBarang: t.String(),
			namaBarang: t.String(),
			stok: t.Number({ minimum: 0 }),
			kondisi: t.String(),
			lokasi: t.String(),
			deskripsi: t.Optional(t.String()),
		}),
	})
	.put("/inventories/:id", async ({ params, body }) => {
		const id = Number(params.id);
		const inventory = await database.inventories.findOne({ id });
		if (!inventory) return notFound("Inventaris tidak ditemukan");
		if (!await database.categories.findOne({ id: body.categoryId })) return notFound("Kategori tidak ditemukan");
		await database.inventories.updateOne({ id }, { $set: body });
		return { ...inventory, ...body };
	}, {
		body: t.Object({
			categoryId: t.Number(),
			kodeBarang: t.String(),
			namaBarang: t.String(),
			stok: t.Number({ minimum: 0 }),
			kondisi: t.String(),
			lokasi: t.String(),
			deskripsi: t.Optional(t.String()),
		}),
	})
	.delete("/inventories/:id", async ({ params }) => {
		const id = Number(params.id);
		const result = await database.inventories.deleteOne({ id });
		if (result.deletedCount === 0) return notFound("Inventaris tidak ditemukan");
		return { success: true, message: "Inventaris berhasil dihapus" };
	})
	.get("/stock-histories", () => database.stockHistories.find().sort({ createdAt: -1 }).toArray())
	.post("/stock-histories", async ({ body, set }) => {
		const [inventory, user] = await Promise.all([
			database.inventories.findOne({ id: body.inventoryId }),
			database.users.findOne({ id: body.userId }),
		]);
		if (!inventory || !user) return notFound("Inventaris atau pengguna tidak ditemukan");
		const delta = body.jenis === "masuk" ? body.jumlah : -body.jumlah;
		if (delta < 0 && inventory.stok < body.jumlah) return { error: "Stok tidak mencukupi" };
		const stokSesudah = inventory.stok + delta;
		await database.inventories.updateOne({ id: inventory.id }, { $set: { stok: stokSesudah } });
		const history = {
			id: await nextId(database.stockHistories),
			...body,
			stokSebelum: inventory.stok,
			stokSesudah,
			createdAt: now(),
		};
		await database.stockHistories.insertOne(history);
		set.status = 201;
		return history;
	}, {
		body: t.Object({
			inventoryId: t.Number(),
			userId: t.Number(),
			jenis: t.Union([
				t.Literal("masuk"),
				t.Literal("keluar"),
			]),
			jumlah: t.Number({ minimum: 1 }),
			keterangan: t.Optional(t.String()),
		}),
	})
	.delete("/stock-histories/:id", async ({ params }) => {
		const id = Number(params.id);
		const result = await database.stockHistories.deleteOne({ id });
		if (result.deletedCount === 0) return notFound("Riwayat stok tidak ditemukan");
		return { success: true, message: "Riwayat stok berhasil dihapus" };
	});
