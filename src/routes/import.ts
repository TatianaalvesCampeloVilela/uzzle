import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import type { TransactionRaw } from "../engine/types";
import { upsertRawTransaction } from "../models/transaction.raw";
import { insertInterpretation } from "../models/transaction.interpretation";
import { categorizeBatch } from "../engine/categorize";

/**
 * POST /import
 * Importa transações. Idempotente.
 * 
 * Payload:
 * {
 *   "transactions": [
 *     { "id": "txn_123", "date": "2026-02-01", "description": "...", "amount_in_cents": 10000, "source": "stripe" }
 *   ]
 * }
 */

export async function registerImportRoutes(app: FastifyInstance, pool: Pool) {
  app.post<{ Body: { transactions: Omit<TransactionRaw, "created_at">[] } }>(
    "/import",
    async (request, reply) => {
      const { transactions } = request.body;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        return reply.code(400).send({ error: "transactions must be non-empty array" });
      }

      const results: { id: string; isNew: boolean }[] = [];

      // Insere/recupera transações raw (idempotente)
      for (const tx of transactions) {
        const { transaction, isNew } = await upsertRawTransaction(pool, tx);
        results.push({ id: transaction.id, isNew });
      }

      // Categoriza automaticamente (apenas as novas ou sem interpretação)
      const categories = categorizeBatch(transactions);

      for (const category of categories) {
        const existing = await pool.query(
          "SELECT * FROM transaction_interpretation WHERE raw_id = $1",
          [category.raw_id]
        );

        if (existing.rows.length === 0) {
          await insertInterpretation(pool, category);
        }
      }

      return reply.code(202).send({
        message: "Import processed",
        imported: results.filter((r) => r.isNew).length,
        duplicates: results.filter((r) => !r.isNew).length,
      });
    }
  );
}