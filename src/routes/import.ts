import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { z } from "zod";
import type { TransactionRaw } from "../engine/types";
import { upsertRawTransaction } from "../models/transaction.raw";
import { insertInterpretation } from "../models/transaction.interpretation";
import { categorizeBatch } from "../engine/categorize";
import { validateImportBody } from "../lib/validate";

export async function registerImportRoutes(app: FastifyInstance, pool: Pool) {
  app.post("/import", async (request, reply) => {
    let transactions: Omit<TransactionRaw, "created_at">[];

    try {
      const body = validateImportBody(request.body);
      transactions = body.transactions as Omit<TransactionRaw, "created_at">[];
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({
          error: "Invalid data",
          details: err.issues,
        });
      }
      throw err;
    }

    const results: { id: string; isNew: boolean }[] = [];

    for (const tx of transactions) {
      const { transaction, isNew } = await upsertRawTransaction(pool, tx);
      results.push({ id: transaction.id, isNew });
    }

    const categories = categorizeBatch(transactions);

    for (const category of categories) {
      const existing = await pool.query(
        "SELECT 1 FROM transaction_interpretation WHERE raw_id = $1 LIMIT 1",
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
  });
}
