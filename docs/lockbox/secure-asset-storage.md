# Secure asset storage

Lockx Lockboxes operate as **tokenised safe-deposit boxes** inside your wallet. Every asset you deposit retains a 1 : 1 on-chain mapping to the NFT’s `tokenId`, guaranteeing provable ownership **without any admin keys or upgrade hooks**.

---

## Direct asset mapping

The core contract keeps separate, gas-optimised mappings for ETH, ERC-20 and ERC-721 so each balance can be queried independently:

```solidity title="Storage excerpts"
// ETH balances – simple and cheap
mapping(uint256 => uint256) internal _baggedETH;

// ERC-20 balances with "known token" enumeration
mapping(uint256 => mapping(address => uint256)) internal _erc20Balances;
mapping(uint256 => address[])              internal _erc20TokenAddresses;
mapping(uint256 => mapping(address => bool)) internal _erc20Known;

// ERC-721 metadata keyed by hashed composite key
struct BaggedNFT { address nftContract; uint256 nftTokenId; }

mapping(uint256 => bytes32[]) internal _nftKeys;
mapping(uint256 => mapping(bytes32 => BaggedNFT)) internal _nftData;
mapping(uint256 => mapping(bytes32 => bool))      internal _nftKnown;
```

These structures ensure every asset is **deterministically linked** to the Lockbox token and cannot be orphaned or swept by contract upgrades.

!!! success "Your assets, your control"
    • No admin back-doors  
    • No pausability modifiers  
    • No upgradeable proxies  
    Only the rightful NFT owner can initiate withdrawals.

!!! info "Zero-fee smart contracts"
    Minting, deposits and withdrawals have **no built-in fees, limits, or hidden tokenomics**.  The only cost is network gas.

---

## Maximum-precision bookkeeping

### ETH (wei-level)

```solidity
function _depositETH(uint256 tokenId) internal payable {
    require(msg.value > 0, "Zero ETH");
    _baggedETH[tokenId] += msg.value; // full 10^18 wei precision
}
```

### ERC-20 (delta tracking)

Instead of trusting the requested `amount`, the contract measures the **actual balance delta** before/after `safeTransferFrom`:

```solidity
function _depositERC20(uint256 tokenId, address token, uint256 amount) internal {
    IERC20 t = IERC20(token);

    if (!_erc20Known[tokenId][token]) {
        _erc20TokenAddresses[tokenId].push(token);
        _erc20Known[tokenId][token] = true;
    }

    uint256 beforeBal = t.balanceOf(address(this));
    t.safeTransferFrom(msg.sender, address(this), amount);
    uint256 delta = t.balanceOf(address(this)) - beforeBal;
    if (delta == 0) revert("Zero amount transferred");

    _erc20Balances[tokenId][token] += delta;
}
```

This approach survives fee-on-transfer tokens and rebasing mechanics while **always recording the exact value received**.

---

## Viewing contents

```solidity
function getFullLockbox(uint256 tokenId)
    external view
    returns (uint256 bagETH, BaggedERC20[] memory erc20, BaggedNFT[] memory nfts)
{
    require(ownerOf(tokenId) == msg.sender, "Not owner");
    bagETH = _baggedETH[tokenId];

    address[] storage addrs = _erc20TokenAddresses[tokenId];
    erc20 = new BaggedERC20[](addrs.length);
    for (uint256 i; i < addrs.length; ++i) {
        erc20[i] = BaggedERC20(addrs[i], _erc20Balances[tokenId][addrs[i]]);
    }

    // NFT enumeration omitted for brevity
}
```

Only the NFT owner can call this view, ensuring privacy while still allowing third-party indexers to derive balances from on-chain events.

---

## Gas optimisations

* **Swap-and-pop** array deletions  
* **Unchecked** counter increments where overflow is impossible  
* **Conditional `_safeMint`** (only for contract recipients)  
* **Full storage cleanup** when a balance hits zero – earns gas refunds  
* Minimal structs: single‐slot primitives wherever possible

```solidity title="Swap-and-pop helper"
function _removeERC20(uint256 tokenId, address token) internal {
    address[] storage arr = _erc20TokenAddresses[tokenId];
    uint256 len = arr.length;
    for (uint256 i; i < len; ++i) {
        if (arr[i] == token) {
            arr[i] = arr[len - 1];
            arr.pop();
            break;
        }
    }
}
```

With these patterns a **single-asset withdrawal** costs <80k gas on mainnet.


A lockbox keeps assets under time- or signature-based control. You decide Rules at creation and no one—including the Lockx deployer—can bypass them.

* **Time lock** – set `unlockTime` only.
* **Signature lock** – require an EIP-712 signature.
* **Hybrid** – allow either once the time has passed.

The lock can be topped up any time without changing its rules.
