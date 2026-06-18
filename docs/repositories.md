---
id: repositories
title: Repositories
sidebar_position: 5
---

# Repositories

A Git repository that is cloned (or updated) into a temporary working directory before each task run. The HEAD commit hash is recorded on the task for traceability.

## Fields

- **Git URL** — HTTPS or SSH URL. Example: `git@github.com:org/repo.git`
- **Branch** — Branch to check out. Default: `main`
- **SSH Key** — An *SSH*-type Access Key for private repositories.

## SSH Keys with Passphrases

Oachkatzl automatically strips the passphrase from the key using `ssh-keygen` before passing it to git, so `BatchMode=yes` works correctly.
