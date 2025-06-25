# Secure asset storage

Lockx treats every vault as a mini smart-contract account controlled by immutable **rules** chosen at deposit time.

| Rule type | On-chain check | Typical use-case |
|-----------|---------------|------------------|
| Time lock | `block.timestamp ≥ unlockTime` | Cold storage, yearly vesting |
| Signature lock | Valid EIP-712 signature from 𝐾 | Hot wallet spending cap |
| Hybrid | Either condition true | Emergency withdrawals after timeout |

---

## Multi-asset design

One Lockbox ID can simultaneously hold:

* Native ETH balance (mapping `balances[id].eth`)
* Any number of ERC-20 tokens (mapping `erc20Balances[id][token]`)
* A sparse set of ERC-721 NFTs (mapping `erc721Owner[id][token][tokenId]`)

This keeps gas low: you pay one NFT mint + storage slot regardless of how many assets you deposit later.

---

## Internal accounting invariants

Extensive invariant tests (see `foundry/LockxArrayInvariant.t.sol`) ensure:

* Σ(assetBalances) == contract balance per asset type
* Each Lockbox’s ERC-721 set contains **no duplicates** and only tokens owned by the contract
* Total ETH recorded never underflows even with self-destruct donations

---

## Re-entrancy and approvals

* All external calls use the *checks-effects-interactions* pattern.
* ERC-721 transfers rely on `safeTransferFrom`, which reverts if the recipient is not the Lockx contract.
* The contract is fully non-reentrant via OpenZeppelin `ReentrancyGuard`.

---

## Gas snapshot (v1.0.0)

| Function | Gas (cold) | Gas (warm) |
|----------|-----------|-----------|
| `depositETH` | 42,188 | 19,037 |
| `withdrawETH` | 56,774 | 32,121 |
| `depositERC20` | 65,922 | 37,110 |
| `withdrawERC20` | 78,341 | 50,228 |

See [gas reference](../gas-reference.md) for full breakdown.


A lockbox keeps assets under time- or signature-based control. You decide Rules at creation and no one—including the Lockx deployer—can bypass them.

* **Time lock** – set `unlockTime` only.
* **Signature lock** – require an EIP-712 signature.
* **Hybrid** – allow either once the time has passed.

The lock can be topped up any time without changing its rules.
