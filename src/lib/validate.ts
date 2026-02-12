import { z } from "zod";

export const TransactionSchema = z.object({
  id: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1).max(500),
  amount_in_cents: z.number().int(),
  source: z.string().min(1),
});

export function validateTransaction(data: unknown) {
  return TransactionSchema.parse(data);
}

export const ImportBodySchema = z.object({
  transactions: z.array(TransactionSchema).min(1),
});

export type ImportBody = z.infer<typeof ImportBodySchema>;

export function validateImportBody(data: unknown): ImportBody {
  return ImportBodySchema.parse(data);
}
