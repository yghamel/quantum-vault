# Holding-duration service fee (testnet)

## Policy (exact)

- Annual rate: **200 bps (2%)**, simple, non-compounding
- Lifetime cap: **1000 bps (10%)**
- Proration: elapsed **seconds**
- Grace: **0**
- Minimum developer fee: **0**
- Networks: Bitcoin Testnet deposits; native Ethereum Sepolia ETH deposits (no ERC-20 in this build)
- Wording: fees accrue based on **time held in vault** after each **confirmed** deposit

Formula (integer math, round down):

```
eligibleHoldingSeconds = max(0, calculationTime - confirmedDepositTime)
uncappedFee = floor(principal × 200 × eligibleHoldingSeconds / 10_000 / 31_536_000)
maximumFee = floor(principal × 1_000 / 10_000)
finalServiceFee = min(uncappedFee, maximumFee)
```

Authoritative times must come from chain/block (or median-time-past) data — not the device clock.

## Feature gate

`featureEnabled` requires:

1. Valid treasury address for that network (`tb1…` for Bitcoin Testnet; valid nonzero `0x` address **bound in config to** `eip155:11155111` for Sepolia)
2. `LIBQC_ATOMIC_FEE_COLLECTION_SUPPORTED === true`

Today (2) is **false**.

## Collection blockers (`@project-eleven/libqc@1.0.0`)

### Bitcoin

`BitcoinAccountClient.emptyVault(destination)` / `buildSweepTransaction` spend all UTXOs to a **single** output. There is no public API to add a treasury output in the same signed transaction. Implementing multi-output fee payment would require modifying libqc signing/scripts — frozen.

### Ethereum Sepolia

`emptyVault` / `sendTransfer` target one destination. `sendKernelUserOperation` accepts a single `UserOperationCall`. Atomic recipient + treasury batching is not exposed on the published surface. Sequential transfers would allow fee success with recipient failure — forbidden.

### Ethereum history / FIFO after recovery

Standard JSON-RPC cannot reliably reconstruct all native funding events after reinstall. Without a Sepolia indexer, recovery-safe FIFO deposit-lot accounting cannot be claimed. Fee collection remains disabled for this reason as well until indexing exists **and** atomic UserOps are available.

## Disclosure

Always-accessible screen: Settings → Service Fee Schedule. Onboarding mentions the policy. Acceptance version: `testnet-holding-v1` (preferences, not vault Keychain).

## Recovery / bypass

Users retain recovery material. External recovery software can move funds without executing this app’s fee code. That is intentional for a non-custodial design.

## Treasuries still required from operator

Provide when ready to enable (collection still blocked by libqc until SDK support):

- Bitcoin Testnet treasury (`tb1…`)
- Ethereum Sepolia treasury (`0x…`, configured for chain 11155111)

Never embed treasury private keys.
