import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { calculateDRE } from './dre.js';
import type { LedgerEntry } from './types.js';


describe('DRE Calculation', () => {
  it('should calculate net result correctly', () => {
    const ledger: LedgerEntry[] = [
      {
        id: 'ledger_1',
        date: '2026-02-01',
        interpretation_id: 'interp_1',
        debit_account: '1.1.1', // Banco
        credit_account: '4.1.1', // Receita de Serviços
        amount_in_cents: 500000,
        description: 'Pagamento recebido',
        created_at: '2026-02-01T10:00:00Z',
        is_internal_transfer: false
      },
      {
        id: 'ledger_2',
        date: '2026-02-05',
        interpretation_id: 'interp_2',
        debit_account: '5.1.2', // Custos de Infraestrutura
        credit_account: '1.1.1', // Banco
        amount_in_cents: 200000,
        description: 'Pagamento AWS',
        created_at: '2026-02-05T10:00:00Z',
        is_internal_transfer: false
      }
    ];
    
    const result = calculateDRE(ledger, '2026-02');
    
    assert.equal(result.revenue_in_cents, 500000);
    assert.equal(result.expenses_in_cents, 200000);
    assert.equal(result.net_result_in_cents, 300000);
  });

  it('should ignore internal transfers', () => {
    const ledger: LedgerEntry[] = [
      {
        id: 'ledger_3',
        date: '2026-02-10',
        interpretation_id: 'interp_3',
        debit_account: '1.1.1',
        credit_account: '1.1.2',
        amount_in_cents: 100000,
        description: 'Transferência entre contas',
        created_at: '2026-02-10T10:00:00Z',
        is_internal_transfer: true
      }
    ];
    
    const result = calculateDRE(ledger, '2026-02');
    
    assert.equal(result.revenue_in_cents, 0);
    assert.equal(result.expenses_in_cents, 0);
    assert.equal(result.net_result_in_cents, 0);
  });

  it('should filter by period correctly', () => {
    const ledger: LedgerEntry[] = [
      {
        id: 'ledger_4',
        date: '2026-01-15', // Janeiro - não deve contar
        interpretation_id: 'interp_4',
        debit_account: '1.1.1',
        credit_account: '4.1.1',
        amount_in_cents: 100000,
        description: 'Receita janeiro',
        created_at: '2026-01-15T10:00:00Z',
        is_internal_transfer: false
      },
      {
        id: 'ledger_5',
        date: '2026-02-15', // Fevereiro - deve contar
        interpretation_id: 'interp_5',
        debit_account: '1.1.1',
        credit_account: '4.1.1',
        amount_in_cents: 200000,
        description: 'Receita fevereiro',
        created_at: '2026-02-15T10:00:00Z',
        is_internal_transfer: false
      }
    ];
    
    const result = calculateDRE(ledger, '2026-02');
    
    assert.equal(result.revenue_in_cents, 200000);
  });
});
    