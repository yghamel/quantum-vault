import { runSingleFlight } from '@/lib/single-flight';
import type { EmptyVaultResult, PersistedAccount } from '@project-eleven/libqc';
import type { RefObject } from 'react';

export const failedWithdrawalErrorMessage =
  'Vault withdrawal failed after submission';

export class WithdrawalInProgressError extends Error {
  constructor() {
    super('A vault withdrawal is already in progress');
    this.name = 'WithdrawalInProgressError';
  }
}

/**
 * Runs a vault sweep unless one is already in flight; a concurrent call
 * rejects instead of broadcasting a second transaction.
 */
export const runExclusiveWithdrawal = <T>({
  inFlightRef,
  action
}: {
  inFlightRef: RefObject<Promise<T> | null>;
  action: () => Promise<T>;
}): Promise<T> =>
  runSingleFlight({ inFlightRef, action }) ??
  Promise.reject(new WithdrawalInProgressError());

type WithdrawalResultIdentityFields = Pick<
  EmptyVaultResult,
  'accountId' | 'destinationChain'
>;

type SelectedAccountIdentityFields = Pick<PersistedAccount, 'id' | 'chainId'>;

export const assertWithdrawalResultIdentity = ({
  result,
  selectedAccount
}: {
  result: WithdrawalResultIdentityFields;
  selectedAccount: SelectedAccountIdentityFields;
}): void => {
  const expectedAccountId = selectedAccount.id.toString();
  const expectedChainId = selectedAccount.chainId.toString();

  if (result.accountId !== expectedAccountId) {
    throw new Error(
      `Withdrawal account mismatch: expected ${expectedAccountId}, got ${result.accountId}`
    );
  }

  if (result.destinationChain !== expectedChainId) {
    throw new Error(
      `Withdrawal chain mismatch: expected ${expectedChainId}, got ${result.destinationChain}`
    );
  }
};
