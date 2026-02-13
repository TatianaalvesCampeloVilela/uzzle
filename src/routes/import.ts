import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { z } from "zod";
import type { TransactionRaw, TransactionInterpretation } from "../engine/types.js";
import { upsertRawTransaction } from "../models/transaction.raw.js";
import { insertInterpretation } from "../models/transaction.interpretation.js";
import { categorizeBatch } from "../engine/categorize.js";
import { validateImportBody } from "../lib/validate.js";

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
        const interp = await insertInterpretation(pool, category);
        
        // ✅ Criar entrada no ledger logo após criar a interpretação
        const rawTx = transactions.find(t => t.id === category.raw_id);
        if (rawTx) {
          await createLedgerEntry(pool, interp, rawTx);
        }
      }
    }

    return reply.code(202).send({
      message: "Import processed",
      imported: results.filter((r) => r.isNew).length,
      duplicates: results.filter((r) => !r.isNew).length,
    });
  });
}

// ✅ Função helper FORA da função de registro de rotas
async function createLedgerEntry(
  pool: Pool, 
  interp: TransactionInterpretation, 
  rawTx: Omit<TransactionRaw, "created_at">
) {
  const debitAccount = rawTx.amount_in_cents > 0 ? "1.1.1" : interp.dre_account;
  const creditAccount = rawTx.amount_in_cents > 0 ? interp.dre_account : "1.1.1";
  
  await pool.query(`
    INSERT INTO ledger (
      id, date, interpretation_id, debit_account, credit_account, 
      amount_in_cents, description, is_internal_transfer
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    `ledger_${interp.id}`,
    rawTx.date,
    interp.id,
    debitAccount,
    creditAccount,
    Math.abs(rawTx.amount_in_cents),
    rawTx.description,
    interp.category === 'transfer'
  ]);
}