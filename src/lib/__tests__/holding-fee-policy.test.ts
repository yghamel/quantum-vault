import { describe, expect, it } from 'vitest';

import {
  buildHoldingFeePolicy,
  ETHEREUM_SEPOLIA_CAIP,
  ETHEREUM_SEPOLIA_CHAIN_ID,
  isValidBitcoinTestnetTreasuryAddress,
  isValidEthereumTreasuryAddressSyntax,
  LIBQC_ATOMIC_FEE_COLLECTION_SUPPORTED
} from '../holding-fee-policy';

describe('holding fee policy gates', () => {
  it('keeps collection disabled without treasury', () => {
    const policy = buildHoldingFeePolicy({
      networkId: 'bitcoin-testnet',
      treasuryAddress: undefined
    });
    expect(policy.featureEnabled).toBe(false);
  });

  it('rejects invalid Bitcoin treasury addresses', () => {
    expect(isValidBitcoinTestnetTreasuryAddress('bc1qinvalidmainnet')).toBe(
      false
    );
    expect(isValidBitcoinTestnetTreasuryAddress('not-an-address')).toBe(false);
  });

  it('accepts tb1 Bitcoin testnet treasury syntax', () => {
    expect(
      isValidBitcoinTestnetTreasuryAddress(
        'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      )
    ).toBe(true);
  });

  it('rejects invalid or zero Ethereum treasury addresses', () => {
    expect(isValidEthereumTreasuryAddressSyntax('0x123')).toBe(false);
    expect(
      isValidEthereumTreasuryAddressSyntax(
        '0x0000000000000000000000000000000000000000'
      )
    ).toBe(false);
  });

  it('accepts valid Ethereum address syntax but still binds to Sepolia via config', () => {
    expect(
      isValidEthereumTreasuryAddressSyntax(
        '0x1111111111111111111111111111111111111111'
      )
    ).toBe(true);
    expect(ETHEREUM_SEPOLIA_CHAIN_ID).toBe(11155111);
    expect(ETHEREUM_SEPOLIA_CAIP).toBe('eip155:11155111');
  });

  it('keeps feature disabled even with valid treasury while libqc lacks atomic fee support', () => {
    expect(LIBQC_ATOMIC_FEE_COLLECTION_SUPPORTED).toBe(false);
    const policy = buildHoldingFeePolicy({
      networkId: 'ethereum-sepolia',
      treasuryAddress: '0x1111111111111111111111111111111111111111'
    });
    expect(policy.featureEnabled).toBe(false);
    expect(policy.collectionSupportedByLibqc).toBe(false);
  });
});
