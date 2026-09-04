import { Elysia, t } from "elysia";
import type { Database } from "../db";
import { nextId, notFound, now } from "../db";

export const borrowingRoutes = (database: Database) => new Elysia()
	.get("/borrowings", async () => {
		const borrowings = await database.borrowings.find().sort({ id: -1 }).toArray();
		return Promise.all(borrowings.map(async (borrowing) => ({
			...borrowing,
			items: await database.borrowingItems.find({ borrowingId: borrowing.id }).toArray(),
		})));
	})
	.post("/borrowings", async ({ body, set }) => {
		if (!await database.users.findOne({ id: body.userId })) return notFound("Pengguna tidak ditemukan");
		for (const item of body.items) {
			const inventory = await database.inventories.findOne({ id: item.inventoryId });
			if (!inventory) return notFound(`Inventaris ${item.inventoryId} tidak ditemukan`);
			if (inventory.stok < item.jumlah) return { error: `Stok ${inventory.namaBarang} tidak mencukupi` };
		}
		const borrowingId = await nextId(database.borrowings);
		const borrowing = { id: borrowingId, userId: body.userId, kodePeminjaman: `PJ-${String(borrowingId).padStart(4, "0")}`, namaPeminjam: body.namaPeminjam, kelas: body.kelas, tujuan: body.tujuan, tanggalPinjam: body.tanggalPinjam, status: "dipinjam" as const, parafGuru: body.parafGuru };
		await database.borrowings.insertOne(borrowing);
		for (const item of body.items) {
			await database.inventories.updateOne({ id: item.inventoryId, stok: { $gte: item.jumlah } }, { $inc: { stok: -item.jumlah } });
			await database.borrowingItems.insertOne({ id: await nextId(database.borrowingItems), borrowingId, ...item });
		}
		set.status = 201;
		return { ...borrowing, items: await database.borrowingItems.find({ borrowingId }).toArray() };
	}, { body: t.Object({ userId: t.Number(), namaPeminjam: t.String(), kelas: t.String(), tujuan: t.String(), tanggalPinjam: t.String(), parafGuru: t.Optional(t.String()), items: t.Array(t.Object({ inventoryId: t.Number(), jumlah: t.Number({ minimum: 1 }), kondisiPinjam: t.String() }), { minItems: 1 }) }) })
	.post("/borrowings/:id/return", async ({ params, body }) => {
		const borrowingId = Number(params.id);
		const borrowing = await database.borrowings.findOne({ id: borrowingId });
		if (!borrowing) return notFound("Peminjaman tidak ditemukan");
		if (borrowing.status === "dikembalikan") return { error: "Peminjaman sudah dikembalikan" };
		for (const returnedItem of body.items) {
			const item = await database.borrowingItems.findOne({ id: returnedItem.itemId, borrowingId });
			if (!item) return notFound(`Detail peminjaman ${returnedItem.itemId} tidak ditemukan`);
			await database.borrowingItems.updateOne({ id: item.id }, { $set: { kondisiKembali: returnedItem.kondisiKembali } });
			await database.inventories.updateOne({ id: item.inventoryId }, { $inc: { stok: item.jumlah } });
		}
		await database.borrowings.updateOne({ id: borrowingId }, { $set: { status: "dikembalikan", tanggalKembali: body.tanggalKembali } });
		return { ...borrowing, status: "dikembalikan" as const, tanggalKembali: body.tanggalKembali, items: await database.borrowingItems.find({ borrowingId }).toArray() };
	}, { body: t.Object({ tanggalKembali: t.String(), items: t.Array(t.Object({ itemId: t.Number(), kondisiKembali: t.String() }), { minItems: 1 }) }) });
