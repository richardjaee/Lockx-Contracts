# Security considerations

Lockx incorporates multiple defence layers (soul-bound NFTs, EIP-712 authorisation, invariants, audits) but **no system is risk-free**.  Review the points below before depositing high-value assets.

---

## 1. Private-key compromise

Lockx requires a normal on-chain transaction **and** an off-chain EIP-712 signature.  If both your wallet key *and* lockbox key/fraction leak, an attacker can withdraw assets.  Mitigation:

* Use hardware wallets for both keys.
* Rotate the lockbox key (`rotateLockboxKey`) immediately on suspicion.
* Enable key-fraction + HSM storage to split risk across devices.

## 2. ERC-20 / ERC-721 upgrade risk

Lockx cannot protect against malicious upgrades in *proxied* token contracts you deposit.  Treat upgradeable tokens as higher risk or prefer immutable implementations.

## 3. Griefing & DoS

Anyone can send arbitrary tokens/NFTs to the contract via `safeTransfer{ETH, ERC20, ERC721}`; these appear in bookkeeping arrays and may bloat gas.  A periodic `sweepUnknownTokens()` governance helper is planned (see roadmap).

## 4. Time-delay attacks

Signatures include a `deadline`.  If you sign far into the future and your lockbox key leaks, the attacker has the whole window to act.  Keep `deadline` ≤ 10 min and regenerate if the transaction fails.

## 5. Front-end phishing

Only interact with **verified** contracts (`security-authorization/direct-interaction.md`).  Check addresses twice and verify the EIP-712 payload you sign.

## 6. Protocol bugs

All contracts are audited and invariant-tested, but undiscovered bugs may exist.  Report any vulnerability via the [bug bounty programme](bug-bounty.md).
