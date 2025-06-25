# Multi-asset support

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
