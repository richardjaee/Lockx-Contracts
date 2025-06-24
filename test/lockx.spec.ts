import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Lockx } from '../typechain-types';

describe('Lockx', function () {
  let lockx: Lockx;
  let owner: any;
  let other: any;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const LockxFactory = await ethers.getContractFactory('Lockx');
    lockx = (await LockxFactory.deploy()) as Lockx;
    await lockx.waitForDeployment();
  });

  it('mints a lockbox with ETH and marks as locked', async function () {
    const lockboxPublicKey = other.address;
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('ref1'));
    const value = ethers.parseEther('1');

    // call createLockboxWithETH
    const tx = await lockx
      .connect(owner)
      .createLockboxWithETH(owner.address, lockboxPublicKey, referenceId, {
        value,
      });
    await tx.wait();

    const tokenId = 0n; // first minted token id should be 0
    expect(await lockx.locked(tokenId)).to.equal(true);
    expect(await lockx.ownerOf(tokenId)).to.equal(owner.address);
  });
});
