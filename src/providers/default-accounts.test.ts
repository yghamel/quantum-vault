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
const sepoliaChainId = 'eip155:11155111';
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
  it('returns Bitcoin Testnet and Sepolia when no default accounts exist', () => {
    const bitcoin = createChain(bitcoinTestnetChainId);
    const sepolia = createChain(sepoliaChainId);

    const result = getMissingDefaultAccountChains({
      accounts: [],
      supportedChains: [bitcoin, sepolia]
    });

    expect(result).toEqual([bitcoin, sepolia]);
  });

  it('returns only Sepolia when Bitcoin Testnet already exists', () => {
    const bitcoin = createChain(bitcoinTestnetChainId);
    const sepolia = createChain(sepoliaChainId);

    const result = getMissingDefaultAccountChains({
      accounts: [createAccount(bitcoinTestnetChainId)],
      supportedChains: [bitcoin, sepolia]
    });

    expect(result).toEqual([sepolia]);
  });

  it('returns nothing when both defaults exist', () => {
    const bitcoin = createChain(bitcoinTestnetChainId);
    const sepolia = createChain(sepoliaChainId);
    const other = createChain(unsupportedChainId);

    const result = getMissingDefaultAccountChains({
      accounts: [
        createAccount(bitcoinTestnetChainId),
        createAccount(sepoliaChainId)
      ],
      supportedChains: [bitcoin, sepolia, other]
    });

    expect(result).toEqual([]);
  });

  it('fails fast when a default chain is unsupported', () => {
    const bitcoin = createChain(bitcoinTestnetChainId);

    expect(() =>
      getMissingDefaultAccountChains({
        accounts: [],
        supportedChains: [bitcoin]
      })
    ).toThrow(
      `Expected supported default account chain ${sepoliaChainId} to be present`
    );
  });
});
