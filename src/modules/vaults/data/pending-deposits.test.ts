import { describe, expect, it, vi } from 'vitest';

vi.mock('@project-eleven/libqc', () => ({
  formatUnits: (value: bigint, decimals: number) =>
    (Number(value) / 10 ** decimals).toString()
}));

vi.mock('@/lib/env', () => ({
  getBitcoinApiUrl: () => 'https://mempool.space/testnet4/api'
}));

import {
  fetchBitcoinPendingIncomingSats,
  formatPendingBitcoinDeposit,
  getPendingIncomingSats
} from './pending-deposits';

const addressStats = (funded: number, spent: number) => ({
  chain_stats: { funded_txo_sum: 1000, spent_txo_sum: 0 },
  mempool_stats: { funded_txo_sum: funded, spent_txo_sum: spent }
});

describe('getPendingIncomingSats', () => {
  it('returns unconfirmed incoming sats', () => {
    expect(getPendingIncomingSats(addressStats(500000, 0))).toBe(500000n);
  });

  it('never goes negative while a withdrawal is unconfirmed', () => {
    expect(getPendingIncomingSats(addressStats(0, 1000))).toBe(0n);
  });

  it('rejects an unexpected response shape', () => {
    expect(() => getPendingIncomingSats({ chain_stats: {} })).toThrow(
      'Unexpected Esplora address response'
    );
  });

  it.each([
    ['fractional', 1.5],
    ['negative', -5],
    ['overflowing', JSON.parse('1e400')],
    ['unsafe integer', Number.MAX_SAFE_INTEGER + 2],
    ['NaN', Number.NaN],
    ['string', '500000'],
    ['null', null]
  ])('rejects a %s mempool amount', (_label, amount: unknown) => {
    expect(() =>
      getPendingIncomingSats({
        mempool_stats: { funded_txo_sum: amount, spent_txo_sum: 0 }
      })
    ).toThrow('Unexpected Esplora address response');
    expect(() =>
      getPendingIncomingSats({
        mempool_stats: { funded_txo_sum: 0, spent_txo_sum: amount }
      })
    ).toThrow('Unexpected Esplora address response');
  });

  it('equals max(funded - spent, 0) for randomized amounts', () => {
    let state = 7;
    const nextSats = () => {
      state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
      return state * 1_000;
    };

    for (let run = 0; run < 1_000; run += 1) {
      const funded = nextSats();
      const spent = nextSats();
      const expected = BigInt(funded) - BigInt(spent);

      expect(getPendingIncomingSats(addressStats(funded, spent))).toBe(
        expected > 0n ? expected : 0n
      );
    }
  });

  it.each([undefined, null, 42, 'text', [], { mempool_stats: null }])(
    'rejects a non-object response %#',
    response => {
      expect(() => getPendingIncomingSats(response)).toThrow(
        'Unexpected Esplora address response'
      );
    }
  );
});

describe('fetchBitcoinPendingIncomingSats', () => {
  it('reads the address endpoint of the configured Esplora API', async () => {
    const fetchImpl = vi.fn(async () => Response.json(addressStats(2500, 0)));

    await expect(
      fetchBitcoinPendingIncomingSats({
        address: 'tb1qexample',
        fetchImpl
      })
    ).resolves.toBe(2500n);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://mempool.space/testnet4/api/address/tb1qexample'
    );
  });

  it('throws when the request fails', async () => {
    const fetchImpl = vi.fn(async () => new Response('busy', { status: 503 }));

    await expect(
      fetchBitcoinPendingIncomingSats({ address: 'tb1qexample', fetchImpl })
    ).rejects.toThrow('Esplora address request failed (503)');
  });
});

describe('formatPendingBitcoinDeposit', () => {
  it('formats sats as a signed BTC amount', () => {
    expect(formatPendingBitcoinDeposit(500000n)).toBe('+0.005 BTC');
  });
});
