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

---

## Trustless TOTP management

Lockx’s 2-factor codes are generated with the **same key-fraction framework**:

* TOTP secret is never stored in full—only a server-side fraction (encrypted in Google Cloud KMS, FIPS-3 HSM) and a user fraction contained in your wallet signature.
* The 6-digit code is required to decrypt the backend fraction before any key derivation or export.
* No central database of TOTP secrets exists → nothing useful to steal.

### Compatible authenticator apps

Google Authenticator · Twilio Authy · Microsoft Authenticator · any TOTP-compatible wallet/app.

---

## Withdrawal flow with 2FA

1. Primary wallet calls `prepareWithdraw` which returns a QR-encoded EIP-712 payload.
2. Secondary device scans the QR, reviews the fields, enters the 6-digit code, signs, and returns `signature2`.
3. Front-end submits `signature1 + signature2` to the chosen `withdraw*` method.
4. Contract checks both signatures, the TOTP hash, and the nonce/deadline before releasing funds.

This ensures that compromising *either* device is not enough—an attacker would still need the current 6-digit code and the other signature within the short validity window.
