---
id: projects-roles
title: Projects & Roles
sidebar_position: 2
---

# Projects & Roles

Every resource (templates, keys, repositories, …) belongs to exactly one project. Users are added to projects with a **role** that controls what they can do.

## Roles

| Role | Permissions |
|------|------------|
| `owner` | Full access including project deletion and member management. |
| `manager` | Create/edit/delete all resources and run tasks. Cannot delete the project. |
| `task_runner` | Run tasks and view output. Cannot modify resources. |
| `guest` | Read-only access. Cannot run tasks or edit anything. |

Global **admins** have owner-level access to every project regardless of membership.
