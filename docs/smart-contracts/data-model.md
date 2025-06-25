# Data model

The Lockx core contract stores a single `Lock` struct per key that tracks ownership and withdrawal rules.  Below is a simplified mapping of the on-chain fields:

| Field | Type | Notes |
|-------|------|-------|
| `owner` | `address` | Wallet authorised to sign withdrawals |
| `token` | `address` | Zero address represents native ETH |
| `amount` | `uint256` | For ERC-721 the NFT `tokenId` is cast into this slot |
| `unlockTime` | `uint40` | Unix timestamp after which a withdrawal *may* be executed without a signature |
| `nonce` | `uint32` | Increments on every successful withdrawal to prevent replay |

For the full struct definition see `ILockx.Lock` in the Solidity contracts.
