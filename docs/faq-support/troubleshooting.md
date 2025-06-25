# Troubleshooting

We're here to help.  Below are common problems and their solutions:

- **Can't connect wallet** – make sure you’re using the correct provider and network, then refresh the page or try another browser.
- **Unable to sign transactions** – open your wallet and clear any pending transactions before signing again.
- **Signature verification fails** – refresh your session and attempt the action again.
- **“Injected Provider” errors** – confirm the wallet extension is properly installed and up-to-date.
- **Repeated permission prompts** – grant the requested permissions when the wallet pop-up appears.
- **Wallet keeps disconnecting** – enable “Always connect to this site” in your wallet settings.
- **2FA not recognised** – ensure 2-factor authentication is fully enabled and confirmed before accessing protected actions.

**`ERR_BAD_NONCE`** – Fetch the current nonce from `Lockx.getLock()` and sign again.

**`ERR_SIG_EXPIRED`** – Your `deadline` has passed; sign a new request.

**I sent tokens but the page shows zero** – The indexer may be behind; check on-chain with `getLock()`.
