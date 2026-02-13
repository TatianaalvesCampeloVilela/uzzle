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
exports.registerImportRoutes = registerImportRoutes;
var zod_1 = require("zod");
var transaction_raw_js_1 = require("../models/transaction.raw.js");
var transaction_interpretation_js_1 = require("../models/transaction.interpretation.js");
var categorize_js_1 = require("../engine/categorize.js");
var validate_js_1 = require("../lib/validate.js");
function registerImportRoutes(app, pool) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app.post("/import", function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var transactions, body, results, _i, transactions_1, tx, _a, transaction, isNew, categories, _loop_1, _b, categories_1, category;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            try {
                                body = (0, validate_js_1.validateImportBody)(request.body);
                                transactions = body.transactions;
                            }
                            catch (err) {
                                if (err instanceof zod_1.z.ZodError) {
                                    return [2 /*return*/, reply.code(400).send({
                                            error: "Invalid data",
                                            details: err.issues,
                                        })];
                                }
                                throw err;
                            }
                            results = [];
                            _i = 0, transactions_1 = transactions;
                            _c.label = 1;
                        case 1:
                            if (!(_i < transactions_1.length)) return [3 /*break*/, 4];
                            tx = transactions_1[_i];
                            return [4 /*yield*/, (0, transaction_raw_js_1.upsertRawTransaction)(pool, tx)];
                        case 2:
                            _a = _c.sent(), transaction = _a.transaction, isNew = _a.isNew;
                            results.push({ id: transaction.id, isNew: isNew });
                            _c.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            categories = (0, categorize_js_1.categorizeBatch)(transactions);
                            _loop_1 = function (category) {
                                var existing, interp, rawTx;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0: return [4 /*yield*/, pool.query("SELECT 1 FROM transaction_interpretation WHERE raw_id = $1 LIMIT 1", [category.raw_id])];
                                        case 1:
                                            existing = _d.sent();
                                            if (!(existing.rows.length === 0)) return [3 /*break*/, 4];
                                            return [4 /*yield*/, (0, transaction_interpretation_js_1.insertInterpretation)(pool, category)];
                                        case 2:
                                            interp = _d.sent();
                                            rawTx = transactions.find(function (t) { return t.id === category.raw_id; });
                                            if (!rawTx) return [3 /*break*/, 4];
                                            return [4 /*yield*/, createLedgerEntry(pool, interp, rawTx)];
                                        case 3:
                                            _d.sent();
                                            _d.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            };
                            _b = 0, categories_1 = categories;
                            _c.label = 5;
                        case 5:
                            if (!(_b < categories_1.length)) return [3 /*break*/, 8];
                            category = categories_1[_b];
                            return [5 /*yield**/, _loop_1(category)];
                        case 6:
                            _c.sent();
                            _c.label = 7;
                        case 7:
                            _b++;
                            return [3 /*break*/, 5];
                        case 8: return [2 /*return*/, reply.code(202).send({
                                message: "Import processed",
                                imported: results.filter(function (r) { return r.isNew; }).length,
                                duplicates: results.filter(function (r) { return !r.isNew; }).length,
                            })];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
// ✅ Função helper FORA da função de registro de rotas
function createLedgerEntry(pool, interp, rawTx) {
    return __awaiter(this, void 0, void 0, function () {
        var debitAccount, creditAccount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debitAccount = rawTx.amount_in_cents > 0 ? "1.1.1" : interp.dre_account;
                    creditAccount = rawTx.amount_in_cents > 0 ? interp.dre_account : "1.1.1";
                    return [4 /*yield*/, pool.query("\n    INSERT INTO ledger (\n      id, date, interpretation_id, debit_account, credit_account, \n      amount_in_cents, description, is_internal_transfer\n    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)\n  ", [
                            "ledger_".concat(interp.id),
                            rawTx.date,
                            interp.id,
                            debitAccount,
                            creditAccount,
                            Math.abs(rawTx.amount_in_cents),
                            rawTx.description,
                            interp.category === 'transfer'
                        ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
