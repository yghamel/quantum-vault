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

export const appCreditLine =
  'Designed by Lucid Intel Limited, in part an MIT project, Eleven Labs';

/** Owner-supplied wording; keep it word for word. */
export const quantumVaultAbout = {
  title: 'Quantum Vault',
  paragraphs: [
    'Quantum computers are not far away, estimates put them at becoming real by 2030. Both Bitcoin and Ethereum and most coins are not resistant to an attack by a quantum computer, at least not yet; they can be hacked and all the coins stolen by a quantum computer that is why researchers are working diligently night and day to fix the problem but because Bitcoin and Ethereum are decentralized, it could take a long time for quantum resistance to be implemented, way after the first quantum computer.',
    'What do you do in the meantime to protect your assets?',
    'Quantum Vault is built on Eleven Labs, an MIT app.',
    'Quantum Vault protects your Bitcoin and Ethereum by placing them behind a quantum-resistant lock.',
    'As long as your Bitcoin and Ethereum remain inside Quantum Vault, they are protected from potential quantum-computer attacks. You can deposit as much as you want, and it will remain protected.',
    'When you withdraw, the quantum lock is opened and can be hacked by a quantum computer unless the Bitcoin or Ethereum is transferred to another quantum resistant wallet or unless both blockchains have been updated to quantum resistant specifications.',
    'Keep in mind, as designed, when you withdraw your Bitcoin or Ethereum your protected wallet is burned and cannot be reused again.',
    'Keep your Bitcoin and Ethereum protected by keeping them inside Quantum Vault.'
  ]
} as const;
