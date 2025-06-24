# contributing

Thanks for taking the time to contribute to **Lockx Contracts**! We welcome pull requests, bug reports and feature suggestions.

## getting started

1. **Fork** the repository then clone your fork.
2. `npm install` to install dev dependencies.
3. Copy `.env.example` to `.env` and fill in RPC URLs if you need to run deployments.
4. Make sure `forge` is installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`).

## development workflow

```bash
# compile
npx hardhat compile

# run the complete test-suite (Hardhat + Foundry)
npm run test && forge test -vvv

# gas, coverage & static analysis
npm run gas:report
npm run coverage
npm run slither
npm run mythril   # optional extra security analysis (see below)
```

### commit messages

We loosely follow the Conventional Commits convention (`feat:`, `fix:`, `docs:` …). It keeps the history readable and enables future changelog automation.

### pre-push checklist

* `npm run format` – ensure Prettier passes.
* `npm run lint:sol` – confirm no critical Solhint issues.
* `npm test` and `forge test` – all tests should pass.
* `npm run slither` – make sure there are no high-severity findings.

CI will enforce the same checks.

## opening a pull request

1. Rebase on the latest `main`.
2. Ensure your branch name is descriptive (e.g. `feat/erc1155-support`).
3. Add a concise description explaining *why* and *what*.
4. If introducing public-facing changes, update the `README.md` accordingly.
5. Link any relevant issues with `Fixes #123`.

A maintainer will review your PR and may request changes. Please be responsive so we can merge improvements quickly.

## security disclosure

If you believe you have found a security vulnerability, **do not** open a public issue. Instead, email `security@lockx.xyz` with details. We will triage and respond as soon as possible.

## mythril (optional advanced analysis)

Mythril performs symbolic execution to detect deeper issues that static analyzers might miss.

```bash
# install (python 3.10+)
pipx install mythril
# or: pip install --user mythril

# run analysis on the main contract
npm run mythril
```

The script generates `reports/mythril-lockx.json`. Review any high-severity findings before submitting.

---

Happy hacking!
