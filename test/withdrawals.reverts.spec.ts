import { expect } from 'chai';
import { ethers } from 'hardhat';
import { domain as buildDomain, types } from './utils/eip712';
import { Lockx, MockERC20, MockERC721 } from '../typechain-types';

const OPERATION_TYPE = {
  ROTATE_KEY: 0,
  WITHDRAW_ETH: 1,
  WITHDRAW_ERC20: 2,
  WITHDRAW_NFT: 3,
};

describe('Lockx withdrawal reverts', () => {
  let lockx: Lockx;
  let mockERC20: MockERC20;
  let mockERC721: MockERC721;
  let owner: any;
  let lockboxSigner: any;
  let stranger: any;

  beforeEach(async () => {
    [owner, lockboxSigner, stranger] = await ethers.getSigners();

    lockx = (await (await ethers.getContractFactory('Lockx')).deploy()) as Lockx;
    await lockx.waitForDeployment();

    mockERC20 = (await (await ethers.getContractFactory('MockERC20')).deploy()) as MockERC20;
    await mockERC20.waitForDeployment();

    mockERC721 = (await (await ethers.getContractFactory('MockERC721')).deploy()) as MockERC721;
    await mockERC721.waitForDeployment();
  });

  /** ---------------------- helpers ---------------------- */
  async function sign(opStruct: any) {
    const dom = await buildDomain(await lockx.getAddress());
    const sig = await lockboxSigner.signTypedData(dom, types, opStruct);
    const messageHash = ethers.TypedDataEncoder.hash(dom, types, opStruct);
    return { messageHash, sig };
  }

  /** ---------------- invalid signature ----------------- */
  it('reverts on invalid signature', async () => {
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('inv-sig'));
    const value = ethers.parseEther('0.2');

    await lockx
      .connect(owner)
      .createLockboxWithETH(owner.address, lockboxSigner.address, referenceId, { value });

    const tokenId = 0n;
    const nonce = await lockx.getNonce(tokenId);
    const blk = await ethers.provider.getBlock('latest');
    const signatureExpiry = BigInt(blk!.timestamp) + 3600n;

    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [tokenId, value, owner.address, referenceId, owner.address, signatureExpiry]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = { tokenId, nonce, opType: OPERATION_TYPE.WITHDRAW_ETH, dataHash };

    // sign with stranger (not lockboxSigner)
    const dom = await buildDomain(await lockx.getAddress());
    const badSig = await stranger.signTypedData(dom, types, opStruct);
    const messageHash = ethers.TypedDataEncoder.hash(dom, types, opStruct);

    await expect(
      lockx.withdrawETH(
        tokenId,
        messageHash,
        badSig,
        value,
        owner.address,
        referenceId,
        signatureExpiry
      )
    ).to.be.revertedWithCustomError(lockx, 'InvalidSignature');
  });

  /** -------------- expired signature ------------------- */
  it('reverts on expired signature', async () => {
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('exp-sig'));
    const value = ethers.parseEther('0.1');

    await lockx.createLockboxWithETH(owner.address, lockboxSigner.address, referenceId, { value });
    const tokenId = 0n;
    const nonce = await lockx.getNonce(tokenId);
    const expired = 1n; // unix epoch past

    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [tokenId, value, owner.address, referenceId, owner.address, expired]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = { tokenId, nonce, opType: OPERATION_TYPE.WITHDRAW_ETH, dataHash };
    const { messageHash, sig } = await sign(opStruct);

    await expect(
      lockx.withdrawETH(tokenId, messageHash, sig, value, owner.address, referenceId, expired)
    ).to.be.revertedWithCustomError(lockx, 'SignatureExpired');
  });

  /** -------------- no eth balance ---------------------- */
  it('reverts on withdrawing more ETH than balance', async () => {
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('over-eth'));
    const value = ethers.parseEther('0.05');
    await lockx.createLockboxWithETH(owner.address, lockboxSigner.address, referenceId, { value });
    const tokenId = 0n;

    const nonce = await lockx.getNonce(tokenId);
    const blk = await ethers.provider.getBlock('latest');
    const expiry = BigInt(blk!.timestamp) + 3600n;
    const withdrawAmount = ethers.parseEther('1'); // > balance

    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [tokenId, withdrawAmount, owner.address, referenceId, owner.address, expiry]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = { tokenId, nonce, opType: OPERATION_TYPE.WITHDRAW_ETH, dataHash };
    const { messageHash, sig } = await sign(opStruct);

    await expect(
      lockx.withdrawETH(
        tokenId,
        messageHash,
        sig,
        withdrawAmount,
        owner.address,
        referenceId,
        expiry
      )
    ).to.be.revertedWithCustomError(lockx, 'NoETHBalance');
  });

  /** -------------- erc20 insufficient ------------------ */
  it('reverts on insufficient ERC20 balance', async () => {
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('over-erc20'));
    const depositAmt = ethers.parseUnits('100', 18);

    await mockERC20.approve(await lockx.getAddress(), depositAmt);
    await lockx.createLockboxWithERC20(
      owner.address,
      lockboxSigner.address,
      await mockERC20.getAddress(),
      depositAmt,
      referenceId
    );
    const tokenId = 0n;

    const nonce = await lockx.getNonce(tokenId);
    const blk = await ethers.provider.getBlock('latest');
    const expiry = BigInt(blk!.timestamp) + 3600n;
    const withdrawAmt = ethers.parseUnits('1000', 18); // more than deposited

    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'address', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [
        tokenId,
        await mockERC20.getAddress(),
        withdrawAmt,
        owner.address,
        referenceId,
        owner.address,
        expiry,
      ]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = { tokenId, nonce, opType: OPERATION_TYPE.WITHDRAW_ERC20, dataHash };
    const { messageHash, sig } = await sign(opStruct);

    await expect(
      lockx.withdrawERC20(
        tokenId,
        messageHash,
        sig,
        await mockERC20.getAddress(),
        withdrawAmt,
        owner.address,
        referenceId,
        expiry
      )
    ).to.be.revertedWithCustomError(lockx, 'InsufficientTokenBalance');
  });

  /** -------------- nft not found ----------------------- */
  it('reverts on withdrawing NFT not in lockbox', async () => {
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('nft-none'));
    const nftDepositId = 1n;
    await mockERC721.approve(await lockx.getAddress(), nftDepositId);
    await lockx.createLockboxWithERC721(
      owner.address,
      lockboxSigner.address,
      await mockERC721.getAddress(),
      nftDepositId,
      referenceId
    );
    const tokenId = 0n;

    const nonce = await lockx.getNonce(tokenId);
    const blk = await ethers.provider.getBlock('latest');
    const expiry = BigInt(blk!.timestamp) + 3600n;
    const withdrawNftId = 2n; // not deposited

    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'address', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [
        tokenId,
        await mockERC721.getAddress(),
        withdrawNftId,
        owner.address,
        referenceId,
        owner.address,
        expiry,
      ]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = { tokenId, nonce, opType: OPERATION_TYPE.WITHDRAW_NFT, dataHash };
    const { messageHash, sig } = await sign(opStruct);

    await expect(
      lockx.withdrawERC721(
        tokenId,
        messageHash,
        sig,
        await mockERC721.getAddress(),
        withdrawNftId,
        owner.address,
        referenceId,
        expiry
      )
    ).to.be.revertedWithCustomError(lockx, 'NFTNotFound');
  });

  /** -------------- zero address recipient ------------- */
  it('reverts on zero address recipient', async () => {
    const referenceId = ethers.keccak256(ethers.toUtf8Bytes('zero-rec'));
    const value = ethers.parseEther('0.1');
    await lockx.createLockboxWithETH(owner.address, lockboxSigner.address, referenceId, { value });
    const tokenId = 0n;
    const nonce = await lockx.getNonce(tokenId);
    const blk = await ethers.provider.getBlock('latest');
    const expiry = BigInt(blk!.timestamp) + 3600n;

    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'address', 'bytes32', 'address', 'uint256'],
      [tokenId, value, ethers.ZeroAddress, referenceId, owner.address, expiry]
    );
    const dataHash = ethers.keccak256(data);
    const opStruct = { tokenId, nonce, opType: OPERATION_TYPE.WITHDRAW_ETH, dataHash };
    const { messageHash, sig } = await sign(opStruct);

    await expect(
      lockx.withdrawETH(tokenId, messageHash, sig, value, ethers.ZeroAddress, referenceId, expiry)
    ).to.be.revertedWithCustomError(lockx, 'ZeroAddress');
  });
});
