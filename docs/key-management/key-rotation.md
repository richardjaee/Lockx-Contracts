# Key rotation

Regular rotation invalidates old keys without moving assets.

**Checklist**

1. Generate new EOA (Ledger, Safe, or KFT).
2. Sign RotateKey message with _current_ key.
3. Call `rotateLockboxKey` before the signature deadline.
4. Backup the new key; delete the old one.

---

Rotating the Lockx key lets you invalidate an old signing key and assign a new one **without moving the assets**.  Use it routinely (e.g. every 6 months) or immediately after any suspected compromise.

---

## How to rotate

1. Generate a fresh EOA (hardware wallet or key-fraction).
2. Sign a **RotateKey** EIP-712 message with the *current* Lockx key.
3. Call `rotateLockboxKey` on-chain with the parameters below.

### Solidity

```solidity
/**
 * @dev Rotates the Lockx public key associated with a Lockbox.
 */
function rotateLockboxKey(
    uint256  tokenId,
    bytes32  messageHash,
    bytes    calldata signature,
    address  newPublicKey,
    bytes32  referenceId,
    uint256  signatureExpiry
) external {
    _requireOwnsLockbox(tokenId);
    if (block.timestamp > signatureExpiry) revert SignatureExpired();

    bytes memory data = abi.encode(
        tokenId, newPublicKey, referenceId, msg.sender, signatureExpiry
    );
    verifySignature(
        tokenId,
        messageHash,
        signature,
        newPublicKey,
        OperationType.ROTATE_KEY,
        data
    );
    emit KeyRotated(tokenId, referenceId);
}
```

---

## Parameters

| Param | Description |
|-------|-------------|
| `tokenId` | Lockbox NFT being updated |
| `messageHash` | Hash of the EIP-712 message signed by the current key |
| `signature` | Signature proving ownership of the current key |
| `newPublicKey` | Address of the new Lockx key |
| `referenceId` | Optional off-chain reference string |
| `signatureExpiry` | Unix timestamp after which the signature is invalid |

---

## Flow overview

1. **Owner** signs the rotate message with the *current* Lockx key.
2. Transaction calls `rotateLockboxKey`.
3. Contract verifies signature, deadline and nonce.
4. Internal mapping is updated to `newPublicKey` and an event is emitted.
5. Subsequent withdrawals must be signed by the **new** key.

!!! warning "Irreversible"
    If you lose access to the *new* key before performing another rotation, the assets are locked permanently.  Keep multiple secure backups or use key-fraction for recovery.

Use `rotateOwner(bytes32 key, address newOwner)` (coming in v2) to migrate control without touching the assets. Requires a signature from both old and new owners.
