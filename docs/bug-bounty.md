# Bug bounty programme

See [`BUG_BOUNTY.md`](../BUG_BOUNTY.md) in the repository for the authoritative scope, rules, and rewards.  This page summarises the key points; if anything differs, the file in git prevails.

---

## Scope

| Target | Location |
|--------|----------|
| Solidity contracts | `contracts/**/*.sol` |
| Hardhat / Foundry scripts | Whole repo |
| CI workflows | `.github/workflows/*` |

Out-of-scope: third-party dependencies, phishing/social-engineering, pure gas optimisation suggestions, DoS via out-of-gas.

## Rewards (USD, max)

| Severity | Reward |
|----------|--------|
| Critical (CVSS ≥ 9.0) | $10 000 |
| High (7.0–8.9) | $5 000 |
| Medium (4.0–6.9) | $1 000 |
| Low (<4.0) | Hall-of-Fame |

Final amount depends on impact, exploitability, and report quality.

## Reporting process

1. Email `security@lockx.app` (PGP fingerprint in [`SECURITY.md`](../SECURITY.md)).  
2. Include a detailed description, PoC steps, and impact assessment.  
3. We respond within 24 h, triage within 5 business days.

## Rules

* First-valid report gets the reward.  
* No public disclosure until fix & coordinated release.  
* Use testnets or forks—do **not** attack mainnet contracts with real funds.  
* No social engineering or physical attacks.

---

Thank you for helping keep Lockx secure ♥
