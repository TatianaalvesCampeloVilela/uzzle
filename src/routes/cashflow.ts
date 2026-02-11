import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { calculateCashFlow } from "../engine/cashflow.js";

/**
 * GET /cashflow/:period
 * Retorna fluxo de caixa para um período (YYYY-MM)
 * 
 * Query params:
 *   ?opening_balance=100000 (em centavos)
 */

export async function registerCashFlowRoutes(
  app: FastifyInstance,
  pool: Pool
) {
  app.get<{
    Params: { period: string };
    Querystring: { opening_balance?: string };
  }>("/cashflow/:period", async (request, reply) => {
    const { period } = request.params;
    const openingBalance = parseInt(request.query.opening_balance || "0", 10);

    if (!/^\d{4}-\d{2}$/.test(period)) {
      return reply.code(400).send({ error: "period must be YYYY-MM" });
    }

    const ledgerResult = await pool.query(
      `SELECT * FROM ledger WHERE date >= $1 AND date < $2 ORDER BY date ASC`,
      [`${period}-01`, `${period.slice(0, 7)}-32`]
    );

    const cashflow = calculateCashFlow(ledgerResult.rows, period, openingBalance);

    return reply.send(cashflow);
  });
}