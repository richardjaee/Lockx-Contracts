# Contract attack protection

Lockx follows hardened patterns plus extra guards to block common exploits.

| Attack | Mitigation |
|--------------|---------------------|
| Reentrancy | `nonReentrant` on every external entry + checks-effects-interactions order. |
| Signature replay | Per-Lockbox **incrementing nonce** embedded in every EIP-712 message. |
| MEV / front-run | Signatures carry `deadline` + unique `referenceId`; stale txs revert. |
| Grief ETH sends | Contract has no `receive()`; unsolicited ETH cannot affect logic. |
| Proxy misuse | Core contract is **non-upgradeable**; smaller surface. |

## Code example: nonReentrant guard

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

