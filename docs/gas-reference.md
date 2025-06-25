# Gas reference

Lockx’s CI pipeline runs `hardhat-gas-reporter` on every commit.  The full snapshot lives in `reports/gas-report.txt` and is attached to GitHub PRs by the `gas-diff.yml` workflow.

| Function | Gas (Paris EVM) |
|----------|----------------|
| `createLockboxWithETH` | 241 546 |
| `createLockboxWithERC20` | 87 214 |
| `createLockboxWithERC721` | 98 671 |
| `createLockboxWithBatch` *(1 ETH, 2 ERC-20s, 1 ERC-721)* | 543 816 |
| `batchWithdraw` *(typical)* | 597 809 |

> Values come from the last successful `main` build (`reports/gas-report.txt`).  Use these as upper-bound estimates; actual gas depends on token code and calldata size.

---

## How we measure

1. `hardhat.config.ts` sets `gasReporter` with Paris hardfork rules and `viaIR` compilation.  
2. Tests run with `REPORT_GAS=true`; reporter aggregates cost per method.  
3. `scripts/compare-gas.js` compares the new snapshot against the base branch and comments on the PR if any cost changes by ≥1 %.  

---

### Tips to reduce gas

* Batch deposits to amortise base cost.  
* Prefer ERC-20 allowances that tightly match the required amount to avoid expensive resets.  
* Re-use lockboxes instead of minting new ones when possible.
