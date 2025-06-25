# Self-custody signing

Prefer managing your own keys?  Lockx works out-of-the-box with any EOA or multisig.  **No part of the protocol requires you to share seed phrases or private keys.**

| Setup | Pros | Cons |
|-------|------|------|
| Ledger / Trezor EOA | Hardware isolation; cheap gas | Single point of failure if you lose the seed |
| Gnosis Safe 2-of-3 | Redundant keys; on-chain policy | Higher gas; UX heavier |
| Safe + KFT | Redundant + secret-split | Small platform fee |

---

## Self-custody vs. key-fraction

| Feature | Lockx key fraction | Self-custody |
|---------|-------------------|--------------|
| Key storage | Encrypted 𝑘ᴾ half in KMS + 𝑘ᵁ in wallet | Full key in user’s devices |
| Two-factor auth | Built-in (TOTP) | Optional (Safe, YubiKey, etc.) |
| Recovery | Assisted via encrypted backup + 2FA | User governs backups |
| Gas cost | Low (single ECDSA) | Low |
| UX | dApp automates signing | User signs directly |

---

## How to use self-custody mode

1. During Lockbox creation choose “Self-custody key”.
2. Safely back up the seed phrase or xpub of the generating wallet.
3. When **withdrawing**, the dApp prompts your signer directly for the EIP-712 signature — no server round-trip.
4. If you prefer an offline flow, build the typed-data JSON and sign it in an air-gapped computer (e.g. via `ethsig` or Ledger Live JSON-RPC over USB).
5. Paste the signature back into the dApp or call `withdraw*` directly via ethers/remix.
6. Keep the signer offline except when authorising withdrawals.

!!! warning "Don’t brick your funds"
    Losing the private key bricks the Lockbox.  Test a small withdrawal first and store encrypted backups in multiple locations.

Best practice: keep the withdrawal key offline (air-gapped hardware wallet or multisig) and use a hot wallet only for `deposit*` calls.  You can migrate to KFT or 2FA later without moving assets.
