# Typical flows

Lockx covers a range of common custody scenarios.  Below is a concise look at the most‐used patterns:

* **Simple time lock** – The owner deposits assets with an `unlockTime`.  After the deadline, they can call `withdraw()` directly without providing a signature.
* **Guarded withdrawal** – The owner requires an off-chain EIP-712 signature **plus** a normal transaction.  Front-ends typically help the user sign the withdrawal struct and relay it.
* **Third-party unlock** – A custodian, DAO, or friend can submit a valid signature on behalf of the owner.  The funds are still sent directly to the owner’s address.
* **Auto-sweep** – Advanced users can deploy a cron job or bot that monitors `unlockTime` and automatically submits the required signature once conditions are met.

For implementation details, see `Withdrawals.sol` and the [signature verification](signature-verification.md) guide.
