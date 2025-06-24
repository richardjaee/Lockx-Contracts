import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Lockx, MockERC20, MockERC721 } from '../typechain-types';

describe('Lockx deposits', function () {
  let lockx: Lockx;
  let mockERC20: MockERC20;
  let mockERC721: MockERC721;
  let owner: any;
  let other: any;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    // Deploy mocks
    const ERC20Factory = await ethers.getContractFactory('MockERC20');
    mockERC20 = (await ERC20Factory.deploy()) as MockERC20;
    await mockERC20.waitForDeployment();

    const ERC721Factory = await ethers.getContractFactory('MockERC721');
    mockERC721 = (await ERC721Factory.deploy()) as MockERC721;
    await mockERC721.waitForDeployment();

    // Deploy Lockx
    const LockxFactory = await ethers.getContractFactory('Lockx');
    lockx = (await LockxFactory.deploy()) as Lockx;
    await lockx.waitForDeployment();
  });

  it('creates lockbox with ERC20 deposit', async function () {
    const lockboxPublicKey = other.address;
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('erc20'));
    const amount = ethers.parseUnits('1000', 18);

    // Approve tokens to Lockx
    await mockERC20.approve(await lockx.getAddress(), amount);

    // Create Lockbox with ERC20 deposit
    await lockx.createLockboxWithERC20(
      owner.address,
      lockboxPublicKey,
      await mockERC20.getAddress(),
      amount,
      referenceId
    );

    const tokenId = 0n;
    expect(await lockx.locked(tokenId)).to.equal(true);
    expect(await mockERC20.balanceOf(await lockx.getAddress())).to.equal(amount);
  });

  it('creates lockbox with ERC721 deposit', async function () {
    const lockboxPublicKey = other.address;
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('erc721'));
    const nftTokenId = await mockERC721.tokenId();

    // approve NFT
    await mockERC721.approve(await lockx.getAddress(), nftTokenId);

    await lockx.createLockboxWithERC721(
      owner.address,
      lockboxPublicKey,
      await mockERC721.getAddress(),
      nftTokenId,
      referenceId
    );

    const tokenId = 0n;
    expect(await lockx.locked(tokenId)).to.equal(true);
    expect(await mockERC721.ownerOf(nftTokenId)).to.equal(await lockx.getAddress());
  });
});
