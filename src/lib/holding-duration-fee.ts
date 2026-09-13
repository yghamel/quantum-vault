/**
 * Holding-duration service-fee math (testnet policy).
 *
 * Exact integer arithmetic only — never floating point for cryptocurrency.
 * Callers supply chain-derived timestamps (seconds), not device clock as authority.
 */

export const SECONDS_PER_YEAR = 31_536_000n;
export const TESTNET_ANNUAL_FEE_BPS = 200n;
export const TESTNET_MAX_LIFETIME_FEE_BPS = 1_000n;
export const BPS_DENOMINATOR = 10_000n;

export type DepositLotForFee = Readonly<{
  /** Principal in base units (sats or wei) attributable to this lot */
  principalBaseUnits: bigint;
  /** Unix seconds of confirmed deposit (chain-derived) */
  confirmedAtSeconds: bigint;
}>;

export type HoldingFeeCalculationInput = Readonly<{
  lots: ReadonlyArray<DepositLotForFee>;
  /** Unix seconds from chain tip / median-time-past (chain-derived) */
  calculationTimeSeconds: bigint;
  annualFeeBps?: bigint;
  maxLifetimeFeeBps?: bigint;
}>;

export type LotFeeBreakdown = Readonly<{
  principalBaseUnits: bigint;
  confirmedAtSeconds: bigint;
  eligibleHoldingSeconds: bigint;
  uncappedFeeBaseUnits: bigint;
  maximumFeeBaseUnits: bigint;
  finalServiceFeeBaseUnits: bigint;
}>;

export type HoldingFeeCalculationResult = Readonly<{
  lots: ReadonlyArray<LotFeeBreakdown>;
  totalPrincipalBaseUnits: bigint;
  totalServiceFeeBaseUnits: bigint;
}>;

export const computeEligibleHoldingSeconds = ({
  confirmedAtSeconds,
  calculationTimeSeconds
}: {
  confirmedAtSeconds: bigint;
  calculationTimeSeconds: bigint;
}): bigint => {
  if (calculationTimeSeconds <= confirmedAtSeconds) {
    return 0n;
  }
  return calculationTimeSeconds - confirmedAtSeconds;
};

export const computeUncappedFeeBaseUnits = ({
  principalBaseUnits,
  eligibleHoldingSeconds,
  annualFeeBps = TESTNET_ANNUAL_FEE_BPS
}: {
  principalBaseUnits: bigint;
  eligibleHoldingSeconds: bigint;
  annualFeeBps?: bigint;
}): bigint => {
  if (principalBaseUnits <= 0n || eligibleHoldingSeconds <= 0n) {
    return 0n;
  }
  return (
    (principalBaseUnits * annualFeeBps * eligibleHoldingSeconds) /
    BPS_DENOMINATOR /
    SECONDS_PER_YEAR
  );
};

export const computeMaximumFeeBaseUnits = ({
  principalBaseUnits,
  maxLifetimeFeeBps = TESTNET_MAX_LIFETIME_FEE_BPS
}: {
  principalBaseUnits: bigint;
  maxLifetimeFeeBps?: bigint;
}): bigint => {
  if (principalBaseUnits <= 0n) {
    return 0n;
  }
  return (principalBaseUnits * maxLifetimeFeeBps) / BPS_DENOMINATOR;
};

export const computeLotServiceFeeBaseUnits = ({
  principalBaseUnits,
  confirmedAtSeconds,
  calculationTimeSeconds,
  annualFeeBps = TESTNET_ANNUAL_FEE_BPS,
  maxLifetimeFeeBps = TESTNET_MAX_LIFETIME_FEE_BPS
}: {
  principalBaseUnits: bigint;
  confirmedAtSeconds: bigint;
  calculationTimeSeconds: bigint;
  annualFeeBps?: bigint;
  maxLifetimeFeeBps?: bigint;
}): LotFeeBreakdown => {
  const eligibleHoldingSeconds = computeEligibleHoldingSeconds({
    confirmedAtSeconds,
    calculationTimeSeconds
  });
  const uncappedFeeBaseUnits = computeUncappedFeeBaseUnits({
    principalBaseUnits,
    eligibleHoldingSeconds,
    annualFeeBps
  });
  const maximumFeeBaseUnits = computeMaximumFeeBaseUnits({
    principalBaseUnits,
    maxLifetimeFeeBps
  });
  const finalServiceFeeBaseUnits =
    uncappedFeeBaseUnits < maximumFeeBaseUnits
      ? uncappedFeeBaseUnits
      : maximumFeeBaseUnits;

  return {
    principalBaseUnits,
    confirmedAtSeconds,
    eligibleHoldingSeconds,
    uncappedFeeBaseUnits,
    maximumFeeBaseUnits,
    finalServiceFeeBaseUnits
  };
};

/**
 * Sums per-lot fees for a withdrawal. Lots with zero principal are skipped.
 * Unconfirmed lots must not be passed (confirmedAtSeconds required).
 */
export const calculateHoldingDurationServiceFee = ({
  lots,
  calculationTimeSeconds,
  annualFeeBps = TESTNET_ANNUAL_FEE_BPS,
  maxLifetimeFeeBps = TESTNET_MAX_LIFETIME_FEE_BPS
}: HoldingFeeCalculationInput): HoldingFeeCalculationResult => {
  const breakdowns: LotFeeBreakdown[] = [];
  let totalPrincipalBaseUnits = 0n;
  let totalServiceFeeBaseUnits = 0n;

  for (const lot of lots) {
    if (lot.principalBaseUnits <= 0n) {
      continue;
    }
    const breakdown = computeLotServiceFeeBaseUnits({
      principalBaseUnits: lot.principalBaseUnits,
      confirmedAtSeconds: lot.confirmedAtSeconds,
      calculationTimeSeconds,
      annualFeeBps,
      maxLifetimeFeeBps
    });
    breakdowns.push(breakdown);
    totalPrincipalBaseUnits += breakdown.principalBaseUnits;
    totalServiceFeeBaseUnits += breakdown.finalServiceFeeBaseUnits;
  }

  return {
    lots: breakdowns,
    totalPrincipalBaseUnits,
    totalServiceFeeBaseUnits
  };
};

/** Bitcoin dust threshold heuristic for P2WPKH outputs (sats). */
export const BITCOIN_P2WPKH_DUST_SATS = 294n;

/**
 * Waive developer fee when treasury output would be below dust.
 * Returns waived fee (0n) and a flag when original fee was positive but dust.
 */
export const applyBitcoinDustFeeWaiver = ({
  serviceFeeSats,
  dustThresholdSats = BITCOIN_P2WPKH_DUST_SATS
}: {
  serviceFeeSats: bigint;
  dustThresholdSats?: bigint;
}): { feeSats: bigint; waivedForDust: boolean } => {
  if (serviceFeeSats > 0n && serviceFeeSats < dustThresholdSats) {
    return { feeSats: 0n, waivedForDust: true };
  }
  return { feeSats: serviceFeeSats, waivedForDust: false };
};
