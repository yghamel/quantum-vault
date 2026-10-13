import type { Asset } from '@project-eleven/libqc';

import bitcoinIconUrl from '@/assets/chains/bitcoin.svg';
import ethereumIconUrl from '@/assets/chains/ethereum.svg';

/** Native assets render bundled icons so they work offline. */
const bundledIconUrlBySymbol: Partial<Record<string, string>> = {
  BTC: bitcoinIconUrl,
  ETH: ethereumIconUrl,
  stETH: ethereumIconUrl
};

export const resolveAssetIconUrl = ({
  asset,
  chainIconUrl
}: {
  asset: Pick<Asset, 'iconUrl' | 'symbol'>;
  chainIconUrl: string | null;
}): string => {
  const bundledIconUrl = bundledIconUrlBySymbol[asset.symbol];
  if (bundledIconUrl === undefined) {
    return asset.iconUrl;
  }

  return chainIconUrl ?? bundledIconUrl;
};
