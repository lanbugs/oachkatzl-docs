---
id: admin-settings
title: "Admin: Global Settings"
sidebar_position: 26
---

# Admin: Global Settings

Accessible via **Admin → Settings** in the sidebar. Changes take effect immediately without a restart.

## Two-Factor Authentication (MFA)

The **Require MFA for all users** toggle forces every user to enroll in TOTP before they can use the application. Users who have not yet set up 2FA are redirected to the profile page on their next login and cannot proceed until enrollment is complete.

## Task History Retention

Controls how long completed task records (log output, status, run metadata) are kept in the database. Options: *Disabled* (keep forever), 7 days, 30 days, 90 days, 1 year. Tasks older than the threshold are deleted by a background cleanup job. Running tasks are never deleted.

## SMTP / E-Mail

See [Notifications → SMTP configuration](notifications#smtp-configuration).

## LDAP / Active Directory

Oachkatzl can authenticate users against an LDAP or Active Directory server. On successful login, group memberships are read and synced to project roles automatically via group-to-project mappings.

| Field | Description |
|-------|-------------|
| Enabled | Toggle LDAP authentication on or off. Local accounts continue to work regardless. |
| Server URL | LDAP server address including scheme and port. Examples: `ldap://dc.example.com:389`, `ldaps://dc.example.com:636`. |
| Use TLS / Use SSL | Enable STARTTLS (port 389) or LDAPS (port 636). Use only one at a time. |
| Bind DN | Service account DN used to search the directory. Example: `CN=svc-oachkatzl,OU=ServiceAccounts,DC=example,DC=com`. |
| Bind password | Password for the bind account. Stored encrypted. Leave blank when editing to keep the existing password. |
| Base DN | Root of the directory tree to search. Example: `DC=example,DC=com`. |
| User search filter | LDAP filter to find a user by login name. Default: `(sAMAccountName={username})`. For OpenLDAP use `(uid={username})`. |
| Group membership attribute | Attribute on the user object that lists group memberships. Default: `memberOf`. |
| Follow nested groups | Resolve nested group memberships (recursive). Can be slow on large directories. |
| Email attribute | LDAP attribute mapped to the user's email. Default: `mail`. |
| Display name attribute | LDAP attribute mapped to the user's display name. Default: `displayName`. |
| UID attribute | Stable unique identifier for the user (used to link LDAP users to existing accounts). Default: `objectGUID`. |
| Admin groups | List of group DNs whose members automatically receive global admin privileges in Oachkatzl. |

## Testing the LDAP Connection

After saving the configuration, click **Test connection**. Oachkatzl attempts a bind with the configured service account and returns a success or error message. A successful test confirms network connectivity and credentials — it does not test user login or group mapping.

## Group-to-Project Mappings

Map LDAP/AD groups to project roles. When a user logs in, Oachkatzl reads their group memberships and automatically adds them to the configured projects with the mapped role. Users are also removed from projects if they leave the group.

| Field | Description |
|-------|-------------|
| Group DN | Full distinguished name of the LDAP group. Example: `CN=Ops-Team,OU=Groups,DC=example,DC=com`. |
| Project | The Oachkatzl project to assign membership in. |
| Role | The project role to assign (owner / manager / task_runner / guest). |

:::info
Members added via LDAP group mapping are shown with an **LDAP** badge in the project Members view. Their role is re-applied on each login, so manual changes may be overwritten.
:::
