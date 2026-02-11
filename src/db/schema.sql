-- TransactionRaw: IMUTÁVEL, APPEND-ONLY
CREATE TABLE IF NOT EXISTS transaction_raw (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount_in_cents BIGINT NOT NULL,
  source VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CHECK (amount_in_cents != 0)
);

CREATE INDEX idx_transaction_raw_date ON transaction_raw(date);
CREATE INDEX idx_transaction_raw_source ON transaction_raw(source);

-- TransactionInterpretation: VERSIONADA
CREATE TABLE IF NOT EXISTS transaction_interpretation (
  id VARCHAR(255) PRIMARY KEY,
  raw_id VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  dre_account VARCHAR(20) NOT NULL,
  confidence NUMERIC(3, 2) NOT NULL,
  method VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INT NOT NULL,
  
  FOREIGN KEY (raw_id) REFERENCES transaction_raw(id),
  UNIQUE (raw_id, version),
  CHECK (confidence >= 0 AND confidence <= 1),
  CHECK (method IN ('rule', 'model', 'manual'))
);

CREATE INDEX idx_transaction_interpretation_raw_id ON transaction_interpretation(raw_id);
CREATE INDEX idx_transaction_interpretation_version ON transaction_interpretation(raw_id, version DESC);

-- LEDGER: IMUTÁVEL, FONTE DE VERDADE
CREATE TABLE IF NOT EXISTS ledger (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  interpretation_id VARCHAR(255) NOT NULL,
  debit_account VARCHAR(20) NOT NULL,
  credit_account VARCHAR(20) NOT NULL,
  amount_in_cents BIGINT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_internal_transfer BOOLEAN NOT NULL DEFAULT FALSE,
  
  FOREIGN KEY (interpretation_id) REFERENCES transaction_interpretation(id),
  CHECK (amount_in_cents > 0)
);

CREATE INDEX idx_ledger_date ON ledger(date);
CREATE INDEX idx_ledger_interpretation_id ON ledger(interpretation_id);
CREATE INDEX idx_ledger_is_internal_transfer ON ledger(is_internal_transfer);

-- Soma de débitos e créditos sempre deve ser zero (integridade contábil)
CREATE TABLE IF NOT EXISTS ledger_integrity_check (
  checked_at TIMESTAMPTZ,
  total_debits BIGINT,
  total_credits BIGINT,
  is_balanced BOOLEAN
);