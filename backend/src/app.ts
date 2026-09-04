import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { connectDatabase, now } from "./db";
import { borrowingRoutes } from "./routes/borrowings";
import { catalogRoutes } from "./routes/catalog";
import { contentRoutes } from "./routes/content";
import { userRoutes } from "./routes/users";

export async function createApp() {
	const database = await connectDatabase();

	return new Elysia()
		.use(cors())
		.get("/", () => ({ name: "Inventory API", version: "1.0.0", docs: "/api" }))
		.get("/api", () => ({
			resources: ["users", "categories", "inventories", "stock-histories", "borrowings", "announcements", "documentations"],
			note: "Data tersimpan di MongoDB.",
		}))
		.get("/health", () => ({ status: "ok", timestamp: now() }))
		.group("/api", (api) => api
			.use(userRoutes(database))
			.use(catalogRoutes(database))
			.use(borrowingRoutes(database))
			.use(contentRoutes(database)));
}
