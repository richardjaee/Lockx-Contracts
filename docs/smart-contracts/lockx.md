# Lockx contract – function walkthrough

This page walks through the key public & external functions of **`Lockx.sol`** and explains how each one is secured and optimised.

> Source: [`contracts/Lockx.sol`](https://github.com/richardjaee/Lockx-Contracts/blob/main/contracts/Lockx.sol)

---

---

## Mint & bag flows

Each lock is a small struct:

```solidity
struct Lock {
    address owner;      // who can authorise release
    address token;      // 0x0 for ETH, otherwise ERC-20/721/1155 contract
    uint256 amount;     // or tokenId for NFTs
    uint40  unlockTime; // optional: after this timestamp a withdrawal is allowed
    uint32  nonce;      // bumps on every withdrawal to stop replays
}
```

Mappings:

```solidity
mapping(bytes32 => Lock) public locks;   // key = keccak(owner, token, id)
```

The contract itself never holds funds directly—assets live in the `Deposits` helper until released.

---

## Key functions

| Function | What it does |
|----------|--------------|
| `lock(token, amount, unlockTime)` | Creates a new lock and emits `LockCreated` |
| `increaseAmount(key, delta)` | Lets the owner top-up a position (saves gas vs new lock) |
| `withdraw(WithdrawRequest req, bytes sig)` | Validates EIP-712 signature (or time lock) and transfers out |
| `cancel(key)` | Deletes a lock before it is funded; safety valve for UX errors |

---

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
* [Deposits functions](deposits.md) · [Withdrawals functions](withdrawals.md) · [Signature verification](signature-verification.md)

```ts
await lockx.lock(dai.address, utils.parseUnits("1000"), 0);

// later …
const message = {
  key,
  amount: utils.parseUnits("1000"),
  nonce,
  deadline: BigInt(Date.now() / 1000 + 600)
};
const sig = await wallet.signTypedData(domain, types, message);
await withdrawals.withdraw(message, sig);
```

---

## Events

* `LockCreated(bytes32 key, address owner, address token, uint256 amount)`
* `LockToppedUp(bytes32 key, uint256 delta)`
* `Withdrawn(bytes32 key, uint256 amount)`

The API reference contains full signatures.

---

## Upgradeability

Lockx is **not** upgradeable; immutability makes auditing simpler.  New features come via optional helper contracts, leaving existing locks untouched.

