import { Elysia, t } from "elysia";
import type { Database } from "../db";
import { nextId, now } from "../db";

export const contentRoutes = (database: Database) => new Elysia()
	.get("/announcements", () => database.announcements.find().sort({ createdAt: -1 }).toArray())
	.post("/announcements", async ({ body, set }) => {
		const announcement = { id: await nextId(database.announcements), ...body, createdAt: now() };
		await database.announcements.insertOne(announcement);
		set.status = 201;
		return announcement;
	}, { body: t.Object({ judul: t.String(), isi: t.String(), thumbnail: t.Optional(t.String()), createdBy: t.Number() }) })
	.put("/announcements/:id", async ({ params, body }) => {
		const id = Number(params.id);
		const announcement = await database.announcements.findOne({ id });
		if (!announcement) return { error: "Pengumuman tidak ditemukan" };
		await database.announcements.updateOne({ id }, { $set: body });
		return { ...announcement, ...body };
	}, { body: t.Object({ judul: t.String(), isi: t.String(), thumbnail: t.Optional(t.String()), createdBy: t.Number() }) })
	.delete("/announcements/:id", async ({ params }) => {
		const id = Number(params.id);
		const result = await database.announcements.deleteOne({ id });
		if (result.deletedCount === 0) return { error: "Pengumuman tidak ditemukan" };
		return { success: true, message: "Pengumuman berhasil dihapus" };
	})
	.get("/documentations", () => database.documentations.find().sort({ tanggal: -1 }).toArray())
	.post("/documentations", async ({ body, set }) => {
		const documentation = { id: await nextId(database.documentations), ...body };
		await database.documentations.insertOne(documentation);
		set.status = 201;
		return documentation;
	}, { body: t.Object({ judul: t.String(), kategori: t.String(), deskripsi: t.Optional(t.String()), foto: t.Optional(t.String()), tanggal: t.String(), createdBy: t.Number() }) })
	.put("/documentations/:id", async ({ params, body }) => {
		const id = Number(params.id);
		const documentation = await database.documentations.findOne({ id });
		if (!documentation) return { error: "Dokumentasi tidak ditemukan" };
		await database.documentations.updateOne({ id }, { $set: body });
		return { ...documentation, ...body };
	}, { body: t.Object({ judul: t.String(), kategori: t.String(), deskripsi: t.Optional(t.String()), foto: t.Optional(t.String()), tanggal: t.String(), createdBy: t.Number() }) })
	.delete("/documentations/:id", async ({ params }) => {
		const id = Number(params.id);
		const result = await database.documentations.deleteOne({ id });
		if (result.deletedCount === 0) return { error: "Dokumentasi tidak ditemukan" };
		return { success: true, message: "Dokumentasi berhasil dihapus" };
	});
