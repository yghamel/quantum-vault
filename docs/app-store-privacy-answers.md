# App Store privacy answers (proposed — confirm with counsel)

NSPrivacyTracking: **No**

Collected data types: **None** intended for this testnet build (no analytics/ads SDKs).

Accessed API types:

- UserDefaults / preferences (CA92.1) — currency, onboarding, fee-policy acceptance version

Keychain:

- Stores opaque encrypted vault payloads via Capacitor secure storage for wallet function only
- Not for tracking

Proposed nutrition labels: do not claim “financial info” sharing to third parties for this build unless RPC/bundler providers’ terms require disclosure of IP-level network traffic (standard HTTPS to configured endpoints).

**Blocker:** final App Store Connect answers must be reviewed by legal before distribution.
