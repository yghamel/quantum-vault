# Manual iOS test checklist (testnet only)

Use **Bitcoin Testnet** and **Ethereum Sepolia** only. Never Mainnet or real funds.

## Install / lifecycle

- [ ] Fresh install
- [ ] Create test wallet
- [ ] Recover with a **test-only** mnemonic
- [ ] Recover on a second simulator
- [ ] Restart app; Keychain vault persists; unlocked state does not
- [ ] Delete wallet; vault Keychain keys cleared; currency preference may remain
- [ ] Delete app from Simulator and reinstall; orphaned Keychain vault is cleared; onboarding / Create or Recover shows
- [ ] Background during onboarding or wallet creation (no password yet); returns to onboarding / initial, not lock
- [ ] Password screen fits without page scroll; Continue with invalid input shows errors and requirements
- [ ] 10-minute foreground idle lock
- [ ] Immediate lock on background / inactive
- [ ] App-switcher shows privacy cover (no balances/addresses)
- [ ] Launch or forced WebView reload with a vault shows Log In, Create, and Recover; Create asks before replacing the vault; Reset Wallet asks, removes the vault, and leaves Create / Recover

## Bitcoin Testnet

- [ ] Receive (`tb1…` address)
- [ ] Balance refresh
- [ ] Withdraw / emptyVault to external testnet address
- [ ] Maximum withdrawal accounts for miner fee
- [ ] Review screen labels the fee "Bitcoin miner fee"

## Ethereum Sepolia

- [ ] Receive Sepolia ETH (clear Sepolia labelling)
- [ ] Smart-account deployment if required by Kernel/bundler
- [ ] Balance refresh
- [ ] Withdraw / emptyVault
- [ ] Review screen labels the fee "Ethereum gas fee"
- [ ] Recovery still works
- [ ] No Mainnet endpoint used

## Failures

- [ ] Duplicate confirm does not double-submit
