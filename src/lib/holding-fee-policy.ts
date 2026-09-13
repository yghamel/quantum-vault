import {
  TESTNET_ANNUAL_FEE_BPS,
  TESTNET_MAX_LIFETIME_FEE_BPS
} from '@/lib/holding-duration-fee';

export const FEE_POLICY_VERSION = 'testnet-holding-v1' as const;

export const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
export const ETHEREUM_SEPOLIA_CAIP =
  `eip155:${ETHEREUM_SEPOLIA_CHAIN_ID}` as const;
export const BITCOIN_TESTNET_CAIP =
  'bip122:000000000933ea01ad0ee984209779ba' as const;

export const DEFAULT_QUOTE_VALIDITY_MS = 120_000;

export type FeeNetworkId = 'bitcoin-testnet' | 'ethereum-sepolia';

export type HoldingFeePolicy = Readonly<{
  featureEnabled: boolean;
  /** Collection requires atomic recipient+treasury support in libqc — currently false. */
  collectionSupportedByLibqc: boolean;
  policyId: typeof FEE_POLICY_VERSION;
  networkId: FeeNetworkId;
  effectiveAtSeconds: number;
  annualFeeBps: number;
  maxLifetimeFeeBps: number;
  gracePeriodSeconds: number;
  quoteValidityMs: number;
  treasuryAddressConfigId: string;
  bitcoinBelowDustPolicy: 'waive-developer-fee';
  userAcceptanceVersion: typeof FEE_POLICY_VERSION;
}>;

export type TreasuryConfig = Readonly<{
  bitcoinTestnetAddress: string | undefined;
  ethereumSepoliaAddress: string | undefined;
}>;

const isNonEmpty = (value: string | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isZeroAddress = (address: string): boolean =>
  address.toLowerCase() === '0x0000000000000000000000000000000000000000';

const ethereumAddressPattern = /^0x[0-9a-fA-F]{40}$/;

/**
 * Bitcoin Testnet addresses use tb1 (bech32) or legacy testnet prefixes.
 * Strict check: must start with tb1 (native segwit / taproot testnet).
 */
export const isValidBitcoinTestnetTreasuryAddress = (
  address: string
): boolean => {
  const normalized = address.trim();
  if (!normalized.startsWith('tb1')) {
    return false;
  }
  // Bech32 charset length bounds for P2WPKH/P2TR
  return normalized.length >= 14 && normalized.length <= 90;
};

/**
 * Ethereum addresses do not encode network. Validate 0x + 20 bytes + nonzero,
 * then bind explicitly to Sepolia via configuration (not address format).
 * Kept free of `@project-eleven/libqc` imports so unit tests avoid loading the
 * full SDK module graph.
 */
export const isValidEthereumTreasuryAddressSyntax = (
  address: string
): boolean => {
  const normalized = address.trim();
  if (!ethereumAddressPattern.test(normalized)) {
    return false;
  }
  return !isZeroAddress(normalized);
};

export const readTreasuryConfigFromEnv = (): TreasuryConfig => ({
  bitcoinTestnetAddress:
    import.meta.env.VITE_BTC_TESTNET_TREASURY_ADDRESS?.trim(),
  ethereumSepoliaAddress:
    import.meta.env.VITE_ETH_SEPOLIA_TREASURY_ADDRESS?.trim()
});

/**
 * libqc 1.0.0 cannot construct multi-output BTC sweeps or batched EVM fee+recipient
 * UserOps through the public emptyVault / sendTransfer APIs.
 */
export const LIBQC_ATOMIC_FEE_COLLECTION_SUPPORTED = false;

export const buildHoldingFeePolicy = ({
  networkId,
  treasuryAddress,
  quoteValidityMs = DEFAULT_QUOTE_VALIDITY_MS,
  effectiveAtSeconds = 0
}: {
  networkId: FeeNetworkId;
  treasuryAddress: string | undefined;
  quoteValidityMs?: number;
  effectiveAtSeconds?: number;
}): HoldingFeePolicy => {
  const treasuryValid =
    networkId === 'bitcoin-testnet'
      ? isNonEmpty(treasuryAddress) &&
        isValidBitcoinTestnetTreasuryAddress(treasuryAddress)
      : isNonEmpty(treasuryAddress) &&
        isValidEthereumTreasuryAddressSyntax(treasuryAddress);

  const featureEnabled = treasuryValid && LIBQC_ATOMIC_FEE_COLLECTION_SUPPORTED;

  return {
    featureEnabled,
    collectionSupportedByLibqc: LIBQC_ATOMIC_FEE_COLLECTION_SUPPORTED,
    policyId: FEE_POLICY_VERSION,
    networkId,
    effectiveAtSeconds,
    annualFeeBps: Number(TESTNET_ANNUAL_FEE_BPS),
    maxLifetimeFeeBps: Number(TESTNET_MAX_LIFETIME_FEE_BPS),
    gracePeriodSeconds: 0,
    quoteValidityMs,
    treasuryAddressConfigId:
      networkId === 'bitcoin-testnet'
        ? 'btc-testnet-treasury'
        : 'eth-sepolia-treasury',
    bitcoinBelowDustPolicy: 'waive-developer-fee',
    userAcceptanceVersion: FEE_POLICY_VERSION
  };
};

export const getActiveHoldingFeePolicies = (
  treasuries: TreasuryConfig = readTreasuryConfigFromEnv()
): ReadonlyArray<HoldingFeePolicy> => [
  buildHoldingFeePolicy({
    networkId: 'bitcoin-testnet',
    treasuryAddress: treasuries.bitcoinTestnetAddress
  }),
  buildHoldingFeePolicy({
    networkId: 'ethereum-sepolia',
    treasuryAddress: treasuries.ethereumSepoliaAddress
  })
];

export const FEE_DISCLOSURE_COPY = {
  annualRate: '2% simple annual holding-duration service fee',
  maxCap: '10% maximum lifetime service fee',
  vaultWording:
    'Fees accrue based on time held in vault after each confirmed deposit.',
  nonCustodial:
    'You retain control of your recovery material. This is an application-level service fee, not a consensus timelock or custodial charge.',
  testnetWarning: 'Testnet coins have no monetary value.',
  collectionBlocked:
    'Service-fee collection is disabled in this build: @project-eleven/libqc@1.0.0 emptyVault supports a single destination only, so recipient and treasury outputs cannot be combined atomically without modifying the SDK.'
} as const;
