# Lockx Bug Bounty Program

We welcome security researchers to review our smart-contracts and associated tooling. Responsible disclosure helps us keep Lockx users safe and maintain transparency.

## Scope

| Target | Contract / Repo | Network |
| ------ | --------------- | ------- |
| Smart-contracts | `contracts/**/*.sol` | Any (deployed & test) |
| Hardhat / Foundry scripts | Repository | N/A |
| CI workflows | `.github/workflows/*` | N/A |

Out-of-scope:
* Third-party dependencies (OpenZeppelin, Hardhat, Forge Std)
* Front-end integrations not maintained in this repo
* Denial-of-Service purely via out-of-gas

## Rewards

| Severity (CVSS) | Reward (USD) |
| --------------- | ------------ |
| Critical (≥9.0) | up to $10,000 |
| High (7.0–8.9)  | up to $5,000  |
| Medium (4.0–6.9)| up to $1,000  |
| Low (<4.0)      | Hall-of-Fame mention |

Final amounts depend on impact, exploitability, and report quality.

## Rules

1. **First come, first rewarded**: duplicates are paid to the earliest valid report.
2. Provide sufficient detail for reproduction.
3. No public disclosure prior to official patch & coordinated release.
4. No testing on mainnet with real user funds; use testnets or local forks.
5. No social engineering, spamming, or physical attacks.

## Reporting

Email `security@lockx.app` (PGP preferred; fingerprint in `SECURITY.md`). Include:
* Description of the issue
* Steps to reproduce / PoC
* Potential impact assessment
* Suggested remediation (optional)

We aim to confirm receipt within **24 h** and provide a triage result within **5 business days**.

## Hall of Fame

Outstanding researchers will be credited here (with consent) after resolution.

| Date | Researcher | Issue | Reward |
|------|-----------|-------|--------|

---
Thank you for helping keep Lockx secure ♥
