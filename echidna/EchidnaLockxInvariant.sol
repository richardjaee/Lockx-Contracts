// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {LockxStateHarness} from "../contracts/mocks/LockxHarness.sol";

// Minimal Echidna contract to assert basic accounting invariant.
contract EchidnaLockxInvariant {
    LockxStateHarness internal lockx;

    constructor() payable {
        lockx = new LockxStateHarness();
        // initialize lockbox 0 with 1 ether so Echidna has non-zero state
        lockx.createLockboxWithETH{value: 1 ether}(address(this), address(this), bytes32("init"));
    }

    // Echidna will attempt to call this payable function with random ETH amounts.
    receive() external payable {
        if (msg.value > 0) {
            lockx.depositETH{value: msg.value}(0, bytes32("echidna"));
        }
    }

    // Invariant: contract balance equals internal accounting for lockbox 0
    function echidna_eth_balance_matches() public view returns (bool) {
        return address(lockx).balance == lockx.getEthBal(0);
    }
}
