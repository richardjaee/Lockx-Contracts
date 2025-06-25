# Quick start

Get up-and-running with Lockx in four short steps.

---

## Step 1 – connect your wallet
Click the **Connect wallet** button in the top right of the dApp and choose your preferred provider.  Accept any connection pop-ups.

Supported wallets: MetaMask, Coinbase Wallet, Brave Wallet and any EIP-1193 compatible extension.

---

## Step 2 – authenticate the session *(no gas)*
After connecting, the dApp asks you to sign a short message to create an **active session**.  Sessions expire automatically after three hours, at which point you simply sign again.

---

## Step 3 – select assets to bag
1. In **Portfolio** click **Create Lockbox**.
2. Tick the ERC-20 tokens and NFTs you want to include (we recommend ≤3 assets per transaction for lowest gas risk).
3. Click **Continue**.

---

## Step 4 – complete the bagging workflow
Choose your key-management option, review the assets and confirm.  The mint transaction deposits the assets and issues you a soul-bound Lockbox NFT.

Key-management tiers:

| Option | Platform fee | Notes |
|--------|--------------|-------|
| **Self-custody** | 4.99 USD | You manage the private key yourself, protected by 2FA. |
| **Lockx key-fraction** | 9.99 USD | Patent-pending encrypted key fraction stored in FIPS-3 HSMs. |

---

## CLI quick start (local testnet)
If you prefer running everything locally:

```bash
# install dependencies
npm install

# compile contracts
npx hardhat compile

# start local node (terminal 1)
npx hardhat node

# deploy Lockx (terminal 2)
npx hardhat run scripts/deploy-lockx.ts --network localhost
```

Run the Hardhat console and interact with `Lockx` directly:

```bash
npx hardhat console --network localhost
> const lockx = await ethers.getContractAt('Lockx', '<deployed_address>')
> await lockx.createLockboxWithETH('<owner>', '<signer>', 123, { value: 1e18 })
```

Once deployed, use the Hardhat console or a front-end to call `lock()` with the token address, amount, and unlock time.  Then sign an EIP-712 withdrawal request and submit it with `withdraw()`.

At any point you can verify contract state with:

```bash
npx hardhat console --network localhost
> const lockx = await ethers.getContractAt('Lockx', '<deployed_address>')
> await lockx.getLock('<user>')
```

For testnet or mainnet, replace `localhost` with the desired network and ensure your wallet has funds for gas.
