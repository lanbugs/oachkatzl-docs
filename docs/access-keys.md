---
id: access-keys
title: Access Keys
sidebar_position: 3
---

# Access Keys

Credentials stored encrypted in the database (Fernet/AES-256). The raw secret is *never* returned by the API — only a `has_secret` flag.

## Key Types

| Type | Stored fields | Used for |
|------|--------------|----------|
| **SSH** | Private key + optional passphrase | Git clone over SSH, Ansible SSH connections |
| **Login / Password** | Username + password | Ansible become, WinRM, custom scripts |
| **Vault** | Ansible Vault password | Decrypting `ansible-vault` encrypted files |
| **None** | — | Named placeholder (public repos, no auth needed) |

:::info Editing secrets
When editing a key, leave the secret fields blank to keep the existing credential. Fill them to replace it.
:::
