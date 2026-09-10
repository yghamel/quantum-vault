# Quantum Vault (iOS)

Capacitor iOS/iPad port of [Quantum Vault](https://github.com/p-11/quantum-vault) by [Project Eleven](https://projecteleven.com/), forked from release **v1.0.1**.

First build: **Bitcoin testnet only**. Mainnet is disabled. `@project-eleven/libqc@1.0.0` remains the pinned SDK.

See `IOS_PORT_PLAN.md` for the Chrome-extension → Capacitor inventory.

## Requirements

- Node.js + **pnpm** only
- Xcode (for simulator/device builds)
- CocoaPods (via Capacitor iOS workflow)

## Setup

```sh
cp .env.example .env   # set VITE_BITCOIN_API_URL (testnet), VITE_ASSET_PRICES_URL, VITE_REGISTER_URL
pnpm install
pnpm build:prod
pnpm exec cap add ios   # first time only
pnpm cap:sync
pnpm cap:open           # opens Xcode
```

## Security notes

- Vault durable state uses Keychain-backed `LibQCStorage` (not `localStorage`).
- App background/inactive locks the vault via the same `clearWalletState` → `vault.lock()` path as idle timeout.
- Never log passwords, mnemonics, keys, or encrypted wallet contents.

## License

[MIT](./LICENSE)
