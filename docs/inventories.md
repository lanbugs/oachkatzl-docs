---
id: inventories
title: Inventories
sidebar_position: 6
---

# Inventories

Ansible host definitions. Not used for Bash or Python templates.

## Inventory Types

| Type | Description |
|------|-------------|
| **Static (INI)** | Paste the inventory content directly (classic `[group] host` format). |
| **Static (YAML)** | Paste YAML inventory content directly. |
| **File** | Path to an inventory file relative to the repository root. Cloned with the repo. |
| **None** | No inventory. Useful when the playbook manages its own connection (e.g., `localhost`). |

## Keys on Inventories

- **SSH Key** — passed to `ansible-playbook --private-key` for host login.
- **Become Key** — used for privilege escalation (`sudo`). Can be SSH or Login/Password type.
