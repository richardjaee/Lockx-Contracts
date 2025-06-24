// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract MockERC721 is ERC721 {
    uint256 public tokenId;

    constructor() ERC721('Mock NFT', 'MNFT') {
        tokenId = 1;
        _mint(msg.sender, tokenId);
    }

    function mint(address to, uint256 id) external {
        _mint(to, id);
    }
}
