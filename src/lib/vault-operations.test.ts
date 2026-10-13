import type {
  Asset,
  BalanceResult,
  PersistedAccount
} from '@project-eleven/libqc';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@project-eleven/libqc', () => ({
  EvmAccountClient: class EvmAccountClient {},
  InvalidDestinationAddressError: class InvalidDestinationAddressError extends Error {},
  formatUnits: (value: bigint) => value.toString(),
  isNativeAsset: (asset: { symbol: string }) =>
    asset.symbol === 'BTC' || asset.symbol === 'ETH'
}));

import {
  NonInterfaceAssetBalanceError,
  WithdrawalFeeTooHighError,
  assertNoNonInterfaceAssetBalances,
  assertWithdrawalFeeWithinLimit,
  computeFeeCost,
  isWithdrawalFeeWithinLimit,
  loadVaultWithdrawSummary
} from '@/lib/vault-operations';
import {
  EvmAccountClient,
  InvalidDestinationAddressError,
  type GasCostEstimate
} from '@project-eleven/libqc';

const isGasCostEstimate = (value: unknown): value is GasCostEstimate =>
  typeof value === 'object' &&
  value !== null &&
  'callGasLimit' in value &&
  typeof value.callGasLimit === 'bigint' &&
  'maxFeePerGas' in value &&
  typeof value.maxFeePerGas === 'bigint';

const createGasEstimate = ({
  callGasLimit,
  preVerificationGas,
  verificationGasLimit,
  paymasterVerificationGasLimit,
  paymasterPostOpGasLimit,
  maxFeePerGas
}: {
  callGasLimit: bigint;
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  paymasterVerificationGasLimit?: bigint;
  paymasterPostOpGasLimit?: bigint;
  maxFeePerGas: bigint;
}): GasCostEstimate => {
  const candidate: unknown = {
    callGasLimit,
    preVerificationGas,
    verificationGasLimit,
    paymasterVerificationGasLimit,
    paymasterPostOpGasLimit,
    maxFeePerGas
  };
  if (!isGasCostEstimate(candidate)) {
    throw new Error('Invalid gas estimate fixture');
  }
  return candidate;
};

const createSeededRandomBigInt = (seed: number) => {
  let state = seed;
  return (max: number): bigint => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return BigInt(state % max);
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isAsset = (value: unknown): value is Asset => {
  if (!isRecord(value)) {
    return false;
  }

  const { id, symbol, decimals, name, iconUrl, entities } = value;
  return (
    typeof id === 'string' &&
    typeof symbol === 'string' &&
    typeof decimals === 'number' &&
    typeof name === 'string' &&
    typeof iconUrl === 'string' &&
    Array.isArray(entities)
  );
};

const isBalanceResult = (value: unknown): value is BalanceResult => {
  if (!isRecord(value)) {
    return false;
  }

  const { symbol, balance } = value;
  return typeof symbol === 'string' && typeof balance === 'bigint';
};

const isPersistedAccount = (value: unknown): value is PersistedAccount => {
  if (!isRecord(value)) {
    return false;
  }

  return 'id' in value;
};

const createAsset = (symbol: string): Asset => {
  const candidate: unknown = {
    id: `asset:${symbol.toLowerCase()}`,
    symbol,
    decimals: symbol === 'USDC' ? 6 : 18,
    name: symbol,
    iconUrl: `https://example.com/${symbol.toLowerCase()}.png`,
    entities: [
      {
        assetType: {
          chainId: {
            namespace: 'eip155',
            reference: '1'
          }
        }
      }
    ]
  };

  if (!isAsset(candidate)) {
    throw new Error(`Invalid asset fixture for ${symbol}`);
  }

  return candidate;
};

const createBalance = ({
  symbol,
  balance
}: {
  symbol: string;
  balance: bigint;
}): BalanceResult => {
  const candidate: unknown = {
    symbol,
    balance
  };

  if (!isBalanceResult(candidate)) {
    throw new Error(`Invalid balance fixture for ${symbol}`);
  }

  return candidate;
};

const createAccount = (): PersistedAccount => {
  const candidate: unknown = {
    id: 'account-1'
  };

  if (!isPersistedAccount(candidate)) {
    throw new Error('Invalid account fixture');
  }

  return candidate;
};

describe('vault operations', () => {
  it('blocks withdrawal summary when hidden token balances are present', async () => {
    const ethereumAsset = createAsset('ETH');
    const usdCoinAsset = createAsset('USDC');
    const getTransferGasCostEstimate = vi.fn();

    const summary = await loadVaultWithdrawSummary(
      {
        getAccount: async () => ({
          listAssets: async () => [ethereumAsset, usdCoinAsset],
          getBalances: async () => [
            createBalance({ symbol: 'ETH', balance: 1n }),
            createBalance({ symbol: 'USDC', balance: 1_000_000n })
          ],
          getTransferGasCostEstimate
        })
      },
      createAccount(),
      '0x1111111111111111111111111111111111111111'
    );

    expect(summary).toEqual({ status: 'unsupported-assets' });
    expect(getTransferGasCostEstimate).not.toHaveBeenCalled();
  });

  it('fails fast before empty-vault execution when hidden token balances are present', async () => {
    const ethereumAsset = createAsset('ETH');
    const usdCoinAsset = createAsset('USDC');

    await expect(
      assertNoNonInterfaceAssetBalances(
        {
          getAccount: async () => ({
            listAssets: async () => [ethereumAsset, usdCoinAsset],
            getBalances: async () => [
              createBalance({ symbol: 'ETH', balance: 1n }),
              createBalance({ symbol: 'USDC', balance: 1_000_000n })
            ]
          })
        },
        createAccount()
      )
    ).rejects.toBeInstanceOf(NonInterfaceAssetBalanceError);
  });

  describe('computeFeeCost', () => {
    it('prices every gas limit at the live bundler maxFeePerGas', () => {
      const estimate = createGasEstimate({
        callGasLimit: 50_000n,
        preVerificationGas: 40_000n,
        verificationGasLimit: 100_000n,
        paymasterVerificationGasLimit: 7_000n,
        paymasterPostOpGasLimit: 3_000n,
        maxFeePerGas: 2_500_000_000n
      });

      expect(computeFeeCost(estimate)).toBe(200_000n * 2_500_000_000n);
    });

    it('treats absent paymaster limits as zero', () => {
      const estimate = createGasEstimate({
        callGasLimit: 1n,
        preVerificationGas: 2n,
        verificationGasLimit: 3n,
        maxFeePerGas: 10n
      });

      expect(computeFeeCost(estimate)).toBe(60n);
    });

    it('scales linearly with maxFeePerGas for randomized gas limits', () => {
      const randomBigInt = createSeededRandomBigInt(42);
      for (let run = 0; run < 500; run += 1) {
        const limits = {
          callGasLimit: randomBigInt(5_000_000),
          preVerificationGas: randomBigInt(5_000_000),
          verificationGasLimit: randomBigInt(5_000_000),
          paymasterVerificationGasLimit: randomBigInt(1_000_000),
          paymasterPostOpGasLimit: randomBigInt(1_000_000)
        };
        const maxFeePerGas = randomBigInt(2_000_000_000) * 1_000n;
        const units = Object.values(limits).reduce((sum, v) => sum + v, 0n);

        expect(
          computeFeeCost(createGasEstimate({ ...limits, maxFeePerGas }))
        ).toBe(units * maxFeePerGas);
      }
    });
  });

  describe('loadVaultWithdrawSummary fees', () => {
    it('shows the Ethereum fee using the live gas price', async () => {
      const ethereumAsset = createAsset('ETH');
      const accountClient = Object.assign(new EvmAccountClient(), {
        listAssets: async () => [ethereumAsset],
        getBalances: async () => [
          createBalance({ symbol: 'ETH', balance: 10n ** 18n })
        ],
        getTransferGasCostEstimate: async () =>
          createGasEstimate({
            callGasLimit: 100_000n,
            preVerificationGas: 50_000n,
            verificationGasLimit: 50_000n,
            maxFeePerGas: 1_000_000_000n
          })
      });

      const summary = await loadVaultWithdrawSummary(
        { getAccount: async () => accountClient },
        createAccount(),
        '0x1111111111111111111111111111111111111111'
      );

      expect(summary).toMatchObject({
        status: 'ready',
        estimatedFee: `~${(200_000n * 1_000_000_000n).toString()} ETH`,
        recipientAmount: `~${(10n ** 18n - 200_000n * 1_000_000_000n).toString()} ETH`
      });
    });

    it('omits the recipient amount when the fee would consume the balance', async () => {
      const ethereumAsset = createAsset('ETH');
      const accountClient = Object.assign(new EvmAccountClient(), {
        listAssets: async () => [ethereumAsset],
        getBalances: async () => [
          createBalance({ symbol: 'ETH', balance: 1_000n })
        ],
        getTransferGasCostEstimate: async () =>
          createGasEstimate({
            callGasLimit: 100_000n,
            preVerificationGas: 50_000n,
            verificationGasLimit: 50_000n,
            maxFeePerGas: 1_000_000_000n
          })
      });

      const summary = await loadVaultWithdrawSummary(
        { getAccount: async () => accountClient },
        createAccount(),
        '0x1111111111111111111111111111111111111111'
      );

      expect(summary).toMatchObject({ status: 'ready', recipientAmount: null });
    });

    it('blocks review when libqc rejects the Bitcoin destination', async () => {
      const bitcoinAsset = createAsset('BTC');
      const summary = await loadVaultWithdrawSummary(
        {
          getAccount: async () => ({
            listAssets: async () => [bitcoinAsset],
            getBalances: async () => [
              createBalance({ symbol: 'BTC', balance: 501_000n })
            ],
            estimateEmptyVaultFee: async (destination: string) => {
              throw new InvalidDestinationAddressError(destination);
            }
          })
        },
        createAccount(),
        'bc1qmainnetaddressnotallowed'
      );

      expect(summary).toEqual({ status: 'invalid-destination' });
    });

    it('still allows review without a fee when Bitcoin fee lookup fails for other reasons', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const bitcoinAsset = createAsset('BTC');
      const summary = await loadVaultWithdrawSummary(
        {
          getAccount: async () => ({
            listAssets: async () => [bitcoinAsset],
            getBalances: async () => [
              createBalance({ symbol: 'BTC', balance: 501_000n })
            ],
            estimateEmptyVaultFee: async () => {
              throw new Error('Esplora unavailable');
            }
          })
        },
        createAccount(),
        'tb1q07fymc3nhh8vtvmp6suhurh7tpnkm290mtwug8'
      );

      expect(summary).toMatchObject({
        status: 'ready',
        estimatedFee: null,
        recipientAmount: null
      });
      consoleError.mockRestore();
    });
  });

  describe('withdrawal fee guard', () => {
    const bitcoinVault = ({
      balance,
      fee
    }: {
      balance: bigint;
      fee: () => Promise<bigint>;
    }) => {
      const bitcoinAsset = createAsset('BTC');
      return {
        getAccount: async () => ({
          listAssets: async () => [bitcoinAsset],
          getBalances: async () => [createBalance({ symbol: 'BTC', balance })],
          estimateEmptyVaultFee: fee
        })
      };
    };

    const ethereumVault = ({
      balance,
      maxFeePerGas
    }: {
      balance: bigint;
      maxFeePerGas: bigint;
    }) => {
      const ethereumAsset = createAsset('ETH');
      const accountClient = Object.assign(new EvmAccountClient(), {
        listAssets: async () => [ethereumAsset],
        getBalances: async () => [createBalance({ symbol: 'ETH', balance })],
        getTransferGasCostEstimate: async () =>
          createGasEstimate({
            callGasLimit: 100_000n,
            preVerificationGas: 50_000n,
            verificationGasLimit: 50_000n,
            maxFeePerGas
          })
      });
      return { getAccount: async () => accountClient };
    };

    it('allows fees up to half of the native balance', () => {
      expect(
        isWithdrawalFeeWithinLimit({ fee: 500n, nativeBalance: 1_000n })
      ).toBe(true);
      expect(
        isWithdrawalFeeWithinLimit({ fee: 501n, nativeBalance: 1_000n })
      ).toBe(false);
    });

    it('rejects negative fees and empty balances', () => {
      expect(
        isWithdrawalFeeWithinLimit({ fee: -1n, nativeBalance: 1_000n })
      ).toBe(false);
      expect(isWithdrawalFeeWithinLimit({ fee: 0n, nativeBalance: 0n })).toBe(
        false
      );
    });

    it('matches the share rule for randomized fees and balances', () => {
      const randomBigInt = createSeededRandomBigInt(7);
      for (let run = 0; run < 1_000; run += 1) {
        const nativeBalance = randomBigInt(2_000_000_000) + 1n;
        const fee = randomBigInt(2_000_000_000);
        expect(isWithdrawalFeeWithinLimit({ fee, nativeBalance })).toBe(
          2n * fee <= nativeBalance
        );
      }
    });

    it('blocks a Bitcoin sweep when a hostile fee rate would burn the balance', async () => {
      await expect(
        assertWithdrawalFeeWithinLimit(
          bitcoinVault({ balance: 501_000n, fee: async () => 496_000n }),
          createAccount(),
          'tb1q07fymc3nhh8vtvmp6suhurh7tpnkm290mtwug8'
        )
      ).rejects.toBeInstanceOf(WithdrawalFeeTooHighError);
    });

    it('allows a Bitcoin sweep with a normal fee', async () => {
      await expect(
        assertWithdrawalFeeWithinLimit(
          bitcoinVault({ balance: 501_000n, fee: async () => 141n }),
          createAccount(),
          'tb1q07fymc3nhh8vtvmp6suhurh7tpnkm290mtwug8'
        )
      ).resolves.toBeUndefined();
    });

    it('fails closed when the Bitcoin fee cannot be estimated', async () => {
      await expect(
        assertWithdrawalFeeWithinLimit(
          bitcoinVault({
            balance: 501_000n,
            fee: async () => {
              throw new Error('Esplora unavailable');
            }
          }),
          createAccount(),
          'tb1q07fymc3nhh8vtvmp6suhurh7tpnkm290mtwug8'
        )
      ).rejects.toThrow('Esplora unavailable');
    });

    it('blocks an Ethereum sweep when the bundler gas price is inflated', async () => {
      await expect(
        assertWithdrawalFeeWithinLimit(
          ethereumVault({
            balance: 10n ** 16n,
            maxFeePerGas: 10n ** 12n
          }),
          createAccount(),
          '0x1111111111111111111111111111111111111111'
        )
      ).rejects.toBeInstanceOf(WithdrawalFeeTooHighError);
    });

    it('allows an Ethereum sweep at a normal gas price', async () => {
      await expect(
        assertWithdrawalFeeWithinLimit(
          ethereumVault({
            balance: 10n ** 16n,
            maxFeePerGas: 2_000_000_000n
          }),
          createAccount(),
          '0x1111111111111111111111111111111111111111'
        )
      ).resolves.toBeUndefined();
    });

    it('fails closed when the account cannot estimate a fee', async () => {
      const ethereumAsset = createAsset('ETH');
      await expect(
        assertWithdrawalFeeWithinLimit(
          {
            getAccount: async () => ({
              listAssets: async () => [ethereumAsset],
              getBalances: async () => [
                createBalance({ symbol: 'ETH', balance: 1n })
              ]
            })
          },
          createAccount(),
          '0x1111111111111111111111111111111111111111'
        )
      ).rejects.toThrow('Withdrawal fee cannot be estimated');
    });
  });
});
