# Lockx contract – function walkthrough

This page walks through the key public & external functions of **`Lockx.sol`** and explains how each one is secured and optimised.  Code links point to the latest commit on the `main` branch.

> Source: [`contracts/Lockx.sol`](https://github.com/richardjaee/Lockx-Contracts/blob/main/contracts/Lockx.sol)

---

## Mint & bag flows

### createLockboxWithETH
```solidity
function createLockboxWithETH(address to,
                               address lockboxPublicKey,
                               bytes32 referenceId) external payable
```
* **Purpose** – mints a new Lockbox NFT and deposits `msg.value` ETH in one atomic action.
* **Key checks**  
  • `to` must be the caller (self-mint only)  
  • `lockboxPublicKey` ≠ `0x0`  
  • `msg.value` > 0
* **Flow**  
  1. Increment `_nextId`, mint NFT (`_mint`)  
  2. `initialize()` sets public key & nonce in `SignatureVerification`  
  3. `_depositETH()` books the ETH  
  4. Emit `Locked` (ERC-5192) and `Minted`
* **Gas notes** – uses `_mint` instead of `_safeMint` (caller is always an EOA), saving ~10k gas.

---

### createLockboxWithERC20
*Same signature pattern as above, plus token address & amount.*

Highlights:
* Pulls tokens via `safeTransferFrom` inside `_depositERC20`, then books **delta** to protect against fee-on-transfer tokens.
* Reverts with `ZeroAmount` if no tokens actually arrive.

### createLockboxWithERC721
*Deposits a single NFT.* Calls `_depositERC721` which performs the `safeTransferFrom` and stores `(contract, tokenId)` keyed by `keccak256(contract, id)`.

### createLockboxWithBatch
Deposits a mix of ETH / ERC-20 / ERC-721 in one go.
* Validates array lengths and `msg.value == amountETH`.
* Delegates to `_batchDeposit` (in `Deposits`).

---

## Metadata management

### setDefaultMetadataURI
```solidity
function setDefaultMetadataURI(string memory newDefaultURI) external onlyOwner
```
* One-shot owner function to set a base URI.
* Guarded by `_defaultURISet` to prevent re-writes (immutability once set).

### setTokenMetadataURI
EIP-712 signature-gated per-token metadata override.
* Verifies ownership + signature + expiry.  
* Updates `_tokenMetadataURIs[tokenId]` and emits `TokenMetadataURISet`.

### tokenURI
Returns custom → default → **revert** (no URI). Reads storage once and short-circuits for efficiency.

---

## Soul-bound enforcement

### locked
Always returns `true` if the token exists – required by ERC-5192.

### _transfer (overridden)
```solidity
function _transfer(address,address,uint256) internal pure override {
    revert TransfersDisabled();
}
```
Unconditionally reverts to disable any secondary sales or accidental transfers.

---

## Fallbacks
Both `receive()` and `fallback()` revert with explicit custom errors. Users must call the typed deposit functions; random ETH sends are rejected.

---

## Events
* `Locked` – ERC-5192 compliance.  
* `Minted` – emitted once per new Lockbox (with `referenceId`).  
* `TokenMetadataURISet` – per-token metadata updates.

---

Continue to the abstract helper contracts:
* [Deposits functions](deposits-functions.md) *(coming next)*
