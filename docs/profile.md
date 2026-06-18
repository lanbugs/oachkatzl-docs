---
id: profile
title: Profile
sidebar_position: 24
---

# Profile

Access your profile via the user icon in the bottom-left of the sidebar or navigate to **/profile**. The page is divided into three cards.

## Profile Info

Shows your username, email address, global role (User / Administrator) and authentication provider (local, ldap, oidc). These fields are read-only and can only be changed by an admin.

## Change Password

Only visible for **local accounts**. Users authenticated via LDAP or OIDC manage their password through the external provider — the card is replaced by an informational notice.

1. Enter your current password.
2. Enter and confirm the new password (minimum 8 characters).
3. Click **Change password**.

## Two-Factor Authentication

Enable or disable TOTP-based 2FA for your account here. See [2FA & Security](security) for the full enrollment flow.

If your administrator has enforced 2FA globally, you will see a banner on the profile page and be redirected here until 2FA is set up. You cannot dismiss this banner or use any other part of the app until enrollment is complete.

## API Tokens

API tokens allow scripts and CI/CD pipelines to authenticate with the REST API without interactive login or 2FA. They are managed via the API:

```
# List your tokens
GET /api/auth/tokens

# Create a new token
POST /api/auth/tokens
{"name": "ci-pipeline", "expires_at": null}
# → returns {"token": "eyJ...", "id": "..."}  — copy the token now, it won't be shown again

# Revoke a token
DELETE /api/auth/tokens/<token_id>
```

Tokens bypass the interactive 2FA step — the token itself is the credential. Revoke tokens immediately if they are compromised. Tokens can optionally carry an expiry date (`expires_at` in ISO 8601 format).
