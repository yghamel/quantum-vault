import type { ChainId } from '@project-eleven/libqc';

import { ensurePresent } from '@/lib/assert';

type AccountWithChain = {
  chainId: ChainId;
};

type SupportedChainWithIdentity = {
  chainId: ChainId;
};

/** Bitcoin testnet only for the first Capacitor iOS build. */
export const defaultAccountChainIds = [
  'bip122:000000000933ea01ad0ee984209779ba'
] as const;

export const hasAccountForChain = ({
  accounts,
  chainId
}: {
  accounts: ReadonlyArray<AccountWithChain>;
  chainId: ChainId | string;
}): boolean =>
  accounts.some(account => account.chainId.toString() === chainId.toString());

export const getMissingDefaultAccountChains = <
  TChain extends SupportedChainWithIdentity
>({
  accounts,
  supportedChains
}: {
  accounts: ReadonlyArray<AccountWithChain>;
  supportedChains: ReadonlyArray<TChain>;
}): TChain[] => {
  const supportedChainById = new Map(
    supportedChains.map(chain => [chain.chainId.toString(), chain])
  );

  return defaultAccountChainIds
    .filter(
      defaultChainId =>
        !hasAccountForChain({ accounts, chainId: defaultChainId })
    )
    .map(chainId =>
      ensurePresent(
        supportedChainById.get(chainId),
        `supported default account chain ${chainId}`
      )
    );
};
