import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with account:', deployer.address);
  console.log(
    'Account balance:',
    (await deployer.provider!.getBalance(deployer.address)).toString()
  );

  const Lockx = await ethers.getContractFactory('Lockx');
  const lockx = await Lockx.deploy();
  await lockx.waitForDeployment();

  console.log('Lockx deployed to:', await lockx.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
