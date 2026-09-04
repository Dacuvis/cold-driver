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
	}, { body: t.Object({ nama: t.String(), username: t.String(), password: t.String({ minLength: 6 }), role: t.Union([t.Literal("admin"), t.Literal("petugas"), t.Literal("peminjam")]), kelas: t.Optional(t.String()) }) });
