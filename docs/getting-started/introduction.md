# Introduction

Lockx combines battle-tested smart contracts with novel **key fraction technology** (KFT) to offer a vault that stays secure even if _either_ the platform or the user’s wallet is compromised.

At a glance:

| Feature | Benefit |
|---------|---------|
| Soul-bound Lockbox NFT | Prevents phishing sales; acts as the identity anchor. |
| Dual-fraction keys (𝑘ᴾ ⊕ 𝑘ᵁ) | A single leak — wallet _or_ database — is harmless. |
| Zero-metadata design | No balances or token lists stored on-chain. |
| EIP-712 authorisation | Gas-efficient, replay-protected off-chain signatures. |
| Apache-2.0 open-source | No token, no vendor lock-in; audits and bounties welcome. |

---

## Background

Crypto custody forces a trade-off between convenience and safety.  Centralised exchanges offer insurance and recovery but collapse into a single point of failure.  Pure self-custody puts every coin behind one private key and a single signature approval screen.

Lockx introduces a middle ground: a vault represented by a soul-bound NFT and controlled by a key that is deterministically _derived_ from two fractions held in different places.  You keep signing authority in your existing wallet; the platform stores only its own useless share.  Neither side alone can approve a withdrawal.  No new hardware wallets, no seed-phrase gymnastics.

For the security rationale and threat model see [Why use Lockx?](why-use-lockx.md); for cryptographic detail view the [whitepaper](../whitepaper.md).

---

## How a deposit works

1. User calls `depositETH` / `depositERC20` / `depositERC721`.  
2. Contract mints a **Lockbox NFT** (`tokenId` = vault id) and records the asset.  
3. Platform derives the public key 𝐾 = 𝑘ᴾ ⊕ 𝑘ᵁ and discards it.

## How a withdrawal works

1. Front-end assembles an EIP-712 payload; back-end re-derives 𝐾.  
2. User wallet signs a short message to supply 𝑘ᵁ.  
3. Back-end calculates 𝐾, signs the withdrawal payload, submits on-chain.  
4. `Withdrawals.sol` recovers 𝐾 and releases funds.

There is **no long-lived private key** stored anywhere.

---

[See the prerequisites →](prerequisites.md)

Lockx is a decentralized platform for securely managing Ethereum assets via **Lockboxes** – tokenised vaults that can hold ETH, ERC-20 tokens and NFTs under fine-grained, self-custody controls.  This documentation portal covers the smart-contract internals, key-fraction technology and the overall business model.

!!! tip "Independent business model"
    Lockx runs on a simple platform-fee model.  There is **no token and no tokenomics** – the contracts are open-source (Apache-2.0) and free to integrate.  Our only revenue comes from optional key-management fees, allowing us to focus on rock-solid infrastructure rather than speculative incentives.








