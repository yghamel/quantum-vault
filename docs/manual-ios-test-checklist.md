# Manual iOS test checklist (testnet only)

Use **Bitcoin Testnet** and **Ethereum Sepolia** only. Never Mainnet or real funds.

## Install / lifecycle

- [ ] Fresh install
- [ ] Create test wallet
- [ ] Recover with a **test-only** mnemonic
- [ ] Recover on a second simulator
- [ ] Restart app; Keychain vault persists; unlocked state does not
- [ ] Delete wallet; vault Keychain keys cleared; currency preference may remain
- [ ] 10-minute foreground idle lock
- [ ] Immediate lock on background / inactive
- [ ] App-switcher shows privacy cover (no balances/addresses)
- [ ] Forced WebView reload returns to lock when vault exists

## Bitcoin Testnet

- [ ] Receive (`tb1…` address)
- [ ] Balance refresh
- [ ] Withdraw / emptyVault to external testnet address
- [ ] Maximum withdrawal accounts for miner fee
- [ ] Multiple deposits of different ages (fee math dry-run / disclosure)
- [ ] Dust developer-fee waiver behaviour documented when collection enabled later

## Ethereum Sepolia

- [ ] Receive Sepolia ETH (clear Sepolia labelling)
- [ ] Smart-account deployment if required by Kernel/bundler
- [ ] Balance refresh
- [ ] Withdraw / emptyVault
- [ ] Gas estimation disclosed separately from any service fee
- [ ] Recovery still works

## Fee policy UI

- [ ] Onboarding mentions holding-duration service fee
- [ ] Settings → Service Fee Schedule always accessible
- [ ] Collection remains **disabled** until libqc atomic support + treasuries
- [ ] Invalid treasury config does not enable collection
- [ ] No Mainnet endpoint used

## Failures

- [ ] Expired quote cannot be signed (when quotes exist)
- [ ] Failed / rejected txs do not collect service fee
- [ ] Duplicate confirm does not double-submit
