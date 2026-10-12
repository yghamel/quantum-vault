import type { PersistedAccount } from '@project-eleven/libqc';
import { useQuery } from '@tanstack/react-query';

import { useWallet } from '@/hooks/use-wallet';

import {
  fetchBitcoinPendingIncomingSats,
  formatPendingBitcoinDeposit
} from './pending-deposits';
import { vaultQueryKeys } from './query-keys';

const bitcoinChainNamespace = 'bip122';

/**
 * Unconfirmed incoming BTC for a vault, formatted like `+0.005 BTC`, or
 * `undefined` when nothing is pending. Balances only count confirmed coins.
 */
export const usePendingBitcoinDeposit = (
  account: Pick<PersistedAccount, 'id' | 'address' | 'chainId'> | undefined
): string | undefined => {
  const { sessionId } = useWallet();
  const address =
    account?.chainId.namespace === bitcoinChainNamespace
      ? account.address
      : undefined;

  const pendingQuery = useQuery({
    queryKey: vaultQueryKeys.pendingDeposit({
      sessionId,
      accountId: account?.id.toString()
    }),
    queryFn: () => fetchBitcoinPendingIncomingSats({ address: address ?? '' }),
    enabled: address !== undefined,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false
  });

  return pendingQuery.data !== undefined && pendingQuery.data > 0n
    ? formatPendingBitcoinDeposit(pendingQuery.data)
    : undefined;
};
