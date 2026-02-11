import type { LedgerEntry, DREReport, DRELineItem } from "./types.js";

/**
 * Demonstração de Resultado do Exercício
 * Fonte única de verdade: LEDGER
 * Sem efeitos colaterais. Função pura.
 */

const DRE_STRUCTURE: Record<string, string> = {
  "4.1.1": "Receita de Serviços",
  "4.1.2": "Receita de Produtos",
  "4.2.1": "Devoluções e Descontos",
  "5.1.1": "Custos de Pessoal",
  "5.1.2": "Custos de Infraestrutura",
  "5.2.1": "Despesas Operacionais",
  "5.3.1": "Despesas Administrativas",
};

export function calculateDRE(
  ledgerEntries: LedgerEntry[],
  period: string
): DREReport {
  // Filtra apenas entradas do período e que não são transferências internas
  const relevantEntries = ledgerEntries.filter(
    (entry) =>
      entry.date.startsWith(period) && !entry.is_internal_transfer
  );

  // Agrupa por conta DRE
  const accountTotals: Record<string, number> = {};

  for (const entry of relevantEntries) {
    const dre_account = extractDREAccount(entry.debit_account, entry.credit_account);

    if (dre_account && dre_account !== "none") {
      accountTotals[dre_account] = (accountTotals[dre_account] || 0) + calculateAmount(entry);
    }
  }

  // Calcula receitas e despesas
  const revenue = sumRevenueAccounts(accountTotals);
  const expenses = sumExpenseAccounts(accountTotals);
  const netResult = revenue + expenses; // expenses já vêm negativas

  const lineItems: DRELineItem[] = Object.entries(accountTotals)
    .filter(([account]) => account !== "none")
    .map(([account, amount]) => ({
      account_code: account,
      account_name: DRE_STRUCTURE[account] || "Unknown Account",
      amount_in_cents: amount,
    }));

  return {
    period,
    revenue_in_cents: revenue,
    expenses_in_cents: Math.abs(expenses),
    net_result_in_cents: netResult,
    line_items: lineItems,
    generated_at: new Date().toISOString(),
  };
}

function extractDREAccount(
  debit_account: string,
  credit_account: string
): string {
  // Identifica qual é a conta de receita/despesa
  if (debit_account.startsWith("4") || debit_account.startsWith("5")) {
    return debit_account;
  }
  if (credit_account.startsWith("4") || credit_account.startsWith("5")) {
    return credit_account;
  }
  return "none";
}

function calculateAmount(entry: LedgerEntry): number {
  // Receitas positivas (débito na conta 4.x)
  // Despesas negativas (crédito na conta 5.x)
  if (entry.debit_account.startsWith("4")) {
    return entry.amount_in_cents;
  }
  if (entry.credit_account.startsWith("5")) {
    return -entry.amount_in_cents;
  }
  return 0;
}

function sumRevenueAccounts(accountTotals: Record<string, number>): number {
  return Object.entries(accountTotals)
    .filter(([account]) => account.startsWith("4"))
    .reduce((sum, [, amount]) => sum + amount, 0);
}

function sumExpenseAccounts(accountTotals: Record<string, number>): number {
  return Object.entries(accountTotals)
    .filter(([account]) => account.startsWith("5"))
    .reduce((sum, [, amount]) => sum - amount, 0);
}