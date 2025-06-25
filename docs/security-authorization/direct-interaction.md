# Direct contract interaction

The Lockx UI is optional—every feature is exposed through verified Solidity contracts.  If the website is ever offline you can still mint, deposit, withdraw, and rotate keys with standard tools like **Etherscan**, **Foundry cast**, or **ethers.js** scripts.

---

## Contract addresses

| Network | Lockx address | Block explorer |
|---------|---------------|----------------|
| Ethereum mainnet | `0x…` *(replace with deployed address)* | [etherscan.io](https://etherscan.io/) |
| Sepolia (test)   | `0x…` | [sepolia.etherscan.io](https://sepolia.etherscan.io/) |

All source code is flattened & verified, so the *Write / Read Contract* tabs are available.

---

## Common functions

| Action | Function | Notes |
|--------|----------|-------|
| Mint empty Lockbox | — | Coming in v2 (minting always bundles a deposit in v1) |
| Mint + deposit ETH | `createLockboxWithETH(address to, address lockboxPublicKey, bytes32 ref)` | Send `value > 0` |
| Mint + deposit ERC-20 | `createLockboxWithERC20(address to,address key,address token,uint256 amount,bytes32 ref)` | Call `approve()` first |
| Deposit ETH | `depositETH(uint256 id, bytes32 ref)` (payable) | Sender must own Lockbox |
| Deposit ERC-20 | `depositERC20(uint256 id,address token,uint256 amount,bytes32 ref)` | `approve()` first |
| Deposit NFT | `depositERC721(uint256 id,address nft,uint256 tokenId,bytes32 ref)` | |
| Withdraw ETH | `withdrawETH(uint256 id,bytes32 digest,bytes sig,uint256 amt,address to,bytes32 ref,uint256 deadline)` | Needs EIP-712 signature |
| Rotate key | `rotateLockboxKey(uint256 id,bytes32 digest,bytes sig,address newKey,bytes32 ref,uint256 deadline)` | |

See NatSpec in each contract for parameter details.

---

## Example: mint with ETH via Foundry `cast`

```bash
export LOCKX=0xYourLockxAddress
export PK=0xYourPrivateKey   # wallet that will own the Lockbox
export PUBKEY=0xSecondaryAuthKey
export REF=$(cast keccak "first-lockbox")

cast send --private-key $PK \
  --value 0.5ether \
  $LOCKX "createLockboxWithETH(address,address,bytes32)" $ADDRESS $PUBKEY $REF
```

The call returns the transaction hash.  The minted token ID is the totalSupply before the call (the contract emits `Minted(id, ref)`).

---

## Example: deposit an ERC-20

```bash
export TOKEN=0xUSDCAddress
export AMOUNT=$(cast to-wei 1000000 6)   # 1 USDC (6 decimals)

# Approve transfer
cast send --private-key $PK $TOKEN "approve(address,uint256)" $LOCKX $AMOUNT

# Deposit
cast send --private-key $PK $LOCKX \
  "depositERC20(uint256,address,uint256,bytes32)" $ID $TOKEN $AMOUNT $REF
```

---

## Example: withdraw ETH with EIP-712 signature

1. Fetch the current `nonce(id)` from the contract (or keep local count).
2. Build the typed-data struct:

```jsonc
{
  "types": {
    "Withdraw": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "amountETH", "type": "uint256"},
      {"name": "recipient", "type": "address"},
      {"name": "referenceId", "type": "bytes32"},
      {"name": "caller", "type": "address"},
      {"name": "signatureExpiry", "type": "uint256"}
    ]
  },
  "primaryType": "Withdraw",
  "domain": { …EIP712Domain… },
  "message": {
    "tokenId": 1,
    "amountETH": "10000000000000000", // 0.01 ETH
    "recipient": "0xRecipient…",
    "referenceId": "0x1234…",
    "caller": "0xYourWallet…",   // msg.sender
    "signatureExpiry": 1700000000
  }
}
```

3. Sign with the **current lockbox key** (Metamask → Sign Typed Data V4).

4. Broadcast:
```bash
cast send --private-key $PK $LOCKX \
  "withdrawETH(uint256,bytes32,bytes,uint256,address,bytes32,uint256)" \
  1 $DIGEST $SIG 10000000000000000 0xRecipient… 0x1234… 1700000000
```

The contract verifies the signature and transfers ETH.

---

## Etherscan tips

1. Switch network → select the *Write Contract* tab.
2. Connect wallet (Metamask).
3. Input params exactly—`bytes32` fields need `0x` prefix.
4. For functions requiring `signature` / `digest`, paste the hex directly; Metamask pops a confirmation.

---

## Gas & security reminders

* Gas for deposits depends on token logic; ETH is cheapest.
* Always double-check `deadline`/`signatureExpiry` to avoid stuck signatures.
* Rotate keys periodically (`rotateLockboxKey`) to limit compromise windows.


Prefer calling the contracts directly over relying on a web UI. Examples:

```
cast send --private-key $PK \
  --value 1ether \
  $LOCKX "lock(address,uint256,uint40)" 0x0000000000000000000000000000000000000000 0 0
```
