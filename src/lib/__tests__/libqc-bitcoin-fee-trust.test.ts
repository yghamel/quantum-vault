import { describe, expect, it } from 'vitest';
import {
  isWithdrawalFeeWithinLimit,
  maxWithdrawFeeSharePercent
} from '../vault-operations';

// libqc 1.0.0 accepts any Esplora fee rate and only refuses a sweep once the
// remainder falls below dust, so at 9,000 sat/vB a 1,000,000 sat balance
// would pay 990,000 sat in fees. The app-side ceiling must refuse that sweep.

const balance = 1_000_000n;

describe('withdrawal fee ceiling for untrusted provider fee rates', () => {
  it('refuses the sweep libqc would build at a hostile fee rate', () => {
    expect(
      isWithdrawalFeeWithinLimit({ fee: 990_000n, nativeBalance: balance })
    ).toBe(false);
  });

  it('allows a fee exactly at the ceiling and refuses one sat above it', () => {
    const ceiling = (balance * maxWithdrawFeeSharePercent) / 100n;

    expect(
      isWithdrawalFeeWithinLimit({ fee: ceiling, nativeBalance: balance })
    ).toBe(true);
    expect(
      isWithdrawalFeeWithinLimit({ fee: ceiling + 1n, nativeBalance: balance })
    ).toBe(false);
  });

  it('allows an ordinary minimum-rate sweep fee', () => {
    expect(
      isWithdrawalFeeWithinLimit({ fee: 110n, nativeBalance: balance })
    ).toBe(true);
  });

  it.each([
    { fee: -1n, nativeBalance: balance },
    { fee: 110n, nativeBalance: 0n }
  ])('fails closed for fee $fee on balance $nativeBalance', input => {
    expect(isWithdrawalFeeWithinLimit(input)).toBe(false);
  });
});
