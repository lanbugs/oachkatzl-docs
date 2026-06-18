---
id: security
title: 2FA & Security
sidebar_position: 21
---

# 2FA & Security

## Two-Factor Authentication (TOTP)

Oachkatzl supports TOTP (RFC 6238) compatible with any authenticator app (Google Authenticator, Authy, 1Password, etc.).

1. Go to your profile or use the API: `GET /api/auth/2fa/setup` to get a QR code.
2. Scan the QR code with your authenticator app.
3. Confirm with a 6-digit code: `POST /api/auth/2fa/enable`.
4. Save the recovery codes — they can bypass 2FA if you lose your device.

## Recovery Codes

8 single-use codes are generated when 2FA is enabled. Store them safely. Each code can only be used once.

## API Tokens vs 2FA

API tokens (from *Profile → API Tokens*) bypass the interactive 2FA step — the token itself is the secret. This makes them suitable for automation. Tokens can be revoked at any time.

## Secret Storage

- All credentials (SSH keys, passwords, vault passwords, TOTP secrets) are stored encrypted with **Fernet (AES-128-CBC)**.
- Passwords use **argon2id** hashing.
- The encryption key (`OACHKATZL_ENCRYPTION_KEY`) must be set in the environment and is never stored in the database.
- Subprocess environments are sanitized — internal secrets are never visible to playbooks or scripts.

:::warning Production checklist
Generate a fresh `OACHKATZL_ENCRYPTION_KEY`:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Also set a strong `OACHKATZL_JWT_SECRET` and change `OACHKATZL_ADMIN_PASSWORD` before going live.
:::
