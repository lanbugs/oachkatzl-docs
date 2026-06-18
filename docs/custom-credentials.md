---
id: custom-credentials
title: Custom Credentials
sidebar_position: 4
---

# Custom Credentials

Custom Credentials let you define your own credential schemas — input fields, labels, and exactly *how* those values are injected into tasks (as environment variables, Ansible extra vars, or temp files). Multiple credentials can be attached to a single template.

:::info Two-level concept
An admin creates a **Credential Type** (the schema — what fields exist and how they are injected). Project members then create **Credentials** based on that type (the actual values, encrypted). Templates reference one or more Credentials.
:::

## Step 1 — Define a Credential Type (Admin)

Open **Settings → Credential Types** in the sidebar (visible to admins only) and click *New type*. Each type has two JSON fields:

### Inputs Schema

A JSON array describing the input fields users must fill in when creating a Credential of this type.

```json
[
  { "id": "username",    "label": "Username",    "type": "string",  "required": true  },
  { "id": "password",    "label": "Password",    "type": "secret",  "required": true  },
  { "id": "api_token",   "label": "API Token",   "type": "secret",  "required": false,
    "help_text": "Leave blank to use username/password instead" },
  { "id": "verify_ssl",  "label": "Verify SSL",  "type": "boolean", "required": false,
    "default": true }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Internal identifier — used in injector templates as `{{ id }}`. |
| `label` | yes | Display name shown to users in the credential form. |
| `type` | yes | `string`, `secret` (masked), `boolean` |
| `required` | no | Whether the field must be filled. Default: `false`. |
| `default` | no | Pre-filled value in the form. |
| `help_text` | no | Short hint shown below the field. |

### Injectors Schema

A JSON object with up to three sections — `env`, `extra_vars`, and `file` — describing how the credential fields are passed to the process. Use `{{ field_id }}` to reference a field value.

```json
{
  "env": {
    "MY_USERNAME":  "{{ username }}",
    "MY_TOKEN":     "{{ api_token }}"
  },
  "extra_vars": {
    "vault_user":   "{{ username }}",
    "verify_ssl":   "{{ verify_ssl }}"
  },
  "file": {
    "content": "{{ private_key }}",
    "var":     "KEY_FILE_PATH"
  }
}
```

| Section | Effect |
|---------|--------|
| `env` | Key/value pairs added to the process environment before execution. Available in Bash as `$MY_USERNAME`, in Python as `os.environ["MY_USERNAME"]`. |
| `extra_vars` | Merged into `--extra-vars` for Ansible playbooks. Access as `{{ vault_user }}` in tasks and templates. Also exported as env vars for Bash/Python. |
| `file` | Writes `content` to a temporary file (mode 0600) and injects its path into the process environment under the name given by `var`. The file is securely deleted after the task finishes. Useful for private keys, certificates, kubeconfig files, etc. |

## Step 2 — Create a Credential (Project)

Open the **Keys & Credentials** tab inside your project and scroll down to the *Credentials* section. Click *New credential* and select the credential type — the form dynamically renders the input fields defined in that type's inputs schema. Secret fields are masked and stored encrypted.

Multiple credentials of the same type can exist in a project (e.g. "Prod API key" and "Staging API key").

## Step 3 — Attach Credentials to a Template

In the template editor, scroll to the **Credentials** section and check one or more credentials from the project. At task run time, all attached credentials are resolved and their injectors applied in order — env vars, extra vars, and file paths are all available to the playbook or script.

:::info
If two credentials inject the same environment variable or extra var, the one listed *last* on the template wins.
:::

## Practical Example — HashiCorp Vault Token

**Inputs schema:**

```json
[
  { "id": "vault_addr",  "label": "Vault Address", "type": "string", "required": true,
    "default": "https://vault.example.com" },
  { "id": "vault_token", "label": "Token",          "type": "secret", "required": true }
]
```

**Injectors schema:**

```json
{
  "env": {
    "VAULT_ADDR":  "{{ vault_addr }}",
    "VAULT_TOKEN": "{{ vault_token }}"
  }
}
```

Any script or playbook attached to a template using this credential can now call the Vault CLI or SDK directly — the environment variables are already set.

## Practical Example — kubeconfig File

**Inputs schema:**

```json
[
  { "id": "kubeconfig", "label": "kubeconfig (YAML)", "type": "secret", "required": true,
    "help_text": "Paste the full kubeconfig file content" }
]
```

**Injectors schema:**

```json
{
  "file": {
    "content": "{{ kubeconfig }}",
    "var":     "KUBECONFIG"
  }
}
```

Oachkatzl writes the kubeconfig content to a temp file, exports its path as `$KUBECONFIG`, and deletes the file after the task finishes. `kubectl` picks up the env var automatically.

:::warning Security
Field values whose `type` is `secret` are stored encrypted in the database and never returned by the API. They are only decrypted inside the worker process immediately before task execution. Values containing *password*, *secret*, *token*, or *pass* in the field ID are automatically masked in the task run-parameter display.
:::
