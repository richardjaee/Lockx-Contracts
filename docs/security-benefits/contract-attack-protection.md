# Contract attack protection

The core code follows battle-tested patterns:

* Re-entrancy guard on every external entry point
* Checks-effects-interactions order when moving tokens
* Pull over push for ETH payments
* No upgradeability ⇒ smaller attack surface
