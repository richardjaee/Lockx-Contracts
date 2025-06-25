# Quick start (local dev)

Spin up a private Hardhat network, deploy Lockx, and mint your first Lockbox in **< 60 seconds**.

---

## 1. Install dependencies

```bash
git clone https://github.com/richardjaee/Lockx-Contracts.git
cd Lockx-Contracts
npm install
```

---

## 2. Compile contracts

```bash
npx hardhat compile
```

---

## 3. Start a local node

```bash
npx hardhat node  # JSON-RPC on http://127.0.0.1:8545
```

Hardhat spawns 20 funded test accounts; copy the first private-key for the next command.

---

## 4. Deploy Lockx

```bash
npx hardhat run scripts/deploy-lockx.ts --network localhost
# ✔ Contract deployed to 0x…
```

Save the address to `$LOCKX`.

---

## 5. Mint a Lockbox with ETH

```bash
export LOCKX=0xDeployedAddress
export PK=0x<private_key_from_node>
export PUBKEY=0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef  # dummy secondary key
export REF=$(cast keccak "local-dev")

cast send --private-key $PK \
  --value 0.1ether \
  $LOCKX "createLockboxWithETH(address,address,bytes32)" 0x$([ -z "$USER" ] && echo "$(cast wallet address --private-key $PK)" || echo "$(cast wallet address --private-key $PK)") $PUBKEY $REF
```

The transaction emits `Minted(tokenId, ref)` — you now own a soul-bound Lockbox containing 0.1 ETH.

---

## 6. Withdraw

Generate an EIP-712 signature (see [EIP-712 guide](../security-authorization/eip-712.md)), then:

```bash
cast send --private-key $PK $LOCKX \
  "withdrawETH(uint256,bytes32,bytes,uint256,address,bytes32,uint256)" \
  0 $DIGEST $SIG 100000000000000000 0xRecipient… $REF $(date -v+10M +%s)
```

---

### Need testnet?

Set `--network sepolia` for all commands and fund your wallet with test ETH.


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
