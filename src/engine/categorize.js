"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeBatch = categorizeBatch;
exports.categorizeOne = categorizeOne;
exports.suggestCategoryAI = suggestCategoryAI;
var CATEGORIZATION_RULES = [
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
function categorizeBatch(transactions // ← USAR O TYPE HELPER
) {
    return transactions.map(function (tx) { return categorizeOne(tx); });
}
function categorizeOne(tx // ← USAR O TYPE HELPER
) {
    var matchedRule = CATEGORIZATION_RULES.find(function (rule) {
        return rule.pattern.test(tx.description);
    });
    if (matchedRule) {
        return {
            id: "interp_".concat(tx.id, "_v1"),
            raw_id: tx.id,
            category: matchedRule.category,
            dre_account: matchedRule.dre_account,
            confidence: 1.0,
            method: "rule",
            created_at: new Date().toISOString(),
            version: 1,
        };
    }
    return {
        id: "interp_".concat(tx.id, "_v1"),
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
function suggestCategoryAI(description) {
    // Placeholder para chamada futura a modelo ML
    // Jamais afeta cálculos. Apenas sugestão.
    return {
        category: "suggested_by_model",
        confidence: 0.5,
    };
}
