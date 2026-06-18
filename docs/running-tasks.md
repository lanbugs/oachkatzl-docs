---
id: running-tasks
title: Running Tasks
sidebar_position: 11
---

# Running Tasks

## Task Lifecycle

`waiting` → `starting` → `running` → `success` / `error` / `stopped`

## Run Dialog Options

| Option | Effect |
|--------|--------|
| Survey answers | Fill in prompted variables before the run starts. |
| Debug mode | Verbose output (`ansible-playbook -vvvv` + Oachkatzl internal logging). |
| Dry run / Check | Ansible only: runs with `--check`. No changes are made to hosts. |
| Diff | Ansible only: shows what would change (`--diff`). |
| Override arguments | If the template allows it, append extra CLI arguments. |

## Stopping a Task

Click **Stop** in the task detail or task list. Oachkatzl sends `SIGTERM` to the running process (checked every 500 ms). If the process does not exit within 10 seconds, `SIGKILL` is sent.

## Log Output

Output is polled from the backend every 1.5 seconds during the run and displayed with ANSI color support. The full log is archived in the database and available after the task completes.

:::info
**Scheduled tasks** show a purple *⏱ Scheduled* badge in the task list because they have no associated user.
:::
