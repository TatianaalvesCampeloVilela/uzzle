/**
 * Tipos financeiros determinísticos
 * Sem enum, sem abstrações. Apenas tipos puros.
 */

export type TransactionRaw = {
  id: string;
  date: string; // ISO 8601: YYYY-MM-DD
  description: string;
  amount_in_cents: number; // Inteiros. Sempre centavos.
  source: string;
  created_at: string; // ISO 8601
};
export type NewTransactionRaw = {
  id: string;
  date: string;
  description: string;
  amount_in_cents: number;
  source: string;
};
export async function insertRawTransaction(
  pool: Pool,
  tx: NewTransactionRaw
): Promise<TransactionRaw> {
  

export type TransactionInterpretation = {
  id: string;
  raw_id: string;
  category: string;
  dre_account: string; // ex: "4.1.1" (receita de serviços)
  confidence: number; // 0 a 1
  method: "rule" | "model" | "manual";
  created_at: string;
  version: number;
};

export type LedgerEntry = {
  id: string;
  date: string;
  interpretation_id: string;
  debit_account: string;
  credit_account: string;
  amount_in_cents: number;
  description: string;
  created_at: string;
  is_internal_transfer: boolean;
};

export type DREReport = {
  period: string; // YYYY-MM
  revenue_in_cents: number;
  expenses_in_cents: number;
  net_result_in_cents: number;
  line_items: DRELineItem[];
  generated_at: string;
};

export type DRELineItem = {
  account_code: string;
  account_name: string;
  amount_in_cents: number;
};

export type CashFlowReport = {
  period: string;
  opening_balance_in_cents: number;
  inflows_in_cents: number;
  outflows_in_cents: number;
  closing_balance_in_cents: number;
  generated_at: string;
};
