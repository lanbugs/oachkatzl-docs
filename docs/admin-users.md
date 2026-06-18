---
id: admin-users
title: "Admin: User Management"
sidebar_position: 25
---

# Admin: User Management

Global admins manage all users under **Admin → Users** in the sidebar. Regular users do not see this page.

## Creating a User

Click **New user** and fill in the form:

| Field | Required | Notes |
|-------|----------|-------|
| Username | yes | Unique, used for login. Cannot be changed after creation. |
| Email | yes | Used for notifications and display. |
| Name | no | Display name shown next to the username. |
| Password | yes | Minimum 8 characters. The user can change it later on their profile page. |
| Global admin | no | Grants access to all projects and the Admin section. |

## Editing a User

Click the edit icon on any user row. Editable fields:

- **Email** and **Name** — update display and notification address.
- **New password** — leave blank to keep the current password. Useful for admin password reset.
- **Global admin** — toggle admin status.
- **Active** — deactivating a user blocks all logins without deleting the account. Existing task runs and audit entries are preserved.

## User List Indicators

| Badge | Meaning |
|-------|---------|
| `admin` (shield icon) | User has global admin privileges. |
| `inactive` | Account is deactivated — login is blocked. |
| `2FA` | User has TOTP two-factor authentication enabled. |

:::info LDAP users
Users who log in via LDAP are created automatically on first login. Their username, email, and display name are synced from the directory. You can still set the *admin* flag manually or via LDAP admin group mappings.
:::
