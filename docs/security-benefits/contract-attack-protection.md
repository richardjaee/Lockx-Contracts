# Contract attack protection

Lockx contracts follow battle-tested patterns and add extra layers to block common smart-contract exploits.

| Attack vector | Mitigation in Lockx |
|--------------|---------------------|
| **Reentrancy** | Every external entry point uses OpenZeppelin’s `nonReentrant` modifier.  State is updated (effects) **before** tokens are transferred (interactions). |
| **Signature replay** | Each Lockbox tracks a **monotonically-increasing nonce**.  The nonce is embedded in every EIP-712 message and auto-incremented after a successful withdrawal/change, so a signature is valid exactly once. |
| **Transaction-ordering manipulation (front-running / sandwich)** | Withdraw signatures include a `deadline` and unique `referenceId`.  A transaction arriving after `deadline` or re-using an old `referenceId` reverts, limiting the window for MEV attacks. |
| **Unexpected ETH sends / self-destruct griefing** | ETH is pulled, not pushed; the contract does not implement a `receive()` function, so unsolicited ETH is irrecoverable but cannot break logic. |
| **Upgradeability foot-guns** | The core Lockx contract is **non-upgradeable** (no proxy), reducing governance / implementation risk. |

## Sample: nonReentrant guard

```solidity
function unbagETH(
    uint256 tokenId,
    bytes32 messageHash,
    bytes calldata signature,
    uint256 amount,
    address recipient,
    bool burnToken,
    bytes32 referenceId
) external nonReentrant {
    // effects: update balances
    _decreaseBalance(tokenId, amount);

    // interactions: transfer ETH after state change
    (bool ok, ) = recipient.call{value: amount}("");
    require(ok, "ETH_XFER_FAIL");
}
```


The core code follows battle-tested patterns:

* Re-entrancy guard on every external entry point
* Checks-effects-interactions order when moving tokens
* Pull over push for ETH payments
* No upgradeability ⇒ smaller attack surface
