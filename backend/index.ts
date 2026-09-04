import { createApp } from "./src/app";

const app = await createApp();
const port = Number(process.env.PORT ?? 3000);

app.listen(port);
console.log(`Inventory API running at http://localhost:${port}`);
