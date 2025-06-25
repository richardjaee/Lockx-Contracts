# Two-factor protection

Lockx supports optional **2-factor signing** to harden withdrawals.

| Factor | Example device | Role |
|--------|----------------|------|
| Primary | Ledger / Trezor (desktop) | Holds 𝑘ᵁ fraction & initiates transaction |
| Secondary | MetaMask Mobile / Rabby (phone) | Confirms by signing the same EIP-712 payload |

---

## Flow

1. Primary wallet calls `prepareWithdraw` to fetch a QR-encoded EIP-712 payload.
2. Secondary wallet scans the QR, reviews details, signs → returns `signature2`.
3. Front-end combines `signature1` + `signature2` (or KFT signature) and submits `withdraw*`.
4. Contract verifies both signatures **and** the standard nonce/deadline.

If either device is lost you can rotate the Lockx key (see [key rotation](key-rotation.md)).
