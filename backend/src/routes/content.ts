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
	.get("/documentations", () => database.documentations.find().sort({ tanggal: -1 }).toArray())
	.post("/documentations", async ({ body, set }) => {
		const documentation = { id: await nextId(database.documentations), ...body };
		await database.documentations.insertOne(documentation);
		set.status = 201;
		return documentation;
	}, { body: t.Object({ judul: t.String(), kategori: t.String(), deskripsi: t.Optional(t.String()), foto: t.Optional(t.String()), tanggal: t.String(), createdBy: t.Number() }) });
