# Threat model & review boundaries (iOS testnet build)

## In scope for this build

- Capacitor WKWebView UI
- Keychain-backed opaque vault storage
- Session lock / privacy cover
- Bitcoin Testnet + Sepolia configuration
- Holding-fee **math**, disclosure, and gates (collection off)

## Out of scope / blocked

- Mainnet / real-value networks
- Modifying libqc cryptography or `emptyVault`
- Atomic service-fee settlement (awaiting SDK capability)
- Biometric unlock
- Analytics / tracking

## Assumptions

- Device may be lost; recovery phrase is the recovery path
- `VITE_*` values are extractable from the app binary — use low-value testnet credentials only
- Upstream audits of reference repos do **not** cover this modified iOS app

## App Store / legal blockers (non-exhaustive)

- Final privacy nutrition labels must be confirmed with counsel
- Fee disclosure / consumer-finance rules may apply even on testnet demos in some jurisdictions
- Independent security review required before any production or Mainnet discussion
