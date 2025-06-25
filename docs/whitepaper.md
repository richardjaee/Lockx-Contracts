# Lockx whitepaper

_Last updated: 24 Jun 2025_

Lockx is a **zero-trust digital-asset vault** that uses soul-bound NFTs, on-demand key derivation, and optional zk-proof integrations to keep user funds safe _without ever learning what, or how much, is in a lockbox_.

---

## 1. Problem statement

Self-custody wallets are powerful but fragile: a single leaked private key can empty a lifetime’s savings. Multisig and social-recovery schemes improve security but add complexity and still reveal holdings on-chain.

We aim for:

* _Invisible custody_ – observers cannot tell which address controls which assets or how much is stored.
* _Key resilience_ – compromise of any single secret is survivable.
* _Composable smart-contract UX_ – deposits and withdrawals feel like normal ERC-20/ERC-721 transfers.

---

## 2. Architecture overview

### 2.1 Lockbox NFTs

Each deposit mints a soul-bound ERC-721 **Lockbox** representing “ownership” of a virtual vault.  The NFT is:

* Non-transferable (soul-bound) to prevent phishing sales.  
* The _identity anchor_: contract logic gates withdrawals on `ownerOf(tokenId)`.

### 2.2 Key-fraction technology

Lockx introduces **key fraction technology** (KFT) to avoid storing full asymmetric keys.

1. **Platform fraction (𝑘ᴾ)** – generated once, AES-encrypted, stored server-side.  
2. **User fraction (𝑘ᵁ)** – deterministically derived from the user’s wallet signature (EIP-191) at mint time.
3. **Public lockbox key (𝐾 = 𝑘ᴾ ⊕ 𝑘ᵁ)** – derived _on the fly_ whenever a signature is required, then zeroised.

Because neither party ever holds both halves, a database breach or wallet leak alone is useless.  𝑘ᴾ can be tucked inside an HSM; 𝑘ᵁ can be re-derived from the wallet each time.

### 2.3 Off-chain signing flow

Withdrawals require an **EIP-712 typed data** signature by 𝐾.  Flow:

1. Front-end assembles the payload (amounts, deadline, nonce).  
2. Back-end re-derives 𝑘ᴾ, asks user wallet for 𝑘ᵁ (one-tap `personal_sign`), computes 𝐾, signs.  
3. Transaction submits the signature to `Withdrawals.withdraw*` (Solidity verifies with `ecrecover`).

### 2.4 Zero-trust extensions

Planned zk circuits let users prove _balance ≥ X_ or _specific token present_ **without** revealing the number or type of assets.  This enables private collateralisation & compliance attestations.

---

## 3. Smart-contract modules

| Contract | Responsibility |
|----------|----------------|
| `Lockx.sol` | NFT mint/burn & top-level book-keeping |
| `Deposits.sol` | Deposit ETH / ERC-20 / ERC-721 (single & batch) |
| `Withdrawals.sol` | Withdraw flow; calls `verifySignature` |
| `SignatureVerification.sol` | Pure library for EIP-712 domain, hashing and recovery |

All modules compile with `viaIR` for maximal optimisation.  Invariant and fuzz suites run under Foundry & Echidna; Slither + Mythril complement static analysis.

---

## 4. Threat model

| Actor | Goal | Mitigation |
|-------|------|-----------|
| Phisher | Trick user into signing withdrawal | Soul-bound NFT prevents transfer, 2FA fraction required |
| Insider | Steal 𝑘ᴾ | Still need 𝑘ᵁ (wallet) |
| Chain observer | Map holdings | NFT has no metadata; zk roadmap hides balances |
| Bug in contract | Drain vault | Unit, fuzz, invariant tests + audits |

---

## 5. Roadmap alignment

Zero-knowledge extensions (Q3 2025) integrate directly with KFT to preserve privacy; Layer-2 & multi-chain support (Q4 2025) re-use the same derivation scheme on non-EVM chains via Taproot Assets (BTC) and ed25519 mapping (Solana).

---

## 6. Conclusion

Lockx blends smart-contract rigour with cryptographic partitioning to deliver a vault that remains secure—even if _either_ the platform or the user wallet is compromised.  The open-source code, audits, and bounty programme invite the community to verify that claim.
