# Wallet attack protection

Lockx isolates vault withdrawals behind a **second signing key** (KFT or self-custody) that lives outside your hot wallet.  Below is a threat-model walkthrough comparing a traditional wallet to a Lockbox-protected vault.

| Scenario | Without Lockx | With Lockx |
|----------|--------------|------------|
| Private-key leak | Attacker drains ETH, ERC-20 & NFTs with one tx | Needs **two** signatures: wallet + Lockx key.  NFT itself is soul-bound, cannot `transferFrom`. |
| Seed-phrase leak | Wallet can be restored on attacker’s device | Seed phrase reveals _no_ Lockx key fraction; vault still safe. |
| Blind-sign attack | Malicious dApp hides calldata, gets unlimited approval | Lockbox only accepts typed EIP-712 payloads; amounts & recipients visible. |
| Malware/RAT | Trojan scrapes extension storage for keys | Lockx key is never stored on disk; derived on-demand & wiped. |
| Airdrop drainer | Airdropped token hooks `transfer` to re-enter | Only owner can deposit; inbound tokens inside Lockbox can’t execute code. |

---

## Deep-dive: attack scenarios

??? danger "Wallet private-key compromise"
    

    !!! info "Lockx defence"
        • Soul-bound NFT cannot be transferred.  
        • Withdrawal requires EIP-712 signature from the **Lockx key**.  
        • Attacker would need to hack both wallet **and** KMS-backed key fraction within the 5-minute deadline.









??? danger "Signature phishing"
    Malicious site asks you to sign ambiguous hex.

    !!! info "Lockx defence"
        • Contract only accepts **typed** `Withdraw*` structs with chainId, nonce, amount.  
        • Wallets (MetaMask, Ledger, etc.) display human-readable fields.






??? danger "Blind signature / permit drainers"
    ERC-20 `permit` blobs can mask unlimited approvals.

    !!! info "Lockx defence"
        Lockbox assets ignore `permit`; only explicit withdrawals signed by **both** keys are accepted.



??? danger "Malware & RATs"
    Trojan scrapes extension storage for keys.

    !!! info "Lockx defence"
        • Lockx key never lives on disk – derived on-demand & wiped.  
        • 𝑘ᴾ fraction sealed in HSM; 𝑘ᵁ requires fresh wallet sig + TOTP.






??? danger "Seed-phrase compromise"
    Restoring the wallet elsewhere recreates private keys.

    !!! info "Lockx defence"
        Seed phrase reveals no Lockx key fraction – vault remains safe; simply rotate user fraction and recover funds.



---

Lockx therefore turns a single-point-of-failure wallet into a **two-factor, typed-data-only** withdrawal flow, stopping the most common drain vectors seen in 2024-25.
