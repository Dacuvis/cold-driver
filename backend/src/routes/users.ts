import { Elysia, t } from "elysia";
import type { Database } from "../db";
import { nextId, now } from "../db";

export const userRoutes = (database: Database) => new Elysia()
	.get("/users", async () => {
		const users = await database.users.find().toArray();
		return users.map(({ _id: _mongoId, password: _password, ...user }) => user);
	})
	.post("/users", async ({ body, set }) => {
		const user = { id: await nextId(database.users), ...body, createdAt: now() };
		await database.users.insertOne(user);
		set.status = 201;
		const { password: _password, ...safeUser } = user;
		return safeUser;
	}, { body: t.Object({ nama: t.String(), username: t.String(), password: t.String({ minLength: 6 }), role: t.Union([t.Literal("admin"), t.Literal("petugas"), t.Literal("peminjam")]), kelas: t.Optional(t.String()) }) })
	.put("/users/:id", async ({ params, body }) => {
		const id = Number(params.id);
		const user = await database.users.findOne({ id });
		if (!user) return { error: "Pengguna tidak ditemukan" };
		const updateData: Record<string, any> = { ...body };
		if (!updateData.password) {
			delete updateData.password;
		}
		await database.users.updateOne({ id }, { $set: updateData });
		const updated = await database.users.findOne({ id });
		if (!updated) return { error: "Pengguna tidak ditemukan" };
		const { _id: _mongoId, password: _password, ...safeUser } = updated;
		return safeUser;
	}, { body: t.Object({ nama: t.String(), username: t.String(), password: t.Optional(t.String()), role: t.Union([t.Literal("admin"), t.Literal("petugas"), t.Literal("peminjam")]), kelas: t.Optional(t.String()) }) })
	.delete("/users/:id", async ({ params }) => {
		const id = Number(params.id);
		const result = await database.users.deleteOne({ id });
		if (result.deletedCount === 0) return { error: "Pengguna tidak ditemukan" };
		return { success: true, message: "Pengguna berhasil dihapus" };
	});
