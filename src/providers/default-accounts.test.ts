import { describe, expect, it } from 'vitest';
import type { ChainId } from '@project-eleven/libqc';

import { getMissingDefaultAccountChains } from './default-accounts';

type TestChain = {
  label: string;
  chainId: ChainId;
};

type TestAccount = {
  chainId: ChainId;
};

const bitcoinTestnetChainId = 'bip122:000000000933ea01ad0ee984209779ba';
const unsupportedChainId = 'eip155:137';

const createChainId = (value: string): ChainId => {
  const [namespace, reference] = value.split(':');

  return {
    namespace,
    reference,
    toString: () => value,
    toJSON: () => ({ namespace, reference })
  };
};

const createChain = (chainId: string): TestChain => ({
  label: chainId,
  chainId: createChainId(chainId)
});

const createAccount = (chainId: string): TestAccount => ({
  chainId: createChainId(chainId)
});

describe('getMissingDefaultAccountChains', () => {
  it('returns Bitcoin testnet when no default accounts exist', () => {
    const bitcoin = createChain(bitcoinTestnetChainId);

    const result = getMissingDefaultAccountChains({
      accounts: [],
      supportedChains: [bitcoin]
    });

    expect(result).toEqual([bitcoin]);
  });

  it('returns nothing when Bitcoin testnet already exists', () => {
    const bitcoin = createChain(bitcoinTestnetChainId);
    const other = createChain(unsupportedChainId);

    const result = getMissingDefaultAccountChains({
      accounts: [createAccount(bitcoinTestnetChainId)],
      supportedChains: [bitcoin, other]
    });

    expect(result).toEqual([]);
  });

  it('fails fast when the default Bitcoin testnet chain is unsupported', () => {
    const other = createChain(unsupportedChainId);

    expect(() =>
      getMissingDefaultAccountChains({
        accounts: [],
        supportedChains: [other]
      })
    ).toThrow(
      `Expected supported default account chain ${bitcoinTestnetChainId} to be present`
    );
  });
});
