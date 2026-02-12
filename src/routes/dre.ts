import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import  { computeDREFromDb }  from "../engine/dre.js";

// IMPORTA O CÁLCULO DO ENGINE

export async function registerDRERoutes(app: FastifyInstance, pool: Pool) {
  app.get("/dre", async (req, reply) => {
    const { period } = (req.query as { period?: string }) ?? {};
    const p = period ?? new Date().toISOString().slice(0, 7); // YYYY-MM

    return await computeDREFromDb(pool, p);
  });
}

