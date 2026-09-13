/**
 * FIFO native ETH deposit-lot tracking for holding-duration fee quotes.
 *
 * Authoritative lot times must come from chain/indexer data. This module only
 * performs exact wei accounting; it does not fetch history.
 */

export type NativeEthDepositLot = Readonly<{
  id: string;
  amountWei: bigint;
  remainingWei: bigint;
  confirmedAtSeconds: bigint;
  txHash: string;
  blockNumber: bigint;
  policyVersion: string;
}>;

export type ConsumedLotSlice = Readonly<{
  lotId: string;
  consumedWei: bigint;
  confirmedAtSeconds: bigint;
  policyVersion: string;
}>;

/**
 * Consume `withdrawWei` from oldest lots first (FIFO). Returns slices and
 * updated lots. Does not mutate inputs.
 */
export const consumeNativeEthLotsFifo = ({
  lots,
  withdrawWei
}: {
  lots: ReadonlyArray<NativeEthDepositLot>;
  withdrawWei: bigint;
}): {
  consumed: ReadonlyArray<ConsumedLotSlice>;
  remainingLots: ReadonlyArray<NativeEthDepositLot>;
  shortfallWei: bigint;
} => {
  if (withdrawWei <= 0n) {
    return { consumed: [], remainingLots: lots, shortfallWei: 0n };
  }

  const ordered = [...lots].sort((a, b) => {
    if (a.confirmedAtSeconds === b.confirmedAtSeconds) {
      return a.blockNumber < b.blockNumber
        ? -1
        : a.blockNumber > b.blockNumber
          ? 1
          : 0;
    }
    return a.confirmedAtSeconds < b.confirmedAtSeconds ? -1 : 1;
  });

  let remainingToConsume = withdrawWei;
  const consumed: ConsumedLotSlice[] = [];
  const remainingLots: NativeEthDepositLot[] = [];

  for (const lot of ordered) {
    if (remainingToConsume === 0n || lot.remainingWei === 0n) {
      remainingLots.push(lot);
      continue;
    }
    const take =
      lot.remainingWei < remainingToConsume
        ? lot.remainingWei
        : remainingToConsume;
    consumed.push({
      lotId: lot.id,
      consumedWei: take,
      confirmedAtSeconds: lot.confirmedAtSeconds,
      policyVersion: lot.policyVersion
    });
    remainingToConsume -= take;
    remainingLots.push({
      ...lot,
      remainingWei: lot.remainingWei - take
    });
  }

  return {
    consumed,
    remainingLots,
    shortfallWei: remainingToConsume
  };
};
