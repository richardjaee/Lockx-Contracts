# Frequently asked questions

Below are the most common questions developers and users ask about Lockx.  If something is missing, open an issue on GitHub and we’ll add it.

---

**Is Lockx upgradeable?**  
No.  The core contract is deployed *without* a proxy to minimise governance and implementation risk.  Bug-fixes and features ship in new versions; existing Lockboxes keep working forever.

**Which networks are supported?**  
• Ethereum mainnet (production)  
• Sepolia testnet  
Deployments are verified on Etherscan.

**What are the contract addresses?**  
See the [direct-interaction guide](../security-authorization/direct-interaction.md) for the latest deploy hashes.

**Are there any fees?**  
Lockx takes *zero* on-chain fees.  You only pay normal gas.  Optional subscription tiers (key-fraction, HSM, etc.) are handled off-chain.

**How does the 2-key model work?**  
Withdrawals need a signature from the **lockbox key** as well as a normal transaction from your wallet.  For key-fraction users the lockbox key is re-derived on the fly from two pieces (see [key fraction technology](../key-management/key-fraction.md)).

**I lost my secondary device – can I recover?**  
Yes.  Rotate the lockbox key to a new address using `rotateLockboxKey`.  You will need an existing valid signature generated *before* you lost the device, or one of your backup fractions.

**Can I batch deposit NFTs or tokens?**  
Yes.  Use `batchDeposit`, which accepts ETH, an array of ERC-20s, and an array of ERC-721s in one transaction.  ERC-1155 batch support is on the roadmap for Q3 2025.

**Are Lockboxes soul-bound?**  
Yes.  They implement ERC-5192 and cannot be transferred.  See the [soul-bound section](../lockbox/soulbound.md).

**Are signatures EIP-712?**  
All authorisation is done via typed-data signatures (EIP-712) to prevent phishing and replay attacks.  The `nonce(tokenId)` increases after every successful operation.

**What happens if the Lockx website is offline?**  
Nothing.  The contracts are verified; you can interact via Etherscan or any scripting tool.  See [direct interaction](../security-authorization/direct-interaction.md).

**License?**  
Open-source under Apache-2.0.


**Is Lockx upgradeable?**  No, the core is immutable to reduce risk.

**What happens if I lose my second-factor device?**  Use a recovery key or wait until the time lock expires.

**Can I batch lock 10 NFTs?**  Not yet; create 10 individual locks or wait for the upcoming batch helper.
