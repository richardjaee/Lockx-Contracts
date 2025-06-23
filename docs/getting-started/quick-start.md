# Quick start

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
