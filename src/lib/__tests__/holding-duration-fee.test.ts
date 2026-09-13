import { describe, expect, it } from 'vitest';

import {
  applyBitcoinDustFeeWaiver,
  calculateHoldingDurationServiceFee,
  computeLotServiceFeeBaseUnits,
  SECONDS_PER_YEAR,
  TESTNET_ANNUAL_FEE_BPS,
  TESTNET_MAX_LIFETIME_FEE_BPS
} from '../holding-duration-fee';

const day = 86_400n;

describe('holding-duration fee math', () => {
  it('produces zero fee for zero holding time', () => {
    const result = computeLotServiceFeeBaseUnits({
      principalBaseUnits: 100_000_000n,
      confirmedAtSeconds: 1_700_000_000n,
      calculationTimeSeconds: 1_700_000_000n
    });
    expect(result.finalServiceFeeBaseUnits).toBe(0n);
  });

  it('prorates thirty days correctly', () => {
    const principal = 100_000_000n; // 1 BTC in sats
    const result = computeLotServiceFeeBaseUnits({
      principalBaseUnits: principal,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: 30n * day
    });
    const expected =
      (principal * TESTNET_ANNUAL_FEE_BPS * (30n * day)) /
      10_000n /
      SECONDS_PER_YEAR;
    expect(result.finalServiceFeeBaseUnits).toBe(expected);
  });

  it('is approximately 1% after six months (exact seconds)', () => {
    const principal = 10_000_000_000n;
    const sixMonths = (SECONDS_PER_YEAR * 6n) / 12n;
    const result = computeLotServiceFeeBaseUnits({
      principalBaseUnits: principal,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: sixMonths
    });
    const expected =
      (principal * TESTNET_ANNUAL_FEE_BPS * sixMonths) /
      10_000n /
      SECONDS_PER_YEAR;
    expect(result.finalServiceFeeBaseUnits).toBe(expected);
    // ~1% of principal
    expect(result.finalServiceFeeBaseUnits).toBe(principal / 100n);
  });

  it('produces 2% after one year', () => {
    const principal = 50_000_000n;
    const result = computeLotServiceFeeBaseUnits({
      principalBaseUnits: principal,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: SECONDS_PER_YEAR
    });
    expect(result.finalServiceFeeBaseUnits).toBe(
      (principal * TESTNET_ANNUAL_FEE_BPS) / 10_000n
    );
  });

  it('produces 6% after three years', () => {
    const principal = 1_000_000_000n;
    const result = computeLotServiceFeeBaseUnits({
      principalBaseUnits: principal,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: SECONDS_PER_YEAR * 3n
    });
    expect(result.finalServiceFeeBaseUnits).toBe((principal * 600n) / 10_000n);
  });

  it('caps at 10% after five years', () => {
    const principal = 1_000_000_000n;
    const result = computeLotServiceFeeBaseUnits({
      principalBaseUnits: principal,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: SECONDS_PER_YEAR * 5n
    });
    expect(result.finalServiceFeeBaseUnits).toBe(
      (principal * TESTNET_MAX_LIFETIME_FEE_BPS) / 10_000n
    );
  });

  it('never exceeds 10% after more than five years', () => {
    const principal = 2_000_000_000n;
    const atFive = computeLotServiceFeeBaseUnits({
      principalBaseUnits: principal,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: SECONDS_PER_YEAR * 5n
    });
    const atTen = computeLotServiceFeeBaseUnits({
      principalBaseUnits: principal,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: SECONDS_PER_YEAR * 10n
    });
    expect(atTen.finalServiceFeeBaseUnits).toBe(
      atFive.finalServiceFeeBaseUnits
    );
    expect(atTen.finalServiceFeeBaseUnits).toBe(principal / 10n);
  });

  it('is simple non-compounding across independent lots', () => {
    const calc = calculateHoldingDurationServiceFee({
      calculationTimeSeconds: SECONDS_PER_YEAR,
      lots: [
        { principalBaseUnits: 100n, confirmedAtSeconds: 0n },
        { principalBaseUnits: 100n, confirmedAtSeconds: 0n }
      ]
    });
    expect(calc.totalServiceFeeBaseUnits).toBe(4n); // 2% of 200
  });

  it('ages each lot independently', () => {
    const calc = calculateHoldingDurationServiceFee({
      calculationTimeSeconds: SECONDS_PER_YEAR,
      lots: [
        { principalBaseUnits: 10_000n, confirmedAtSeconds: 0n },
        {
          principalBaseUnits: 10_000n,
          confirmedAtSeconds: SECONDS_PER_YEAR / 2n
        }
      ]
    });
    expect(calc.lots[0]?.finalServiceFeeBaseUnits).toBe(200n);
    expect(calc.lots[1]?.finalServiceFeeBaseUnits).toBe(100n);
    expect(calc.totalServiceFeeBaseUnits).toBe(300n);
  });

  it('rounds fractional base units down', () => {
    // Choose values that leave a remainder before floor division.
    const result = computeLotServiceFeeBaseUnits({
      principalBaseUnits: 1n,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: 1n
    });
    expect(result.finalServiceFeeBaseUnits).toBe(0n);
  });

  it('waives Bitcoin developer fees below dust', () => {
    const waived = applyBitcoinDustFeeWaiver({ serviceFeeSats: 100n });
    expect(waived.feeSats).toBe(0n);
    expect(waived.waivedForDust).toBe(true);
    const kept = applyBitcoinDustFeeWaiver({ serviceFeeSats: 1000n });
    expect(kept.feeSats).toBe(1000n);
    expect(kept.waivedForDust).toBe(false);
  });

  it('does not change when device-clock-like values differ if chain times fixed', () => {
    const chainCalcTime = SECONDS_PER_YEAR;
    const a = computeLotServiceFeeBaseUnits({
      principalBaseUnits: 1_000_000n,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: chainCalcTime
    });
    const b = computeLotServiceFeeBaseUnits({
      principalBaseUnits: 1_000_000n,
      confirmedAtSeconds: 0n,
      calculationTimeSeconds: chainCalcTime
    });
    expect(a.finalServiceFeeBaseUnits).toBe(b.finalServiceFeeBaseUnits);
  });
});
