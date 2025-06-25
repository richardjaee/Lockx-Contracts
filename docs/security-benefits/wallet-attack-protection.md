# Wallet attack protection

Even if your **hot wallet** is compromised, Lockx blocks a drain attack through _four_ independent layers:

| Threat | Lockx mitigation |
|--------|-----------------------|
| Seed-phrase leak | Assets sit inside a **soul-bound Lockbox NFT**.  Withdrawals need a Lockx signature (KFT or EIP-712) so the attacker needs **two** keys, not one. |
| Phishing pop-ups | Only **structured EIP-712** messages are valid.  Amounts, recipient, chainId, deadline are plain-text – no opaque blobs. |
| Drainer contracts | The Lockbox NFT cannot be `transferFrom`-ed.  Attackers cannot side-step the withdrawal rules. |
| Malicious airdrops | Only the owner can deposit.  Airdrops inside a Lockbox cannot execute code. |

!!! note "Open standards only"
    Lockx sticks to vanilla Ethereum standards (ERC-20/721, EIP-712).  No off-chain oracle or proprietary SDK – assets stay accessible even if the front-end disappears.

