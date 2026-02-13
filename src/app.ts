import "dotenv/config";
import Fastify from "fastify";
import { Pool } from "pg";

import { registerImportRoutes } from "./routes/import.js";
import { registerDRERoutes } from "./routes/dre.js";
import { registerCashFlowRoutes } from "./routes/cashflow.js";

const app = Fastify({ logger: true });

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/uzzle",
  max: 5,
});

app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

async function main() {
  await registerImportRoutes(app, pool);
  await registerDRERoutes(app, pool);
  await registerCashFlowRoutes(app, pool);

  await app.ready();
  console.log(app.printRoutes());

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "127.0.0.1";

  await app.listen({ port, host });

  console.log(`✓ Financial engine listening on http://${host}:${port}`);
}

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
