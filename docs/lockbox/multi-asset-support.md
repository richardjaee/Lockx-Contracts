# Multi-asset support

One Lockbox can hold fungible **and** non-fungible assets behind the same withdrawal policy.  Gas stays low because the Lockbox NFT already anchors all bookkeeping.

| Asset type | How to deposit | How to withdraw |
|------------|---------------|-----------------|
| ETH | Send `value` with `depositETH(tokenId)` or create a new Lockbox with `createLockboxWithETH()` | `withdrawETH(tokenId, amount, recipient, …)` |
| ERC-20 | `approve(lockx, amount)` then `depositERC20(token, amount, tokenId)` | `withdrawERC20(tokenId, token, amount, recipient, …)` |
| ERC-721 | `safeTransferFrom(msg.sender, lockx, id)` → triggers `depositERC721` | `withdrawERC721(tokenId, token, id, recipient, …)` |
| ERC-1155 (coming) | `safeBatchTransferFrom` → `depositERC1155Batch` | `withdrawERC1155Batch` |

---

## Batch operations

Lockx lets you **bundle** ETH, ERC-20s and NFTs in a single tx.

### Batch deposit
```solidity
function batchDeposit(
    uint256 tokenId,
    uint256 amountETH,
    address[] calldata tokens,
    uint256[] calldata amounts,
    address[] calldata nftContracts,
    uint256[] calldata nftIds,
    bytes32 ref
) external payable
```
* Verifies `msg.value == amountETH` and length matches.
* Pushes each asset through the regular `_deposit*` helpers inside `unchecked` loops.
* Emits one `DepositedBatch` event.

### Batch unbag / withdraw
Same idea with a **single** `verifySignature` call:
```solidity
function batchUnbag(
    uint256 tokenId,
    bytes32 msgHash,
    bytes   sig,
    uint256 amountETH,
    address[] calldata tokens,
    uint256[] calldata amounts,
    address[] calldata nftContracts,
    uint256[] calldata nftIds,
    address recipient,
    uint256 expiry
) external
```
* Validates `block.timestamp ≤ expiry`.
* Signature covers **all** arrays, so any tampering invalidates the op.

#### Why batch?
* Cuts gas up to 40 % vs separate calls.
* Simplifies portfolio rebalances (e.g. move 1 ETH + 2 NFTs to cold wallet).
* Keeps the nonce monotonic – one increment per portfolio action.

!!! warning "Soft gas limit"
    Because NFT loops are storage-heavy we advise ≤3 distinct assets per batch on mainnet to avoid block gas limits. Layer-2s have ample headroom.

---

## Internal storage layout

```solidity
struct Balances {
    uint256 eth;
    mapping(address => uint256) erc20;          // token => amount
}

mapping(uint256 => Balances)          _balances;       // by Lockbox id
mapping(uint256 => mapping(address => mapping(uint256 => bool))) _erc721Owned; // id ⇒ token ⇒ tokenId ⇒ owned?
```

This layout gives O(1) look-ups while keeping the storage footprint minimal.

---

## Roadmap

* **ERC-1155 batch** deposits & withdrawals — Q3 2025.
* **ERC-4626 vault tokens** (yield strategies) — research phase.
* **Bitcoin & Solana bridged assets** — depends on zero-trust bridge milestones (see [roadmap](../roadmap.md)).

A single Lockbox can hold ETH, ERC-20s **and** NFTs, letting you group related assets behind the same withdrawal policy.

| Asset type | Interface | How it’s deposited |
|------------|-----------|--------------------|
| ETH | Native | Send `value` along with `createLockboxWithETH` or `depositETH` |
| ERC-20 | IERC20 | `approve()` then call `depositERC20(token, amount)` |
| ERC-721 | IERC721 | `safeTransferFrom()` into `depositERC721(token, id)` |
| ERC-1155 | IERC1155 | `safeBatchTransferFrom()` into `depositERC1155(token, id, amount)` *(batch coming soon)* |

!!! tip "Bundle gas guidance"
    For lowest failure risk stick to ≤3 assets per bundle.  As L2 gas costs drop we’ll raise this soft limit.

---

## Internal accounting

Each Lockbox stores an array of `Asset` structs:

```solidity
struct Asset {
    AssetType  assetType;   // 0 = ETH, 1 = ERC20, 2 = ERC721, 3 = ERC1155
    address    token;
    uint256    id;          // 0 for fungible types
    uint256    amount;      // 1 for NFTs
}
```

On withdrawal the contract iterates over the array and calls the correct transfer primitive (`call`, `transfer`, `safeTransferFrom`, etc.) depending on `assetType`.

---

## Roadmap

* **ERC-1155 batch deposits & withdrawals** – Q3 2025
* **ERC-4626 yield-vault support** – research phase


Lockx supports:

* **ETH** – native transfers via `lock{value:…}`
* **ERC-20** – any standard token
* **ERC-721** – single NFTs
* **ERC-1155** – individual ids (batch lock coming soon)

Each lock stores the token address and—if applicable—the id.
