# Key fraction technology

Lockx offers an optional **key-fraction** tier for users that prefer extra security without losing self-custody.  Instead of storing a full private key anywhere, the key is deterministically re-derived on-demand from *two* independent pieces – one held by you, the other held (encrypted) by Lockx.

---

## Zero-trust architecture

!!! tip "No single point of compromise"
    Neither Lockx nor the user ever holds the entire key at rest.  A thief would need to breach *both* sides **and** pass 2-factor authentication within the short signature window.

---

## How it works

1. **User authentication** – the dApp asks you to sign a fresh session message containing a random **client fraction**.
2. **Server fraction** – Lockx stores an encrypted random fraction in Google Cloud KMS backed by FIPS-3 HSMs.
3. **Ephemeral key derivation** – when you initiate an operation (withdrawal, key rotation, etc.) the two fractions are hashed together to create a one-time ECDSA key pair.
4. **Expiring signature** – the derived private key signs a typed EIP-712 message that includes `deadline`, nonce and operation fields.  The signature is valid for minutes, not days.
5. **Immediate cleanup** – the private key is wiped from memory.  To sign again the fractions must be recombined, so there is no lingering secret.

---

## Security benefits

* No full private key ever exists on disk.  A database leak reveals nothing useful.
* Derivation requires both your wallet **and** server-side KMS (protected by 2FA).
* Each signature is time-boxed → replay window is tiny.
* Fractions can be rotated independently, giving you proactive defence if a device is lost.

---

## Comparison of tiers

| Tier | Who holds key? | Platform fee | Ideal for |
|------|----------------|-------------|-----------|
| **Self-custody** | User stores full private key (e.g. hardware wallet) | $4.99 | Power users comfortable managing backups |
| **Key-fraction** | Split: user wallet + encrypted KMS fraction | $9.99 | Users wanting extra assurance & 2FA without hardware wallet |


Split an ownership key into shares stored on separate devices. Any 2-of-3 can sign a withdrawal, lowering the chance that one lost phone bricks your funds.
