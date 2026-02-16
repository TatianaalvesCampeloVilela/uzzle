
import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { Pool } from "pg";

import { registerImportRoutes } from "./routes/import.js";
import { registerDRERoutes } from "./routes/dre.js";
import { registerCashFlowRoutes } from "./routes/cashflow.js";

const app = Fastify({ logger: true });

// ✅ Plugins primeiro
async function buildApp() {
  await app.register(cors, {
    origin: true, // dev-friendly (libera qualquer origem)
  });

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      ",postgresql://postgres:postgres@127.0.0.1:5432/uzzle",
    max: 5,
  });

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // ✅ Rotas depois dos plugins
  await registerImportRoutes(app, pool);
  await registerDRERoutes(app, pool);
  await registerCashFlowRoutes(app, pool);

  await app.ready();
  console.log(app.printRoutes());

  return app;
}

async function main() {
  const server = await buildApp();

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "127.0.0.1";

  await server.listen({ port, host });

  console.log(`✓ Financial engine listening on http://${host}:${port}`);
}

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
