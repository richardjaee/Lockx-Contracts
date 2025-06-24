# Soulbound nature

Lockboxes are **non-transferable NFTs** compliant with [EIP-5192](https://eips.ethereum.org/EIPS/eip-5192). Once minted they are *soul-bound* to your wallet for life—no admin can migrate, claw back, or pause transfers because transfers are disabled at the contract level.

---

## Why soul-bound?

* Prevents phishing or marketplace mis-listing.  
* Guarantees the vault key can’t be sold or accidentally sent to a burn address.  
* Simplifies auditing—no hidden “escape hatch” that could drain the box.

---

## Standard interface

```solidity title="IERC5192"
/// @dev Minimal interface for soul-bound tokens
interface IERC5192 {
    /// Emitted exactly once when the token becomes locked
    event Locked(uint256 tokenId);

    /// Emitted if a token ever becomes unlocked (not used in Lockx)
    event Unlocked(uint256 tokenId);

    /// MUST always return true for every existing Lockbox
    function locked(uint256 tokenId) external view returns (bool);
}
```

Lockx emits the `Locked` event during mint and overrides `locked()` to always return `true`.

---

## Transfer prevention

```solidity title="_transfer override"
/// Disable *any* transfer—soul-bound enforcement
function _transfer(address, address, uint256) internal pure override {
    revert TransfersDisabled();
}
```

All ERC-721 transfer pathways (`transferFrom`, `safeTransferFrom`, approvals) eventually call `_transfer`, so this single override is sufficient.

!!! danger "Irreversible"
    Once minted, the NFT **cannot** be moved to another wallet. If you lose access to the original wallet you will need to rely on your key-management choice (self-custody seed phrase, or Lockx key-fraction recovery) to regain control.

---

## Locked event flow

```solidity title="Mint flow"
uint256 tokenId = _tokenIdCounter.current();
_tokenIdCounter.increment();

_safeMint(to, tokenId);
emit Locked(tokenId);          // ← EIP-5192 compliance
initialize(tokenId, pubKey);   // contract-specific setup
```

External indexers can listen for `Locked` events to catalogue all Lockboxes.


Set the `soulbound` flag to mark a lock as non-transferable. Tokens stay tied to the original owner; even after withdrawal they can only be sent back to the same wallet. Good for holdings you never want to mix with a hot wallet.
