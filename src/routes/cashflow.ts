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

export async function registerCashFlowRoutes(app: FastifyInstance, pool: Pool) {
  app.get<{
    Params: { period: string };
    Querystring: { opening_balance?: string };
  }>("/cashflow/:period", async (request, reply) => {
    const { period } = request.params;
    const openingBalance = parseInt(request.query.opening_balance || "0", 10);

    if (!/^\d{4}-\d{2}$/.test(period)) {
      return reply.code(400).send({ error: "period must be YYYY-MM" });
    }

    const [yearStr, monthStr] = period.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    const start = `${yearStr}-${monthStr}-01`;
    const endExclusive = `${String(nextYear)}-${String(nextMonth).padStart(2, "0")}-01`;

    const ledgerResult = await pool.query(
      `SELECT * FROM ledger WHERE date >= $1 AND date < $2 ORDER BY date ASC`,
      [start, endExclusive]
    );

    const cashflow = calculateCashFlow(ledgerResult.rows, period, openingBalance);

    return reply.send(cashflow);
  });
}
