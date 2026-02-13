"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportBodySchema = exports.TransactionSchema = void 0;
exports.validateTransaction = validateTransaction;
exports.validateImportBody = validateImportBody;
var zod_1 = require("zod");
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1).max(255),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: zod_1.z.string().min(1).max(500),
    amount_in_cents: zod_1.z.number().int().refine(function (val) { return val !== 0; }, {
        message: "amount_in_cents cannot be zero"
    }),
    source: zod_1.z.string().min(1),
});
function validateTransaction(data) {
    return exports.TransactionSchema.parse(data);
}
exports.ImportBodySchema = zod_1.z.object({
    transactions: zod_1.z.array(exports.TransactionSchema).min(1),
});
function validateImportBody(data) {
    return exports.ImportBodySchema.parse(data);
}
