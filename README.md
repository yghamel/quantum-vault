# Quantum Vault (iOS / Capacitor)

Non-custodial **testnet** wallet UI forked from [p-11/quantum-vault@v1.0.1](https://github.com/p-11/quantum-vault/releases/tag/v1.0.1).

**Networks:** Bitcoin Testnet + Ethereum Sepolia only. No Mainnet. No real-value funds.

Pinned SDK: `@project-eleven/libqc@1.0.0`. Package manager: **pnpm only**.

See:

- `IOS_PORT_PLAN.md` — conversion inventory and blockers
- `docs/ios-development.md` — Xcode / Capacitor setup
- `docs/holding-duration-service-fee.md` — 2%/10% fee policy and collection blockers
- `docs/threat-model-ios.md` — review boundaries

Upstream reference implementations were audited; **this modified iOS application is not claimed audited or production-ready.**

## Quick start

```sh
cp .env.example .env
pnpm install
pnpm build:prod
pnpm exec cap sync ios
pnpm exec cap open ios
```

## Licence

[MIT](./LICENSE)
