import type { LedgerEntry, CashFlowReport } from "./types.js";
import type { Pool } from "pg";

/**
 * Fluxo de Caixa
 * Apenas transações que movem caixa (contas 1.x - Banco)
 */

// ✅ FUNÇÃO PURA - SEM acesso ao banco
export function calculateCashFlow(
  ledgerEntries: LedgerEntry[],
  period: string,
  openingBalance: number
): CashFlowReport {
  const relevantEntries = ledgerEntries.filter((entry) =>
    entry.date.startsWith(period)
  );

  let inflows = 0;
  let outflows = 0;

  for (const entry of relevantEntries) {
    // Se débito em conta de caixa (1.x), é entrada
    if (entry.debit_account.startsWith("1")) {
      inflows += entry.amount_in_cents;
    }
    // Se crédito em conta de caixa (1.x), é saída
    if (entry.credit_account.startsWith("1")) {
      outflows += entry.amount_in_cents;
    }
  }

  const closingBalance = openingBalance + inflows - outflows;

  return {
    period,
    opening_balance_in_cents: openingBalance,
    inflows_in_cents: inflows,
    outflows_in_cents: outflows,
    closing_balance_in_cents: closingBalance,
    generated_at: new Date().toISOString(),
  };
}

// ✅ FUNÇÃO QUE ACESSA O BANCO - Busca dados e chama a função pura
export async function computeCashFlowFromDb(
  pool: Pool,
  period: string,
  openingBalance: number
): Promise<CashFlowReport> {
  const { rows } = await pool.query<LedgerEntry>(
    `SELECT * FROM ledger 
     WHERE date >= $1::date 
       AND date < ($1::date + interval '1 month')
     ORDER BY date ASC`,
    [`${period}-01`]
  );

  return calculateCashFlow(rows, period, openingBalance);
}
