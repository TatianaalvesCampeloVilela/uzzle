# uzzle
Financial intelligence engine.  Objective: Transform raw bank transactions into reliable financial statements.  Principles: - Deterministic calculations - Auditability - Simplicity over cleverness
# Financial Backend Engine

> Motor financeiro auditável. Determinístico. Imutável. Simples.

## Princípios

- ✅ **Sem floats**: apenas centavos (inteiros)
- ✅ **Imutável**: TransactionRaw e Ledger nunca mudam
- ✅ **Versionado**: TransactionInterpretation mantém histórico completo
- ✅ **Idempotente**: mesma importação 2x não duplica
- ✅ **Funções puras**: engine calcula sem efeitos colaterais
- ✅ **Sem abstração desnecessária**: código direto e rastreável

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

```bash
DATABASE_URL=postgresql://user:password@localhost/financial
NODE_ENV=development
```

## Schema

Execute em sua base PostgreSQL:

```bash
psql -U user -d financial -f src/db/schema.sql
```

## Desenvolvimento

```bash
npm run dev
```

## API

### POST /import
Importa transações (idempotente)

```json
{
  "transactions": [
    {
      "id": "txn_stripe_12345",
      "date": "2026-02-01",
      "description": "Stripe payout",
      "amount_in_cents": 50000,
      "source": "stripe"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Import processed",
  "imported": 1,
  "duplicates": 0
}
```

### GET /dre/:period
DRE para um período (YYYY-MM)

```bash
GET /dre/2026-02
```

**Response:**
```json
{
  "period": "2026-02",
  "revenue_in_cents": 500000,
  "expenses_in_cents": 200000,
  "net_result_in_cents": 300000,
  "line_items": [
    {
      "account_code": "4.1.1",
      "account_name": "Receita de Serviços",
      "amount_in_cents": 500000
    }
  ],
  "generated_at": "2026-02-11T10:00:00Z"
}
```

### GET /cashflow/:period
Fluxo de caixa para um período

```bash
GET /cashflow/2026-02?opening_balance=100000
```

**Response:**
```json
{
  "period": "2026-02",
  "opening_balance_in_cents": 100000,
  "inflows_in_cents": 500000,
  "outflows_in_cents": 200000,
  "closing_balance_in_cents": 400000,
  "generated_at": "2026-02-11T10:00:00Z"
}
```

## Arquitetura

```
/src
├── engine/          # Lógica financeira (funções puras)
│   ├── dre.ts       # Demonstração de Resultado
│   ├── cashflow.ts  # Fluxo de Caixa
│   ├── categorize.ts # Categorização de transações
│   └── types.ts     # Tipos determinísticos
├── models/          # Persistência (sem ORM)
│   ├── transaction.raw.ts
│   └── transaction.interpretation.ts
├── routes/          # HTTP direto (sem controller)
│   ├── import.ts
│   ├── dre.ts
│   └── cashflow.ts
└── app.ts           # Bootstrap
```

## Conceitos

### TransactionRaw
- **Imutável**: nunca update/delete
- **Auditável**: rastreia origem (source)
- **Simples**: apenas dados brutos

### TransactionInterpretation
- **Versionada**: histórico completo
- **Confiança**: sugestão IA vs regra vs manual
- **Método**: rule | model | manual

### Ledger
- **Fonte de Verdade**: DRE e CashFlow usam apenas ledger
- **Dupla-Entrada**: débito = crédito
- **Imutável**: nunca muda

### Engine (funções puras)
- Sem acesso ao BD
- Sem efeitos colaterais
- Deterministicamente testável

## Regras Contábeis

- Transferências internas (is_internal_transfer=true) não entram na DRE
- Receitas sempre positivas em contas 4.x
- Despesas sempre negativas em contas 5.x
- Somas de débitos = créditos (invariante)

## Testes

```bash
npm test
```

Todos os testes focam em:
- ✅ Determinismo (mesma entrada → mesma saída)
- ✅ Imutabilidade (dados nunca mudam)
- ✅ Idempotência (operações são repetíveis)
