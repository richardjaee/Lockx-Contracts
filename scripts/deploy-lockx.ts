import { ethers, network, run } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying Lockx with account: ${deployer.address}`);

  const balance = await deployer.provider!.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');

  // Deploy
  const Lockx = await ethers.getContractFactory('Lockx');
  const lockx = await Lockx.deploy();
  await lockx.waitForDeployment();

  const address = await lockx.getAddress();
  console.log('Lockx deployed to:', address);

  // Auto-verify on live networks
  if (!['hardhat', 'localhost'].includes(network.name)) {
    console.log('Waiting for 6 confirmations before verification…');
    await lockx.deploymentTransaction()!.wait(6);

    try {
      await run('verify:verify', {
        address,
        constructorArguments: [],
      });
      console.log('Etherscan verification complete');
    } catch (err: any) {
      console.warn('Verification failed (maybe already verified):', err.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
