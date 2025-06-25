<div class="hero">
  <h1>Secure your assets with Lockx</h1>
  <p>Soul-bound lockboxes for ETH, ERC-20 tokens and NFTs — fully open-source and audited.</p>
  <a class="btn-primary" href="https://app.lockx.io">Connect wallet</a>
</div>

# Getting started

## Documentation

Lockx is a decentralized platform for managing Ethereum assets through smart-contract powered **Lockboxes**. A Lockbox acts as a tokenised safe-deposit box and can store ETH, ERC-20 tokens and NFTs.

This portal covers:

* Smart-contract internals
* Key-fraction technology
* Business model & fees

---

!!! tip "Independent business model"
    Lockx operates on a simple platform-fee model for its key-management service.  The contracts themselves are open and free to use – there is **no token or tokenomics**.  That lets us focus on reliability instead of artificial scarcity or usage limits.

---

# Quick start

See the dedicated [quick start guide](quick-start.md) for a full walkthrough. Below is a high-level summary.

Follow these steps to connect your wallet and create your first Lockbox.

1. Connect wallet → MetaMask/Coinbase/Brave
2. Sign EIP-712 message → opens 3-hour session (no gas)
3. Select assets → up to 3 tokens or NFTs
4. Pay platform fee & choose key-management tier
5. Mint soul-bound Lockbox NFT


Lockx is a zero-trust digital-asset vault.  Each deposit mints a **soul-bound Lockbox NFT** that represents ownership of a private vault capable of holding ETH, ERC-20 tokens and NFTs.  Withdrawals are authorised by an **on-demand, dual-fraction key** (see Key fraction technology) via EIP-712 signatures.

**Why it matters**

* A leaked wallet key alone _cannot_ empty a Lockbox – the platform fraction is still required.  Conversely, a server breach cannot move funds without your wallet’s signature.
* No metadata or balances are exposed on-chain.  Planned zk integrations will hide them even from the platform.
* Everything is open-source (Apache-2.0) and audited.  There is no token, no hidden fees, and no vendor lock-in.

Use the sidebar to dive into the contracts, security architecture and roadmap, or jump straight to the [quick start](quick-start.md) if you want to test locally.

 This site aggregates all publicly available information about the Lockx smart-contract suite.



* **Overview** – this page.
* **Audit report** – detailed security & QA assessment for v1.0.0.
* **Test methodology** – explanation of unit, fuzz, and invariant test layers.
* **API reference** – auto-generated NatSpec for every Solidity contract. Navigate via the sidebar or the links below.
  * [Lockx](api/Lockx.md)
  * [Deposits](api/Deposits.md)
  * [Withdrawals](api/Withdrawals.md)
  * [SignatureVerification](api/SignatureVerification.md)

---


