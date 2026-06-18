---
id: custom-apps
title: Custom Apps
sidebar_position: 20
---

# Custom Apps

**Custom Apps** extend the built-in app types (*Ansible*, *Bash*, *Python*) with any executable available in the worker image — Terraform, kubectl, make, a custom binary, or anything else reachable in the worker's `PATH`. Once registered, a Custom App appears as an additional app type in the template editor, just like the built-in types.

:::info
Creating and editing Custom Apps is restricted to **global admins**. Project members can use an active app in templates but cannot modify its definition.
:::

## Creating a Custom App

Go to **Settings → Custom Apps** in the sidebar and click *New app*.

| Field | Required | Description |
|-------|----------|-------------|
| `slug` | yes | Unique identifier — lowercase letters, digits, `-` and `_`. This becomes the `app` value stored on templates. Immutable after creation. Example: `terraform`, `kubectl`, `make`. |
| Title | yes | Human-readable name shown in the app-type dropdown in the template editor. |
| Executable | yes | Binary name (looked up in `PATH`) or absolute path on the worker. Examples: `terraform`, `/usr/local/bin/kubectl`. |
| Default arguments | no | JSON array of arguments *always* prepended to every invocation — before the script file and template arguments. Example: `["--no-color"]` for Terraform. |
| Args template | no | Controls how the command line is assembled. Two placeholders are available: `{file}` (the script/playbook path from the template) and `{arguments}` (the template's Arguments field). Default: `{file} {arguments}`. |
| Worker pool | no | Default [Worker Pool](custom-workers) for this app type. Applied to all templates that use this app unless the template overrides it. Useful to ensure, e.g., that `terraform` always runs on a worker with Terraform installed. |
| Active | — | Inactive apps are hidden from the template editor. Existing templates using the app are not affected. |

## How the Command Is Assembled

For each task run, Oachkatzl builds the subprocess command in this order:

1. **Executable** — the binary.
2. **Default arguments** — always present, from the app definition.
3. **Script file and/or template arguments** — controlled by the *Args template*.

| Args template | Resulting command |
|---------------|------------------|
| `{file} {arguments}` (default) | `executable [default_args] script.tf --var env=prod` |
| `{arguments}` | `executable [default_args] --var env=prod` — no script file passed |
| `{file}` | `executable [default_args] script.tf` — no extra arguments |
| (empty / anything else) | `executable [default_args] script.tf [arguments]` — same as default |

:::warning Security
Custom Apps execute arbitrary binaries on the worker. Only global admins can register or modify them. The binary must already be present in the worker image — Oachkatzl never downloads or installs executables at run time. Arguments are always passed as a list (no shell interpolation), so shell injection via template arguments is not possible.
:::

## Example — Terraform

**App definition:**

| Field | Value |
|-------|-------|
| Slug | `terraform` |
| Title | Terraform |
| Executable | `terraform` |
| Default arguments | `["-no-color"]` |
| Args template | `{arguments}` (Terraform subcommands are passed as arguments, not as a script file) |
| Worker pool | *Terraform Worker* (a pool whose worker image includes the Terraform binary) |

**Template using this app:**

- App type: *terraform*
- Script / playbook: leave blank (Args template has no `{file}`)
- Arguments: `["apply", "-auto-approve", "-var", "env=production"]`

Resulting command: `terraform -no-color apply -auto-approve -var env=production`

## Example — kubectl

| Field | Value |
|-------|-------|
| Slug | `kubectl` |
| Executable | `/usr/local/bin/kubectl` |
| Default arguments | `[]` |
| Args template | `{arguments}` |

Template Arguments: `["rollout", "restart", "deployment/myapp", "-n", "production"]`

Resulting command: `/usr/local/bin/kubectl rollout restart deployment/myapp -n production`

## Using a Custom App in a Template

1. Open a template (new or existing) and scroll to **App type**.
2. Select the Custom App from the dropdown — it appears alongside Ansible, Bash, Python.
3. Fill in the **Script / playbook** field if the args template uses `{file}`; leave blank otherwise.
4. Add any run-time arguments in the **Arguments** field (JSON array).
5. Environment variables, Survey Variables, Repositories, and Artifact Cache all work the same as with built-in app types.

:::info
Inventory and Vault are Ansible-specific and have no effect on Custom App templates.
:::
