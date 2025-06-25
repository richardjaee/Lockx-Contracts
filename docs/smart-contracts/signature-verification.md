# Signature verification

Lockx relies on EIP-712 typed data so withdrawals can be authorised off-chain and relayed by anyone. This reduces gas costs for the owner and allows social-recovery flows.

## Domain separator

```
name:   "Lockx"
version:"1"
chainId:getChainId()
verifyingContract: Withdrawals
```

## Types

```solidity
type WithdrawRequest {
  bytes32 key;
  uint256 amount;
  uint32  nonce;
  uint40  deadline;
}
```

The full type-hash is pre-computed as `_WITHDRAW_TYPEHASH` to save gas.

## Signing in JavaScript

```ts
import { ethers } from "ethers";
const domain = { name: "Lockx", version: "1", chainId, verifyingContract: withdrawals.address };
const types = { WithdrawRequest: [
  { name: "key", type: "bytes32" },
  { name: "amount", type: "uint256" },
  { name: "nonce", type: "uint32" },
  { name: "deadline", type: "uint40" }
]};

const value = { key, amount, nonce, deadline };
const sig = await wallet._signTypedData(domain, types, value);
```

Pass `sig` to `withdrawals.withdraw(value, sig)`.

## Gas and security notes

* Using EIP-712 avoids `eth_sign` replay across chains.
* Nonce bumping makes signatures single-use.
* A short `deadline` (e.g. 10 minutes) limits risk if the signature leaks.

---

## Function walkthrough

### initialize
```solidity
function initialize(uint256 tokenId, address lockboxPublicKey) internal
```
* Called once by `Lockx` during minting.
* Writes `activeLockboxPublicKey` and sets starting `nonce = 1`.
* Guards with `AlreadyInitialized`.

### verifySignature
Central authorisation gate used by **every** sensitive function.
```solidity
function verifySignature(uint256 tokenId,
                         bytes32 messageHash,
                         bytes signature,
                         address newLockboxPublicKey,
                         OperationType opType,
                         bytes data) internal
```
Flow:
1. Compute `dataHash = keccak256(data)`.
2. Build `structHash = keccak256(OPERATION_TYPEHASH, tokenId, nonce, opType, dataHash)`.
3. Hash with `_hashTypedDataV4` (EIP-712 domain) → `expectedHash`.
4. Require `messageHash == expectedHash` else `InvalidMessageHash`.
5. Recover signer via `ECDSA` and compare to `activeLockboxPublicKey`; else `InvalidSignature`.
6. Increment `nonce` (`++`) to make sig one-use.
7. If `opType == ROTATE_KEY` update key to `newLockboxPublicKey` (non-zero).

### OperationType enum
Enumerates every action protected by a signature. Numeric values are stable:
| Value | Action |
|-------|--------|
| 0 | ROTATE_KEY |
| 1 | WITHDRAW_ETH |
| 2 | WITHDRAW_ERC20 |
| 3 | WITHDRAW_NFT |
| 4 | BURN_LOCKBOX |
| 5 | SET_TOKEN_URI |
| 6 | BATCH_WITHDRAW |

### getActiveLockboxPublicKeyForToken / getNonce
Both are `onlyTokenOwner` view helpers so owners can fetch current auth state for signing.

### _purgeAuth
Internal cleanup called by `burnLockbox` after assets are cleared to maximise storage refund.

---

With this, the EIP-712 engine is fully covered. Return to the [overview](overview.md) or jump back to a specific helper contract if needed.
