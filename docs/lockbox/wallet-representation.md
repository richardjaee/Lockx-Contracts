# Wallet representation

A Lockbox is itself an NFT.  Once minted, the token surfaces in your wallet the same way as any collectable.

| What you see | What it means |
|--------------|---------------|
| Lockbox NFT with id `#123` | A vault that holds the assets listed below |
| Attributes tab | Shows current ETH, ERC-20, and ERC-721 counts |
| Image | Dynamically generated SVG that updates when you deposit or withdraw |

Because the NFT **encapsulates all bookkeeping**, you never have to track multiple token contracts—just watch a single token id.

---

## UX benefits

* **Portfolio clarity** – one entry in your wallet stands for an entire diversified vault.
* **Transferability** – you can transfer or trade the Lockbox NFT to move ownership of _all_ contained assets in a single transaction (subject to the lock rule).
* **Gas efficiency** – the metadata update is an off-chain render; no storage writes when the image changes.

---

## Under the hood

1. After each `deposit*` or `withdraw*` call, the contract emits `BalanceUpdate(id, …)`.
2. The metadata renderer listens, fetches new balances via `tokenURI`, and regenerates the SVG.
3. Wallets that support on-chain metadata (Rainbow, Zerion, Rabby) show the updated attributes automatically.

This approach keeps on-chain storage minimal while still giving users a real-time view of their vault composition.
