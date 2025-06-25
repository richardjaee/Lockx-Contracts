# Contract attack protection

Lockx smart contracts combine OpenZeppelin battle-tested primitives with extra layers (nonces, deadlines, immutable core) to thwart the major Ethereum contract exploits seen in real-world hacks 2016-2025.

| Threat | Without Lockx | Lockx defence |
|--------|--------------|---------------|
| Reentrancy | External call before state update → drain | `nonReentrant` + checks-effects-interactions on every `withdraw*`. |
| Signature replay | Same signed payload drains twice | Per-Lockbox **nonce++** after every successful verify. |
| MEV/front-run | Miner reorders tx to profit | Typed data includes `deadline` + `referenceId` → late tx reverts. |
| Unauthorized call | Anyone calls internal burn/rotate | Ownership check `ownerOf(tokenId)==msg.sender` + dual-signature. |
| Logic upgrade rug | Proxy admin swaps impl | No proxy. Contract is final & immutable. |

---

## Deep-dive scenarios

### 1. Reentrancy

Attacker contract uses `fallback()` to re-enter before balances update.

Lockx counter-measures:

* `nonReentrant` modifier on every external entry.
* Internal pattern: *checks → effects → interactions*.
* Unit + Foundry invariant tests keep `Σ(balances) == addr.balance`.

```solidity
function withdrawETH(uint256 tokenId, bytes32 msgHash, bytes calldata sig,
    uint256 amount, address recipient, bytes32 refId, uint256 expiry)
    external nonReentrant {
    _requireOwnsLockbox(tokenId);
    if (block.timestamp > expiry) revert SignatureExpired();
    verifySignature(tokenId, msgHash, sig, address(0), OperationType.WITHDRAW_ETH,
        abi.encode(tokenId, amount, recipient, refId, expiry));
    _ethBalances[tokenId] -= amount;
    (bool ok,) = payable(recipient).call{value: amount}("");
    if (!ok) revert EthTransferFailed();
}
```

### 2. Signature replay

* Mitigation: `tokenNonce[tokenId]` increments inside `verifySignature`.  Any reused signature fails `!= currentNonce`.

### 3. Transaction ordering / MEV

* Every `Withdraw*` struct embeds `deadline` (unix seconds) and `referenceId` (hash chosen by user).
* Front-run tx mined after the deadline => **revert**.
* Duplicate referenceIds rejected in backend UX.

### 4. Unauthorized function access

* All mutating functions check `ownerOf(tokenId)`.
* Dual-authorization: wallet **and** Lockx key signature.

### 5. Grief ETH send & self-destruct

Contract has no `receive()`; forced ETH increases internal `address(this).balance` but invariant tests treat surplus as donation – never underflow.

---

```solidity
function withdrawETH(
    uint256 tokenId,
    bytes32 messageHash,
    bytes calldata signature,
    uint256 amountETH,
    address recipient,
    bytes32 referenceId,
    uint256 signatureExpiry
) external nonReentrant {
    _requireOwnsLockbox(tokenId);
    if (block.timestamp > signatureExpiry) revert SignatureExpired();

    // 1) Verify signature & update nonce
    bytes memory data = abi.encode(
        tokenId,
        amountETH,
        recipient,
        referenceId,
        msg.sender,
        signatureExpiry
    );
    verifySignature(
        tokenId,
        messageHash,
        signature,
        address(0),
        OperationType.WITHDRAW_ETH,
        data
    );

    // 2) Effects: update internal balance
    uint256 bal = _ethBalances[tokenId];
    if (bal < amountETH) revert NoETHBalance();
    _ethBalances[tokenId] = bal - amountETH;

    // 3) Interaction: transfer ETH after state changes
    (bool s, ) = payable(recipient).call{value: amountETH}("");
    if (!s) revert EthTransferFailed();
}
```

