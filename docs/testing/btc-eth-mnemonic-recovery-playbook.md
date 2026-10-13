# BTC/ETH Mnemonic Recovery Playbook (Test Operators)

This guide documents how to recover funds from a Quantum Vault mnemonic outside
the extension during QA/mainnet testing.

## Scope

- BTC recovery path (Electrum-based)
- ETH recovery path (LibQC script-based)
- Derivation path expectations and compatibility notes
- Safety warnings and validation checklist

## Safety First

- Treat the mnemonic as production-secret material.
- Use an offline/isolated machine when possible.
- Move recovered funds to a new destination wallet immediately after recovery.
- Never paste mnemonic or private keys into websites, chat tools, or ticket
  comments.
- Never save plaintext mnemonic/private keys in shell history or repo files.

## Derivation Expectations (LibQC)

Quantum Vault uses BIP-85 derivation (not standard BIP-44/BIP-84 account
restore paths):

- Base path formula: `m/83696968'/<app_no>'/<address_index>'`
- EVM signer key app number: `4861`
- BTC key app number: `4862`
- Address index is 0-based (`Vault #01` => index `0`, `Vault #02` => index
  `1`, etc.)

Important ETH caveat:

- The Quantum Vault ETH address is a smart-account (Kernel) address.
- Importing the raw EVM private key into MetaMask/Rabby produces the owner EOA,
  not the same smart-account address shown by Quantum Vault.

## ETH Recovery Playbook (Outside Extension)

Use LibQC directly and sweep from the same smart-account address.

1. Capture from Quantum Vault before lockout:
   - Expected ETH vault address (`0x...`)
   - Vault number (to get index)
2. Prepare env values (same values used by the extension):
   - Ethereum RPC URL
   - Ethereum bundler RPC URL
   - Ethereum bundler API key
3. Run a local Node script (outside the extension) with `@project-eleven/libqc`
   that:
   - imports the mnemonic
   - creates the ETH account for the target index
   - asserts recovered account address equals the captured ETH vault address
   - calls `emptyVault(destinationAddress)`
4. Confirm transaction success on-chain, then repeat for any additional indices.

Reference script shape (for operators comfortable with Node):

```js
import { ChainId, LibQC, toChain } from '@project-eleven/libqc';

// 1) Provide storage implementation + chains + bundler provider
// 2) importWallet(mnemonic, password)
// 3) createAccount(eip155:1, undefined, undefined, targetIndex)
// 4) assert recovered account address matches captured vault address
// 5) accountClient.emptyVault(destinationAddress)
```

## BTC Recovery Playbook (Electrum)

Use Electrum to import/sweep the BTC private key derived for the target index.

1. Capture from Quantum Vault before lockout:
   - Expected BTC vault address (`bc1...`)
   - Vault number/index
2. Derive the BTC private key from the mnemonic at:
   - `m/83696968'/4862'/<index>'`
3. Convert the derived BTC private key to compressed mainnet WIF.
4. In Electrum:
   - `File -> New/Restore`
   - Choose `Import Bitcoin addresses or private keys`
   - Paste the WIF key
   - Verify the shown address matches the captured Quantum Vault BTC address
   - Sweep funds to the destination wallet
5. Wait for confirmations and archive txid + destination in test notes.

Known test vector: removed. The vector previously published here is burned
because its mnemonic and private key are in public git history; never fund or
reuse it. For dry-run validation, generate a fresh throwaway mnemonic locally,
derive index `0` with the steps above, and keep the derived secrets out of the
repository.

## Wallet/Tool Compatibility Notes

- Works:
  - Electrum (BTC via WIF import/sweep)
  - LibQC script path (ETH smart-account sweep)
- Caution:
  - MetaMask/Rabby private-key import controls owner EOA, not the Quantum Vault
    ETH smart-account address.
- Does not match Quantum Vault by default:
  - Standard mnemonic restore flows expecting BIP-44/BIP-84 derivation paths.

## Validation Checklist (Must Pass Before Any Spend)

- Captured source address from Quantum Vault for the target chain/index.
- Derived/recovered address matches captured source address exactly.
- Destination address verified by second operator.
- Small test transfer succeeds first (if operationally possible).
- Full sweep executed only after address + chain + destination confirmation.
- Tx hash recorded in QA/mainnet notes.

## Do / Don't

Do:

- Validate address match before sending.
- Sweep to a fresh destination wallet.
- Revoke/delete temporary key material after completion.

Don't:

- Do not send before address match is proven.
- Do not reuse exposed recovery keys.
- Do not store mnemonic/private keys in repo files, PR text, or issue comments.
