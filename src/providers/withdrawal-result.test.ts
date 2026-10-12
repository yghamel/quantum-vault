import { describe, expect, it, vi } from 'vitest';

import {
  WithdrawalInProgressError,
  assertWithdrawalResultIdentity,
  runExclusiveWithdrawal
} from './withdrawal-result';

const accountId = 'eip155:1:0x1111111111111111111111111111111111111111';
const chainId = 'eip155:1';

const selectedAccount = {
  id: {
    toString: () => accountId
  },
  chainId: {
    toString: () => chainId
  }
};

const createResult = () => ({
  accountId,
  destinationChain: chainId,
  status: 'pending' as const
});

describe('withdrawal-result', () => {
  describe('assertWithdrawalResultIdentity', () => {
    it('accepts responses that match the selected account identity', () => {
      expect(() =>
        assertWithdrawalResultIdentity({
          result: createResult(),
          selectedAccount
        })
      ).not.toThrow();
    });

    it('throws when account id mismatches', () => {
      expect(() =>
        assertWithdrawalResultIdentity({
          result: {
            ...createResult(),
            accountId: 'eip155:1:0x3333333333333333333333333333333333333333'
          },
          selectedAccount
        })
      ).toThrow(
        `Withdrawal account mismatch: expected ${accountId}, got eip155:1:0x3333333333333333333333333333333333333333`
      );
    });

    it('throws when destination chain mismatches', () => {
      expect(() =>
        assertWithdrawalResultIdentity({
          result: {
            ...createResult(),
            destinationChain: 'bip122:000000000019d6689c085ae165831e93'
          },
          selectedAccount
        })
      ).toThrow(
        'Withdrawal chain mismatch: expected eip155:1, got bip122:000000000019d6689c085ae165831e93'
      );
    });
  });

  describe('runExclusiveWithdrawal', () => {
    const createInFlightRef = (): { current: Promise<string> | null } => ({
      current: null
    });

    const createDeferred = () => {
      let resolve: (value: string) => void = () => undefined;
      let reject: (error: Error) => void = () => undefined;
      const promise = new Promise<string>((onResolve, onReject) => {
        resolve = onResolve;
        reject = onReject;
      });
      return { promise, resolve, reject };
    };

    it('rejects a concurrent withdrawal without starting a second sweep', async () => {
      const inFlightRef = createInFlightRef();
      const first = createDeferred();
      const action = vi.fn(() => first.promise);

      const firstRequest = runExclusiveWithdrawal({ inFlightRef, action });
      const secondRequest = runExclusiveWithdrawal({ inFlightRef, action });

      await expect(secondRequest).rejects.toBeInstanceOf(
        WithdrawalInProgressError
      );
      expect(action).toHaveBeenCalledTimes(1);

      first.resolve('submitted');
      await expect(firstRequest).resolves.toBe('submitted');
    });

    it('rejects every rapid repeat while the first sweep is pending', async () => {
      const inFlightRef = createInFlightRef();
      const first = createDeferred();
      const action = vi.fn(() => first.promise);

      const firstRequest = runExclusiveWithdrawal({ inFlightRef, action });
      const repeats = Array.from({ length: 10 }, () =>
        runExclusiveWithdrawal({ inFlightRef, action })
      );

      const settled = await Promise.allSettled(repeats);
      expect(settled.every(({ status }) => status === 'rejected')).toBe(true);
      expect(action).toHaveBeenCalledTimes(1);

      first.resolve('submitted');
      await firstRequest;
    });

    it('allows a retry after the previous withdrawal failed', async () => {
      const inFlightRef = createInFlightRef();
      const first = createDeferred();
      const action = vi
        .fn<() => Promise<string>>()
        .mockImplementationOnce(() => first.promise)
        .mockResolvedValueOnce('retried');

      const firstRequest = runExclusiveWithdrawal({ inFlightRef, action });
      first.reject(new Error('bundler unavailable'));
      await expect(firstRequest).rejects.toThrow('bundler unavailable');

      await expect(
        runExclusiveWithdrawal({ inFlightRef, action })
      ).resolves.toBe('retried');
      expect(action).toHaveBeenCalledTimes(2);
    });
  });
});
