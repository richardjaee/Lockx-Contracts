# Lockx Hardhat Development Environment

[![ci](https://github.com/richardjaee/Lockx-Contracts/actions/workflows/ci.yml/badge.svg)](https://github.com/richardjaee/Lockx-Contracts/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](coverage/index.html)
[![slither](https://img.shields.io/badge/slither-passing-brightgreen)](reports/slither-report.txt)
[![license](https://img.shields.io/badge/license-BUSL--1.1-blue)](LICENSE)

A professional Solidity smart-contract repository powered by Hardhat, with full testing, coverage, static-analysis and CI.

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Quick start](#quick-start)
3. [Testing](#testing)
4. [Coverage](#coverage)
5. [Static analysis](#static-analysis)
6. [Linting & formatting](#linting--formatting)
7. [Deployment](#deployment)
8. [Continuous integration](#continuous-integration)
9. [Environment variables](#environment-variables)

---

## Prerequisites

• Node.js ≥ 18 (tested on 20).  
• npm (ships with Node).  
• Python 3.10+ (required for Slither).  
• `pipx` **or** `pip` able to install Python packages globally (Slither).

> Hardhat shows a warning on Node 23 – use an LTS version for production.

## Quick start

```bash
# install dependencies
npm install

# copy env template and fill in RPC URL / private key / etherscan key
cp .env.example .env

# compile contracts
npx hardhat compile
```

## Testing

Unit tests are written in TypeScript using Hardhat/Chai.

```bash
npm test         # runs all unit & integration tests
```

### Edge-case tests

`test/withdrawals.reverts.spec.ts` covers signature / balance / recipient error paths.

## Coverage

```bash
npm run coverage            # outputs coverage summary in terminal
open coverage/index.html    # full HTML coverage report
```

## Static analysis

### Slither

Slither is invoked via npm script and in CI.

```bash
# install once (Python)
pipx install "slither-analyzer==0.11.1"
# or: pip install --user slither-analyzer==0.11.1

npm run slither             # produces checklist report
```

### Solidity-lint (Solhint)

```bash
npm run lint:sol            # runs solhint over contracts/
```

## Linting & formatting

Prettier (with `prettier-plugin-solidity`) is configured. Format the entire repo:

```bash
npm run format
```

## Deployment

Deploy to any configured network (see `hardhat.config.ts`). Example for Sepolia:

```bash
npx hardhat run --network sepolia scripts/deploy.ts

# verify on Etherscan (API key required in .env)
npx hardhat verify --network sepolia <DEPLOYED_ADDRESS>
```

`scripts/deploy.ts` performs a simple deployment of the `Lockx` contract.

## Continuous integration

`.github/workflows/ci.yml` executes on every push / PR:

1. Install dependencies
2. Run tests
3. Generate coverage
4. Install & run Slither

## Environment variables

Create a `.env` file (based on `.env.example`) in the project root:

```
SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/yourKey
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/yourKey
PRIVATE_KEY=0xabc123...
ETHERSCAN_API_KEY=YourEtherscanKey
```

`PRIVATE_KEY` should correspond to the deployer account – **keep it safe**.

---

See the full security audit at [reports/AUDIT_REPORT_v1.1.2.md](reports/AUDIT_REPORT_v1.1.2.md).
