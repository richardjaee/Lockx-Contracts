# Quick start

Follow these five steps to connect your wallet and mint your first Lockbox on **mainnet or any supported testnet**.

---

## Step&nbsp;1 – Connect your wallet

Click the **Connect wallet** button in the top-right of the dApp and approve the connection request in your wallet extension.

Supported wallets:

* MetaMask  
* Coinbase Wallet  
* Brave Wallet

> **Tip**: No transaction is sent at this stage – it is just the standard JSON-RPC `eth_requestAccounts` handshake.

---

## Step&nbsp;2 – Authenticate the session

Immediately after connecting you will be prompted to sign a short, human-readable EIP-191 message.  This creates a 3-hour session token so the UI can perform read-only calls on your behalf without repeatedly resurfacing the signature prompt.

!!! note "Gas free"
    The authentication signature is off-chain and costs 0 gas.

---

## Step&nbsp;3 – Select assets to bag

1. Click **Create Lockbox** in your portfolio.  
2. Tick the ERC-20 tokens and NFTs you want to include.  
3. (Optional) Top up ETH for future gas.

> **Recommendation**: select **no more than three** distinct assets in one bundle to minimise the risk of out-of-gas errors on congested networks.

---

## Step&nbsp;4 – Choose key management & pay the platform fee

| Option | Platform fee | Description |
|--------|--------------|-------------|
| **Self-custody keys** | **$4.99** | You keep the full private key. 2FA signing is enforced. |
| **Lockx key-fraction** | **$9.99** | Our patent-pending encrypted key-fraction scheme (FIPS-3 HSM storage) derives a secondary key pair on-the-fly for each withdrawal. |

Payment is processed via Stripe in fiat; no tokens or native gas are required.

---

## Step&nbsp;5 – Mint your Lockbox

After the Stripe checkout you’ll be redirected back to the dApp where a single **mint** transaction is prepared.

* A new soul-bound NFT is minted to your address.
* Assets are deposited into the contract.  
* The NFT is marked **locked** via EIP-5192 and the `Locked` event is emitted.

Once the transaction confirms you can view the Lockbox in your portfolio, withdraw assets at any time, or top-up balances.

---

### CLI cheatsheet

Below is the abbreviated CLI sequence for advanced users wanting to experiment on a local Hardhat node:

```bash
# install deps
npm install

# compile
npx hardhat compile

# start local node (separate terminal)
npx hardhat node

# deploy
npx hardhat run scripts/deploy-lockx.ts --network localhost
```

Open another terminal:

```bash
npx hardhat console --network localhost
> const lockx = await ethers.getContractAt('Lockx', '<deployed_addr>')
> await lockx.lock(token, amount, unlockTime)
> // ... sign EIP-712 message ...
> await lockx.withdraw(withdrawSig)
```

Replace `localhost` with `sepolia` or `mainnet` as required.

This page walks you through deploying the contracts to a local Hardhat network, locking an ERC-20 token, and performing a withdrawal.

```bash
# clone and install
npm install

# compile contracts
npx hardhat compile

# start local node in a second terminal
npx hardhat node

# deploy Lockx
npx hardhat run scripts/deploy-lockx.ts --network localhost
```

Once deployed, use the Hardhat console or a front-end to call `lock()` with the token address, amount, and unlock time.  Then sign an EIP-712 withdrawal request and submit it with `withdraw()`.

At any point you can verify contract state with:

```bash
npx hardhat console --network localhost
> const lockx = await ethers.getContractAt('Lockx', '<deployed_address>')
> await lockx.getLock('<user>')
```

For testnet or mainnet, replace `localhost` with the desired network and ensure your wallet has funds for gas.
