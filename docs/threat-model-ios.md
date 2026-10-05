# Threat model & review boundaries (iOS testnet build)

## In scope for this build

- Capacitor WKWebView UI
- Keychain-backed opaque vault storage
- Session lock / privacy cover
- Bitcoin Testnet + Sepolia configuration

## Out of scope / blocked

- Mainnet / real-value networks
- Modifying libqc cryptography or `emptyVault`
- Biometric unlock
- Analytics / tracking

## Assumptions

- Device may be lost; recovery phrase is the recovery path
- `VITE_*` values are extractable from the app binary — use low-value testnet credentials only
- Upstream audits of reference repos do **not** cover this modified iOS app

## App Store / legal blockers (non-exhaustive)

- Final privacy nutrition labels must be confirmed with counsel
- Independent security review required before any production or Mainnet discussion
