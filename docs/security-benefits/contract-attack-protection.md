# Contract attack protection

Lockx’s core contracts inherit hardened patterns from OpenZeppelin and are *intentionally minimal*. Fewer lines of code = fewer bugs. Below are the key defences that protect against on-chain exploits.

---

## Re-entrancy guard

Every external function that transfers value is wrapped in `nonReentrant`.

```solidity
function withdraw(WithdrawRequest calldata req, bytes calldata sig)
    external
    nonReentrant
{
    _validate(req, sig);
    _transfer(req);
}
```

This single modifier blocks classic attacks like the 2016 DAO drain or ERC-777 callback loops.

---

## Checks-effects-interactions

State is updated *before* any external call:

```solidity
function _transfer(WithdrawRequest memory r) internal {
    Lock storage l = locks[r.key];
    l.amount -= r.amount;           // effects
    l.nonce  += 1;

    _sendToken(r.token, r.to, r.amount); // interaction
}
```

Even if the recipient is a malicious contract, the internal balance is already debited so re-entry does nothing.

---

## Pull over push (ETH)

Users *pull* ETH with `withdraw()`; the contract never auto-forwards ether. All sends use `call{value:…}` and return-value checks to avoid lost funds.

---

## Immutability and no upgrade proxies

Lockx is **deployed once and forever**—no `delegatecall` proxy, no upgrade keys. Auditors can therefore reason about the exact bytecode that holds user funds.

---

## Dependency sanitation

* **OpenZeppelin 4.9.5** – last minor before 5.x breaking changes, thoroughly audited.  
* No diamond patterns, no assembly except the lightweight ECDSA `recover` optimisation included upstream.

---

## Differential fuzzing & invariants

See the [test report](../../reports/test-report-2025-06-23.md) for fuzz suites that continuously hammer random inputs across:

* ERC-20 fee-on-transfer variants.  
* Token contracts that revert on `transfer` to ensure proper bubble-up.  
* Malicious ERC-721 receivers that re-enter during `onERC721Received`.

The invariants confirm:

* Total ETH inside the contract equals sum of all `_baggedETH`.  
* ERC-20 balances never underflow.  
* Nonces strictly increase.


The core code follows battle-tested patterns:

* Re-entrancy guard on every external entry point
* Checks-effects-interactions order when moving tokens
* Pull over push for ETH payments
* No upgradeability ⇒ smaller attack surface
