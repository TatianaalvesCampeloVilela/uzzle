import Fastify from "fastify";
import dotenv from "dotenv";
import { Pool } from "pg";
import { registerImportRoutes } from "./routes/import"; // ajuste se o arquivo tiver outro nome

dotenv.config();

const app = Fastify({ logger: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/health", async () => {
  return { status: "ok" };
});

// registra /import
await registerImportRoutes(app, pool);

// debug: imprime as rotas registradas
await app.ready();
console.log(app.printRoutes());

// sobe o servidor (UMA vez)
await app.listen({ port: 3000, host: "127.0.0.1" });
console.log("Server running at http://127.0.0.1:3000");
