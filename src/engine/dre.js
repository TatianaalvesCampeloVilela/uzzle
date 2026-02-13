"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDRE = calculateDRE;
exports.computeDREFromDb = computeDREFromDb;
/**
 * Demonstração de Resultado do Exercício
 * Fonte única de verdade: LEDGER
 * Sem efeitos colaterais. Função pura.
 */
var DRE_STRUCTURE = {
    "4.1.1": "Receita de Serviços",
    "4.1.2": "Receita de Produtos",
    "4.2.1": "Devoluções e Descontos",
    "5.1.1": "Custos de Pessoal",
    "5.1.2": "Custos de Infraestrutura",
    "5.2.1": "Despesas Operacionais",
    "5.3.1": "Despesas Administrativas",
};
function calculateDRE(ledgerEntries, period) {
    // Filtra apenas entradas do período e que não são transferências internas
    var relevantEntries = ledgerEntries.filter(function (entry) {
        return entry.date.startsWith(period) && !entry.is_internal_transfer;
    });
    // Agrupa por conta DRE
    var accountTotals = {};
    for (var _i = 0, relevantEntries_1 = relevantEntries; _i < relevantEntries_1.length; _i++) {
        var entry = relevantEntries_1[_i];
        var dre_account = extractDREAccount(entry.debit_account, entry.credit_account);
        if (dre_account && dre_account !== "none") {
            accountTotals[dre_account] = (accountTotals[dre_account] || 0) + calculateAmount(entry);
        }
    }
    // Calcula receitas e despesas
    var revenue = sumRevenueAccounts(accountTotals);
    var expenses = sumExpenseAccounts(accountTotals);
    var netResult = revenue + expenses; // expenses já vêm negativas
    var lineItems = Object.entries(accountTotals)
        .filter(function (_a) {
        var account = _a[0];
        return account !== "none";
    })
        .map(function (_a) {
        var account = _a[0], amount = _a[1];
        return ({
            account_code: account,
            account_name: DRE_STRUCTURE[account] || "Unknown Account",
            amount_in_cents: amount,
        });
    });
    return {
        period: period,
        revenue_in_cents: revenue,
        expenses_in_cents: Math.abs(expenses),
        net_result_in_cents: netResult,
        line_items: lineItems,
        generated_at: new Date().toISOString(),
    };
}
function extractDREAccount(debit_account, credit_account) {
    // Identifica qual é a conta de receita/despesa
    if (debit_account.startsWith("4") || debit_account.startsWith("5")) {
        return debit_account;
    }
    if (credit_account.startsWith("4") || credit_account.startsWith("5")) {
        return credit_account;
    }
    return "none";
}
function calculateAmount(entry) {
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
function sumRevenueAccounts(accountTotals) {
    return Object.entries(accountTotals)
        .filter(function (_a) {
        var account = _a[0];
        return account.startsWith("4");
    })
        .reduce(function (sum, _a) {
        var amount = _a[1];
        return sum + amount;
    }, 0);
}
function sumExpenseAccounts(accountTotals) {
    return Object.entries(accountTotals)
        .filter(function (_a) {
        var account = _a[0];
        return account.startsWith("5");
    })
        .reduce(function (sum, _a) {
        var amount = _a[1];
        return sum + amount;
    }, 0);
}
function computeDREFromDb(pool, period) {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query("\n    SELECT\n      id,\n      date,\n      interpretation_id,\n      debit_account,\n      credit_account,\n      amount_in_cents,\n      description,\n      created_at,\n      is_internal_transfer\n    FROM ledger\n    WHERE date >= ($1 || '-01')::date\n      AND date <  (to_date($1 || '-01', 'YYYY-MM-DD') + interval '1 month')\n    ORDER BY date ASC, id ASC\n  ", [period])];
                case 1:
                    rows = (_a.sent()).rows;
                    return [2 /*return*/, calculateDRE(rows, period)];
            }
        });
    });
}
