import type { TransactionRaw, TransactionInterpretation } from "./types.js";

/**
 * Categorização por regras determinísticas.
 * IA é opcional e nunca muda números.
 */

const CATEGORIZATION_RULES: Array<{
  pattern: RegExp;
  category: string;
  dre_account: string;
}> = [
  {
    pattern: /stripe|payment|pagamento/i,
    category: "payment_processor",
    dre_account: "4.1.1",
  },
  {
    pattern: /aws|azure|cloud|servidor/i,
    category: "infrastructure",
    dre_account: "5.1.2",
  },
  {
    pattern: /salário|salary|folha/i,
    category: "payroll",
    dre_account: "5.2.1",
  },
  {
    pattern: /transfer|transferência/i,
    category: "transfer",
    dre_account: "none", // Não entra na DRE
  },
  {
    pattern: /refund|reembolso|devolução/i,
    category: "refund",
    dre_account: "4.2.1",
  },
];

export function categorizeBatch(
  transactions: TransactionRaw[]
): TransactionInterpretation[] {
  return transactions.map((tx) => categorizeOne(tx));
}

export function categorizeOne(
  tx: TransactionRaw
): TransactionInterpretation {
  const matchedRule = CATEGORIZATION_RULES.find((rule) =>
    rule.pattern.test(tx.description)
  );

  if (matchedRule) {
    return {
      id: `interp_${tx.id}_v1`,
      raw_id: tx.id,
      category: matchedRule.category,
      dre_account: matchedRule.dre_account,
      confidence: 1.0,
      method: "rule",
      created_at: new Date().toISOString(),
      version: 1,
    };
  }

  // Default: necessita classificação manual
  return {
    id: `interp_${tx.id}_v1`,
    raw_id: tx.id,
    category: "unclassified",
    dre_account: "unknown",
    confidence: 0,
    method: "manual",
    created_at: new Date().toISOString(),
    version: 1,
  };
}

/**
 * AI suggestion ONLY - nunca muda valores.
 * Apenas retorna sugestão com baixa confiança.
 */
export function suggestCategoryAI(
  description: string
): { category: string; confidence: number } {
  // Placeholder para chamada futura a modelo ML
  // Jamais afeta cálculos. Apenas sugestão.
  return {
    category: "suggested_by_model",
    confidence: 0.5,
  };
}