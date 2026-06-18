---
id: survey-variables
title: Survey Variables
sidebar_position: 10
---

# Survey Variables

Survey variables are **prompted before each run**, letting operators provide runtime values without editing the template.

## Field Types

| Field type | UI | Notes |
|------------|-----|-------|
| **string** | Text input | Default type |
| **int** | Number input | Validated as integer |
| **enum** | Dropdown | Choices defined on the template |
| **secret** | Password input | Value masked in UI, not stored in plain text logs |
| **bool** | Checkbox | Passed as `true` / `false` |
| **separator** | Visual divider | Groups fields. Optional title. Not passed to the script. |

## How Values Are Passed to Scripts

- **Ansible** — added to `--extra-vars`. Access as `{{ var_name }}` in playbooks.
- **Bash** — exported as environment variables. Access as `$var_name`.
- **Python** — exported as environment variables. Access via `os.environ["var_name"]`.

## Schedules with Survey Variables

When a template with survey variables is used in a schedule, the survey answers must be **pre-configured on the schedule**. If a required variable has no default and no schedule value, the run is skipped with an error in the worker log.
