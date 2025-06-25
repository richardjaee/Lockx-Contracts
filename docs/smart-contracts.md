# Smart contracts

## Contract overview

The Lockx platform runs on **just four Solidity contracts**—a deliberate, minimalist architecture that keeps the codebase simple to audit and reduces attack surface.

| Contract | Purpose | NatSpec / source |
|----------|---------|------------------|
| **Lockx** | ERC-721 soul-bound NFT that represents the vault and handles minting / bagging flows | [`Lockx.sol`](https://github.com/richardjaee/Lockx-Contracts/blob/main/contracts/Lockx.sol) · [NatSpec](api/Lockx.md) |
| **Deposits** | Abstract contract that stores ETH, ERC-20 & ERC-721 deposits with precise accounting | [`Deposits.sol`](https://github.com/richardjaee/Lockx-Contracts/blob/main/contracts/Deposits.sol) · [NatSpec](api/Deposits.md) |
| **Withdrawals** | Abstract contract that inherits *Deposits* and adds signature-gated withdrawal logic | [`Withdrawals.sol`](https://github.com/richardjaee/Lockx-Contracts/blob/main/contracts/Withdrawals.sol) · [NatSpec](api/Withdrawals.md) |
| **SignatureVerification** | Implements EIP-712 typed-data signing / nonce tracking for secure authorisation | [`SignatureVerification.sol`](https://github.com/richardjaee/Lockx-Contracts/blob/main/contracts/SignatureVerification.sol) · [NatSpec](api/SignatureVerification.md) |

> **Intentional simplicity**  
> Each contract has one job: *Lockx* mints NFTs, *Deposits* tracks assets, *Withdrawals* releases assets, and *SignatureVerification* approves actions. A straight-line inheritance tree keeps responsibilities clear.

```
Lockx
├─ ERC721 ▸ IERC721
├─ Ownable
├─ Withdrawals (abstract)
│   └─ Deposits (abstract)
│       ├─ SignatureVerification ▸ EIP712
│       ├─ IERC721Receiver
│       └─ ReentrancyGuard
└─ IERC5192 (Soul-bound)
```

### Lockx
The entry-point ERC-721 contract that mints **soul-bound Lockbox NFTs** and supports single-transaction mint-and-bag flows (`bagETH`, `bagERC20`, `bagBatch` …). Implements EIP-5192 to make tokens non-transferable and disables `_transfer` entirely. 

*Key highlights*
* Soul-bound (`locked()` always true, `_transfer` reverts)
* Gas-optimised `_mint` vs `_safeMint` depending on recipient
* Supports setting default & per-token metadata URIs
* Inherits **Withdrawals** ⇒ full deposit & withdrawal stack

### Deposits
Abstract helper that records all incoming assets.

* Supports ETH, ERC-20, ERC-721 & batch deposits
* Precise accounting—ERC-20 amount booked equals *actual* delta in balance (fee-on-transfer safe)
* Gas-efficient storage layout; swap-and-pop removal helpers
* Emits `Deposited` event with off-chain `referenceId`

### Withdrawals
Adds EIP-712 signature-gated withdrawal, burn, and key-rotation flows on top of *Deposits*.

* `unbagETH`, `unbagERC20`, `unbagNFT`, `batchUnbag`
* Time-bounded signatures (`signatureExpiry`) & nonce replay protection
* Complete storage cleanup when balances hit zero (gas refunds)
* `burnLockbox` permanently destroys vault after wiping storage

### SignatureVerification
EIP-712 domain: *Lockx / v1*  
Every Lockbox tracks `activeLockxPublicKey` + `nonce`. `verifySignature` checks:

1. Digest matches supplied `messageHash`
2. Signature recovers to active key
3. Nonce increments → prevents replay
4. If `ROTATE_KEY`, updates the key

All high-risk functions in *Withdrawals* call this internal helper.

---

Need deeper detail? Jump to the full NatSpec:

* [Lockx](api/Lockx.md) · [Deposits](api/Deposits.md) · [Withdrawals](api/Withdrawals.md) · [SignatureVerification](api/SignatureVerification.md)
