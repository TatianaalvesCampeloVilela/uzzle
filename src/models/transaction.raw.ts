import { Pool } from "pg";
import type { TransactionRaw } from "../engine/types.js";

/**
 * TransactionRaw é IMUTÁVEL
 * Nunca delete. Nunca update.
 * Append-only.
 */

export async function insertRawTransaction(
  pool: Pool,
  tx: Omit<TransactionRaw, "created_at">
): Promise<TransactionRaw> {
  const now = new Date().toISOString();

  const result = await pool.query(
    `
    INSERT INTO transaction_raw (id, date, description, amount_in_cents, source, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [tx.id, tx.date, tx.description, tx.amount_in_cents, tx.source, now]
  );

  return result.rows[0];
}

export async function getRawTransactionById(
  pool: Pool,
  id: string
): Promise<TransactionRaw | null> {
  const result = await pool.query(
    "SELECT * FROM transaction_raw WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
}

export async function getAllRawTransactions(
  pool: Pool
): Promise<TransactionRaw[]> {
  const result = await pool.query("SELECT * FROM transaction_raw ORDER BY date ASC");
  return result.rows;
}

/**
 * Idempotência: mesmo arquivo importado 2x não duplica.
 * Retorna o existente ou cria novo.
 */
export async function upsertRawTransaction(
  pool: Pool,
  tx: Omit<TransactionRaw, "created_at">
): Promise<{ transaction: TransactionRaw; isNew: boolean }> {
  const existing = await getRawTransactionById(pool, tx.id);

  if (existing) {
    return { transaction: existing, isNew: false };
  }

  const newTx = await insertRawTransaction(pool, tx);
  return { transaction: newTx, isNew: true };
}