import { expect } from 'chai';
import { ethers } from 'hardhat';
import { domain as buildDomain, types } from './utils/eip712';
import { Lockx, MockERC20, MockERC721 } from '../typechain-types';

describe('Lockx withdrawals', function () {
  let lockx: Lockx;
  let mockERC20: MockERC20;
  let mockERC721: MockERC721;
  let owner: any;
  let lockboxSigner: any; // signer whose address is lockbox public key

  const OPERATION_TYPE = {
    ROTATE_KEY: 0,
    WITHDRAW_ETH: 1,
    WITHDRAW_ERC20: 2,
    WITHDRAW_NFT: 3,
  };

  async function signWithdrawERC20(
    tokenId: bigint,
    tokenAddress: string,
    amount: bigint,
    recipient: string,
    referenceId: string,
    signatureExpiry: bigint,
    caller: string
  ) {
    const nonce = await lockx.getNonce(tokenId);
    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'address', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [tokenId, tokenAddress, amount, recipient, referenceId, caller, signatureExpiry]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = {
      tokenId,
      nonce,
      opType: OPERATION_TYPE.WITHDRAW_ERC20,
      dataHash,
    };
    const dom = await buildDomain(await lockx.getAddress());
    const messageHash = ethers.TypedDataEncoder.hash(dom, types, opStruct);
    const sig = await lockboxSigner.signTypedData(dom, types, opStruct);
    return { messageHash, sig };
  }

  async function signWithdrawNFT(
    tokenId: bigint,
    nftAddress: string,
    nftTokenId: bigint,
    recipient: string,
    referenceId: string,
    signatureExpiry: bigint,
    caller: string
  ) {
    const nonce = await lockx.getNonce(tokenId);
    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'address', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [tokenId, nftAddress, nftTokenId, recipient, referenceId, caller, signatureExpiry]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = {
      tokenId,
      nonce,
      opType: OPERATION_TYPE.WITHDRAW_NFT,
      dataHash,
    };
    const dom = await buildDomain(await lockx.getAddress());
    const messageHash = ethers.TypedDataEncoder.hash(dom, types, opStruct);
    const sig = await lockboxSigner.signTypedData(dom, types, opStruct);
    return { messageHash, sig };
  }

  beforeEach(async () => {
    [owner, lockboxSigner] = await ethers.getSigners();

    const LockxFactory = await ethers.getContractFactory('Lockx');
    lockx = (await LockxFactory.deploy()) as Lockx;
    await lockx.waitForDeployment();

    const ERC20Factory = await ethers.getContractFactory('MockERC20');
    mockERC20 = (await ERC20Factory.deploy()) as MockERC20;
    await mockERC20.waitForDeployment();

    const ERC721Factory = await ethers.getContractFactory('MockERC721');
    mockERC721 = (await ERC721Factory.deploy()) as MockERC721;
    await mockERC721.waitForDeployment();
  });

  async function signWithdrawETH(
    tokenId: bigint,
    amount: bigint,
    recipient: string,
    referenceId: string,
    signatureExpiry: bigint,
    caller: string
  ) {
    const nonce = await lockx.getNonce(tokenId);
    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [tokenId, amount, recipient, referenceId, caller, signatureExpiry]
    );
    const dataHash = ethers.keccak256(data);

    const opStruct = {
      tokenId,
      nonce,
      opType: OPERATION_TYPE.WITHDRAW_ETH,
      dataHash,
    };

    const dom = await buildDomain(await lockx.getAddress());
    const messageHash = ethers.TypedDataEncoder.hash(dom, types, opStruct);
    const sig = await lockboxSigner.signTypedData(dom, types, opStruct);
    return { messageHash, sig };
  }

  it('withdraws ETH with valid signature', async function () {
    // create lockbox with ETH deposit
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('weth'));
    const value = ethers.parseEther('1');
    await lockx
      .connect(owner)
      .createLockboxWithETH(owner.address, lockboxSigner.address, referenceId, {
        value,
      });

    const tokenId = 0n;
    expect(await ethers.provider.getBalance(await lockx.getAddress())).to.equal(value);

    // prepare withdrawal signature
    const blk = await ethers.provider.getBlock('latest');
    const signatureExpiry = BigInt(blk!.timestamp) + 3600n;
    const { messageHash, sig } = await signWithdrawETH(
      tokenId,
      value,
      owner.address,
      referenceId,
      signatureExpiry,
      owner.address
    );

    // perform withdrawal
    const balBefore = await ethers.provider.getBalance(owner.address);
    const tx = await lockx.withdrawETH(
      tokenId,
      messageHash,
      sig,
      value,
      owner.address,
      referenceId,
      signatureExpiry
    );
    const receipt = await tx.wait();
    const gasCost = receipt!.gasUsed * (tx.gasPrice ?? 0n);

    const balAfter = await ethers.provider.getBalance(owner.address);
    // Owner balance should increase by close to value minus gas cost
    expect(balAfter + gasCost).to.equal(balBefore + value);

    expect(await ethers.provider.getBalance(await lockx.getAddress())).to.equal(0n);
  });

  it('withdraws ERC20 with valid signature', async function () {
    const amount = ethers.parseUnits('500', 18);
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('werc20'));

    // record initial balance
    const erc20BalInitial = await mockERC20.balanceOf(owner.address);

    // Mint lockbox with ERC20 deposit (transfers tokens to contract)
    await mockERC20.approve(await lockx.getAddress(), amount);
    await lockx.createLockboxWithERC20(
      owner.address,
      lockboxSigner.address,
      await mockERC20.getAddress(),
      amount,
      referenceId
    );
    const tokenId = 0n;

    // Prepare signature
    const blk = await ethers.provider.getBlock('latest');
    const signatureExpiry = BigInt(blk!.timestamp) + 3600n;
    const { messageHash, sig } = await signWithdrawERC20(
      tokenId,
      await mockERC20.getAddress(),
      amount,
      owner.address,
      referenceId,
      signatureExpiry,
      owner.address
    );

    await lockx.withdrawERC20(
      tokenId,
      messageHash,
      sig,
      await mockERC20.getAddress(),
      amount,
      owner.address,
      referenceId,
      signatureExpiry
    );

    expect(await mockERC20.balanceOf(owner.address)).to.equal(erc20BalInitial);
    expect(await mockERC20.balanceOf(await lockx.getAddress())).to.equal(0n);
  });

  it('withdraws ERC721 with valid signature', async function () {
    const nftTokenId = 1n;
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('wnft'));
    // Mint lockbox with NFT deposit
    await mockERC721.connect(owner).approve(await lockx.getAddress(), nftTokenId);
    await lockx.createLockboxWithERC721(
      owner.address,
      lockboxSigner.address,
      await mockERC721.getAddress(),
      nftTokenId,
      referenceId
    );
    const tokenId = 0n;

    const blk = await ethers.provider.getBlock('latest');
    const signatureExpiry = BigInt(blk!.timestamp) + 3600n;
    const { messageHash, sig } = await signWithdrawNFT(
      tokenId,
      await mockERC721.getAddress(),
      nftTokenId,
      owner.address,
      referenceId,
      signatureExpiry,
      owner.address
    );

    await lockx.withdrawERC721(
      tokenId,
      messageHash,
      sig,
      await mockERC721.getAddress(),
      nftTokenId,
      owner.address,
      referenceId,
      signatureExpiry
    );

    expect(await mockERC721.ownerOf(nftTokenId)).to.equal(owner.address);
  });
});
