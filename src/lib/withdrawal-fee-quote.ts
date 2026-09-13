import { DEFAULT_QUOTE_VALIDITY_MS } from '@/lib/holding-fee-policy';

export type WithdrawalFeeQuote = Readonly<{
  quoteId: string;
  networkId: 'bitcoin-testnet' | 'ethereum-sepolia';
  createdAtMs: number;
  expiresAtMs: number;
  /** Chain-derived calculation time (unix seconds). */
  calculationTimeSeconds: bigint;
  recipientAddress: string;
  recipientAmountBaseUnits: bigint;
  /** Bitcoin miner fee or Ethereum gas (base units / wei as documented by caller). */
  networkFeeBaseUnits: bigint;
  networkFeeLabel: 'Bitcoin miner fee' | 'Ethereum gas fee';
  serviceFeeBaseUnits: bigint;
  serviceFeeWaivedForDust: boolean;
  annualFeeBps: number;
  maxLifetimeFeeBps: number;
  totalDeductedBaseUnits: bigint;
  collectionEnabled: boolean;
}>;

export const createWithdrawalFeeQuote = (
  input: Omit<WithdrawalFeeQuote, 'expiresAtMs' | 'totalDeductedBaseUnits'> & {
    quoteValidityMs?: number;
  }
): WithdrawalFeeQuote => {
  const quoteValidityMs = input.quoteValidityMs ?? DEFAULT_QUOTE_VALIDITY_MS;
  return {
    ...input,
    expiresAtMs: input.createdAtMs + quoteValidityMs,
    totalDeductedBaseUnits:
      input.recipientAmountBaseUnits +
      input.networkFeeBaseUnits +
      input.serviceFeeBaseUnits
  };
};

export const isWithdrawalFeeQuoteExpired = ({
  quote,
  nowMs
}: {
  quote: WithdrawalFeeQuote;
  nowMs: number;
}): boolean => nowMs >= quote.expiresAtMs;

/**
 * Signing must refuse expired quotes. Collection remains gated separately.
 */
export const assertQuoteSignable = ({
  quote,
  nowMs
}: {
  quote: WithdrawalFeeQuote;
  nowMs: number;
}): void => {
  if (isWithdrawalFeeQuoteExpired({ quote, nowMs })) {
    throw new Error('Withdrawal quote expired; request a fresh quote');
  }
};
