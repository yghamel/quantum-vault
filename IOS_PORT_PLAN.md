# iOS Capacitor Port Plan (updated)

**Source:** [p-11/quantum-vault@v1.0.1](https://github.com/p-11/quantum-vault/releases/tag/v1.0.1) (`94843b6`)  
**Fork:** [yghamel/quantum-vault](https://github.com/yghamel/quantum-vault)  
**Branch:** `ios-capacitor-port`  
**Pinned SDK:** `@project-eleven/libqc@1.0.0` (published pin only; no fork/link/workspace)  
**Package manager:** pnpm only  

## Goal (current)

Development-quality, non-custodial iOS wallet for **exactly**:

1. Bitcoin Testnet (`bip122:000000000933ea01ad0ee984209779ba`, `testnet: true`, `tb1…` addresses)
2. Ethereum Sepolia (`eip155:11155111`, `testnet: true`, labels **Ethereum Sepolia** / **Sepolia ETH**)

Mainnet Bitcoin, Ethereum mainnet (`eip155:1`), Base, and all other real-value networks are **forbidden** in runtime configuration.

**No developer service fee.** Withdrawals pay only the network fee: the Bitcoin miner fee or the Ethereum gas fee.

**Non-custodial wording:** use “held in vault” / “time held in vault”. Never claim trust, custody, or guaranteed unspendability.

**Licence:** preserve MIT + upstream attribution. Upstream repos were audited as *reference implementations*; this modified iOS app needs its own security and legal review. Do not claim this app is audited or safe for real funds.

**Removed / obsolete:** any MNTD firmware URL, RAK, Helium, or unrelated hardware references from earlier drafts. They are not part of this product.

---

## 1. Chrome-extension → Capacitor inventory

| Area | Status |
| --- | --- |
| `@crxjs/vite-plugin` | Removed from iOS build path |
| `manifest.json` as entry | Not shipped in `dist/` |
| Popup 360×600 shell | Replaced with full-viewport + safe areas |
| `chrome.runtime.getManifest` | Replaced with build metadata / Capacitor platform |
| `WebStorage` / `localStorage` for `vault_*` | Replaced with Keychain-backed `CapacitorLibQCStorage` |
| Idle 10-minute lock | Preserved |
| Background lock | Capacitor `appStateChange` → `clearWalletState` → `vault.lock()` |
| Privacy cover | Required for app-switcher snapshots |
| Clipboard | Never copy passwords / recovery phrases / private keys |

---

## 2. localStorage / storage map

| Key / prefix | Sensitivity | Backend |
| --- | --- | --- |
| `vault_*` (via `LibQCStorage`) | Critical (opaque ciphertext from libqc) | iOS Keychain only on native; in-memory for unit/web preview — **never** silent `localStorage` fallback on iOS |
| `quantum-vault-currency` | Low | Preferences / WKWebView `localStorage` OK |
| `quantum-vault-onboarding-seen` | Low | Same |
| `quantum-vault-native-install-marker` | Low | Same; marks that this install has reconciled the Keychain |

Keychain intent: device-only, non-syncing, unlocked-device access (`WhenUnlockedThisDeviceOnly` equivalent). Reinstall may retain Keychain items on iOS — wallet deletion must clear `vault_*`; recovery phrase remains the recovery path.

Fresh install: WKWebView `localStorage` is removed with the app but Keychain items are not. On native boot, if neither the install marker nor the onboarding flag exists, orphaned `vault_*` items are cleared before hydration so a reinstall starts at onboarding / Create or Recover (`src/lib/native-vault-install-reconcile.ts`).

---

## 3. Lifecycle lock + privacy

Authoritative path: `clearWalletState()` → `vault.lock()` → navigate `lock` when a password exists, otherwise onboarding / initial (`resolveScreenAfterSessionEnd`).

| Event | Action |
| --- | --- |
| App inactive / background | Immediate lock |
| Foreground after lock | Password required (no auto-unlock, no biometrics in v1) |
| 10 min foreground idle | Existing session timeout |
| App-switcher snapshot | Privacy cover hides balances/addresses/recovery/tx details |
| Cold launch / unexpected WebView reload | Hydration routes a locked vault to the start screen: Log In (password), Create (replaces the vault after confirmation), or Recover |

No competing lock paths. No secret material in lock logs.

---

## 4. Network configuration

### Bitcoin Testnet

- CAIP ref = libqc `BITCOIN_TESTNET_REF` = `000000000933ea01ad0ee984209779ba`
- `testnet: true`
- API: `VITE_BITCOIN_API_URL` (testnet-compatible only)
- Fail closed if missing/invalid
- No Mainnet chain, no Mainnet toggle, no hidden Mainnet fallback

### Ethereum Sepolia

- `eip155:11155111`, `testnet: true`
- Display names: Ethereum Sepolia / Sepolia ETH
- RPC: `VITE_ETHEREUM_RPC_URL` (Sepolia HTTPS)
- Bundler: `VITE_ETHEREUM_BUNDLER_RPC_URL` + optional key
- Fail closed if Sepolia boot config missing when ETH path enabled
- No Mainnet / Base / other EVM networks

### libqc 1.0.0 Sepolia feasibility

LibQC accepts arbitrary `ChainSpecification` + `BundlerConfigProvider`. Kernel userops are chain-agnostic at the API layer. End-to-end Sepolia still requires: Sepolia RPC, ERC-4337 bundler that supports the Kernel account version libqc uses, factory deployment support on Sepolia, and ETH for gas (paymaster optional). Gaps are **infrastructure**, not a pin change.

---

## 5. Security freeze

Do not modify: mnemonic generation/validation, BIP-85, key derivation, passwords, private keys, encryption, address generation, signing, exposure detection, recovery semantics, `emptyVault` cryptography. Never log secrets. No analytics/tracking SDKs.

---

## 6. Capacitor / Xcode

- Capacitor **7.4.4** (pinned; matches Node 24 + existing port; Xcode 26.3)
- `webDir: dist`, appId `com.projecteleven.quantumvault` (provisional until distribution)
- Privacy manifest required; no remote script execution
- Simulator Debug build after `pnpm build:prod && pnpm exec cap sync ios`

---

## 7. Verification checklist

- [x] libqc remains `1.0.0`
- [x] Runtime chains: BTC testnet + Sepolia only
- [x] No developer service fee; withdrawals show only miner / gas fees
- [x] Background lock + privacy cover
- [x] Keychain vault storage (no localStorage fallback on native)
- [x] Simulator compile under Xcode 26.3 (`BUILD SUCCEEDED`, iPhone 17 / iOS 26.3.1)
