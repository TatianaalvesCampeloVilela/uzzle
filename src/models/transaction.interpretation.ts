import { Pool } from "pg";
import type { TransactionInterpretation } from "../engine/types.js";

/**
 * Interpretação é VERSIONADA
 * Nova interpretação nunca apaga a anterior.
 * Histórico completo mantido.
 */

export async function insertInterpretation(
  pool: Pool,
  interp: Omit<TransactionInterpretation, "created_at" | "version">
): Promise<TransactionInterpretation> {
  const now = new Date().toISOString();
  
  // Encontra a versão máxima para este raw_id
  const versionResult = await pool.query(
    "SELECT COALESCE(MAX(version), 0) as max_version FROM transaction_interpretation WHERE raw_id = $1",
    [interp.raw_id]
  );
  
  const nextVersion = versionResult.rows[0].max_version + 1;
  const interpId = `interp_${interp.raw_id}_v${nextVersion}`;

  const result = await pool.query(
    `
    INSERT INTO transaction_interpretation 
    (id, raw_id, category, dre_account, confidence, method, created_at, version)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [
      interpId,
      interp.raw_id,
      interp.category,
      interp.dre_account,
      interp.confidence,
      interp.method,
      now,
      nextVersion,
    ]
  );

  return result.rows[0];
}

export async function getLatestInterpretation(
  pool: Pool,
  rawId: string
): Promise<TransactionInterpretation | null> {
  const result = await pool.query(
    `
    SELECT * FROM transaction_interpretation 
    WHERE raw_id = $1 
    ORDER BY version DESC 
    LIMIT 1
    `,
    [rawId]
  );

  return result.rows[0] || null;
}

export async function getInterpretationHistory(
  pool: Pool,
  rawId: string
): Promise<TransactionInterpretation[]> {
  const result = await pool.query(
    `
    SELECT * FROM transaction_interpretation 
    WHERE raw_id = $1 
    ORDER BY version ASC
    `,
    [rawId]
  );

  return result.rows;
}