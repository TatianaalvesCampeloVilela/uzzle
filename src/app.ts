import Fastify from "fastify";
import { Pool } from "pg";
import { registerImportRoutes } from "./routes/import.js";
import { registerDRERoutes } from "./routes/dre.js";
import { registerCashFlowRoutes } from "./routes/cashflow.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost/financial",
  max: 5,
});

const app = Fastify({
  logger: true,
});

// Health check
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Registra rotas
await registerImportRoutes(app, pool);
await registerDRERoutes(app, pool);
await registerCashFlowRoutes(app, pool);

const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("✓ Financial engine listening on http://0.0.0.0:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();