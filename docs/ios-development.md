# iOS development (Capacitor)

## Requirements

- Node.js compatible with `packageManager` in `package.json` (pnpm@10.20.0)
- **pnpm only** (npm/yarn blocked by `preinstall`)
- Xcode **26.3** (verified with `xcodebuild -version`)
- CocoaPods for iOS native deps
- Full Xcode selected: `xcode-select -p` → `/Applications/Xcode.app/Contents/Developer`

If CLT is selected instead:

```sh
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Setup

```sh
git checkout ios-capacitor-port
cp .env.example .env
# Fill testnet-only URLs (Bitcoin Testnet API, Sepolia RPC, Sepolia bundler, prices, register)
pnpm install
pnpm build:prod
pnpm exec cap sync ios
pnpm exec cap open ios
```

Simulator Debug build example (verified under Xcode 26.3 / iOS Simulator 26.3.1):

```sh
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17,OS=26.3.1' \
  -derivedDataPath ios/DerivedData \
  CODE_SIGNING_ALLOWED=NO \
  build
```

If no simulator runtime is installed:

```sh
xcodebuild -downloadPlatform iOS
```

If CocoaPods has not been installed yet:

```sh
cd ios/App && pod install && cd ../..
```

## Networks

Runtime chains are **Bitcoin Testnet** and **Ethereum Sepolia** only. Mainnet is not configured.

## Holding-duration service fee

See `docs/holding-duration-service-fee.md`. Collection is **disabled** until libqc can atomically pay recipient + treasury.

## Security

- Vault storage: Keychain-backed `LibQCStorage` (`src/lib/capacitor-libqc-storage.ts`)
- Lock on background + 10-minute idle
- Privacy cover for app-switcher snapshots
- Never log secrets

## Attribution

Upstream `quantum-vault` / `libqc` were published as audited *reference* implementations. This modified iOS application requires its own security and legal review. It is **not** production-ready for real funds.
