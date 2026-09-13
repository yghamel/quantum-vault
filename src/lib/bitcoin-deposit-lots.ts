/**
 * Bitcoin UTXO deposit-lot helpers for holding-duration fee quotes.
 *
 * Confirmation time must be chain-derived (prefer median-time-past). Device
 * clock must never be treated as authoritative for accrual.
 */

export type BitcoinUtxoDepositLot = Readonly<{
  txid: string;
  vout: number;
  valueSats: bigint;
  confirmedAtSeconds: bigint;
  confirmations: number;
  policyVersion: string;
}>;

export const filterConfirmedBitcoinLots = (
  lots: ReadonlyArray<BitcoinUtxoDepositLot>
): ReadonlyArray<BitcoinUtxoDepositLot> =>
  lots.filter(lot => lot.confirmations > 0 && lot.valueSats > 0n);

/**
 * Full-vault sweep: every confirmed UTXO is an independent fee lot with
 * principal = gross satoshi value of that UTXO.
 */
export const bitcoinLotsForFullVaultSweep = (
  lots: ReadonlyArray<BitcoinUtxoDepositLot>
): ReadonlyArray<{ principalBaseUnits: bigint; confirmedAtSeconds: bigint }> =>
  filterConfirmedBitcoinLots(lots).map(lot => ({
    principalBaseUnits: lot.valueSats,
    confirmedAtSeconds: lot.confirmedAtSeconds
  }));
