# Secure asset storage

Lockx treats every vault as a mini smart-contract account controlled by immutable **rules** chosen at deposit time.

| Rule type | On-chain check | Typical use-case |
|-----------|---------------|------------------|
| Time lock | `block.timestamp ≥ unlockTime` | Cold storage, yearly vesting |
| Signature lock | Valid EIP-712 signature from 𝐾 | Hot wallet spending cap |
| Hybrid | Either condition true | Emergency withdrawals after timeout |

---

## Direct asset mapping

Every Lockbox maintains **1:1 on-chain mappings** between its token ID and assets.  Storage slots:

```solidity
mapping(uint256 => uint256) internal _baggedETH;
mapping(uint256 => mapping(address => uint256)) internal _erc20Balances;
mapping(uint256 => address[]) internal _erc20TokenAddresses;

struct BaggedNFT { address nftContract; uint256 nftTokenId; }
mapping(uint256 => bytes32[]) internal _nftKeys;
mapping(uint256 => mapping(bytes32 => BaggedNFT)) internal _nftData;
```

This structure ensures deposits never mix between users and keeps gas low because each asset list is sparse and append-only.

---

## Multi-asset design

One Lockbox ID can simultaneously hold:

* Native ETH balance (mapping `balances[id].eth`)
* Any number of ERC-20 tokens (mapping `erc20Balances[id][token]`)
* A sparse set of ERC-721 NFTs (mapping `erc721Owner[id][token][tokenId]`)

This keeps gas low: you pay one NFT mint + storage slot regardless of how many assets you deposit later.

---

## Your assets, your control

* **No admin keys** – contracts have zero owner modifiers; even the deployer cannot pause or withdraw.
* **Soul-bound NFT** – the vault can’t be `transferFrom`-ed, stopping rug pulls that move assets to new logic.
* **Zero fee structure** – no protocol fees on mint, deposit or withdraw.  Gas cost only.

---

## Internal accounting invariants

Extensive invariant tests (see `foundry/LockxArrayInvariant.t.sol`) ensure:

* Σ(assetBalances) == contract balance per asset type
* Each Lockbox’s ERC-721 set contains **no duplicates** and only tokens owned by the contract
* Total ETH recorded never underflows even with self-destruct donations

---

## Maximum precision guarantees

Lockx never truncates or rounds—balances are written *exactly* as the chain sees them.

### ETH
Stored in wei (1 ETH = 1e18 wei).
```solidity
function _depositETH(uint256 tokenId, uint256 amountETH) internal {
    if (amountETH == 0) return;
    _baggedETH[tokenId] += amountETH;
}
```

### ERC-20 (delta tracking)
Instead of trusting the caller-supplied `amount`, Lockx measures the **delta** in the contract’s balance before/after a `safeTransferFrom`:
```solidity
function _depositERC20(uint256 tokenId, address token, uint256 amount) internal {
    IERC20 t = IERC20(token);
    uint256 before = t.balanceOf(address(this));
    t.safeTransferFrom(msg.sender, address(this), amount);
    uint256 received = t.balanceOf(address(this)) - before;
    if (received == 0) revert ZeroAmount();
    _erc20Balances[tokenId][token] += received;
}
```
The recording is **proof-of-receipt**: if a token charges transfer fees or rebases, only what actually arrived gets booked.

### NFTs
NFTs are stored via a packed `bytes32` key: `keccak256(nftContract, tokenId)`. Look-ups are O(1) and collision-free.


Asset accounting never truncates:

* **ETH**: stored in wei (`uint256`).
* **ERC-20**: the contract tracks raw token units; no 18-decimal assumption.
* **NFTs**: stored as packed `bytes32` keys so enumeration is O(1) per id.

Invariant tests (`foundry/LockxArrayInvariant.t.sol`) continuously assert that on-chain balances equal internal bookkeeping even when fuzzed with forced ETH donations.

---

---

## View your vault contents
Owners can query a full snapshot in **one** call:
```solidity
function getFullLockbox(uint256 tokenId)
    external view returns (
        uint256 bagETH,
        BaggedERC20[] memory erc20Tokens,
        BaggedNFT[]   memory nfts
    ) {
    _requireExists(tokenId);
    if (_erc721.ownerOf(tokenId) != msg.sender) revert NotOwner();
    bagETH = _baggedETH[tokenId];

    address[] storage toks = _erc20TokenAddresses[tokenId];
    erc20Tokens = new BaggedERC20[](toks.length);
    for (uint256 i; i < toks.length; ++i) {
        erc20Tokens[i] = BaggedERC20(toks[i], _erc20Balances[tokenId][toks[i]]);
    }
    // NFT enumeration omitted for brevity
}
```
No pagination required—front-ends get the full state with a single RPC.

---

## Gas optimisations
* **Unchecked loops** where bounds are pre-validated.  
* **Swap-and-pop** for O(1) array removals:
```solidity
function _removeERC20Token(uint256 tokenId, address token) internal {
    uint256 idx = _erc20Index[tokenId][token];
    if (idx == 0) return;
    uint256 last = _erc20TokenAddresses[tokenId].length;
    if (idx != last) {
        address lastTok = _erc20TokenAddresses[tokenId][last-1];
        _erc20TokenAddresses[tokenId][idx-1] = lastTok;
        _erc20Index[tokenId][lastTok] = idx;
    }
    _erc20TokenAddresses[tokenId].pop();
    delete _erc20Index[tokenId][token];
}
```
* **Conditional `_safeMint`** – `Lockx` mints with plain `_mint` for EOAs, saving ~10k gas.
* **Storage refunds** – when a balance hits zero the slot is deleted, clawing back gas.

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
