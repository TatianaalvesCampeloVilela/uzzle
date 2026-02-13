import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/uzzle",
});

async function main() {
  const start = "2026-02-01";
  const end = "2026-03-01";

  const count = await pool.query(
    "select count(*)::int as n from ledger where date >= $1 and date < $2",
    [start, end]
  );

  console.log("ledger rows in period:", count.rows[0].n);

  const sample = await pool.query(
    "select date, description, amount_in_cents from ledger where date >= $1 and date < $2 order by date asc limit 20",
    [start, end]
  );

  console.table(sample.rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
