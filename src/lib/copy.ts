/**
 * Centralized UI copy strings for Home + Vault Detail + Withdraw + Deposit
 * surfaces. `toastMessages` stays in `./content.ts` as the established
 * central bundle for toast-only text; this file carries screen chrome copy
 * so renderers never inline user-visible strings.
 *
 * Groups mirror the Figma frame taxonomy under section 31:1152.
 */

import type { WithdrawDisabledMessageByNamespace } from '@/modules/vaults/detail/core';

export const homeCopy = {
  title: 'Quantum Vault',
  totalBalanceLabel: 'TOTAL BALANCE',
  depositAction: 'Deposit',
  withdrawAction: 'Withdraw',
  refreshBalancesAria: 'Refresh balances',
  settingsAria: 'Settings',
  backAria: 'Lock wallet and go back to start',
  alertSingular: '1 Vault Vulnerable',
  alertPlural: (count: number) => `${count} Vaults Vulnerable`,
  atRiskSuffix: 'at risk',
  syncStateSyncingTitle: 'Withdrawal syncing',
  syncStateSyncingBody:
    'Withdrawal sent. Balances and vault sections are updating.',
  syncStateTimeoutTitle: 'Sync delayed',
  syncStateTimeoutBody:
    'Withdrawal was sent, but data refresh is taking longer than expected.',
  syncStateFailedTitle: 'Withdrawal failed',
  syncStateFailedBody:
    'Withdrawal failed after submission. Review activity and retry if needed.',
  syncStateDismissAria: 'Dismiss withdrawal sync notice',
  vaultSnapshotsError: 'Unable to load vault balances.'
};

export const vaultCardCopy = {
  tokenSingular: '1 Token',
  tokenPlural: (count: number) => `${count} Tokens`,
  burnedTag: 'BURNED',
  unavailable: '--'
};

export const vaultDetailCopy = {
  safeBadge: 'SAFE',
  vulnerableBadge: 'VULNERABLE',
  withdrawnBadge: 'BURNED',
  totalBalanceLabel: 'TOTAL BALANCE',
  tabFunds: 'Funds',
  tabActivity: 'Activity',
  withdrawAction: 'Withdraw',
  withdrawToSafeAction: 'Withdraw',
  depositAction: 'Deposit',
  activityEmpty: 'No activity',
  activityDirectionReceived: 'Received',
  activityDirectionSent: 'Sent',
  activityDirectionWithdrawAll: 'Withdraw ALL',
  activityCounterpartyFrom: 'from',
  activityCounterpartyTo: 'to',
  activityAllFunds: 'All Funds',
  copyAddressAria: 'Copy address',
  refreshBalancesAria: 'Refresh balances',
  backAria: 'Back',
  dataError: 'Unable to load vault details.'
};

export const vaultDetailInsufficientWithdrawCopyByNamespace = {
  eip155:
    'Insufficient balance to withdraw - remaining funds are below the estimated gas cost.',
  bip122:
    'Insufficient balance to withdraw - remaining funds are below the estimated transaction fee.'
} as const satisfies WithdrawDisabledMessageByNamespace;

export const vaultDetailUnsupportedAssetWithdrawCopy =
  'Unsupported token balances cannot be withdrawn in this version.';

export const vaultAlertCopy = {
  safeTitle: 'Quantum protected',
  safeBody:
    'This vault has never sent a transaction, so its public key is hidden. It stays protected until you withdraw.',
  vulnerableTitle: 'Vulnerable',
  vulnerableBody:
    'This vault is vulnerable. Withdraw funds to a quantum safe vault.',
  pendingTitle: 'Transaction pending',
  pendingBody:
    'This vault address is being burned. Do not send new funds to it.',
  withdrawnBody:
    'This vault address is burned and no longer quantum protected. Never send funds to it again.',
  pendingConfirmationBody: (chainName: string) =>
    `Waiting for ${chainName} network confirmation`,
  undoAction: 'Undo'
};

export const vaultSuccessCopy = {
  title: 'Successfully Withdrawn',
  body: (sourceLabel: string, destinationLabel: string) =>
    `All funds from ${sourceLabel} have been withdrawn to ${destinationLabel}`,
  burnedNote:
    'This vault address is now burned and no longer quantum protected. Never send funds to it again.',
  viewTxAction: 'View Withdrawal Tx'
};

export const withdrawFlowCopy = {
  warningTitle: 'Warning',
  warningBody:
    'Once withdrawn, your funds are no longer quantum protected and this vault address is burned. Never send funds to it again.\n\nThe full balance goes to a single address so nothing is left behind unprotected.',
  burnNoticeTitle: 'This vault address will be burned',
  burnNoticeBody:
    'Once withdrawn, these funds are no longer quantum protected. Never send funds to this vault address again.',
  continueAction: 'CONTINUE',
  backAction: 'CANCEL',
  suggestionBody: (vaultLabel: string) =>
    `${vaultLabel} is SAFE. Would you like to move assets directly there?`,
  suggestionYes: 'YES',
  suggestionNo: 'NO, WITHDRAW TO EXTERNAL WALLET',
  fullBalanceWithdrawHelper:
    'Your full balance is sent and this vault address is burned, because coins left behind would no longer be quantum protected. To send only part, withdraw to a wallet you control, send what you need, then deposit the rest into a safe vault.',
  safeDestinationLookupError:
    'Unable to find a safe vault automatically. Enter an address to continue.',
  addAddressTitle: 'Withdraw Vault',
  addAddressFieldLabel: (chainName: string) =>
    `Enter your ${chainName} withdrawal address:`,
  addAddressPlaceholder: '0x...',
  reviewTitle: 'You will send',
  reviewToLegend: 'TO',
  reviewBitcoinMinerFeeLabel: 'Bitcoin miner fee',
  reviewEthereumGasFeeLabel: 'Ethereum gas fee',
  reviewTestnetWarning: 'Testnet coins have no monetary value.',
  reviewAddressLabel: (chainName: string) => `${chainName} Address`,
  cancelAction: 'CANCEL',
  confirmAction: 'CONFIRM',
  confirmWithdrawalAction: 'CONFIRM WITHDRAWAL'
};

export const depositFlowCopy = {
  selectNetworkTitle: 'Deposit',
  selectNetworkSubtitle: 'Select receiving network',
  loadingSafeVaults: 'Loading safe vaults...',
  safeVaultsError: 'Unable to load safe vaults.',
  noSafeVaults: 'No safe vaults are available for deposit.',
  selectNetworkWarning:
    'Sending assets on the wrong network will result in permanent loss. Verify the network before sending.',
  warningSubtitle: (chainSymbol: string, tokenFamily: string) =>
    chainSymbol === tokenFamily
      ? `Only send ${chainSymbol} to this address`
      : `Only send ${chainSymbol} / ${tokenFamily} to this address`,
  protectionNote:
    'Coins are quantum protected as soon as they arrive and stay protected until you withdraw.',
  vaultAddressLabel: 'Vault Address',
  copyAddressAria: 'Copy address',
  copyAddressAction: 'Copy Address'
};

/**
 * Derived helpers kept alongside copy so the mapping stays in one place.
 */
export const getAlertTitle = (vulnerableCount: number) =>
  vulnerableCount === 1
    ? homeCopy.alertSingular
    : homeCopy.alertPlural(vulnerableCount);

export const getHomeAlertLine = ({
  vaultLabel,
  amount
}: {
  vaultLabel: string;
  amount: string;
}) => `${vaultLabel} - ${amount} ${homeCopy.atRiskSuffix}`;

export const getTokenCountLabel = (count: number) =>
  count === 1 ? vaultCardCopy.tokenSingular : vaultCardCopy.tokenPlural(count);

/** Zero-padded vault index for labels (ENG-1818). */
export const formatVaultNumberForDisplay = (vaultNumber: number): string =>
  vaultNumber.toString().padStart(2, '0');

export const getVaultName = ({
  chainName,
  vaultNumber
}: {
  chainName: string;
  vaultNumber: number;
}) => `${chainName} Vault #${formatVaultNumberForDisplay(vaultNumber)}`;
