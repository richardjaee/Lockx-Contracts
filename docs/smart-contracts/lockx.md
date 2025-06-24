# Lockx contract

`Lockx.sol` is the heart of the system.  It stores every lock, enforces rules, and moves assets when a withdrawal is authorised.

---

## What it stores

Each lock is a small struct:

```solidity
struct Lock {
    address owner;      // who can authorise release
    address token;      // 0x0 for ETH, otherwise ERC-20/721/1155 contract
    uint256 amount;     // or tokenId for NFTs
    uint40  unlockTime; // optional: after this timestamp a withdrawal is allowed
    uint32  nonce;      // bumps on every withdrawal to stop replays
}
```

Mappings:

```solidity
mapping(bytes32 => Lock) public locks;   // key = keccak(owner, token, id)
```

The contract itself never holds funds directly—assets live in the `Deposits` helper until released.

---

## Key functions

| Function | What it does |
|----------|--------------|
| `lock(token, amount, unlockTime)` | Creates a new lock and emits `LockCreated` |
| `increaseAmount(key, delta)` | Lets the owner top-up a position (saves gas vs new lock) |
| `withdraw(WithdrawRequest req, bytes sig)` | Validates EIP-712 signature (or time lock) and transfers out |
| `cancel(key)` | Deletes a lock before it is funded; safety valve for UX errors |

### Example (ERC-20)

```ts
await lockx.lock(dai.address, utils.parseUnits("1000"), 0);

// later …
const message = {
  key,
  amount: utils.parseUnits("1000"),
  nonce,
  deadline: BigInt(Date.now() / 1000 + 600)
};
const sig = await wallet.signTypedData(domain, types, message);
await withdrawals.withdraw(message, sig);
```

---

## Events

* `LockCreated(bytes32 key, address owner, address token, uint256 amount)`
* `LockToppedUp(bytes32 key, uint256 delta)`
* `Withdrawn(bytes32 key, uint256 amount)`

The API reference contains full signatures.

---

## Upgradeability

Lockx is **not** upgradeable; immutability makes auditing simpler.  New features come via optional helper contracts, leaving existing locks untouched.

