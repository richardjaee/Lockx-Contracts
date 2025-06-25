# Introduction

Lockx is a decentralized platform for securely managing Ethereum assets via **Lockboxes** – tokenised vaults that can hold ETH, ERC-20 tokens and NFTs under fine-grained, self-custody controls.  This documentation portal covers the smart-contract internals, key-fraction technology and the overall business model.

!!! tip "Independent business model"
    Lockx runs on a simple platform-fee model.  There is **no token and no tokenomics** – the contracts are open-source (Apache-2.0) and free to integrate.  Our only revenue comes from optional key-management fees, allowing us to focus on rock-solid infrastructure rather than speculative incentives.

## Why use Lockx?

* Protect tokens from accidental transfers or compromised wallets.
* Separate day-to-day spending from long-term holdings.
* Enforce two-step withdrawals or key-rotation policies without relying on a custodian.

## Prerequisites

* A wallet that can sign EIP-712 messages (e.g. MetaMask, Rabby, Ledger via MetaMask).
* Node.js ≥ 18 if you plan to compile and test locally.
* Basic familiarity with Hardhat or Foundry for contract deployment.

Continue to the [quick-start](quick-start.md) for a copy-paste example.
