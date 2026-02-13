import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import  { computeDREFromDb }  from "../engine/dre.js";

// IMPORTA O CÁLCULO DO ENGINE

export async function registerDRERoutes(app: FastifyInstance, pool: Pool) {
  app.get("/dre", async (req, reply) => {
    try {
      const { period } = (req.query as { period?: string }) ?? {};
      const p = period ?? new Date().toISOString().slice(0, 7);
      
      // Validar formato YYYY-MM com mês válido (01-12)
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) {
        return reply.code(400).send({ 
          error: "period must be YYYY-MM with valid month (01-12)" 
        });
      }
      
      const result = await computeDREFromDb(pool, p);
      return reply.send(result);
    } catch (error) {
      app.log.error(error);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });
}