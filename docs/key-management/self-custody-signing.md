# Self-custody signing

Prefer managing your own keys?  Lockx works out-of-the-box with any EOA or multisig.  **No part of the protocol requires you to share seed phrases or private keys.**

| Setup | Pros | Cons |
|-------|------|------|
| Ledger / Trezor EOA | Hardware isolation; cheap gas | Single point of failure if you lose the seed |
| Gnosis Safe 2-of-3 | Redundant keys; on-chain policy | Higher gas; UX heavier |
| Safe + KFT | Redundant + secret-split | Small platform fee |

Best practice: keep the withdrawal key offline (air-gapped or multisig) and use a hot wallet only for `deposit*` calls.  If you ever need extra safety you can rotate into KFT or 2FA without moving assets.
