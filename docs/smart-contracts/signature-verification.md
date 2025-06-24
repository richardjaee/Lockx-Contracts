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
