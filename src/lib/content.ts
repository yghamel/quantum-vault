export const toastMessages = {
  unexpectedError: 'An unexpected error occurred, please try again',
  vaultQueryVaultStateFailed:
    'Vault access failed. Unlock your wallet and try again. If this keeps happening, restore from your recovery phrase.',
  vaultQueryConfigInvalid:
    'Wallet configuration is missing or invalid. Reload the extension and try again.',
  vaultQueryRateLimited:
    'Too many requests right now. Returning to home; reopen the vault in a moment.',
  vaultQueryRpcUnavailable:
    'Blockchain service is temporarily unavailable. Returning to home.',
  vaultQueryNetworkUnavailable:
    'Cannot reach the network. Check your internet connection, then reopen the vault from home.',
  invalidAddress: 'Invalid address. Please re-enter the address and try again.',
  insufficientFunds: 'Insufficient funds.',
  copiedToClipboard: 'Copied to clipboard.',
  invalidSecretPhrase:
    'Invalid secret phrase. Please ensure you entered all 24 words correctly.',
  unknownRecoveryWords: (positions: readonly number[]) =>
    positions.length === 1
      ? `Word ${positions[0]} isn't a recovery word. Check its spelling.`
      : `Words ${positions.join(', ')} aren't recovery words. Check their spelling.`,
  recoveryPhraseChecksumMismatch:
    "All 24 words are valid, but they don't form your phrase. Check the order and that no word was swapped for a similar one.",
  transactionSent: 'Transaction sent.',
  invalidPassword: 'Invalid password.',
  passwordMismatch: 'Passwords do not match.',
  passwordUpdated: 'Your password has been updated.',
  walletReset: 'Wallet reset. Create or recover a vault to continue.',
  invalidContractAddress: 'Please enter a valid contract address.',
  unsupportedAsset: 'Unsupported asset.',
  unsupportedContractType: 'Unsupported contract type.',
  balanceProviderUnavailable:
    'Unable to refresh balances. Retrying in the background.',
  balanceProviderRecovered: 'Balance connection restored.',
  balanceRefreshSuccess: 'Balances refreshed.',
  balanceRefreshFailed: 'Unable to refresh balances. Try again in a moment.',
  balanceRefreshInProgress: 'Balance refresh already in progress.',
  walletSyncSuccess: 'Wallet synced successfully.',
  walletSyncFailed: 'Failed to sync wallet.',
  walletCreationFailed: 'Wallet creation failed. Please try again.',
  withdrawalDetectedAsFailed: 'Withdrawal failed. Review activity and retry.',
  domainNameRegistered: 'Domain name registered.',
  domainNameRecordExists: 'Domain name record already exists.',
  invalidSecretPhraseConfirmation: "That doesn't look right. Please try again.",
  atlasDomainNameAlreadyRegistered: 'Domain name already registered.',
  atlasInvalidPayment: 'Invalid payment.',
  atlasInvalidPreClaim: 'Invalid pre-claim.',
  atlasPreClaimAlreadyExists: 'Pre-claim already exists.',
  atlasUnsupportedChain: 'Unsupported chain.',
  atlasInsufficientFunds: 'Insufficient funds.',
  atlasRecordNotFound: 'Domain name record not found.',
  atlasMismatchedChain: 'This domain cannot receive funds from this network.'
};

export const appName = 'Quantum Vault Wallet';

export const appLicenceLine =
  'Includes open-source software under the MIT License.';

/** Owner-approved wording; keep it word for word. */
export const quantumVaultAbout = {
  title: appName,
  paragraphs: [
    'Bitcoin and Ethereum use signatures that a large enough quantum computer could break. No such computer exists today, and nobody knows when one will.',
    'A quantum attack needs your public key. An address only reveals its public key once it sends a transaction.',
    'Quantum Vault Wallet keeps your coins in vault addresses that have never sent a transaction, so their public keys stay hidden. This reduces your exposure; it does not make your coins quantum-proof.',
    'When you withdraw, the vault sends its full balance in one transaction. That reveals its public key, so the vault is burned and must never be used again. Withdrawn coins are only as protected as the address you send them to.',
    'This version runs on Bitcoin Testnet4 and Ethereum Sepolia only. Testnet coins have no monetary value.',
    'Quantum Vault Wallet charges no fees. Blockchain networks charge their own network fee when you withdraw.'
  ]
} as const;
