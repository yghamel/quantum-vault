import { describe, expect, it } from 'vitest';

import {
  assertQuoteSignable,
  createWithdrawalFeeQuote,
  isWithdrawalFeeQuoteExpired
} from '../withdrawal-fee-quote';

describe('withdrawal fee quotes', () => {
  it('marks quotes expired after validity window', () => {
    const quote = createWithdrawalFeeQuote({
      quoteId: 'q1',
      networkId: 'bitcoin-testnet',
      createdAtMs: 1_000,
      calculationTimeSeconds: 1n,
      recipientAddress: 'tb1qtest',
      recipientAmountBaseUnits: 1000n,
      networkFeeBaseUnits: 10n,
      networkFeeLabel: 'Bitcoin miner fee',
      serviceFeeBaseUnits: 0n,
      serviceFeeWaivedForDust: false,
      annualFeeBps: 200,
      maxLifetimeFeeBps: 1000,
      collectionEnabled: false,
      quoteValidityMs: 100
    });

    expect(isWithdrawalFeeQuoteExpired({ quote, nowMs: 1_050 })).toBe(false);
    expect(isWithdrawalFeeQuoteExpired({ quote, nowMs: 1_100 })).toBe(true);
    expect(() => assertQuoteSignable({ quote, nowMs: 1_100 })).toThrow(
      /expired/
    );
  });

  it('does not allow signing an expired quote', () => {
    const quote = createWithdrawalFeeQuote({
      quoteId: 'q2',
      networkId: 'ethereum-sepolia',
      createdAtMs: 0,
      calculationTimeSeconds: 1n,
      recipientAddress: '0x1111111111111111111111111111111111111111',
      recipientAmountBaseUnits: 1n,
      networkFeeBaseUnits: 1n,
      networkFeeLabel: 'Ethereum gas fee',
      serviceFeeBaseUnits: 0n,
      serviceFeeWaivedForDust: false,
      annualFeeBps: 200,
      maxLifetimeFeeBps: 1000,
      collectionEnabled: false,
      quoteValidityMs: 1
    });
    expect(() => assertQuoteSignable({ quote, nowMs: 2 })).toThrow();
  });
});
