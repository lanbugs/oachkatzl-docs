---
id: project-members
title: Project Members
sidebar_position: 4
---

# Project Members

Members are managed under **Project → Members** in the sidebar. Only users with the `owner` or `manager` role (or a global admin) can add or remove members.

## Adding a Member

1. Click **Add member** in the top-right corner.
2. Select a user from the dropdown — only users who are not already members are shown.
3. Select a role (see [Projects & Roles](projects-roles) for role descriptions).
4. Click **Add member**.

## Changing a Member's Role

Use the role dropdown next to the member's name. The change takes effect immediately. An owner cannot demote themselves — another owner must do it.

## Removing a Member

Click the trash icon on the member row. The user immediately loses access to the project and all its resources.

## LDAP-Managed Members

When [LDAP/AD](admin-settings#ldap--active-directory) is enabled and group-to-project mappings are configured, users whose role comes from an LDAP group are marked with an **LDAP** badge. Their role is determined by the LDAP group mapping and is re-synced on every login. Manual role changes for LDAP-managed members are overwritten on the user's next login.
