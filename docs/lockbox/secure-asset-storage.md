# Secure asset storage

A lockbox keeps assets under time- or signature-based control. You decide Rules at creation and no one—including the Lockx deployer—can bypass them.

* **Time lock** – set `unlockTime` only.
* **Signature lock** – require an EIP-712 signature.
* **Hybrid** – allow either once the time has passed.

The lock can be topped up any time without changing its rules.
