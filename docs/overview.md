---
id: overview
title: Overview
slug: /
sidebar_position: 1
---

# Oachkatzl Documentation

A self-hosted automation platform for running Ansible playbooks, shell scripts, and Python scripts.

Oachkatzl lets you define **templates** (what to run), attach resources (repositories, inventories, credentials), and execute them as **tasks** — manually, on a schedule, or via an API token. All output is streamed and archived.

## Core Concepts

| Concept | What it is |
|---------|-----------|
| **Project** | Top-level isolation boundary. Everything belongs to a project. |
| **Template** | Reusable definition of what to execute and how. |
| **Task** | A single execution of a template. Has status, log output, commit hash. |
| **Access Key** | Encrypted credential (SSH key, password, Vault passphrase). |
| **Repository** | Git repository cloned before each task run. |
| **Inventory** | Ansible host list (static INI/YAML or a file in the repository). |
| **Environment** | Extra variables and environment variables injected at run time. |
