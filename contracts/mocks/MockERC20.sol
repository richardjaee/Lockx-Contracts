// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MockERC20 is ERC20 {
    constructor() ERC20('Mock Token', 'MCK') {
        _mint(msg.sender, 1_000_000 ether);
    }

    // test helper to mint tokens to any address
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
