import { formatUnits } from '@project-eleven/libqc';

import { getBitcoinApiUrl } from '@/lib/env';

const bitcoinDecimals = 8;

type EsploraMempoolStats = {
  funded_txo_sum: number;
  spent_txo_sum: number;
};

const isSatsAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const isEsploraMempoolStats = (value: unknown): value is EsploraMempoolStats =>
  typeof value === 'object' &&
  value !== null &&
  isSatsAmount((value as EsploraMempoolStats).funded_txo_sum) &&
  isSatsAmount((value as EsploraMempoolStats).spent_txo_sum);

/**
 * Net unconfirmed sats arriving at an address. Outgoing mempool spends
 * (withdrawals) never make this negative.
 */
export const getPendingIncomingSats = (addressStats: unknown): bigint => {
  const mempoolStats =
    typeof addressStats === 'object' && addressStats !== null
      ? (addressStats as { mempool_stats?: unknown }).mempool_stats
      : undefined;

  if (!isEsploraMempoolStats(mempoolStats)) {
    throw new Error('Unexpected Esplora address response');
  }

  const net =
    BigInt(mempoolStats.funded_txo_sum) - BigInt(mempoolStats.spent_txo_sum);

  return net > 0n ? net : 0n;
};

export const fetchBitcoinPendingIncomingSats = async ({
  address,
  apiUrl = getBitcoinApiUrl(),
  fetchImpl = fetch
}: {
  address: string;
  apiUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<bigint> => {
  const response = await fetchImpl(
    `${apiUrl.replace(/\/+$/, '')}/address/${encodeURIComponent(address)}`
  );

  if (!response.ok) {
    throw new Error(`Esplora address request failed (${response.status})`);
  }

  return getPendingIncomingSats(await response.json());
};

export const formatPendingBitcoinDeposit = (sats: bigint): string =>
  `+${formatUnits(sats, bitcoinDecimals)} BTC`;
