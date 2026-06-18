---
id: schedules
title: Schedules
sidebar_position: 12
---

# Schedules

Schedules trigger templates automatically using a cron expression. They are evaluated by **Celery Beat** every minute.

## Cron Format

Standard 5-field cron: `minute hour day month weekday`

| Expression | Meaning |
|-----------|---------|
| `0 * * * *` | Every hour |
| `0 8 * * 1-5` | 08:00 on weekdays |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 1 * *` | First day of every month at midnight |

Use [crontab.guru](https://crontab.guru) to validate expressions.

## Survey Variables on Schedules

Pre-configure survey answers directly on the schedule. At run time the stored values are used. The caller can also pass `survey_answers` via the execute token API.
