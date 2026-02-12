import Fastify from "fastify";
import dotenv from "dotenv";
import { Pool } from "pg";

import { registerImportRoutes } from "./routes/import.js";
import { registerDRERoutes } from "./routes/dre.js";
import { registerCashFlowRoutes } from "./routes/cashflow.js";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/uzzle",
  max: 5,
});

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

await registerImportRoutes(app, pool);
await registerDRERoutes(app, pool);
await registerCashFlowRoutes(app, pool);

await app.listen({ port: 3000, host: "127.0.0.1" });
console.log("✓ Financial engine listening on http://127.0.0.1:3000");
