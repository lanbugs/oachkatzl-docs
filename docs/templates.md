---
id: templates
title: Templates
sidebar_position: 8
---

# Templates

A template defines *what* gets executed, *how*, and with *which* resources.

## App Types

| Type | What runs | Extras |
|------|-----------|--------|
| **Ansible** | `ansible-playbook <playbook>` | Inventory, Vault passwords, Galaxy auto-install |
| **Bash / Shell** | `/bin/bash <script>` | — |
| **Python** | Python interpreter + script | Auto `.venv` from `requirements.txt` |
| **Custom App** | Admin-registered executable | Any binary available in the worker image |

## Ansible: Automatic Galaxy Install

Before running the playbook, Oachkatzl checks for requirements files and installs them into an isolated path:

- `requirements.yml` → `ansible-galaxy role install` + `ansible-galaxy collection install`
- `roles/requirements.yml` → roles only
- `collections/requirements.yml` → collections only

## Python: Automatic Virtualenv

If a `requirements.txt` exists at the repository root, Oachkatzl automatically:

1. Creates `.venv` in the working directory
2. Runs `pip install -r requirements.txt` — via proxy if `OACHKATZL_PIP_INDEX_URL` is set (see [pip Package Proxy](pip-proxy))
3. Executes the script with the venv Python

## Template Options

| Option | Effect |
|--------|--------|
| Allow override args | Operators can pass extra CLI arguments when starting a run. |
| Allow parallel tasks | By default tasks from the same template queue sequentially. Enable this to allow concurrent runs. |
| Suppress success alerts | Notifications are sent on failure but not on success for this template. |
| Debug mode | Ansible: adds `-vvvv`. All types: extra logging from Oachkatzl itself (git steps, venv creation, galaxy install). |
