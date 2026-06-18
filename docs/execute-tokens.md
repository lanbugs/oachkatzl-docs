---
id: execute-tokens
title: Execute Tokens
sidebar_position: 13
---

# Execute Tokens

Execute tokens let external systems trigger a specific template **without full API authentication**. The token is the only credential — treat it like a password.

## Creating a Token

1. Open the template list and click the 🔑 icon on a template.
2. Click **Generate token**.
3. Give it a name (e.g. "CI pipeline"), optionally set an expiry date.
4. If the template has survey variables, pre-fill defaults for this token.
5. Copy the token — it is shown **only once**.

## Triggering a Run

```bash
# Simple trigger
curl -X POST "https://oachkatzl.example.com/api/execute/<token>"

# With survey variable overrides
curl -X POST "https://oachkatzl.example.com/api/execute/<token>" \
  -H "Content-Type: application/json" \
  -d '{"survey_answers": {"env": "production", "version": "2.1.0"}}'
```

The response contains the `task_id` which can be used to poll the task status:

```
GET /api/projects/<project_id>/tasks/<task_id>
```

## Survey Answer Precedence

1. Values in the request body `survey_answers` (highest priority)
2. Token default values
3. Template survey variable defaults

:::warning
Tokens cannot be retrieved after creation. If lost, revoke the old token and generate a new one.
:::
