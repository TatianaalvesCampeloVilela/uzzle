import type { LedgerEntry, CashFlowReport } from "./types.js";

/**
 * Fluxo de Caixa
 * Apenas transações que movem caixa (contas 1.x - Banco)
 */

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