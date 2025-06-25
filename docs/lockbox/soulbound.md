# Soul-bound nature (EIP-5192)

Lockboxes mint as **soul-bound NFTs** – they cannot be transferred, approved, or listed. Assets remain tied to the original wallet until a valid Lockx withdrawal executes.

| Benefit | Why it matters |
|---------|---------------|
| Anti-phishing | Attackers cannot trick you into "gift" transfers. |
| Leak containment | A stolen seed is useless without a Lockx signature. |
| Clean portfolio | Marketplaces hide ERC-5192 tokens by default. |

---

## Standard compliance

Lockx implements the ERC-5192 *Minimal Soulbound NFT* standard.  Two core hooks enforce the behaviour:

```solidity
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { IERC5192 } from "erc-5192/IERC5192.sol";

contract Lockx is ERC721, IERC5192 {
    /// Always true – every existing Lockbox is locked (soul-bound)
    function locked(uint256 tokenId) external view override returns (bool) {
        if (!_exists(tokenId)) revert NonexistentToken();
        return true;
    }

    /// Disable any transfer – soul-bound enforcement
    function _transfer(address, address, uint256) internal pure override {
        revert TransfersDisabled();
    }

    /// Report ERC-5192 support alongside ERC-721 and ERC-165
    function supportsInterface(bytes4 id) public view override returns (bool) {
        if (id == type(IERC5192).interfaceId) return true;
        return super.supportsInterface(id);
    }
}
```

### Why not `safeTransferFrom`?

Because `_transfer` is overridden to **always revert**, even internal calls to the standard `safeTransferFrom`/`transferFrom` helpers fail.  Marketplaces see the ERC-5192 interface and automatically hide Lockboxes from listings.

---

## Security benefits

* Prevents accidental or malicious transfers of the Lockbox NFT itself.
* Shields bagged assets if the wallet’s seed phrase is leaked – the attacker still needs a valid Lockx signature to withdraw assets.
* Eliminates approval scams that rely on users moving their NFTs to phishing contracts.

---

## Common questions

**Can I migrate to a new wallet?**  Yes.  Withdraw your assets to the new address, then burn the empty Lockbox (or simply leave it – it costs no gas to store).

**Can I renounce soul-bound behaviour?**  No.  It is a deliberate safety feature.  Use a new Lockbox if you require a transferrable wrapper.

