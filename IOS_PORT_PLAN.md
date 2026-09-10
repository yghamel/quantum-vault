# iOS Capacitor Port Plan (from quantum-vault v1.0.1)

**Source:** [p-11/quantum-vault@v1.0.1](https://github.com/p-11/quantum-vault/releases/tag/v1.0.1) (`94843b6`)  
**Fork:** [yghamel/quantum-vault](https://github.com/yghamel/quantum-vault)  
**Branch:** `ios-capacitor-port`  
**Constraint:** Preserve pinned `@project-eleven/libqc@1.0.0`. Do **not** modify libqc, mnemonic generation, key derivation, encryption, Bitcoin address generation, transaction signing, exposure detection, or `emptyVault`. Use **pnpm only**. First build: **Bitcoin testnet only** (no mainnet). Never log passwords, mnemonics, keys, or encrypted wallet contents.

**External artifact noted (not fetched):** `https://firmware.getmntd.com/MNTD_2023_04_18_0.zip` — Cloudflare-challenged (HTTP 403) at plan time; not part of the Chrome extension tree. Treat as out-of-band hardware/firmware material unless product confirms otherwise. Do not embed firmware blobs into the app binary without an explicit follow-up.

---

## 1. Chrome-extension dependencies (inventory)

These are the extension-specific surfaces that must be removed, replaced, or adapted for Capacitor/iOS.

### 1.1 Build / packaging

| Dependency / artifact | Location | iOS action |
| --- | --- | --- |
| `@crxjs/vite-plugin` | `package.json`, `vite.config.ts` | Remove. Replace HMR/extension plugin path with a plain Vite web build consumed by Capacitor (`webDir`). |
| `manifest.json` (MV3) | repo root | Stop shipping as app entry. Keep temporarily only if needed for reference; Capacitor uses `capacitor.config.*` + native `Info.plist`. |
| `viteStaticCopy` of `manifest.json` + `icons/*` | `vite.config.ts` | Drop manifest copy. Icons move to iOS asset catalogs / Capacitor assets. |
| Build scripts `build:extension:*`, `build:package*` | `package.json` | Replace with `build` → `dist/` + `cap sync ios`. |
| Prod target `chrome110` | `vite.config.ts` | Switch to modern mobile Safari / WKWebView target (or leave default). |
| `runtimeVariant: 'extension' \| 'hmr'` | `src/lib/build-metadata.ts`, `vite.config.ts` | Add `'capacitor'` (or `'ios'`) variant for diagnostics. |
| `scripts/validate-prod.mjs` CSP/manifest checks | `scripts/` | Replace with Capacitor/iOS validation (bundle present, no extension CSP assumptions). |
| Playwright loads Vite preview as “extension substitute” | `playwright.config.ts` | Later: Capacitor/WebView or keep web preview for non-native UI; do not block first iOS build. |
| CI chrome-extension zip / host permissions docs | `README.md`, `.github/*`, `docs/*` | Update docs after first green iOS build; out of scope for crypto changes. |

### 1.2 Runtime Chrome APIs (app code)

| API / assumption | Location | iOS action |
| --- | --- | --- |
| `chrome.runtime.getManifest()` version | `src/lib/runtime-diagnostics.ts` | Replace with Capacitor `App.getInfo()` / package version from build metadata. |
| Manifest `host_permissions` (RPC/bundler/keys/assets) | `manifest.json` | Equivalent: iOS App Transport / ATS allows HTTPS; Capacitor does not use Chrome host permissions. Ensure WKWebView can reach configured RPC origins. |
| Extension CSP `script-src 'self'` | `manifest.json` | Capacitor serves local assets; maintain no remote script injection. Avoid loosening CSP via arbitrary remote JS. |
| Popup lifecycle (ephemeral close clears RAM) | `AGENTS.md`, architecture rules | **Critical behavioral change:** iOS apps stay resident. Must add explicit lifecycle locking (Section 3). |
| Fixed popup shell `360×600` / `--popup-width/height` | `index.html`, `src/App.tsx`, `src/index.css` | Replace with responsive full-screen layout for iPhone/iPad safe areas. |
| Chrome popup chrome comments / boot shell sizing | `index.html` | Adapt boot shell to full viewport; keep dark boot paint. |
| Unpacked extension load instructions | `README.md` | Replace with Xcode / Capacitor run instructions. |

### 1.3 Not Chrome APIs but extension-shaped UX

| Item | Location | iOS action |
| --- | --- | --- |
| `window.open(..., '_blank')` for explorers | `src/modules/vaults/detail/panels.tsx` | Use Capacitor `Browser` plugin or `App.openUrl`. |
| `navigator.clipboard.writeText` | receive/account/export flows, `use-copy-to-clipboard.ts` | Prefer `@capacitor/clipboard` for reliability in WKWebView. |
| DOM event idle tracking (`mousedown`/`keydown`/`touchstart`/`scroll`) | `src/hooks/use-session-timeout.ts` | Keep for in-app idle; **add** Capacitor `App` state listeners (Section 3). |
| `document.getElementById('boot-shell')` | `screen-provider.tsx`, `boot-error-screen.tsx` | Keep if boot shell remains in `index.html`. |

### 1.4 Indirect / docs-only Chrome references

- `.claude/skills/check-libqc/SKILL.md` mentions `chrome.storage.local` historically; **this app does not call `chrome.storage`**. Persistence is `LibQC` + `WebStorage` → `localStorage` (Section 2).
- `src/modules/vaults/detail/chrome.tsx` is UI chrome naming, not the browser API.
- E2E helpers clear `localStorage`/`sessionStorage` as the extension storage stand-in.

---

## 2. Every `localStorage` usage

### 2.1 Application preferences (direct `localStorage`)

| Key | File | Read/Write | Sensitivity | iOS plan |
| --- | --- | --- | --- | --- |
| `quantum-vault-currency` | `src/lib/currency.ts` | `getItem` / `setItem` | Low (fiat preference) | Prefer Capacitor Preferences **or** keep `localStorage` in WKWebView (acceptable for non-secrets). |
| `quantum-vault-onboarding-seen` | `src/lib/onboarding.ts` | `getItem` / `setItem` | Low (UX flag) | Same as currency. |

### 2.2 Encrypted vault persistence (via libqc `WebStorage`)

| Mechanism | File | Behavior | Sensitivity | iOS plan |
| --- | --- | --- | --- | --- |
| `new WebStorage()` → `LibQCStorage` | `src/providers/wallet-provider.tsx` | Default prefix `vault_`; `get`/`put`/`delete`/`has`/`clear` serialize JSON through **`localStorage`** | **Critical** — stores encrypted vault blobs and related durable state (encryption performed inside libqc state layer; storage is ciphertext + metadata) | **Replace** with an app-owned `LibQCStorage` implementation backed by iOS Keychain / Secure Storage (Section 4). Do not change libqc. |
| Keys matching `vault_*` (e.g. tests reference `vault_state.entropy`) | `__tests__/e2e/*` | Cleared in E2E resets | Critical | Tests must clear the new secure store, not only `localStorage`. |

### 2.3 `sessionStorage`

No production app writes found. E2E reset clears `sessionStorage` for hygiene only.

### 2.4 Not storage, but related browser persistence

- React Query in-memory cache is cleared on `clearWalletState()` — must remain on lock.
- No `indexedDB` / `chrome.storage` usage in app source.

---

## 3. iOS app-lifecycle locking requirements

### 3.1 Current extension behavior (baseline)

| Trigger | Behavior | Location |
| --- | --- | --- |
| 10 min idle on tracked screens | `clearWalletState()` → navigate `lock` | `use-session-timeout.ts`, `screen-provider.tsx`, `src/lib/session.ts` |
| Explicit Settings → Lock | same | `settings-lock-wallet-screen.tsx` |
| Lock implementation | bump `sessionId`, clear selection/withdraw sync caches, remove React Query caches, **`vault.lock()`** (drops cached encryption key) | `wallet-provider.tsx` `clearWalletState` |
| Popup close | Process teardown implicitly wiped RAM | Architecture docs |

### 3.2 Why iOS needs more

WKWebView / Capacitor keeps JS heap across backgrounding. An unlocked vault can retain the derived key in libqc memory after the user leaves the app. **Idle timeout alone is insufficient.**

### 3.3 Required lock policy for first iOS build

Implement a single lock helper that always runs the existing `clearWalletState()` + navigate-to-`lock` path (do not invent a second lock path that skips `vault.lock()`).

| Event | Required action | Notes |
| --- | --- | --- |
| App → `background` / `inactive` | Lock immediately (or within a very short grace ≤1–2s if needed for iOS snapshot) | Capacitor `@capacitor/app` `appStateChange` |
| App → `active` while previously unlocked | Remain on lock screen; require password | Do not auto-unlock |
| Device lock / biometric OS lock while app backgrounded | Covered by background lock | |
| 10 min in-foreground idle | Keep existing session timeout | Extend activity events if needed for iPad pointer |
| Screen tracking policy | Preserve `screenSessionTrackingPolicy` | Do not weaken `never` screens incorrectly |
| Memory warning / unexpected reload | Hydration already routes locked vault to `lock` | Keep hydration via `ScreenProvider` |

### 3.4 Explicit non-goals for lock UX (first build)

- No Face ID / Touch ID unlock yet (password remains the unlock secret).
- No background balance polling while unlocked (must be locked when backgrounded).
- Do not log lock reasons with any secret material.

---

## 4. `LibQCStorage` replacement

### 4.1 SDK contract (pinned `@project-eleven/libqc@1.0.0`)

From published types (`dist/storage/index.d.ts`):

```ts
export interface LibQCStorage {
  get<V>(key: string): Promise<V | null>;
  put<V>(key: string, value: V): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear?(): Promise<void>;
}
```

Shipped reference implementation: `WebStorage` (`dist/storage/web.js`) — prefix `vault_`, backend `localStorage`, JSON serialize. **Encryption is not done in storage**; libqc’s state layer encrypts before `put`.

### 4.2 Current wiring

```ts
// src/providers/wallet-provider.tsx
const storage = new WebStorage();
new LibQC(storage, chains, bundlerConfigProvider, undefined, { registerUrl });
```

### 4.3 Replacement design (app-owned; do not fork libqc)

| Decision | Choice |
| --- | --- |
| Interface | Implement `LibQCStorage` in-repo (e.g. `src/lib/capacitor-libqc-storage.ts`) |
| Backend | Capacitor Secure Storage / Keychain plugin (prefer a maintained Capacitor 6/7-compatible Keychain wrapper). Values remain opaque JSON from libqc’s perspective. |
| Prefix | Keep `vault_` (or pass the same default) for operational parity with existing key naming. |
| Sync vs async | Interface is already async — map Keychain I/O to Promises. |
| `clear()` | Implement fully; `deleteWalletData()` → `vault.clearState()` depends on durable wipe. |
| Migration | First iOS build: **no Chrome extension vault import**. Fresh testnet wallets only. Do not attempt to read desktop `localStorage` dumps. |
| Fallback | **No** silent fallback to `localStorage` in production iOS builds for vault keys. |
| Logging | Never log keys, values, ciphertext, or Keychain errors that echo payloads. |

### 4.4 Preferences vs vault storage

Keep UX prefs (`currency`, onboarding) out of Keychain if using Preferences/`localStorage`. Never mix preference keys into the `vault_` Keychain namespace.

---

## 5. Security-sensitive boundaries (do not break)

### 5.1 Hard freeze (do not modify)

| Boundary | Where / how it appears | Rule |
| --- | --- | --- |
| `@project-eleven/libqc` pin | `package.json` `1.0.0` | Keep published pin; no `file:`/`link:`/`workspace:`. |
| Mnemonic generation / validation | libqc + wallet creation/recovery UI that only call SDK | UI may adapt layout; crypto stays in SDK. |
| Key derivation / unlock | `vault.unlock` / `setPassword` / scrypt inside libqc | Call sites only; no reimplementation. |
| Encryption at rest | libqc state layer | Storage adapter stores opaque payloads only. |
| Bitcoin address generation | libqc account clients | Testnet HRP (`tb1`) must come from chain config `testnet: true` + `BITCOIN_TESTNET_REF`. |
| Transaction signing | libqc | Unchanged. |
| Exposure detection | libqc + vault status mappers | Unchanged algorithms. |
| `emptyVault` | `wallet-provider.tsx` withdraw path calling `accountClient.emptyVault` | Keep call semantics; may hide ETH UI but do not rewrite sweep crypto. |

### 5.2 Soft freeze (touch carefully; security review)

| Boundary | Location |
| --- | --- |
| Provider order | `CurrencyProvider` → `WalletProvider` → `ScreenProvider` (`main.tsx` / `App.tsx`) |
| Single `LibQC` instance | `WalletProvider` boot gate + `useRef` |
| Session timeout policy | `use-session-timeout.ts` + `session.ts` |
| `clearWalletState` / `vault.lock()` | `wallet-provider.tsx` |
| Secret zeroing helpers | `secrets-zeroing.ts`, export-recovery-phrase secrets |
| Password / mnemonic UI buffers | creation, recovery, export flows |
| Env strictness | `src/lib/env.ts` — fail loud; no public RPC silent fallbacks |
| Diagnostics copy | Must not include secrets (`runtime-diagnostics.ts`) |
| Console logging | Existing `console.warn`/`console.error` in wallet/withdraw/fee paths — audit that messages never include secrets; do not add secret logging |

### 5.3 Network / chain boundary (first build: BTC testnet only)

Current v1.0.1 `buildChains()` enables:

1. Bitcoin **mainnet** — CAIP ref `000000000019d6689c085ae165831e93`, `testnet: false`
2. Ethereum **mainnet** — `eip155:1`, bundler required

**First iOS build must:**

| Change | Detail |
| --- | --- |
| Enable only Bitcoin testnet | CAIP-2 ref from libqc `BITCOIN_TESTNET_REF` = `000000000933ea01ad0ee984209779ba`, `testnet: true as Testnet` |
| Point `VITE_BITCOIN_API_URL` | Testnet-capable Bitcoin API only |
| Remove / omit Ethereum chain | No `eip155:1` in `buildChains()`; bundler provider can throw or be unused |
| Update `defaultAccountChainIds` | `src/providers/default-accounts.ts` currently hardcodes mainnet BTC + ETH — switch to testnet BTC only |
| Do **not** enable mainnet | No mainnet chain specs, no mainnet RPC defaults, no UI network toggle to mainnet |
| Host allowlists / docs | Drop mainnet-only assumptions in app config used at runtime |

### 5.4 Logging policy (mandatory)

Never log:

- passwords / password bytes
- mnemonics / recovery phrases
- private keys / encryption keys
- encrypted wallet contents / `vault_*` storage values
- raw withdraw destination dumps beyond what UI already shows as addresses (prefer address truncation in logs if any)

Prefer structured errors with codes/messages already used by UI (`query-error-message.ts`), not payload dumps.

---

## 6. Capacitor conversion outline (post-plan implementation order)

1. **Docs first (this file)** — done before code edits.
2. **Tooling:** add `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/app`, secure-storage/Keychain plugin, optional `@capacitor/clipboard` / `@capacitor/browser` — **pnpm only**.
3. **Vite:** remove `@crxjs/vite-plugin` from the iOS build path; emit `dist/`; set `capacitor.config` `webDir: 'dist'`.
4. **Storage:** implement Keychain `LibQCStorage`; swap `new WebStorage()` at the WalletProvider seam only.
5. **Lifecycle lock:** Capacitor `App` state → existing `clearWalletState` + lock navigation.
6. **Chains:** Bitcoin testnet only; update default accounts; trim env requirements that force unused mainnet ETH vars where possible without breaking boot (or provide dummy-unused stubs only if absolutely required by shared code paths — prefer deleting ETH chain config so bundler env is unused).
7. **Shell UI:** full-screen responsive layout / safe areas (functional first; polish second).
8. **Native project:** `pnpm exec cap add ios`, `cap sync`, open Xcode for device/simulator.
9. **Verify:** no secret logging; libqc still `1.0.0`; testnet addresses (`tb1…`); backgrounding locks vault.

### Out of scope for first build

- Mainnet enablement
- ETH / bundler production paths
- Extension store packaging
- Importing existing Chrome extension vaults
- Biometric unlock
- Embedding `MNTD_2023_04_18_0.zip` firmware

---

## 7. Verification checklist (first build gate)

- [ ] `@project-eleven/libqc` remains exactly `1.0.0` in `package.json` + lockfile intent
- [ ] No edits inside `node_modules/@project-eleven/libqc` or vendored SDK forks
- [ ] Only Bitcoin testnet chain configured; mainnet BTC and ETH absent from runtime chain list
- [ ] Vault durable state uses Keychain-backed `LibQCStorage`, not `WebStorage`/`localStorage`
- [ ] Background / inactive app state locks via `clearWalletState()` → `vault.lock()`
- [ ] Idle 10-minute lock still works in foreground
- [ ] No logs of passwords, mnemonics, keys, or encrypted vault payloads
- [ ] Package manager remains pnpm (`preinstall` only-allow pnpm preserved)
- [ ] App runs under Capacitor iOS (simulator or device)

---

## 8. Key file map

| Concern | Primary files |
| --- | --- |
| LibQC seam / storage / chains | `src/providers/wallet-provider.tsx` |
| Default chains for accounts | `src/providers/default-accounts.ts` |
| Idle lock | `src/hooks/use-session-timeout.ts`, `src/lib/session.ts`, `src/providers/screen-provider.tsx` |
| Pref `localStorage` | `src/lib/currency.ts`, `src/lib/onboarding.ts` |
| Env | `src/lib/env.ts` |
| Extension build | `vite.config.ts`, `manifest.json`, `package.json` |
| Shell size | `src/App.tsx`, `src/index.css`, `index.html` |
| Diagnostics Chrome API | `src/lib/runtime-diagnostics.ts` |
