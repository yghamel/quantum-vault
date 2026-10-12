import { EsploraBitcoinApi } from '@project-eleven/libqc/dist/account/bitcoin/esplora';
import { estimateSweepTransaction } from '@project-eleven/libqc/dist/account/bitcoin/emptyVault';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Characterises how libqc 1.0.0 trusts the Esplora fee estimate (finding
// QV-SEC-001 in docs/security/pre-audit-readiness-report.md). When libqc adds a
// fee-rate ceiling these expectations should flip to assert the rejection.

const accountId = 'bip122:00000000da84f2bafbbc53dee25a72ae:tb1qsource';
const p2wpkhOutputScript = new Uint8Array(22);
const oneUtxoOf = (value: bigint) => [{ txid: 'a'.repeat(64), vout: 0, value }];

const stubFeeEstimates = (body: unknown) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }))
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('libqc bitcoin fee-rate trust (QV-SEC-001)', () => {
  it('passes an arbitrarily high fee estimate through without a ceiling', async () => {
    stubFeeEstimates({ '1': 1_000_000 });
    const api = new EsploraBitcoinApi('https://esplora.invalid/api');

    await expect(api.getFeeRateSatsPerVByte()).resolves.toBe(1_000_000);
  });

  it('builds a sweep that spends 99% of the balance on fees at a hostile rate', () => {
    const balance = 1_000_000n;
    const { amountToSend, fee } = estimateSweepTransaction({
      accountId,
      outputScript: p2wpkhOutputScript,
      utxos: oneUtxoOf(balance),
      feeRateSatsPerVByte: 9_000
    });

    expect(fee).toBe(990_000n);
    expect(amountToSend).toBe(10_000n);
    expect(fee * 100n).toBeGreaterThanOrEqual(balance * 99n);
  });

  it('only refuses once the remainder falls below the dust limit', () => {
    expect(() =>
      estimateSweepTransaction({
        accountId,
        outputScript: p2wpkhOutputScript,
        utxos: oneUtxoOf(1_000_000n),
        feeRateSatsPerVByte: 9_090
      })
    ).toThrow();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'fails closed for a non-finite fee rate (%s)',
    feeRate => {
      expect(() =>
        estimateSweepTransaction({
          accountId,
          outputScript: p2wpkhOutputScript,
          utxos: oneUtxoOf(1_000_000n),
          feeRateSatsPerVByte: feeRate
        })
      ).toThrow(RangeError);
    }
  );

  it('clamps negative and zero fee rates to 1 sat/vB', () => {
    const { fee } = estimateSweepTransaction({
      accountId,
      outputScript: p2wpkhOutputScript,
      utxos: oneUtxoOf(1_000_000n),
      feeRateSatsPerVByte: -50
    });

    expect(fee).toBe(110n);
  });
});
