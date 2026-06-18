---
id: environments
title: Environments & Variables
sidebar_position: 7
---

# Environments & Variables

Reusable variable groups attached to templates. Two JSON objects are stored separately:

| Field | How it's used |
|-------|--------------|
| **Extra Variables** | Ansible: passed as `--extra-vars @file`. Bash/Python: exported as environment variables. |
| **Environment Variables** | Set directly in the process environment before execution (all app types). Example: `AWS_REGION`, `KUBECONFIG`. |

## Variable Precedence (Highest Wins)

1. Survey answers provided at run time
2. Per-run environment override (in the run dialog)
3. Environment extra variables
4. Environment env vars

:::warning Security
Oachkatzl never passes its own internal variables (`OACHKATZL_JWT_SECRET`, `OACHKATZL_ENCRYPTION_KEY`, etc.) to subprocesses. Only what you explicitly configure is visible to scripts.
:::
