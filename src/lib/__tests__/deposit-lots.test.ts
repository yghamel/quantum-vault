import { describe, expect, it } from 'vitest';

import { consumeNativeEthLotsFifo } from '../ethereum-deposit-lots';
import { bitcoinLotsForFullVaultSweep } from '../bitcoin-deposit-lots';
import { calculateHoldingDurationServiceFee } from '../holding-duration-fee';

describe('ethereum FIFO deposit lots', () => {
  it('consumes oldest lots first and supports partial consumption', () => {
    const result = consumeNativeEthLotsFifo({
      withdrawWei: 150n,
      lots: [
        {
          id: 'a',
          amountWei: 100n,
          remainingWei: 100n,
          confirmedAtSeconds: 10n,
          txHash: '0xa',
          blockNumber: 1n,
          policyVersion: 'testnet-holding-v1'
        },
        {
          id: 'b',
          amountWei: 100n,
          remainingWei: 100n,
          confirmedAtSeconds: 20n,
          txHash: '0xb',
          blockNumber: 2n,
          policyVersion: 'testnet-holding-v1'
        }
      ]
    });

    expect(result.consumed).toEqual([
      {
        lotId: 'a',
        consumedWei: 100n,
        confirmedAtSeconds: 10n,
        policyVersion: 'testnet-holding-v1'
      },
      {
        lotId: 'b',
        consumedWei: 50n,
        confirmedAtSeconds: 20n,
        policyVersion: 'testnet-holding-v1'
      }
    ]);
    expect(result.remainingLots.find(l => l.id === 'b')?.remainingWei).toBe(
      50n
    );
    expect(result.shortfallWei).toBe(0n);
  });
});

describe('bitcoin UTXO deposit lots', () => {
  it('ignores unconfirmed UTXOs for fee aging', () => {
    const lots = bitcoinLotsForFullVaultSweep([
      {
        txid: '1',
        vout: 0,
        valueSats: 1000n,
        confirmedAtSeconds: 1n,
        confirmations: 0,
        policyVersion: 'testnet-holding-v1'
      },
      {
        txid: '2',
        vout: 0,
        valueSats: 2000n,
        confirmedAtSeconds: 5n,
        confirmations: 3,
        policyVersion: 'testnet-holding-v1'
      }
    ]);
    expect(lots).toHaveLength(1);
    expect(lots[0]?.principalBaseUnits).toBe(2000n);
  });

  it('combines multi-age UTXOs into correct total fee', () => {
    const fee = calculateHoldingDurationServiceFee({
      calculationTimeSeconds: 31_536_000n,
      lots: bitcoinLotsForFullVaultSweep([
        {
          txid: 'old',
          vout: 0,
          valueSats: 10_000n,
          confirmedAtSeconds: 0n,
          confirmations: 10,
          policyVersion: 'testnet-holding-v1'
        },
        {
          txid: 'new',
          vout: 0,
          valueSats: 10_000n,
          confirmedAtSeconds: 15_768_000n,
          confirmations: 2,
          policyVersion: 'testnet-holding-v1'
        }
      ])
    });
    expect(fee.totalServiceFeeBaseUnits).toBe(300n);
  });
});
